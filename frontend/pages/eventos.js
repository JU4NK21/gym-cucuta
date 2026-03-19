/* ══════════════════════════════════════
   PAGES/EVENTOS.JS
   - Admin/Entrenador: puede agregar eventos
   - Cliente: solo visualiza
══════════════════════════════════════ */
'use strict';

const PageEventos = (() => {

  let _calYear  = new Date().getFullYear();
  let _calMonth = new Date().getMonth();
  let _diaSeleccionado = null;

  function getHTML() {
    const rol      = Auth.getRol();
    const esAdmin  = rol === 'admin' || rol === 'entrenador';

    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">📅 Calendario de Eventos</h2>
          <p class="page-sub">${esAdmin ? 'Gestiona los eventos y actividades del gimnasio' : 'Consulta los próximos eventos y actividades'}</p>
        </div>
      </div>

      <div class="eventos-layout-new">

        <!-- CALENDARIO MEJORADO -->
        <div class="cal-card">
          <div class="cal-card-header">
            <button class="cal-nav-btn" id="calPrev">‹</button>
            <div class="cal-month-info">
              <h3 id="calTitle"></h3>
              <span id="calEventCount" class="cal-event-count"></span>
            </div>
            <button class="cal-nav-btn" id="calNext">›</button>
          </div>

          <div class="cal-weekdays-new">
            <span>Dom</span><span>Lun</span><span>Mar</span>
            <span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
          </div>

          <div class="cal-grid-new" id="calGrid"></div>

          <div class="cal-legend">
            <span class="cal-legend-item"><span class="cal-legend-dot today-dot"></span>Hoy</span>
            <span class="cal-legend-item"><span class="cal-legend-dot event-dot"></span>Con evento</span>
          </div>
        </div>

        <!-- PANEL DERECHO -->
        <div class="cal-side">

          <!-- Eventos del día seleccionado -->
          <div class="card" id="diaEventosCard" style="display:none; margin-bottom:16px;">
            <div class="card-title" id="diaEventosTitulo">Eventos del día</div>
            <div id="diaEventosLista"></div>
          </div>

          <!-- Formulario solo para admin/entrenador -->
          ${esAdmin ? `
          <div class="card">
            <div class="card-title">➕ Agregar Evento</div>
            <div class="field" style="margin-bottom:14px;">
              <label>Nombre <span class="req">*</span></label>
              <input type="text" id="ev-nombre" placeholder="Ej: Clase especial de Zumba"/>
            </div>
            <div class="form-row">
              <div class="field"><label>Fecha <span class="req">*</span></label><input type="date" id="ev-fecha"/></div>
              <div class="field"><label>Hora</label><input type="time" id="ev-hora"/></div>
            </div>
            <div class="field" style="margin-bottom:14px;"><label>Tipo</label>
              <select id="ev-tipo">
                <option>Clase especial</option><option>Torneo</option>
                <option>Seminario</option><option>Promoción</option>
                <option>Mantenimiento</option><option>Otro</option>
              </select>
            </div>
            <div class="field" style="margin-bottom:14px;">
              <label>Descripción</label>
              <textarea id="ev-desc" placeholder="Descripción del evento..."></textarea>
            </div>
            <button class="btn btn-primary full-width" id="btnAddEvent">📅 Agregar al Calendario</button>
          </div>
          ` : `
          <div class="cal-info-card">
            <div class="cal-info-icon">💡</div>
            <h4>¿Cómo usar el calendario?</h4>
            <p>Haz clic en cualquier fecha para ver los eventos de ese día. Los días marcados con un punto azul tienen actividades programadas.</p>
          </div>
          `}
        </div>
      </div>

      <!-- LISTA PRÓXIMOS EVENTOS -->
      <div class="card" style="margin-top:24px;">
        <div class="card-title">Próximos Eventos</div>
        <div class="events-list" id="eventsList"></div>
      </div>
    </div>`;
  }

  function afterRender() {
    document.getElementById('calPrev').addEventListener('click', () => {
      _calMonth--; if(_calMonth < 0){ _calMonth = 11; _calYear--; } renderCalendar();
    });
    document.getElementById('calNext').addEventListener('click', () => {
      _calMonth++; if(_calMonth > 11){ _calMonth = 0; _calYear++; } renderCalendar();
    });

    const btnAdd = document.getElementById('btnAddEvent');
    if (btnAdd) btnAdd.addEventListener('click', addEvent);

    renderCalendar();
  }

  function renderCalendar() {
    const titleEl      = document.getElementById('calTitle');
    const countEl      = document.getElementById('calEventCount');
    const gridEl       = document.getElementById('calGrid');
    if (!titleEl || !gridEl) return;

    titleEl.textContent = `${MONTHS[_calMonth]} ${_calYear}`;

    const firstDay    = new Date(_calYear, _calMonth, 1).getDay();
    const daysInMonth = new Date(_calYear, _calMonth + 1, 0).getDate();
    const todayStr    = todayISO();

    // Agrupar eventos por fecha
    const evMap = {};
    Store.getEvents().forEach(ev => {
      if (!evMap[ev.fecha]) evMap[ev.fecha] = [];
      evMap[ev.fecha].push(ev);
    });

    // Contar eventos del mes
    const evMes = Object.keys(evMap).filter(f => f.startsWith(`${_calYear}-${pad2(_calMonth+1)}`)).length;
    if (countEl) countEl.textContent = evMes > 0 ? `${evMes} evento${evMes>1?'s':''}` : '';

    let cells = '';

    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      cells += `<div class="cal-cell-new empty"></div>`;
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const ds       = `${_calYear}-${pad2(_calMonth+1)}-${pad2(d)}`;
      const isToday  = ds === todayStr;
      const hasEvent = !!evMap[ds];
      const isSel    = ds === _diaSeleccionado;
      const count    = evMap[ds]?.length || 0;

      let cls = 'cal-cell-new';
      if (isToday)  cls += ' cal-today';
      if (isSel)    cls += ' cal-selected';
      if (hasEvent) cls += ' cal-has-event';

      cells += `
        <div class="${cls}" data-date="${ds}" onclick="PageEventos.seleccionarDia('${ds}')">
          <span class="cal-day-num">${d}</span>
          ${hasEvent ? `<span class="cal-dot-row">${'●'.repeat(Math.min(count,3))}</span>` : ''}
        </div>`;
    }

    gridEl.innerHTML = cells;
    renderEventsList();

    // Si hay un día seleccionado, refrescar su panel
    if (_diaSeleccionado) seleccionarDia(_diaSeleccionado);
  }

  function seleccionarDia(fecha) {
    _diaSeleccionado = fecha;

    // Quitar selección anterior y marcar nueva
    document.querySelectorAll('.cal-cell-new').forEach(c => c.classList.remove('cal-selected'));
    const cell = document.querySelector(`[data-date="${fecha}"]`);
    if (cell) cell.classList.add('cal-selected');

    const card   = document.getElementById('diaEventosCard');
    const titulo = document.getElementById('diaEventosTitulo');
    const lista  = document.getElementById('diaEventosLista');
    if (!card || !lista) return;

    const evs = Store.getEvents().filter(e => e.fecha === fecha);
    const d   = new Date(fecha + 'T12:00:00');
    const label = `${d.getDate()} de ${MONTHS[d.getMonth()]}`;

    if (titulo) titulo.textContent = `Eventos · ${label}`;
    card.style.display = 'block';

    if (!evs.length) {
      lista.innerHTML = `<p style="color:var(--text-muted);font-size:13px;padding:8px 0;">Sin eventos este día.</p>`;
      return;
    }

    lista.innerHTML = evs.map(ev => `
      <div class="dia-evento-item">
        <div class="dia-evento-hora">${ev.hora || 'Todo el día'}</div>
        <div class="dia-evento-info">
          <div class="dia-evento-nombre">${ev.nombre}</div>
          <div class="dia-evento-tipo">${ev.tipo}${ev.desc ? ' · ' + ev.desc : ''}</div>
        </div>
      </div>
    `).join('');
  }

  function addEvent() {
    const nombre = document.getElementById('ev-nombre')?.value.trim();
    const fecha  = document.getElementById('ev-fecha')?.value;
    if (!nombre || !fecha) { showToast('Nombre y fecha son obligatorios.', 'warn'); return; }

    Store.addEvent({
      nombre, fecha,
      hora:  document.getElementById('ev-hora')?.value  || '',
      tipo:  document.getElementById('ev-tipo')?.value  || 'Otro',
      desc:  document.getElementById('ev-desc')?.value.trim() || ''
    });

    ['ev-nombre','ev-fecha','ev-hora','ev-desc'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });

    showToast('📅 Evento agregado al calendario.');
    renderCalendar();
  }

  function renderEventsList() {
    const container = document.getElementById('eventsList');
    if (!container) return;

    const hoy    = todayISO();
    const sorted = [...Store.getEvents()]
      .filter(e => e.fecha >= hoy)
      .sort((a,b) => a.fecha.localeCompare(b.fecha));

    if (!sorted.length) {
      container.innerHTML = `<div class="empty-state" style="padding:24px;"><div class="empty-icon">📅</div><p>No hay eventos próximos.</p></div>`;
      return;
    }

    const tipoColor = { 'Clase especial':'tag-blue', 'Torneo':'tag-orange', 'Seminario':'tag-blue', 'Promoción':'tag-green', 'Mantenimiento':'tag-orange', 'Otro':'tag-blue' };

    container.innerHTML = sorted.map(ev => {
      const d   = new Date(ev.fecha + 'T12:00:00');
      const day = d.getDate();
      const mon = MONTHS[d.getMonth()].slice(0,3).toUpperCase();
      const color = tipoColor[ev.tipo] || 'tag-blue';
      return `
        <div class="event-item">
          <div class="event-date-box">
            <span class="event-day">${day}</span>
            <span class="event-mon">${mon}</span>
          </div>
          <div class="event-info">
            <div class="event-nombre">${ev.nombre}</div>
            <div class="event-meta">
              <span class="news-tag ${color}">${ev.tipo}</span>
              <span class="event-hora">🕐 ${ev.hora || 'Todo el día'}</span>
              ${ev.desc ? `<span class="event-desc-text">${ev.desc}</span>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');
  }

  return { getHTML, afterRender, seleccionarDia };
})();
