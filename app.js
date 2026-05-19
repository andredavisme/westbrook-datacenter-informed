// ===== WESTBROOK INFORMED - APP.JS =====

// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://hhyhulqngdkwsxhymmcd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_haKvwV0M7KMj4Qz69M6WGg_KmIfU-aI';

async function sbInsert(question_id, answer) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/wb_poll_votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ question_id, answer })
  });
  return res.ok;
}

async function sbGetResults(question_id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/wb_poll_results?question_id=eq.${encodeURIComponent(question_id)}&order=votes.desc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );
  if (!res.ok) return [];
  return res.json();
}

// --- COUNTDOWN TIMER ---
// Moratorium adopted May 18 2026; 180 days expires ~Nov 14 2026
const MORATORIUM_END = new Date('2026-11-14T23:59:59-05:00').getTime();

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now = Date.now();
  const diff = MORATORIUM_END - now;
  const banner = document.getElementById('countdown-banner');
  if (diff <= 0) {
    document.getElementById('cd-days').textContent = '00';
    document.getElementById('cd-hours').textContent = '00';
    document.getElementById('cd-mins').textContent = '00';
    document.getElementById('cd-secs').textContent = '00';
    if (banner) banner.classList.add('expired');
    return;
  }
  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('cd-days').textContent  = pad(days);
  document.getElementById('cd-hours').textContent = pad(hours);
  document.getElementById('cd-mins').textContent  = pad(mins);
  document.getElementById('cd-secs').textContent  = pad(secs);

  // Urgency color: gold when < 30 days, red when < 7
  if (banner) {
    if (days < 7)  banner.classList.add('urgent');
    else if (days < 30) banner.classList.add('warning');
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

// --- CHARTS ---

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

// --- POLL LOGIC ---

const pollData = JSON.parse(localStorage.getItem('wbPollData') || '{}');

function buildResultsBar(rows, myAnswer) {
  if (!rows || rows.length === 0) return '';
  const total = rows.reduce((s, r) => s + Number(r.votes), 0);
  return rows.map(r => {
    const pct = total > 0 ? Math.round((Number(r.votes) / total) * 100) : 0;
    const isMe = r.answer === myAnswer ? ' <em>(you)</em>' : '';
    return `
      <div class="result-row">
        <span class="result-label">${r.answer}${isMe}</span>
        <div class="result-bar-wrap">
          <div class="result-bar" style="width:${pct}%"></div>
        </div>
        <span class="result-pct">${pct}% <small>(${r.votes})</small></span>
      </div>`;
  }).join('') + `<p class="result-total">Total responses: ${total}</p>`;
}

async function vote(questionId, answer) {
  if (pollData[questionId]) {
    const rows = await sbGetResults(questionId);
    showResult(questionId, buildResultsBar(rows, pollData[questionId]));
    return;
  }
  pollData[questionId] = answer;
  localStorage.setItem('wbPollData', JSON.stringify(pollData));
  lockQuestion(questionId, answer);
  showResult(questionId, 'Submitting...');
  const ok = await sbInsert(questionId, answer);
  if (ok) {
    const rows = await sbGetResults(questionId);
    showResult(questionId, buildResultsBar(rows, answer));
  } else {
    showResult(questionId, 'Response saved locally. Results will display when connected.');
  }
}

function lockQuestion(questionId, answer) {
  const btns = document.querySelectorAll('#' + questionId + ' .poll-btn');
  btns.forEach(btn => {
    if (btn.textContent.trim() === answer) btn.classList.add('selected');
    btn.disabled = true;
  });
}

function showResult(questionId, html) {
  const el = document.getElementById('result-' + questionId);
  if (el) el.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', async () => {
  for (const qId of Object.keys(pollData)) {
    lockQuestion(qId, pollData[qId]);
    const rows = await sbGetResults(qId);
    showResult(qId, buildResultsBar(rows, pollData[qId]));
  }
});

// --- COPY LINK ---
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert('Link copied!');
  }).catch(() => {
    prompt('Copy this link:', window.location.href);
  });
}
