const questions = [
  { q: "What do you enjoy most?", o: ["Building", "Researching", "Creating", "Helping"], m: ["R","I","A","S"] },
  { q: "Which sounds fun?", o: ["Fix machines", "Solve problems", "Design art", "Teach people"], m: ["R","I","A","S"] },
  { q: "Pick one", o: ["Workshop", "Lab", "Studio", "Classroom"], m: ["R","I","A","S"] },
  { q: "You prefer", o: ["Hands-on", "Thinking", "Imagination", "Socializing"], m: ["R","I","A","S"] },
  { q: "Which job sounds best?", o: ["Technician", "Scientist", "Designer", "Teacher"], m: ["R","I","A","S"] },
  { q: "Your strength", o: ["Practical", "Analytical", "Creative", "Empathetic"], m: ["R","I","A","S"] },
  { q: "Choose", o: ["Tools", "Data", "Art", "People"], m: ["R","I","A","S"] },
  { q: "You like", o: ["Repairing", "Discovering", "Designing", "Guiding"], m: ["R","I","A","S"] }
];

const jobDatabase = {
  R: [
    { title: "Electrician", skills: ["Wiring", "Safety"], salary: "₹3–6 LPA" },
    { title: "Mechanical Technician", skills: ["Repair", "Tools"], salary: "₹4–7 LPA" }
  ],
  I: [
    { title: "Data Scientist", skills: ["Python", "ML"], salary: "₹8–15 LPA" },
    { title: "Research Analyst", skills: ["Analysis"], salary: "₹6–10 LPA" }
  ],
  A: [
    { title: "Graphic Designer", skills: ["Photoshop", "Creativity"], salary: "₹4–8 LPA" },
    { title: "UI/UX Designer", skills: ["Figma", "UX"], salary: "₹6–12 LPA" }
  ],
  S: [
    { title: "Teacher", skills: ["Communication"], salary: "₹3–6 LPA" },
    { title: "Counselor", skills: ["Empathy"], salary: "₹4–7 LPA" }
  ],
  E: [
    { title: "Startup Founder", skills: ["Leadership"], salary: "Variable" }
  ],
  C: [
    { title: "Accountant", skills: ["Excel", "Tally"], salary: "₹4–8 LPA" }
  ]
};

let scores = { R:0, I:0, A:0, S:0, E:0, C:0 };
let current = 0;

function loadQuestion() {
  const qEl = document.getElementById("question");
  const optEl = document.getElementById("options");
  const prog = document.getElementById("progress");

  if (!qEl) return;

  const q = questions[current];
  qEl.innerText = q.q;
  optEl.innerHTML = "";

  q.o.forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = text;
    btn.onclick = () => selectOption(idx);
    optEl.appendChild(btn);
  });

  prog.innerText = `Question ${current + 1} of ${questions.length}`;
}

function selectOption(index) {
  const letter = questions[current].m[index];
  scores[letter]++;
  current++;

  if (current >= questions.length) {
    localStorage.setItem("scores", JSON.stringify(scores));
    window.location.href = "result.html";
  } else {
    loadQuestion();
  }
}

function showResults() {
  const codeEl = document.getElementById("code");
  if (!codeEl) return;

  const saved = JSON.parse(localStorage.getItem("scores"));
  const sorted = Object.entries(saved).sort((a,b)=>b[1]-a[1]);
  const top3 = sorted.slice(0,3).map(x=>x[0]);

  document.getElementById("code").innerText = top3.join("");
  document.getElementById("desc").innerText = "Your dominant career interests.";

  const container = document.getElementById("jobResults");
  container.innerHTML = "";

  top3.forEach(code => {
    const jobs = jobDatabase[code];
    if (!jobs) return;

    jobs.forEach(job => {
      const div = document.createElement("div");
      div.className = "job-card";
      div.innerHTML = `
        <h4>${job.title}</h4>
        <p>Skills: ${job.skills.join(", ")}</p>
        <p>Salary: ${job.salary}</p>
      `;
      container.appendChild(div);
    });
  });
}

function restart() {
  localStorage.clear();
  window.location.href = "index.html";
}

loadQuestion();
showResults();
