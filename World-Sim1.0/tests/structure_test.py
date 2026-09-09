"""Static regression checks for paper order, anchors, and section-level tabs."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
VOID = set("area base br col embed hr img input link meta param source track wbr".split())


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.nodes, self.errors = [], [], []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.nodes.append((tag, attrs, tuple(self.stack)))
        if tag not in VOID:
            self.stack.append((tag, attrs.get("id")))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1][0] != tag:
            self.errors.append((tag, self.stack[-1:] or None))
        else:
            self.stack.pop()


class StructureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text()
        cls.page = Page()
        cls.page.feed(cls.html)
        cls.attrs = [attrs for _, attrs, _ in cls.page.nodes]

    def test_balanced_markup_and_unique_ids(self):
        self.assertEqual(self.page.errors, [])
        self.assertEqual(self.page.stack, [])
        ids = [a["id"] for a in self.attrs if "id" in a]
        self.assertEqual(len(ids), len(set(ids)))

    def test_navigation_follows_main_sections(self):
        expected = ["abstract", "method", "experiments", "applications",
                    "ood-cases", "contributors", "citation"]
        sections = [a["id"] for tag, a, stack in self.page.nodes
                    if tag == "section" and stack and stack[-1][0] == "main"]
        links = [a["href"][1:] for a in self.attrs
                 if "nav-link" in a.get("class", "").split()]
        self.assertEqual(sections, expected)
        self.assertEqual(links, expected)

    def test_experiment_subsections_follow_paper(self):
        positions = [self.html.index(text) for text in [
            "Experimental Setup", "Video Prediction Benchmark",
            "Qualitative Generation Results"]]
        self.assertEqual(positions, sorted(positions))

    def test_tabs_have_valid_targets_and_one_initial_selection(self):
        ids = {a["id"]: a for a in self.attrs if "id" in a}
        for key, expected in [("data-tab", ["scene", "embodiment", "object", "viewpoint", "reverse"]),
                              ("data-app", ["data", "evaluation", "selection", "learning"])]:
            tabs = [a for a in self.attrs if key in a]
            self.assertEqual([a[key] for a in tabs], expected)
            self.assertEqual(sum(a.get("aria-selected") == "true" for a in tabs), 1)
            self.assertEqual(tabs[0].get("aria-selected"), "true")
            for tab in tabs:
                self.assertIn(tab["aria-controls"], ids)
                self.assertEqual(ids[tab["aria-controls"]]["role"], "tabpanel")
        visible = [a["id"] for a in self.attrs if "panel" in a.get("class", "").split()
                   and "hidden" not in a["class"].split()]
        self.assertEqual(visible, ["panel-scene"])

    def test_internal_links_and_accessible_labels_resolve(self):
        ids = {a["id"] for a in self.attrs if "id" in a}
        for a in self.attrs:
            if a.get("href", "").startswith("#") and a["href"] != "#":
                self.assertIn(a["href"][1:], ids)
            for target in a.get("aria-labelledby", "").split():
                self.assertIn(target, ids)

    def test_major_headings_are_unnumbered(self):
        import re
        titles = re.findall(r"<h2\b[^>]*>(.*?)</h2>", self.html, re.S)
        self.assertTrue(titles)
        self.assertTrue(all(not re.match(r"\s*\d", text) for text in titles))

    def test_initial_application_copy_matches_its_tab(self):
        import re
        from html import unescape
        tab = next(a for a in self.attrs if a.get("data-app") == "data")
        initial = re.search(r'<p id="application-description"[^>]*>(.*?)</p>', self.html, re.S).group(1)
        self.assertEqual(unescape(initial), tab["data-description"])

    def test_hero_features_share_the_same_content_structure(self):
        import re
        cards = re.findall(r'<div role="listitem">(.*?)</div>', self.html, re.S)
        self.assertEqual(len(cards), 4)
        for card in cards:
            self.assertRegex(card, r'^<strong>[^<]+</strong><span class="hero-feature-label">[^<]+</span><p>[^<]+<br />[^<]+</p>$')

    def test_hero_uses_supplied_video_and_matching_poster(self):
        import hashlib
        hero = next(a for a in self.attrs if a.get("class") == "hero-video")
        self.assertEqual(hero["poster"], "assets/posters/hero-dexhand-mosaic.jpg")
        self.assertEqual(hero["data-playback-rate"], "1")
        self.assertTrue((ROOT / hero["poster"]).is_file())
        video = ROOT / "assets/videos/hero-dexhand-mosaic.mp4"
        self.assertIn(str(video.relative_to(ROOT)), self.html)
        self.assertEqual(hashlib.sha256(video.read_bytes()).hexdigest(),
                         "0dcd927086af221491a421d4b89d397030dc0d236b6257d61560777e0aa47945")


if __name__ == "__main__":
    unittest.main()
