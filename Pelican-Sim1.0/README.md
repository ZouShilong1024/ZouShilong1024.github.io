# Pelican-Sim 1.0 project page

Static project page for **Pelican-Sim 1.0: A general world model simulator for
embodied intelligence**, aligned with the supplied `World_Simulator.pdf` report
(September 9, 2026).

Institution: Beijing Innovation Center of Humanoid Robotics (X-Humanoid),
WFM System Group. Contributor roles follow Section 6 of the report.

## Structure

- `index.html`: page content and semantic markup
- `assets/css/site.css`: custom styles and animations
- `assets/js/main.js`: initialization, section tabs and playback lifecycle
- `assets/js/demo-data.js`: dataset and task catalog
- `assets/js/video-gallery.js`: shared viewpoint, embodiment and object gallery controller
- `assets/js/overview.js`: overview carousel, button and swipe navigation
- `assets/js/reverse-gallery.js`: alternating forward/reverse playback
- `assets/js/media.js`: cancellable media loading and visibility-based playback
- `assets/js/page-ui.js`: four application protocols, navigation and citation copy
- `assets/js/tab-keyboard.js`: keyboard navigation for application and distribution-shift tabs
- `assets/js/tailwind-config.js`: Tailwind theme
- `assets/figures`, `assets/posters`, `assets/videos`: media assets

No build step or package installation is required. Tailwind and Google Fonts
are loaded from their existing CDNs. JavaScript uses native ES modules.

## Preview

From this directory, run a persistent Linux preview with `./serve.sh`, or use
a foreground server (Python 3 required):

```bash
# macOS / Linux
python3 -m http.server 8000 --bind 127.0.0.1
# Windows
py -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Press Ctrl+C to stop the foreground server.
Use HTTP rather than opening `index.html` directly: ES modules require it.

## Editing demos

Update the catalog in `assets/js/demo-data.js`; task buttons remain in
`index.html` and their numeric `data-*-task` values follow catalog order.
Media path conventions are defined in `main.js` (shared galleries) and the
overview/reverse modules. Keep the original relative asset paths for Pages.
The shared controller supports progress-based synchronization (viewpoint and
objects), time-based synchronization (embodiment), and duration-matched
playback rates (viewpoint).

## Validation

Run `node --test tests/*.test.mjs` with a recent Node.js to check media
load cancellation, replacement and section-tab keyboard navigation. Run
`python3 tests/structure_test.py` for paper order, markup, anchors and tab labels.
`python3 tests/paper_copy_test.py` compares the web Abstract with the supplied PDF
(requires `pypdf`).
No npm dependencies are required. For
browser checks, exercise task tabs, previous/next, arrow keys, application
tabs, and switching away from a playing OOD panel.

## Publish on GitHub Pages

1. Create a **new public repository** (do not commit this folder into Pelican-Sim).
2. Copy the contents of this directory, excluding local build output and logs.
3. Push to `main`.
4. Settings → Pages → Source: `main` / `/ (root)`.
5. The site URL will be `https://<user>.github.io/<repo>/`.

All asset paths are relative (`assets/videos/...`). Do not prefix them with `/`, or they 404 on project Pages.

`.nojekyll` is required so GitHub does not run Jekyll on this folder.

## What not to commit

- source archives in `assets/videos/*.zip` (source bundles only)
- any `.pptx` extracted from that zip
- Git LFS (Pages serves LFS pointer files, so videos will not play)

Check individual media sizes before publishing. Unused media, PPTX files and
source archives were moved outside the project to
`../world_sim_page_unused_backup_20260909_113641/`; `manifest.json` records their
original paths and checksums. Unreferenced legacy figure files and media have since been removed from this project.

## Paper and release links

The Paper button opens `World_Simulator.pdf`. The GitHub button links to the
X-Humanoid organization listed on the report cover. The report promises model
checkpoints and inference code; the page labels these as planned and does not
invent a release URL or an arXiv identifier. The BibTeX entry is constructed
from the institutional authorship, title and date on the report.

## Content and media provenance

See `docs/paper-alignment.md` for section/table mappings and distinctions
between paper figures and supplementary demo clips. Source videos and their
paths used by the page are preserved. The current architecture image,
`paper-architecture.png`, is rendered from page 5 of the latest report. The
scene/appearance section uses video demonstrations. Figure 8 remains available in the paper PDF.

The carousel contains eight demo groups drawn from seven datasets: the
AgiBotWorld Beta gripper and dexterous-hand groups belong to one dataset.
Existing video examples are retained; additional tasks and paired-object
clips are explicitly distinguished from the tasks illustrated in the paper.

The teaser uses `paper-teaser.png` (2500 × 1900), rendered from page 1 of the
latest report. Clicking the teaser opens the corresponding PDF page.

The dark video hero is followed by alternating white and ice-blue-gray reading
surfaces, with a graphite Generalization theater, centered unnumbered section
headings and 16 px body copy. `assets/css/presentation.css` scopes this editorial
theme to the body without changing the cover or navigation. Results combine Tables 2–3 with a summary
of Tables 4–6. Unreferenced legacy media and the unused playback toolbar module have been removed.

Page order follows the report: Abstract, Method, Experiments & Results,
Applications, Generalization, Contributors, Citation.
The dataset carousel now follows the quantitative comparison inside Experiments;
its `#overview` anchor is preserved. Five distribution-shift tabs begin with scene and appearance, followed by
embodiment, object, viewpoint, and trajectory. Numbering is limited to subtopics and steps.

The benchmark summary reports absolute PSNR gains in dB against the strongest
evaluated baseline for each dataset, retaining both method names and raw scores.
The complete table remains visible and its method column stays pinned while
scrolling horizontally. These highlights do not imply OOD benchmark gains.

Video galleries and the application-data video play automatically without playback
toolbars. Scientific images and video colors are not filtered; phase emphasis is
applied to labels. On narrower screens the forward and reverse pairs form two rows.

The hero uses `assets/videos/hero-dexhand-mosaic.mp4`, an unchanged copy of
the supplied dexterous-hand-centered mosaic video (3840 × 2880, 16 fps, 30 seconds, H.264), with a matching
poster frame and original-speed playback. The cover dimensions and crop rules
are unchanged. The Abstract reproduces the paper's original wording; other body
sections are concise summaries with necessary experimental qualifications.

Each of the eight qualitative dataset tabs contains two synchronized three-stream
rows. Each row follows its own reference-video clock. Second-row selections and
screening evidence are recorded in `docs/overview-second-row-selection.json`.
