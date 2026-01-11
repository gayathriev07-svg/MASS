const questions = [
  { q: "What do you enjoy?", o: ["Building", "Research", "Art", "Helping"], m: ["R","I","A","S"] },
  { q: "Pick one", o: ["Tools", "Data", "Design", "People"], m: ["R","I","A","S"] },
  { q: "Best place?", o: ["Workshop", "Lab", "Studio", "School"], m: ["R","I","A","S"] },
  { q: "Strength?", o: ["Hands-on", "Logic", "Creativity", "Empathy"], m: ["R","I","A","S"] }
];

const jobDatabase = {
  R: ["Electrician", "Technician", "Mechanic"],
  I: ["Data Scientist", "Researcher", "Engineer"],
  A: ["Designer", "Animator", "Writer"],
  S: ["Teacher", "Counselor", "HR"],
  E: ["Entrepreneur", "Marketer"],
  C: ["Accountant", "Data Clerk"]
};

const searchMap = {
  R: "technician",
  I: "data scientist",
  A: "designer",
  S: "teacher",
  E: "marketing",
  C: "accountant"
};

let scores = { R:0, I:0, A:0, S:0, E:0, C:0 };
let current = 0;

/* ================= QUIZ PAGE ================= */

function loadQuestion() {
  const q = document.getElementById("question");
  const o = document.getElementById("options");
  const p = document.getElementById("progress");
  if (!q || !o) return;

  const data = questions[current];
  q.innerText = data.q;
  o.innerHTML = "";

  data.o.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = text;
    btn.onclick = () => selectOption(i);
    o.appendChild(btn);
  });

  if (p) p.innerText = `Question ${current + 1} of ${questions.length}`;
}

function selectOption(i) {
  const letter = questions[current].m[i];
  scores[letter]++;
  current++;

  if (current >= questions.length) {
    localStorage.setItem("scores", JSON.stringify(scores));
    window.location.href = "result.html";
  } else {
    loadQuestion();
  }
}

/* ================= RESULT PAGE ================= */

function showResults() {
  const el = document.getElementById("code");
  if (!el) return;

  const saved = JSON.parse(localStorage.getItem("scores"));
  if (!saved) return;

  const sorted = Object.entries(saved).sort((a,b)=>b[1]-a[1]);
  const top3 = sorted.slice(0,3).map(x=>x[0]);

  el.innerText = top3.join("");

  const staticDiv = document.getElementById("jobResults");
  staticDiv.innerHTML = "";

  // ONLY show jobs for the TOP domain
  const topDomain = top3[0];
  jobDatabase[topDomain]?.forEach(job => {
    const d = document.createElement("div");
    d.className = "job-card";
    d.innerText = job;
    staticDiv.appendChild(d);
  });

  // Fetch live jobs for the same top domain
  fetchLiveJobs(searchMap[topDomain]);
}

async function fetchLiveJobs(keyword) {
  const container = document.getElementById("liveJobs");
  if (!container) return;

  try {
    const res = await fetch(`http://localhost:3000/jobs?q=${keyword}`);
    const jobs = await res.json();

    container.innerHTML = "";

    jobs.slice(0,5).forEach(job => {
      const d = document.createElement("div");
      d.className = "job-card";
      d.innerHTML = `
        <strong>${job.title}</strong><br>
        ${job.company || ""}<br>
        ${job.location || ""}<br>
        <a href="${job.url}" target="_blank">Apply</a>
      `;
      container.appendChild(d);
    });
  } catch (err) {
    container.innerHTML = "⚠ Unable to load live jobs.";
  }
}

function restart() {
  localStorage.clear();
  window.location.href = "index.html";
}

/* ================= AUTO DETECT PAGE ================= */

document.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
  showResults();
});
