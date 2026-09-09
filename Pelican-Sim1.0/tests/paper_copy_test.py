"""Check the web abstract against the supplied PDF (requires pypdf)."""
from html import unescape
from pathlib import Path
import re
import unittest
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]


class PaperCopyTests(unittest.TestCase):
    @unittest.skipUnless((ROOT / "World_Simulator.pdf").exists(), "Paper PDF is not included")
    def test_abstract_preserves_original_wording(self):
        html = (ROOT / "index.html").read_text()
        section = html.split('<section id="abstract">')[1].split('</section>')[0]
        paragraphs = re.findall(r'<p\b[^>]*>(.*?)</p>', section, re.S)
        web = unescape(re.sub(r'<[^>]+>', ' ', ' '.join(paragraphs)))
        page = PdfReader(ROOT / "World_Simulator.pdf").pages[1].extract_text()
        paper = page.split('Abstract')[1].split('1. Introduction')[0]
        # PDF extraction splits words at line breaks and drops spaces next to
        # bold runs; compare letters/digits without changing case or numbers.
        normalize = lambda text: re.sub(r'[^a-zA-Z0-9]', '', text)
        self.assertEqual(normalize(web.replace('Pelican-Sim', 'World-Sim')), normalize(paper))


if __name__ == '__main__':
    unittest.main()
