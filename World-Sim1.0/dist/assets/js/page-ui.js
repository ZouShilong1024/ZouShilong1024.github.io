import { enableTabKeyboard } from "./tab-keyboard.js";

export function initPageUI() {
  const appTabs = [...document.querySelectorAll(".app-tab")];
  const applicationKicker = document.getElementById("application-kicker");
  const applicationTitle = document.getElementById("application-title");
  const applicationDescription = document.getElementById("application-description");
  const applicationMedia = document.getElementById("application-media");
  const workflow = document.getElementById("application-workflow");
  const chartTitle = document.getElementById("application-chart-title");
  const chartBars = document.getElementById("application-chart-bars");
  const workflowResult = document.getElementById("application-workflow-result");
  // Paper Tables 9, 11, 12 and 14.
  const workflows = {
    data: {
      chart: "π0.5 success rate (%) ↑",
      scale: 100,
      unit: "%",
      highlights: [1, 3, 5],
      rows: [
        ["10 original · 0 generated · 10 total", 28.5],
        ["10 original · 100 generated · 110 total", 64.5],
        ["30 original · 0 generated · 30 total", 57.0],
        ["30 original · 300 generated · 330 total", 87.0],
        ["50 original · 0 generated · 50 total", 70.0],
        ["50 original · 500 generated · 550 total", 93.0],
      ],
      result: "+36.0 / +30.0 / +23.0 percentage points at 10 / 30 / 50 original trajectories per task.",
    },
    evaluation: {
      chart: "Policy-evaluation agreement · Pearson r ↑",
      scale: 1,
      unit: "",
      decimals: 4,
      rows: [["0 adaptation rollouts", 0.9020], ["100 rollouts", 0.9580], ["200 rollouts", 0.9760], ["500 rollouts", 0.9890], ["1,000 rollouts", 0.9940]],
      result: "Perfect ranking agreement at 200 adaptation rollouts · Spearman ρ = 1.0 across five checkpoints.",
    },
    selection: {
      chart: "RoboTwin success rate (%) ↑",
      scale: 100,
      unit: "%",
      rows: [["Single sample", 43.2], ["Random-of-10", 43.5], ["VLM-direct", 48.7], ["Ctrl-World", 52.3], ["World-Sim 1.0", 63.8]],
      result: "+20.6 percentage points over single-sample execution.",
    },
    learning: {
      chart: "RoboTwin success rate (%) ↑",
      scale: 100,
      unit: "%",
      rows: [["Initial SFT", 62.7], ["Iter-SFT", 67.0], ["GRPO · terminal only", 68.5], ["World-Sim 1.0 · full GRPO", 75.4]],
      result: "+12.7 percentage points over the initial policy.",
    },
  };
  const setApplicationPanel = (btn) => {
    appTabs.forEach(tab => {
      tab.setAttribute("aria-selected", String(tab === btn));
      tab.tabIndex = tab === btn ? 0 : -1;
    });
    document.getElementById("application-panel").setAttribute("aria-labelledby", btn.id);
    applicationKicker.textContent = btn.dataset.kicker;
    applicationTitle.textContent = btn.dataset.title;
    applicationDescription.textContent = btn.dataset.description;
    workflow.classList.remove("hidden");
    applicationMedia.classList.remove("hidden");
    applicationMedia.classList.add("has-media");
    {
      const content = workflows[btn.dataset.app];
      chartTitle.textContent = content.chart;
      if (btn.dataset.app === "data") {
        chartBars.innerHTML = renderDataColumns(content.rows);
      } else {
      chartBars.replaceChildren(...content.rows.map(([label, value], index) => {
        const row = document.createElement("div");
        row.className = "application-chart-row";
        if ((content.highlights ?? [content.rows.length - 1]).includes(index)) row.classList.add("is-highlight");
        const heading = document.createElement("div");
        heading.className = "application-chart-label";
        const name = document.createElement("span");
        name.textContent = label;
        const number = document.createElement("strong");
        number.textContent = `${value.toFixed(content.decimals ?? 1)}${content.unit}`;
        heading.append(name, number);
        const track = document.createElement("div");
        track.className = "application-chart-track";
        track.setAttribute("aria-hidden", "true");
        const fill = document.createElement("div");
        fill.className = "application-chart-fill";
        fill.style.width = `${value / content.scale * 100}%`;
        fill.style.animationDelay = `${index * 60}ms`;
        track.append(fill);
        row.append(heading, track);
        return row;
      }));
      }
      workflowResult.textContent = content.result;
    }
  };
  appTabs.forEach(btn => btn.addEventListener("click", () => setApplicationPanel(btn)));
  enableTabKeyboard(appTabs);
  setApplicationPanel(appTabs.find(tab => tab.getAttribute("aria-selected") === "true") ?? appTabs[0]);

  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main > section[id]")];
  const nav = document.querySelector("body > nav");
  let navigationFrame = null;
  const updateNavigation = () => {
    const threshold = nav.getBoundingClientRect().height + 130;
    const active = sections.filter(section => section.getBoundingClientRect().top <= threshold).at(-1);
    navLinks.forEach(link => {
      const sectionId = active?.id;
      if (sectionId && link.hash === `#${sectionId}`) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    navigationFrame = null;
  };
  const scheduleNavigation = () => {
    if (navigationFrame === null) navigationFrame = requestAnimationFrame(updateNavigation);
  };
  window.addEventListener("scroll", scheduleNavigation, { passive: true });
  window.addEventListener("resize", scheduleNavigation);
  updateNavigation();

  const copyBtn = document.getElementById("copy");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("bibtex").innerText);
      copyBtn.textContent = "Copied";
    } catch {
      copyBtn.textContent = "Select citation to copy";
    }
    setTimeout(() => { copyBtn.textContent = "Copy citation"; }, 1500);
  });
}

