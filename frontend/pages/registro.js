/* ══════════════════════════════════════
   PAGES/REGISTRO.JS — Guarda en BD via API
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
        <div class="photo-upload"><span class="photo-icon">📷</span><span class="photo-label">Foto</span></div>

        <div class="form-section-title">Información Personal</div>
        <div class="form-row">
          <div class="field"><label>Nombres <span class="req">*</span></label><input type="text" id="r-nombres" placeholder="Juan Carlos"/></div>
          <div class="field"><label>Apellidos <span class="req">*</span></label><input type="text" id="r-apellidos" placeholder="Pérez Gómez"/></div>
        </div>
        <div class="form-row-3">
          <div class="field"><label>Cédula <span class="req">*</span></label><input type="text" id="r-cedula" placeholder="1234567890"/></div>
          <div class="field"><label>Fecha de Nacimiento</label><input type="date" id="r-nacimiento"/></div>
          <div class="field"><label>Género</label>
            <select id="r-genero"><option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="field"><label>Teléfono <span class="req">*</span></label><input type="tel" id="r-telefono" placeholder="300 123 4567"/></div>
          <div class="field"><label>Correo</label><input type="email" id="r-email" placeholder="correo@ejemplo.com"/></div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Dirección</label><input type="text" id="r-direccion" placeholder="Calle 5 # 3-20, Cúcuta"/></div>

        <div class="form-section-title">Membresía</div>
        <div class="form-row-3">
          <div class="field"><label>Tipo de Plan <span class="req">*</span></label>
            <select id="r-plan"><option value="">Seleccionar</option>
              <option>Mensual - $120.000</option><option>Trimestral - $320.000</option>
              <option>Semestral - $580.000</option><option>Anual - $1.000.000</option>
            </select>
          </div>
          <div class="field"><label>Fecha de Inicio <span class="req">*</span></label><input type="date" id="r-inicio"/></div>
          <div class="field"><label>Entrenador Asignado</label>
            <select id="r-entrenador"><option value="">Sin asignar</option>
              <option>Carlos Rojas</option><option>Daniela López</option>
              <option>Andrés Mora</option><option>Valentina Cruz</option>
            </select>
          </div>
        </div>
        <div class="field" style="margin-bottom:16px;"><label>Notas</label><textarea id="r-notas" placeholder="Información adicional..."></textarea></div>

        <div class="auth-error" id="regMiembroError" style="margin-bottom:12px;"></div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="btnClearMiembro">🗑 Limpiar</button>
          <button class="btn btn-primary" id="btnSaveMiembro">✅ Registrar Miembro</button>
        </div>
      </div>
    </div>`;
  }

  function afterRender() {
    const hoy = new Date().toISOString().split('T')[0];
    const iniciEl = document.getElementById('r-inicio');
    if (iniciEl) iniciEl.value = hoy;

    document.getElementById('btnClearMiembro')?.addEventListener('click', clearForm);
    document.getElementById('btnSaveMiembro')?.addEventListener('click', saveMiembro);
  }

  function clearForm() {
    ['r-nombres','r-apellidos','r-cedula','r-nacimiento','r-genero','r-telefono',
     'r-email','r-direccion','r-plan','r-entrenador','r-notas'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    const hoy = new Date().toISOString().split('T')[0];
    const ini = document.getElementById('r-inicio'); if(ini) ini.value = hoy;
    const err = document.getElementById('regMiembroError'); if(err) err.textContent = '';
    showToast('Formulario limpiado.', 'info');
  }

  async function saveMiembro() {
    const nombres   = document.getElementById('r-nombres')?.value.trim();
    const apellidos = document.getElementById('r-apellidos')?.value.trim();
    const cedula    = document.getElementById('r-cedula')?.value.trim();
    const telefono  = document.getElementById('r-telefono')?.value.trim();
    const plan      = document.getElementById('r-plan')?.value;
    const inicio    = document.getElementById('r-inicio')?.value;
    const errEl     = document.getElementById('regMiembroError');
    const btn       = document.getElementById('btnSaveMiembro');

    if (errEl) { errEl.style.color = '#f87171'; errEl.textContent = ''; }

    if (!nombres || !apellidos || !cedula || !plan || !inicio) {
      if (errEl) errEl.textContent = 'Completa los campos obligatorios (*).'; return;
    }

    // Calcular fecha de vencimiento
    const planDias = { Mensual:30, Trimestral:90, Semestral:180, Anual:365 };
    const planKey  = plan.split(' - ')[0];
    const d = new Date(inicio + 'T12:00:00');
    d.setDate(d.getDate() + (planDias[planKey] || 30));
    const vence = d.toISOString().split('T')[0];

    if (btn) { btn.textContent = 'Guardando...'; btn.disabled = true; }

    try {
      await Auth.fetchAuth('/miembros', {
        method: 'POST',
        body: JSON.stringify({
          nombres, apellidos, cedula, telefono,
          email:   document.getElementById('r-email')?.value.trim() || '',
          plan, vence, estado: 'Activo',
          notas:   document.getElementById('r-notas')?.value.trim() || '',
        })
      });

      showToast(`✅ ${nombres} ${apellidos} registrado correctamente.`);
      clearForm();
      window._router?.navigate('miembros');

    } catch(err) {
      if (errEl) errEl.textContent = err.message;
    } finally {
      if (btn) { btn.textContent = '✅ Registrar Miembro'; btn.disabled = false; }
    }
  }

  return { getHTML, afterRender };
})();
