/* ══════════════════════════════════════
   PAGES/SOPORTE.JS — Diseño mejorado con roles
══════════════════════════════════════ */
'use strict';

const PageSoporte = (() => {

  function getHTML() {
    const rol     = Auth.getRol();
    const esAdmin = rol === 'admin' || rol === 'entrenador';

    const faqsCliente = [
      { q:'¿Cómo veo los eventos del gimnasio?', a:'Ve a la sección "Eventos" en el menú superior. Ahí encontrarás el calendario con todas las actividades programadas. Puedes hacer clic en cualquier fecha para ver los detalles.' },
      { q:'¿Cómo puedo contactar al gimnasio?', a:'Puedes llamarnos al +57 300 123 4567 de Lunes a Sábado de 7AM a 9PM, escribirnos por WhatsApp al +57 315 987 6543 o enviarnos un correo a soporte@gymcucuta.com.' },
      { q:'¿Cómo renuevo mi membresía?', a:'Acércate a recepción o contáctanos por WhatsApp. Te daremos todas las opciones de planes disponibles y los métodos de pago aceptados.' },
      { q:'¿Cuáles son los horarios del gimnasio?', a:'Lunes a Viernes: 5:00 AM – 10:00 PM. Sábados: 6:00 AM – 8:00 PM. Domingos y festivos: 8:00 AM – 2:00 PM.' },
      { q:'¿Puedo congelar mi membresía?', a:'Sí, puedes congelar tu membresía hasta por 30 días al mes. Comunícate con recepción o escríbenos por WhatsApp para hacer el trámite.' },
    ];

    const faqsAdmin = [
      { q:'¿Cómo registrar un nuevo miembro?', a:'Ve al menú "Registrar". Completa los campos obligatorios (*) y haz clic en "Registrar Miembro". Las estadísticas se actualizan automáticamente.' },
      { q:'¿Cómo editar la información de un miembro?', a:'Ve a "Miembros", busca al miembro y haz clic en ✏️. Se abrirá un formulario con su información para modificarla.' },
      { q:'¿Cómo ver los informes actualizados?', a:'En "Informes" los datos se calculan en tiempo real desde los miembros registrados. Puedes cambiar entre vista mensual y anual.' },
      { q:'¿Cómo agregar un evento al calendario?', a:'En "Eventos", usa el formulario a la derecha del calendario. Completa nombre, fecha, hora y tipo, luego haz clic en "Agregar".' },
      { q:'¿Cómo aprobar un entrenador?', a:'Ve a "Validaciones" en el menú. Ahí verás las solicitudes pendientes con los botones de Aprobar o Rechazar.' },
      { q:'¿Cómo cambiar mi contraseña?', a:'Contacta al administrador del sistema. En próximas versiones se habilitará desde el perfil de usuario.' },
    ];

    const faqs = esAdmin ? faqsAdmin : faqsCliente;

    return `
    <div class="page-enter">

      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h2 class="page-title">💬 Centro de Soporte</h2>
          <p class="page-sub">Estamos aquí para ayudarte. Elige cómo quieres contactarnos.</p>
        </div>
      </div>

      <!-- TARJETAS DE CONTACTO -->
      <div class="soporte-grid">
        <div class="soporte-card" onclick="showToast('📞 Línea: +57 300 123 4567', 'info')">
          <div class="soporte-card-icon" style="background:linear-gradient(135deg,#0ea5e9,#0284c7)">📞</div>
          <div class="soporte-card-body">
            <h3>Llamar</h3>
            <p>Lunes a Sábado · 7:00 AM – 9:00 PM</p>
            <span class="soporte-dato">+57 300 123 4567</span>
          </div>
          <div class="soporte-card-arrow">→</div>
        </div>

        <div class="soporte-card" onclick="showToast('📧 soporte@gymcucuta.com', 'info')">
          <div class="soporte-card-icon" style="background:linear-gradient(135deg,#14b8a6,#0f766e)">📧</div>
          <div class="soporte-card-body">
            <h3>Correo</h3>
            <p>Respuesta en menos de 24h</p>
            <span class="soporte-dato">soporte@gymcucuta.com</span>
          </div>
          <div class="soporte-card-arrow">→</div>
        </div>

        <div class="soporte-card" onclick="window.open('https://wa.me/573143873575?text=Hola%2C%20necesito%20información%20sobre%20el%20gimnasio','_blank')">
          <div class="soporte-card-icon" style="background:linear-gradient(135deg,#22c55e,#15803d)">💬</div>
          <div class="soporte-card-body">
            <h3>WhatsApp</h3>
            <p>Chat inmediato · Disponible 24/7</p>
            <span class="soporte-dato">+57 314 387 3575</span>
          </div>
          <div class="soporte-card-arrow">→</div>
        </div>

        <div class="soporte-card" onclick="showToast('📖 Manual disponible próximamente.', 'info')">
          <div class="soporte-card-icon" style="background:linear-gradient(135deg,#a855f7,#7e22ce)">📖</div>
          <div class="soporte-card-body">
            <h3>Manual</h3>
            <p>Guías paso a paso del sistema</p>
            <span class="soporte-dato">Ver documentación →</span>
          </div>
          <div class="soporte-card-arrow">→</div>
        </div>
      </div>

      <!-- HORARIOS -->
      <div class="soporte-horarios">
        <div class="horario-titulo">🕐 Horarios de atención del gimnasio</div>
        <div class="horarios-grid">
          <div class="horario-item"><span class="horario-dia">Lun – Vie</span><span class="horario-hora">5:00 AM – 10:00 PM</span></div>
          <div class="horario-item"><span class="horario-dia">Sábado</span><span class="horario-hora">6:00 AM – 8:00 PM</span></div>
          <div class="horario-item"><span class="horario-dia">Dom y festivos</span><span class="horario-hora">8:00 AM – 2:00 PM</span></div>
        </div>
      </div>

      <!-- FORMULARIO + FAQ en dos columnas -->
      <div class="soporte-bottom-grid">

        <!-- FORMULARIO MENSAJE -->
        <div class="soporte-form-card">
          <div class="soporte-form-header">
            <span class="soporte-form-icon">✉️</span>
            <div>
              <h3>Enviar mensaje</h3>
              <p>Te responderemos lo antes posible</p>
            </div>
          </div>
          <div class="field" style="margin-bottom:14px;">
            <label>Asunto <span class="req">*</span></label>
            <input type="text" id="sup-asunto" placeholder="¿En qué podemos ayudarte?"/>
          </div>
          <div class="field" style="margin-bottom:14px;">
            <label>Prioridad</label>
            <select id="sup-prioridad">
              <option>Baja</option>
              <option>Media</option>
              <option>Alta</option>
              <option>Urgente</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:20px;">
            <label>Mensaje <span class="req">*</span></label>
            <textarea id="sup-mensaje" placeholder="Describe tu consulta con el mayor detalle posible..." style="min-height:130px;"></textarea>
          </div>
          <button class="btn btn-primary full-width" id="btnSendSupport">
            📤 Enviar Mensaje
          </button>
        </div>

        <!-- FAQ -->
        <div class="soporte-faq-card">
          <div class="soporte-faq-header">
            <span class="soporte-form-icon">❓</span>
            <div>
              <h3>Preguntas frecuentes</h3>
              <p>Respuestas rápidas a las dudas más comunes</p>
            </div>
          </div>
          <div class="faq-lista" id="faqLista">
            ${faqs.map((item, i) => `
              <div class="faq-item-new" data-idx="${i}">
                <button class="faq-pregunta">
                  <span>${item.q}</span>
                  <span class="faq-icono">+</span>
                </button>
                <div class="faq-respuesta">${item.a}</div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>`;
  }

  function afterRender() {
    // Botón enviar
    document.getElementById('btnSendSupport')?.addEventListener('click', () => {
      const asunto  = document.getElementById('sup-asunto')?.value.trim();
      const mensaje = document.getElementById('sup-mensaje')?.value.trim();
      const prio    = document.getElementById('sup-prioridad')?.value;
      if (!asunto || !mensaje) { showToast('Completa el asunto y el mensaje.', 'warn'); return; }
      document.getElementById('sup-asunto').value  = '';
      document.getElementById('sup-mensaje').value = '';
      showToast(`✅ Mensaje enviado con prioridad ${prio}. Te responderemos pronto.`);
    });

    // FAQ acordeón
    document.querySelectorAll('.faq-item-new').forEach(item => {
      item.querySelector('.faq-pregunta').addEventListener('click', () => {
        const abierto = item.classList.contains('open');
        document.querySelectorAll('.faq-item-new').forEach(f => {
          f.classList.remove('open');
          f.querySelector('.faq-icono').textContent = '+';
        });
        if (!abierto) {
          item.classList.add('open');
          item.querySelector('.faq-icono').textContent = '−';
        }
      });
    });
  }

  return { getHTML, afterRender };
})();
