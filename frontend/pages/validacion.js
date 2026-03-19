/* ═══════════════════════════════════════
   PAGES/VALIDACION.JS — Panel admin: aprobación entrenadores
═══════════════════════════════════════ */
'use strict';

const PageValidacion = (() => {

  function getHTML() {
    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">Validación de Entrenadores</h2>
          <p class="page-sub">Aprueba o rechaza solicitudes de nuevos entrenadores</p>
        </div>
        <button class="btn btn-ghost btn-sm" id="btnRefrescarVal">🔄 Refrescar</button>
      </div>

      <!-- Stats -->
      <div class="stats-grid" id="valStats" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px;"></div>

      <!-- Tabla solicitudes -->
      <div class="card">
        <div class="card-title">Solicitudes de Entrenadores</div>
        <div id="valTabla">
          <div class="empty-state"><div class="empty-icon">⏳</div><p>Cargando solicitudes...</p></div>
        </div>
      </div>
    </div>`;
  }

  async function afterRender() {
    document.getElementById('btnRefrescarVal').addEventListener('click', cargarDatos);
    await cargarDatos();
  }

  async function cargarDatos() {
    try {
      const [dataSol, dataStats] = await Promise.all([
        Auth.fetchAuth('/validacion'),
        Auth.fetchAuth('/validacion/estadisticas')
      ]);
      renderStats(dataStats.stats);
      renderTabla(dataSol.solicitudes);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function renderStats(stats) {
    const map = { pendiente: { label:'Pendientes', color:'orange', icon:'⏳' }, aprobado: { label:'Aprobados', color:'teal', icon:'✅' }, rechazado: { label:'Rechazados', color:'purple', icon:'❌' } };
    const el = document.getElementById('valStats');
    if (!el) return;
    let html = '';
    ['pendiente','aprobado','rechazado'].forEach(estado => {
      const found = stats.find(s => s.estado === estado);
      const total = found ? found.total : 0;
      const cfg   = map[estado];
      html += `
        <div class="stat-card" data-color="${cfg.color}">
          <div class="stat-icon-bg">${cfg.icon}</div>
          <div class="stat-label">${cfg.label}</div>
          <div class="stat-value">${total}</div>
        </div>`;
    });
    el.innerHTML = html;
  }

  function renderTabla(solicitudes) {
    const el = document.getElementById('valTabla');
    if (!el) return;

    if (!solicitudes.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p>No hay solicitudes pendientes.</p></div>`;
      return;
    }

    el.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Entrenador</th><th>Email</th><th>Teléfono</th>
              <th>Fecha Solicitud</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${solicitudes.map(s => `
              <tr>
                <td><div class="member-cell">
                  <div class="avatar">${s.nombre[0]}${s.apellido[0]}</div>
                  <span class="member-name">${s.nombre} ${s.apellido}</span>
                </div></td>
                <td>${s.email}</td>
                <td>${s.telefono || '—'}</td>
                <td>${s.fecha_solicitud?.split('T')[0] || s.fecha_solicitud}</td>
                <td>${badgeEstado(s.estado)}</td>
                <td>
                  ${s.estado === 'pendiente' ? `
                    <div class="action-btns">
                      <button class="btn btn-primary btn-sm" onclick="PageValidacion.aprobar(${s.id}, '${s.nombre} ${s.apellido}')">✅ Aprobar</button>
                      <button class="btn btn-danger btn-sm"  onclick="PageValidacion.rechazar(${s.id})">❌ Rechazar</button>
                    </div>` : `<span style="color:var(--text-faint);font-size:12px;">Revisado por ${s.revisado_por_nombre||'—'}</span>`}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function badgeEstado(estado) {
    const map = { pendiente:'status-pending', aprobado:'status-active', rechazado:'status-inactive' };
    return `<span class="status ${map[estado]||''}">${estado}</span>`;
  }

  async function aprobar(id, nombre) {
    if (!confirm(`¿Aprobar la solicitud de ${nombre}?`)) return;
    try {
      const data = await Auth.fetchAuth(`/validacion/${id}/aprobar`, { method: 'PUT' });
      showToast(data.mensaje);
      await cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  }

  async function rechazar(id) {
    const motivo = prompt('Motivo del rechazo (opcional):');
    if (motivo === null) return;
    try {
      await Auth.fetchAuth(`/validacion/${id}/rechazar`, {
        method: 'PUT',
        body: JSON.stringify({ motivo })
      });
      showToast('Solicitud rechazada.');
      await cargarDatos();
    } catch (err) { showToast(err.message, 'error'); }
  }

  return { getHTML, afterRender, aprobar, rechazar };
})();