// A shared zero baseline makes augmentation gains comparable across budgets.
function renderDataColumns(rows) {
  const ticks = [0, 25, 50, 75, 100].map(value => {
    const y = 256 - value * 2;
    return `<line x1="42" x2="502" y1="${y}" y2="${y}" stroke="#e3e9f1"/><text x="32" y="${y + 4}" text-anchor="end">${value}</text>`;
  }).join("");
  const groups = [10, 30, 50].map((budget, i) => {
    const x = 114 + i * 155;
    const bars = [0, 1].map(j => {
      const [label, value] = rows[i * 2 + j];
      const bx = x - 44 + j * 47;
      const height = value * 2;
      return `<g><title>${label}: ${value.toFixed(1)}%</title><rect class="data-column-bar" style="animation-delay: ${(i * 2 + j) * 60}ms" x="${bx}" y="${256 - height}" width="36" height="${height}" rx="3" fill="${j ? "#2563eb" : "#a9b5c5"}"/><text class="column-value" x="${bx + 18}" y="${248 - height}" text-anchor="middle">${value.toFixed(1)}</text></g>`;
    }).join("");
    return `${bars}<text class="column-budget" x="${x}" y="280" text-anchor="middle">${budget} originals</text><text x="${x}" y="301" text-anchor="middle">+${budget * 10} generated</text>`;
  }).join("");
  return `<svg class="data-column-chart" viewBox="0 0 520 330" role="img" aria-label="Table 9: original-only versus World-Sim augmentation success. At 10 originals: 28.5 versus 64.5 percent; at 30: 57.0 versus 87.0; at 50: 70.0 versus 93.0.">
    <g class="column-legend"><rect x="55" y="8" width="12" height="12" rx="2" fill="#a9b5c5"/><text x="74" y="19">Original only</text><rect x="230" y="8" width="12" height="12" rx="2" fill="#2563eb"/><text x="249" y="19">Original + World-Sim 1.0</text></g>
    ${ticks}${groups}<text x="272" y="325" text-anchor="middle">Trajectories per task</text>
  </svg>`;
}
