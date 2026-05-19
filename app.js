// ===== WESTBROOK INFORMED - APP.JS =====

// Energy Chart
const energyCtx = document.getElementById('energyChart');
if (energyCtx) {
  new Chart(energyCtx, {
    type: 'bar',
    data: {
      labels: ['Edge', 'Enterprise', 'Hyperscale', 'AI Cluster'],
      datasets: [{
        label: 'Typical Power Draw (MW)',
        data: [10, 60, 300, 600],
        backgroundColor: ['#f39c12','#e67e22','#e74c3c','#c0392b'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y + ' MW' } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 10 } }, title: { display: true, text: 'Megawatts', font: { size: 10 } } },
        x: { ticks: { font: { size: 10 } } }
      }
    }
  });
}

// Water Chart
const waterCtx = document.getElementById('waterChart');
if (waterCtx) {
  new Chart(waterCtx, {
    type: 'bar',
    data: {
      labels: ['Air-Cooled', 'Evaporative (Med)', 'Hyperscale'],
      datasets: [{
        label: 'Millions Gallons/Year',
        data: [0.5, 50, 500],
        backgroundColor: ['#3498db','#2980b9','#1a5276'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ctx.parsed.y + 'M gal/yr' } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 10 } }, title: { display: true, text: 'Million Gallons/Year', font: { size: 10 } } },
        x: { ticks: { font: { size: 10 } } }
      }
    }
  });
}

// Jobs Chart
const jobsCtx = document.getElementById('jobsChart');
if (jobsCtx) {
  new Chart(jobsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Construction (temp)', 'Permanent Ops', 'Indirect/Supply Chain'],
      datasets: [{
        data: [65, 15, 20],
        backgroundColor: ['#f39c12','#27ae60','#3498db'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 9 }, padding: 8 } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
      }
    }
  });
}

// ===== POLL =====
const pollData = JSON.parse(localStorage.getItem('wbPollData') || '{}');

function vote(questionId, answer) {
  if (pollData[questionId]) {
    showResult(questionId, 'You already responded: "' + pollData[questionId] + '"');
    return;
  }
  pollData[questionId] = answer;
  localStorage.setItem('wbPollData', JSON.stringify(pollData));
  lockQuestion(questionId, answer);
  showResult(questionId, 'Response recorded: "' + answer + '"');
}

function lockQuestion(questionId, answer) {
  const btns = document.querySelectorAll('#' + questionId + ' .poll-btn');
  btns.forEach(btn => {
    if (btn.textContent.trim() === answer) btn.classList.add('selected');
    btn.disabled = true;
  });
}

function showResult(questionId, message) {
  const el = document.getElementById('result-' + questionId);
  if (el) el.textContent = message;
}

window.addEventListener('DOMContentLoaded', () => {
  Object.keys(pollData).forEach(qId => {
    lockQuestion(qId, pollData[qId]);
    showResult(qId, 'Response recorded: "' + pollData[qId] + '"');
  });
});

// ===== COPY LINK =====
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('Link copied!');
  }).catch(() => {
    prompt('Copy this link:', window.location.href);
  });
}
