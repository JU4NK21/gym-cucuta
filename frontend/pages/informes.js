/* ══════════════════════════════════════
   PAGES/INFORMES.JS
══════════════════════════════════════ */
'use strict';

const PageInformes = (() => {

  function getHTML() {
    const s = Store.getStats();
    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">Informes y Estadísticas</h2>
          <p class="page-sub">Datos en tiempo real calculados desde los miembros registrados</p>
        </div>
        <div class="period-toggle">
          <button class="period-btn active" data-period="mes">Este Mes</button>
          <button class="period-btn" data-period="año">Este Año</button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card" data-color="blue">
          <div class="stat-icon-bg">💰</div>
          <div class="stat-label">Ingresos Potenciales</div>
          <div class="stat-value" id="rep-ingresos">${Store.formatCOP(s.ingresos)}</div>
          <div class="stat-sub">Suma de planes activos</div>
        </div>
        <div class="stat-card" data-color="teal">
          <div class="stat-icon-bg">👥</div>
          <div class="stat-label">Miembros Activos</div>
          <div class="stat-value" id="rep-activos">${s.activos}</div>
          <div class="stat-sub">De ${s.total} totales registrados</div>
        </div>
        <div class="stat-card" data-color="orange">
          <div class="stat-icon-bg">➕</div>
          <div class="stat-label">Nuevos este Mes</div>
          <div class="stat-value" id="rep-nuevos">${s.nuevosEsteMes}</div>
          <div class="stat-sub">Registros del mes actual</div>
        </div>
        <div class="stat-card" data-color="purple">
          <div class="stat-icon-bg">⚠️</div>
          <div class="stat-label">Vencen en 30 días</div>
          <div class="stat-value" id="rep-vencen">${s.vencenProximo}</div>
          <div class="stat-sub">${s.inactivos} ya inactivos</div>
        </div>
      </div>

      <div class="reports-grid">
        <div class="card">
          <div class="card-title">Distribución de Planes</div>
          <div class="donut-wrap" id="repDonut"></div>
        </div>
        <div class="card">
          <div class="card-title">Miembros por Estado</div>
          <div class="bar-chart" id="repEstadoChart"></div>
        </div>
        <div class="card">
          <div class="card-title">Planes Contratados</div>
          <div class="bar-chart" id="repPlanesChart"></div>
        </div>
        <div class="card">
          <div class="card-title">Vencimientos por Mes</div>
          <div class="bar-chart" id="repVencChart"></div>
        </div>
      </div>

      <div class="card" style="margin-top:20px;">
        <div class="card-title">Resumen de Miembros</div>
        <div class="table-wrap">
          <table id="repTable"></table>
        </div>
      </div>
    </div>`;
  }

  function afterRender() {
    renderCharts();
    $$('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCharts();
      });
    });
  }

  function renderCharts() {
    const s = Store.getStats();

    // Actualizar tarjetas
    const map = { 'rep-ingresos': Store.formatCOP(s.ingresos), 'rep-activos': s.activos, 'rep-nuevos': s.nuevosEsteMes, 'rep-vencen': s.vencenProximo };
    Object.entries(map).forEach(([id, val]) => { const el = $(id); if(el) el.textContent = val; });

    // Donut plans
    renderDonutChart('repDonut', s.planDist, s.activos);

    // Estado chart
    renderBarChart('repEstadoChart', [
      { label:'Activos',    val: s.activos,    display: s.activos },
      { label:'Inactivos',  val: s.inactivos,  display: s.inactivos },
      { label:'Pendientes', val: s.pendientes, display: s.pendientes },
    ]);

    // Planes chart
    renderBarChart('repPlanesChart', s.planDist.map(p => ({ label: p.label, val: p.count, display: p.count })));

    // Vencimientos por mes (próximos 6 meses)
    const members = Store.getMembers();
    const now = new Date();
    const vencMeses = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${pad2(d.getMonth()+1)}`;
      const count = members.filter(m => m.vence && m.vence.startsWith(key)).length;
      vencMeses.push({ label: MONTHS[d.getMonth()].slice(0,3), val: count, display: count });
    }
    renderBarChart('repVencChart', vencMeses);

    // Tabla resumen
    renderSummaryTable();
  }

  function renderSummaryTable() {
    const table = $('repTable');
    if (!table) return;
    const members = Store.getMembers();
    if (members.length === 0) {
      table.innerHTML = `<tbody><tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Sin miembros registrados aún.</td></tr></tbody>`;
      return;
    }
    table.innerHTML = `
      <thead><tr><th>Nombre</th><th>Plan</th><th>Vence</th><th>Registro</th><th>Estado</th></tr></thead>
      <tbody>
        ${members.map(m => `
          <tr>
            <td><div class="member-cell"><div class="avatar">${(m.nombres[0]||'')+(m.apellidos[0]||'').toUpperCase()}</div><span class="member-name">${m.nombres} ${m.apellidos}</span></div></td>
            <td>${m.plan.split(' - ')[0]}</td>
            <td>${m.vence}</td>
            <td>${m.fechaRegistro || '—'}</td>
            <td><span class="status ${statusClass(m.estado)}">${m.estado}</span></td>
          </tr>`).join('')}
      </tbody>`;
  }

  function onStoreUpdate() {
    if ($('rep-activos')) renderCharts();
  }

  return { getHTML, afterRender, onStoreUpdate };
})();
