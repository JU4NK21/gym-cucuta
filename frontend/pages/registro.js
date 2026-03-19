/* ══════════════════════════════════════
   PAGES/REGISTRO.JS
══════════════════════════════════════ */
'use strict';

const PageRegistro = (() => {

  function getHTML() {
    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">Registrar Nuevo Miembro</h2>
          <p class="page-sub">Complete todos los datos del nuevo integrante del gimnasio</p>
        </div>
      </div>

      <div class="card form-card">
        <div class="photo-upload" id="photoUpload" title="Cargar foto">
          <span class="photo-icon">📷</span>
          <span class="photo-label">Foto</span>
        </div>

        <div class="form-section-title">Información Personal</div>
        <div class="form-row">
          <div class="field"><label>Nombres <span class="req">*</span></label><input type="text" id="r-nombres" placeholder="Ej: Juan Carlos"/></div>
          <div class="field"><label>Apellidos <span class="req">*</span></label><input type="text" id="r-apellidos" placeholder="Ej: Pérez Gómez"/></div>
        </div>
        <div class="form-row-3">
          <div class="field"><label>Cédula / ID <span class="req">*</span></label><input type="text" id="r-cedula" placeholder="1234567890"/></div>
          <div class="field"><label>Fecha de Nacimiento</label><input type="date" id="r-nacimiento"/></div>
          <div class="field"><label>Género</label>
            <select id="r-genero"><option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Teléfono <span class="req">*</span></label><input type="tel" id="r-telefono" placeholder="300 123 4567"/></div>
          <div class="field"><label>Correo Electrónico</label><input type="email" id="r-email" placeholder="correo@ejemplo.com"/></div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Dirección</label><input type="text" id="r-direccion" placeholder="Calle 5 # 3-20, Cúcuta"/></div>

        <div class="form-section-title">Datos Físicos</div>
        <div class="form-row-3">
          <div class="field"><label>Peso (kg)</label><input type="number" id="r-peso" placeholder="70"/></div>
          <div class="field"><label>Estatura (cm)</label><input type="number" id="r-estatura" placeholder="175"/></div>
          <div class="field"><label>Objetivo Principal</label>
            <select id="r-objetivo"><option value="">Seleccionar</option><option>Bajar de peso</option><option>Ganar músculo</option><option>Tonificar</option><option>Resistencia</option><option>Salud general</option></select>
          </div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Condición Médica / Lesiones</label><textarea id="r-medico" placeholder="Indique si tiene alguna condición médica o lesión relevante..."></textarea></div>

        <div class="form-section-title">Membresía</div>
        <div class="form-row-3">
          <div class="field"><label>Tipo de Plan <span class="req">*</span></label>
            <select id="r-plan"><option value="">Seleccionar</option><option>Mensual - $120.000</option><option>Trimestral - $320.000</option><option>Semestral - $580.000</option><option>Anual - $1.000.000</option></select>
          </div>
          <div class="field"><label>Fecha de Inicio <span class="req">*</span></label><input type="date" id="r-inicio"/></div>
          <div class="field"><label>Entrenador Asignado</label>
            <select id="r-entrenador"><option value="">Sin asignar</option><option>Carlos Rojas</option><option>Daniela López</option><option>Andrés Mora</option><option>Valentina Cruz</option></select>
          </div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Contacto de Emergencia</label><input type="text" id="r-emergencia" placeholder="Nombre y teléfono del contacto de emergencia"/></div>
        <div class="field" style="margin-bottom:16px;"><label>Notas adicionales</label><textarea id="r-notas" placeholder="Cualquier información adicional relevante..."></textarea></div>

        <div class="form-actions">
          <button class="btn btn-ghost" id="btnClearForm">🗑 Limpiar</button>
          <button class="btn btn-primary" id="btnSaveMember">✅ Registrar Miembro</button>
        </div>
      </div>
    </div>`;
  }

  function afterRender() {
    $('r-inicio').value = todayISO();
    $('btnClearForm').addEventListener('click', clearForm);
    $('btnSaveMember').addEventListener('click', saveMember);
  }

  function clearForm() {
    ['r-nombres','r-apellidos','r-cedula','r-nacimiento','r-genero',
     'r-telefono','r-email','r-direccion','r-peso','r-estatura',
     'r-objetivo','r-medico','r-plan','r-entrenador','r-emergencia','r-notas']
      .forEach(id => { const el = $(id); if(el) el.value = ''; });
    $('r-inicio').value = todayISO();
    showToast('Formulario limpiado.', 'info');
  }

  function saveMember() {
    const nombres   = $('r-nombres')?.value.trim();
    const apellidos = $('r-apellidos')?.value.trim();
    const cedula    = $('r-cedula')?.value.trim();
    const telefono  = $('r-telefono')?.value.trim();
    const plan      = $('r-plan')?.value;
    const inicio    = $('r-inicio')?.value;

    if (!nombres || !apellidos || !cedula || !telefono || !plan || !inicio) {
      showToast('Completa todos los campos obligatorios (*).', 'warn');
      return;
    }

    // Verificar cédula duplicada
    const existe = Store.getMembers().find(m => m.cedula === cedula);
    if (existe) {
      showToast(`Ya existe un miembro con cédula ${cedula}.`, 'warn');
      return;
    }

    const planKey = plan.split(' - ')[0];
    const vence   = addDays(inicio, PLAN_DAYS[planKey] || 30);

    Store.addMember({
      nombres, apellidos, cedula, telefono,
      email:        $('r-email')?.value.trim()    || '',
      plan,
      vence,
      estado:       'Activo',
      notas:        $('r-notas')?.value.trim()    || '',
      fechaRegistro: todayISO(),
    });

    showToast(`✅ ${nombres} ${apellidos} registrado correctamente.`);
    clearForm();

    // Navegar a miembros
    window._router?.navigate('miembros');
  }

  return { getHTML, afterRender };
})();
