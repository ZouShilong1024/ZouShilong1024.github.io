#!/usr/bin/env python3
"""Build the complete static site; preserve originals and omit unreferenced media."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from concurrent.futures import ThreadPoolExecutor
import argparse, json, re, shutil, subprocess

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--compress-videos', action='store_true')
parser.add_argument('--crf', type=int, default=28)
args = parser.parse_args()
out = root / 'dist'
required = {'index.html', '.nojekyll'}
slots = {}

def add(value):
    url = urlsplit(value)
    if not url.scheme and not url.netloc and url.path:
        name = unquote(url.path).lstrip('/')
        if '..' in Path(name).parts:
            raise SystemExit(f'Unsafe asset path: {value}')
        required.add(name)

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if not value:
                continue
            if key in ('src', 'href', 'poster'):
                add(value)
            if key.startswith('data-'):
                slots.setdefault(key, set()).add(value)
Links().feed((root / 'index.html').read_text())
# Keep all small code files, including modules imported indirectly.
for folder in ('assets/js', 'assets/css'):
    for p in (root / folder).rglob('*'):
        if p.is_file():
            required.add(str(p.relative_to(root)))
            if p.suffix == '.css':
                for value in re.findall(r'url\([\"\x27]?([^\)\"\x27]+)', p.read_text()):
                    if not urlsplit(value).scheme:
                        resolved = (p.parent / value).resolve()
                        required.add(str(resolved.relative_to(root)))
# Read the real JS catalog, rather than infer referenced files from filenames.
code = "const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8').replace(/export const /g,'const ');eval(s+';console.log(JSON.stringify({overviewDatasets,viewpointTasks,embodimentTasks,objectTasks,reverseTasks}))');"
catalog = json.loads(subprocess.check_output(['node', '-e', code, str(root / 'assets/js/demo-data.js')]))
def media(stem):
    required.update((f'assets/videos/{stem}.mp4', f'assets/posters/{stem}.jpg'))
for dataset in catalog['overviewDatasets']:
    for slot in slots.get('data-overview-stream', set()):
        media(f"overview_{dataset['id']}_{slot}")
for dataset in catalog['overviewDatasets']:
    for slot in slots.get('data-overview-second', set()):
        media(f"{dataset['secondStem']}_{slot}")
for kind, prefix in (('viewpoint', 'ood_view'), ('embodiment', 'ood_embodiment'), ('reverse', 'ood_reverse')):
    for task in catalog[kind + 'Tasks']:
        for slot in slots.get(f'data-{kind}-video', set()):
            media(f"{prefix}_{task['stem']}_{slot}")
for task in catalog['objectTasks']:
    for slot in slots.get('data-object-video', set()):
        source = 'original_objects' if slot == 'reference' else task['source']
        stem = 'reference' if slot == 'reference' else task['stem']
        required.update((f'assets/videos/multi_obj/{source}.mp4', f'assets/posters/ood_object_{stem}.jpg'))
missing = sorted(n for n in required if not (root / n).is_file())
if missing:
    raise SystemExit('Missing website assets: ' + ', '.join(missing))
if out.exists():
    shutil.rmtree(out)
out.mkdir()
for name in sorted(required):
    target = out / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / name, target)
original_bytes = sum((root / n).stat().st_size for n in required)
all_media = {str(p.relative_to(root)) for p in (root / 'assets').rglob('*') if p.is_file() and p.suffix not in ('.zip', '.pptx')}
unused = sorted(all_media - required)
videos = sorted(n for n in required if n.endswith('.mp4'))
print(f'Referenced: {len(required)} files, {len(videos)} videos; excluded: {len(unused)} unused assets', flush=True)

def probe(path):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames:format=duration', '-of', 'json', str(path)]))
def compress(name):
    src, dst = root / name, out / name
    temp = dst.with_suffix('.compressed.mp4')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(src), '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', str(args.crf), '-pix_fmt', 'yuv420p', '-threads', '2', '-c:a', 'copy', '-movflags', '+faststart', str(temp)], check=True)
    before, after = probe(src), probe(temp)
    for field in ('width', 'height', 'r_frame_rate', 'nb_frames'):
        if before['streams'][0].get(field) != after['streams'][0].get(field):
            raise RuntimeError(f'{name}: changed {field}')
    if abs(float(before['format']['duration']) - float(after['format']['duration'])) > .1:
        raise RuntimeError(f'{name}: changed duration')
    if temp.stat().st_size < dst.stat().st_size:
        temp.replace(dst)
    else:
        temp.unlink()
    return {'path': name, 'before': src.stat().st_size, 'after': dst.stat().st_size}
results = []
if args.compress_videos:
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i, result in enumerate(pool.map(compress, videos), 1):
            results.append(result)
            if i % 20 == 0 or i == len(videos):
                print(f'Compressed and verified {i}/{len(videos)} videos', flush=True)
report = {'compressed': args.compress_videos, 'crf': args.crf if args.compress_videos else None, 'files': sorted(required), 'excluded': unused, 'referenced_original_bytes': original_bytes, 'output_bytes': sum((out / n).stat().st_size for n in required), 'videos': results}
(root / 'build-report.json').write_text(json.dumps(report, indent=2) + '\n')
print(f"Validated {len(required)} files, {report['output_bytes']/1024**2:.1f} MiB", flush=True)
