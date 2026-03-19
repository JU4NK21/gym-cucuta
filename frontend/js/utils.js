/* ══════════════════════════════════════
   UTILS.JS — Funciones auxiliares
══════════════════════════════════════ */
'use strict';

/* ── DOM ── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── Toast ── */
let _toastTimer = null;
function showToast(message, type = 'success') {
  const toast = $('toast');
  const iconEl = $('toastIcon');
  const msgEl  = $('toastMsg');
  const icons  = { success:'✅', error:'❌', warn:'⚠️', info:'ℹ️' };
  iconEl.textContent = icons[type] || '✅';
  msgEl.textContent  = message;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ── Fecha ── */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function pad2(n) { return String(n).padStart(2,'0'); }
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}
function friendlyDate() {
  const now  = new Date();
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  return `${days[now.getDay()]} ${now.getDate()} de ${MONTHS[now.getMonth()]}, ${now.getFullYear()}`;
}

/* ── Status CSS ── */
function statusClass(estado) {
  return { Activo:'status-active', Inactivo:'status-inactive', Pendiente:'status-pending' }[estado] || 'status-pending';
}

/* ── Bar chart renderer ── */
function renderBarChart(containerId, data) {
  const el = $(containerId);
  if (!el) return;
  const maxVal = Math.max(...data.map(d => d.val), 1);
  el.innerHTML = data.map(d => `
    <div class="bar-row">
      <div class="bar-label">${d.label}</div>
      <div class="bar-outer">
        <div class="bar-inner" data-target="${Math.round((d.val/maxVal)*100)}">
          <span>${d.display !== undefined ? d.display : d.val}</span>
        </div>
      </div>
    </div>`).join('');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.querySelectorAll('.bar-inner').forEach(b => { b.style.width = b.dataset.target + '%'; });
  }));
}

/* ── Donut chart renderer ── */
function renderDonutChart(containerId, data, centerLabel) {
  const el = $(containerId);
  if (!el) return;
  const r = 45, circ = 2 * Math.PI * r;
  let offset = circ / 4;
  const hasData = data.some(d => d.val > 0);
  const circles = hasData
    ? data.map(d => {
        const dash = (d.val / 100) * circ;
        const c = `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${d.color}"
          stroke-width="10" stroke-dasharray="${dash.toFixed(2)} ${(circ-dash).toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}" style="transition:stroke-dashoffset 0.6s ease;"/>`;
        offset -= dash; return c;
      }).join('')
    : `<circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>`;

  el.innerHTML = `
    <svg class="donut-svg" viewBox="0 0 100 100" width="160" height="160">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
      <g transform="rotate(-90 50 50)">${circles}</g>
      <text x="50" y="46" text-anchor="middle" fill="#e5e7eb" font-size="13" font-weight="700" font-family="Barlow Condensed">${centerLabel}</text>
      <text x="50" y="60" text-anchor="middle" fill="#6b7280" font-size="7.5" font-family="Barlow">activos</text>
    </svg>
    <div class="donut-legend">
      ${data.map(d=>`<div class="legend-item"><div class="legend-dot" style="background:${d.color}"></div>${d.label}: ${d.count || 0} (${d.val}%)</div>`).join('')}
    </div>`;
}

/* ── Modal ── */
function openModal(id)  { $(id)?.classList.add('open'); }
function closeModal(id) { $(id)?.classList.remove('open'); }
