# Paper alignment

Source: `World_Simulator.pdf`, 27 pages, September 9, 2026. Website language remains
English. Content follows the supplied report rather than external publications.

| Website content | Paper evidence |
| --- | --- |
| Name, institution, team, date, GitHub organization | Cover, page 1 |
| Abstract | Full original abstract from page 2, split into two paragraphs for reading; wording and comparison baselines preserved |
| Training corpus and seven dataset sources | §4.1, page 9 |
| 28-D layout, zero filling, rendering and gripper colors | §3.2, pages 5–6, Figure 4 |
| Zero-based odd/even injection, 28-layer Cosmos-Predict 2.5 DiT | §3.3, pages 6–8, Figure 3 |
| One shared expert, eight routed experts, top-2 activation | §3.3 and §4.1 |
| Causal adaptation, ODE initialization, self-forcing DMD, four-step model | §3.4, pages 8–9; 2.2 s / 21 frames and 5.67× are clip-level benchmarks |
| Video metrics and adapted EWMBench | Tables 2–3, pages 10 and 13; within-source test splits |
| Action-condition ablations | §4.4, Tables 4–6 |
| Data augmentation | §4.5, Tables 8–9; distinct cross-domain and scaling studies |
| VLM evaluator inputs and outputs | §4.1, §4.6; independent from world-model prediction |
| Policy evaluation and ranking | Table 11; five checkpoints from one training run |
| Best-of-10 action selection | §4.7, Table 12; open-loop execution, +20.6 pp |
| Closed-loop GRPO policy improvement | §4.8, Table 14; +12.7 pp over SFT |
| Five qualitative distribution-shift axes | §4.9, Figures 7–11; five ordered tabs, with an original paper figure for scene/appearance |
| Contributor roles | §6, page 27 |

## Media distinctions

- Current figures are rendered directly from the latest paper at 5× scale.
  Top-left PDF crop coordinates (left, top, right, bottom), in points:
  `paper-teaser.png`, Figure 1/page 1, (48, 272, 548, 652), 2500 × 1900;
  `paper-architecture.png`, Figure 3/page 5, (48, 68, 548, 302), 2500 × 1170.
- The scene/appearance section now uses video demonstrations. Figure 8 remains
  available on page 20 of the paper PDF; the unused extracted image was removed.
- The latest PDF is copied unchanged from `/Users/zsl/Downloads/World_Simulator.pdf`.
  Unreferenced legacy PDFs and images have been removed.
- Existing videos have been retained without assuming all are the exact clips
  pictured in the report. Figure 9 illustrates stacking; the Lift clip is an
  additional example. Figure 11's image says “Put the bowl on the plate,” while
  its accompanying paragraph describes a book-to-caddy task. This is an internal
  manuscript discrepancy. The webpage retains actual asset labels and does not
  repeat the inconsistent book-to-caddy claim; other tasks are supplementary.
- Existing paired-object videos differ from Figure 10's single manipulated
  object and five image-edited variants. The supplementary clips differ from the paper protocol; this distinction is
  noted on the page. Their labels continue to
  describe the actual assets rather than relabeling them as Figure 10.
- Panda RGB and action clips show the source trajectory. Target embodiments
  receive IK-retargeted joint trajectories and their own rendered action videos;
  the source Panda action is not claimed to be the complete target condition.

## Claim boundaries

The seven training datasets must not be confused with eight carousel entries.
Optional text conditioning must not become a mandatory interface input.
Gripper color indicates configuration, without an unsupported stationary claim.
Qualitative OOD examples are not quantitative robustness measurements or proof
of physical reversibility. Matched-action policy evaluation is distinct from
closed-loop policy improvement. The VLM supplies feedback; the world model
predicts observations. Improvements are percentage points, not relative percent.

The BibTeX is a constructed institutional technical-report entry, not an
assertion that an official citation key, release repository, DOI or arXiv ID
has been assigned. PDF title/date and contributor roles are kept separate.

## Current presentation

The body alternates white and ice-blue-gray surfaces with a graphite generalization
section, centered section headings without
number prefixes, 16 px prose and 14–15 px supporting text. The dark video hero
retains its sizing. Results tables scroll horizontally on narrow screens.
Concise protocol context distinguishes paper figures from supplementary demos.
PAIWorld is a layout reference only: https://guhuangai.github.io/PAIWorld-Proj/.

Pelican-Sim leads the five Table 2 metrics and Table 3 overall score in the shown
comparisons, not every individual EWMBench metric. Mixed-data ablations change
both training volume and diversity. Interleaving reduces conditioning modules
but is not the numerically strongest injection variant on every metric.
The fine-tuned VLM stays frozen downstream; its validation scores do not establish
world-model physical accuracy. The 20.6 and 12.7 percentage-point gains use distinct
protocols and baselines. Oracle results remain above the learned methods.

## Paper-order structure

The main page and navigation share this order: Abstract → Method → Experiments
& Results → Applications → Generalization → Conclusion & Future Work →
Contributors → Citation. The video hero and teaser remain the cover.
Literature-review detail stays in the linked report rather than being duplicated
as a long project-page section.

- Method follows §§3.1–3.4: prediction interface, complementary action
  representations, dual-branch sparse-expert injection, causal few-step distillation.
- Experiments follows §§4.1–4.4: setup, quantitative comparison, qualitative
  video examples, then ablations. The former `#overview` carousel is retained
  as the qualitative subsection; `#results` remains a valid deep link.
- Application tabs follow §§4.5–4.8: data generation, policy evaluation/ranking,
  action selection, policy improvement.
- Generalization tabs follow §4.9: trajectory, scene/appearance, embodiment,
  object, viewpoint. Trajectory is selected initially. Scene uses Figure 8,
  while the four existing video galleries retain their assets and controls.
- Conclusion summarizes §5, including broader data coverage, quality–efficiency
  analysis and more precise evaluation of generality. Contributor roles follow §6.

Only subtopics, rendering steps, application tabs and future directions use
small numbers. Major section titles remain unnumbered. Application navigation
is horizontal above a media-and-description layout, stacking on narrower screens.
Section-level tabs support arrow keys, Home and End, with explicit panel labels.

## Academic copy audit · September 9, 2026

Rechecked against the unchanged 27-page report (SHA-256
`1c53fe2cd51cb3cf11c58765e68657336f0466c1c65ac01014691d96c2a982c4`).
The Abstract now reproduces page 2 rather than combining a summary with details
from Method. Other sections remain concise, source-backed project-page summaries.
Removed repetitive teaser copy, conversational section prompts and redundant
color descriptions. Application summaries retain protocols, comparator names,
evaluation budgets, distinct data-generation studies and oracle references.
Small benchmark differences are not described as statistically significant.

The Figure 11 caption/image and accompanying paragraph name different tasks
(bowl-on-plate versus book-to-caddy). This discrepancy remains in the source PDF;
the page follows the depicted task and labels extra gallery tasks as supplementary.
Supplementary paired-object clips are not presented as the Figure 10 experiment.

The hero now uses the user-supplied `ac_pred_错落堆叠_灵巧手001124中心_4x3_压缩版.mp4`, copied byte-for-byte
to `assets/videos/hero-dexhand-mosaic.mp4`: H.264, 3840 × 2880, 16 fps, 30 s.
Its poster is extracted from the same video. Both old and new videos have a 4:3
aspect ratio; the hero's existing CSS sizing, cover crop, and overlay are unchanged.
The replacement plays at its original 1× speed. Original demo videos are retained.
The former hero video and poster have been removed because the page no longer uses them.
