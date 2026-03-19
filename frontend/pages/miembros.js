/* ══════════════════════════════════════
   PAGES/MIEMBROS.JS
══════════════════════════════════════ */
'use strict';

const PageMiembros = (() => {

  let _search = '';
  let _filter = '';

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

      <div id="tableContainer"></div>
    </div>`;
  }

  function afterRender() {
    _search = '';
    _filter = '';
    renderTable();

    $('searchInput').addEventListener('input', e => { _search = e.target.value.toLowerCase(); renderTable(); });
    $('filterStatus').addEventListener('change', e => { _filter = e.target.value; renderTable(); });
    $('btnIrRegistro').addEventListener('click', () => window._router?.navigate('registro'));
  }

  function renderTable() {
    const all = Store.getMembers();
    const list = all.filter(m => {
      const matchSearch = !_search ||
        `${m.nombres} ${m.apellidos}`.toLowerCase().includes(_search) ||
        m.cedula.includes(_search) ||
        m.email.toLowerCase().includes(_search);
      const matchFilter = !_filter || m.estado === _filter;
      return matchSearch && matchFilter;
    });

    // Actualizar contador
    const count = $('membersCount');
    if (count) count.textContent = `${all.length} miembros registrados · ${list.length} mostrados`;

    const container = $('tableContainer');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>${all.length === 0 ? 'No hay miembros registrados aún. ¡Registra el primero!' : 'No se encontraron miembros con ese criterio.'}</p>
        </div>`;
      return;
    }

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Miembro</th><th>Cédula</th><th>Teléfono</th>
              <th>Plan</th><th>Vence</th><th>Registro</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(m => {
              const realIdx = all.indexOf(m);
              const ini = (m.nombres[0]||'')+(m.apellidos[0]||'');
              return `
              <tr>
                <td><div class="member-cell"><div class="avatar">${ini.toUpperCase()}</div><span class="member-name">${m.nombres} ${m.apellidos}</span></div></td>
                <td>${m.cedula}</td>
                <td>${m.telefono}</td>
                <td>${m.plan.split(' - ')[0]}</td>
                <td>${m.vence}</td>
                <td>${m.fechaRegistro || '—'}</td>
                <td><span class="status ${statusClass(m.estado)}">${m.estado}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-ghost btn-sm" onclick="PageMiembros.openEdit(${realIdx})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="PageMiembros.remove(${realIdx})">🗑</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function openEdit(index) {
    const m = Store.getMember(index);
    if (!m) return;
    $('e-nombres').value   = m.nombres;
    $('e-apellidos').value = m.apellidos;
    $('e-telefono').value  = m.telefono;
    $('e-email').value     = m.email;
    $('e-plan').value      = m.plan;
    $('e-estado').value    = m.estado;
    $('e-notas').value     = m.notas;
    $('editModal')._editIndex = index;
    openModal('editModal');
  }

  function remove(index) {
    const m = Store.getMember(index);
    if (!m) return;
    if (!confirm(`¿Eliminar a ${m.nombres} ${m.apellidos}? Esta acción no se puede deshacer.`)) return;
    Store.deleteMember(index);
    showToast(`🗑 ${m.nombres} eliminado.`);
    renderTable();
  }

  /* Se llama desde el store cuando cambian los datos */
  function onStoreUpdate() {
    if ($('tableContainer')) renderTable();
  }

  return { getHTML, afterRender, openEdit, remove, onStoreUpdate };
})();
