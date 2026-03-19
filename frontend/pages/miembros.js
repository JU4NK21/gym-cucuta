/* ══════════════════════════════════════
   PAGES/MIEMBROS.JS — Lee desde API/BD
══════════════════════════════════════ */
'use strict';

const PageMiembros = (() => {

  let _search = '';
  let _filter = '';
  let _todos   = [];

  function getHTML() {
    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">Miembros Registrados</h2>
          <p class="page-sub" id="membersCount">Cargando...</p>
        </div>
      </div>
      <div class="table-toolbar">
        <div class="search-bar">
          <span>🔍</span>
          <input type="text" id="searchInput" placeholder="Buscar por nombre, cédula o correo..."/>
        </div>
        <select id="filterStatus" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
          <option value="Pendiente">Pendientes</option>
        </select>
        <button class="btn btn-primary btn-sm" id="btnIrRegistro">➕ Nuevo</button>
      </div>
      <div id="tableContainer">
        <div class="empty-state"><div class="empty-icon">⏳</div><p>Cargando miembros...</p></div>
      </div>
    </div>`;
  }

  async function afterRender() {
    _search = ''; _filter = '';
    await cargarMiembros();

    document.getElementById('searchInput')?.addEventListener('input', e => { _search = e.target.value.toLowerCase(); renderTabla(); });
    document.getElementById('filterStatus')?.addEventListener('change', e => { _filter = e.target.value; renderTabla(); });
    document.getElementById('btnIrRegistro')?.addEventListener('click', () => window._router?.navigate('registro-miembro'));
  }

  async function cargarMiembros() {
    try {
      const data = await Auth.fetchAuth('/miembros');
      _todos = data.miembros || [];
      renderTabla();
    } catch(err) {
      const c = document.getElementById('tableContainer');
      if (c) c.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><p>${err.message}</p></div>`;
    }
  }

  function renderTabla() {
    const list = _todos.filter(m => {
      const q = _search;
      const matchSearch = !q ||
        `${m.nombres} ${m.apellidos}`.toLowerCase().includes(q) ||
        (m.cedula||'').includes(q) ||
        (m.email||'').toLowerCase().includes(q);
      const matchFilter = !_filter || m.estado === _filter;
      return matchSearch && matchFilter;
    });

    const count = document.getElementById('membersCount');
    if (count) count.textContent = `${_todos.length} miembros registrados · ${list.length} mostrados`;

    const container = document.getElementById('tableContainer');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${_todos.length === 0 ? '👥' : '🔍'}</div>
          <p>${_todos.length === 0 ? 'No hay miembros registrados aún. ¡Registra el primero!' : 'No se encontraron miembros con ese criterio.'}</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Miembro</th><th>Cédula</th><th>Teléfono</th><th>Plan</th><th>Vence</th><th>Registro</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            ${list.map(m => {
              const ini = ((m.nombres||'')[0]||'') + ((m.apellidos||'')[0]||'');
              const sc  = { Activo:'status-active', Inactivo:'status-inactive', Pendiente:'status-pending' }[m.estado] || 'status-pending';
              return `
              <tr>
                <td><div class="member-cell"><div class="avatar">${ini.toUpperCase()}</div><span class="member-name">${m.nombres} ${m.apellidos}</span></div></td>
                <td>${m.cedula}</td>
                <td>${m.telefono||'—'}</td>
                <td>${(m.plan||'').split(' - ')[0] || '—'}</td>
                <td>${m.vence||'—'}</td>
                <td>${m.fecha_registro||'—'}</td>
                <td><span class="status ${sc}">${m.estado}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" onclick="PageMiembros.openEdit(${m.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="PageMiembros.remove(${m.id}, '${m.nombres} ${m.apellidos}')">🗑</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function openEdit(id) {
    const m = _todos.find(x => x.id === id);
    if (!m) return;

    document.getElementById('e-nombres').value   = m.nombres || '';
    document.getElementById('e-apellidos').value = m.apellidos || '';
    document.getElementById('e-telefono').value  = m.telefono || '';
    document.getElementById('e-email').value     = m.email || '';
    document.getElementById('e-plan').value      = m.plan || '';
    document.getElementById('e-estado').value    = m.estado || 'Activo';
    document.getElementById('e-notas').value     = m.notas || '';

    const modal = document.getElementById('editModal');
    modal._editId = id;
    modal.classList.add('open');
  }

  async function saveEdit(id) {
    try {
      await Auth.fetchAuth(`/miembros/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombres:   document.getElementById('e-nombres').value.trim(),
          apellidos: document.getElementById('e-apellidos').value.trim(),
          telefono:  document.getElementById('e-telefono').value.trim(),
          email:     document.getElementById('e-email').value.trim(),
          plan:      document.getElementById('e-plan').value,
          estado:    document.getElementById('e-estado').value,
          notas:     document.getElementById('e-notas').value.trim(),
        })
      });
      await cargarMiembros();
      showToast('💾 Cambios guardados correctamente.');
    } catch(err) { showToast(err.message, 'error'); }
  }

  async function remove(id, nombre) {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await Auth.fetchAuth(`/miembros/${id}`, { method: 'DELETE' });
      await cargarMiembros();
      showToast(`🗑 ${nombre} eliminado.`);
    } catch(err) { showToast(err.message, 'error'); }
  }

  async function onStoreUpdate() {
    if (document.getElementById('tableContainer')) await cargarMiembros();
  }

  return { getHTML, afterRender, openEdit, saveEdit, remove, onStoreUpdate };
})();
