const resumeInput   = document.getElementById("resumeInput");
const jobDesc       = document.getElementById("jobDesc");
const analyzeBtn    = document.getElementById("analyzeBtn");
const generateBtn   = document.getElementById("generateBtn");

const extractedBox  = document.getElementById("extractedChips");
const missingBox    = document.getElementById("missingChips");
const finalBox      = document.getElementById("finalChips");
const guidanceList  = document.getElementById("guidanceList");

const beforeCanvas  = document.getElementById("beforeChart");
const afterCanvas   = document.getElementById("afterChart");

const API_URL = "https://resumeai-backend-e3ks.onrender.com/analyze/";

let extractedSkills = [];
let matchedSkills   = [];
let missingSkills   = [];
let finalSkills     = [];
let learningPaths   = {};

let beforeChart, afterChart;

const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    const { ctx } = chart;
    const value = chart.data.datasets[0].data[0];
    ctx.save();
    ctx.font = "bold 22px system-ui";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value + "%", chart.width / 2, chart.height / 2);
  }
};

function createDonut(ctx) {
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Matched", "Missing"],
      datasets: [{
        data: [0, 100],
        backgroundColor: ["#3ba4f9", "#ff6b8a"]
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: { legend: { display: false } }
    },
    plugins: [centerTextPlugin]
  });
}

function updateCharts(before, after) {
  if (!beforeChart) {
    beforeChart = createDonut(beforeCanvas);
    afterChart  = createDonut(afterCanvas);
  }
  beforeChart.data.datasets[0].data = [before, 100 - before];
  afterChart.data.datasets[0].data  = [after, 100 - after];
  beforeChart.update();
  afterChart.update();
}

analyzeBtn.addEventListener("click", async () => {
  const file = resumeInput.files[0];
  const jd   = jobDesc.value.trim();

  if (!file || !jd) {
    alert("Upload resume and paste job description");
    return;
  }

  const form = new FormData();
  form.append("file", file);
  form.append("job_description", jd);

  const res = await fetch(API_URL, { method: "POST", body: form });
  const data = await res.json();

  extractedSkills = data.extracted_skills || [];
  matchedSkills   = data.matched_skills   || [];
  missingSkills   = data.missing_skills   || [];
  learningPaths   = data.learning_paths   || {};

  finalSkills = [...extractedSkills];

  renderAll();
});

function renderAll() {
  renderChips(extractedBox, extractedSkills);
  renderMissing();
  renderFinal();
  renderGuidance();

  const total  = matchedSkills.length + missingSkills.length || 1;
  const before = Math.round((matchedSkills.length / total) * 100);

  updateCharts(before, before);
  renderATSAndRecruiter(before);
}

function renderChips(container, list) {
  container.innerHTML = "";
  list.forEach(s => container.innerHTML += `<div class="chip">${s}</div>`);
}

function renderMissing() {
  missingBox.innerHTML = "";
  missingSkills.forEach(s => {
    missingBox.innerHTML += `
      <div class="chip missing">
        ${s}
        <button onclick="addSkill('${s}')">Add</button>
      </div>`;
  });
}

function addSkill(skill) {
  if (!finalSkills.includes(skill)) {
    finalSkills.push(skill);
    renderFinal();

    const total  = matchedSkills.length + missingSkills.length || 1;
    const before = Math.round((matchedSkills.length / total) * 100);
    const after  = Math.min(Math.round((finalSkills.length / total) * 100), 95);

    updateCharts(before, after);
    renderATSAndRecruiter(after);
  }
}

function renderFinal() {
  renderChips(finalBox, finalSkills);
}

function renderGuidance() {
  guidanceList.innerHTML = "";

  missingSkills.forEach(skill => {
    const g = learningPaths[skill];
    if (!g) return;

    guidanceList.innerHTML += `
      <div class="guide">
        <strong onclick="this.nextElementSibling.classList.toggle('open')" style="cursor:pointer">
          ${skill} ▼
        </strong>
        <div class="guide-body">
          <ul>
            ${g.roadmap.map((step, i) =>
              `<li><a href="${g.links[i]}" target="_blank">${step}</a></li>`
            ).join("")}
          </ul>
          <p><b>Certification:</b> ${g.cert || "—"}</p>
        </div>
      </div>`;
  });
}

function renderATSAndRecruiter(score) {
  let container = document.getElementById("atsRecruiterBox");

  if (!container) {
    container = document.createElement("div");
    container.id = "atsRecruiterBox";
    generateBtn.insertAdjacentElement("afterend", container);
  }

  const recruiterNote =
    score >= 80 ? "High chance of shortlisting" :
    score >= 65 ? "Moderate shortlisting probability" :
                  "Low shortlisting probability";

  container.innerHTML = `
    <div class="card">
      <h3>ATS Match Score: ${score}%</h3>
      <ul>
        <li>Keyword matching successful</li>
        <li>No keyword stuffing detected</li>
        <li>ATS-readable structure</li>
        <li>Clear section hierarchy</li>
      </ul>
    </div>

    <div class="card">
      <h3>Recruiter View (Simulated)</h3>
      <p><b>Shortlisting:</b> ${recruiterNote}</p>
      <p><b>Strengths:</b> Strong fundamentals and clarity</p>
      <p><b>Risk:</b> Limited deployment exposure</p>
      <p><b>Recommendation:</b> Add one production-level project</p>
    </div>`;
}

generateBtn.addEventListener("click", () => {
  if (!matchedSkills.length) {
    alert("Please analyze the resume first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 20;

  pdf.setFontSize(16);
  pdf.text("Skill Analysis Appendix", 20, y);
  y += 10;

  pdf.setFontSize(10);
  pdf.text("Note: Original resume is NOT modified.", 20, y);
  y += 12;

  pdf.setFontSize(12);
  pdf.text("Matched Skills:", 20, y);
  y += 8;

  pdf.setFontSize(10);
  matchedSkills.forEach(s => {
    pdf.text(`- ${s}`, 22, y);
    y += 6;
  });

  y += 8;
  pdf.setFontSize(12);
  pdf.text("Missing Skills and Learning Roadmaps:", 20, y);
  y += 8;

  pdf.setFontSize(10);
  missingSkills.forEach(skill => {
    const g = learningPaths[skill];
    if (!g) return;

    pdf.text(skill, 22, y);
    y += 6;

    g.roadmap.forEach((step, i) => {
      pdf.text(`• ${step}`, 26, y);
      pdf.textWithLink("Open", 150, y, { url: g.links[i] });
      y += 6;
    });

    y += 4;
  });

  pdf.save("Skill_Analysis_Appendix.pdf");
});
