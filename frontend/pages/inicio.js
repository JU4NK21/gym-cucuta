/* ══════════════════════════════════════
   PAGES/INICIO.JS
   Vista diferenciada por rol:
   - Admin / Entrenador → panel con estadísticas
   - Cliente            → bienvenida personalizada
══════════════════════════════════════ */
'use strict';

const PageInicio = (() => {

  function getHTML() {
    const rol = Auth.getRol();
    if (rol === 'cliente') return getHTMLCliente();
    return getHTMLAdmin();
  }

  function afterRender() {
    const rol = Auth.getRol();
    if (rol === 'cliente') afterRenderCliente();
  }

  /* ══════════════════════════════
     VISTA CLIENTE
  ══════════════════════════════ */
  function getHTMLCliente() {
    const u = Auth.getUsuario();
    const hora = new Date().getHours();
    const saludo = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches';

    return `
    <div class="page-enter cliente-home">

      <!-- HERO BIENVENIDA -->
      <div class="cliente-hero">
        <div class="cliente-hero-content">
          <div class="cliente-avatar">${(u?.nombre?.[0] || 'U').toUpperCase()}</div>
          <div>
            <h1 class="cliente-saludo">${saludo}, <span class="accent">${u?.nombre || 'Atleta'}!</span> 💪</h1>
            <p class="cliente-fecha">${friendlyDate()}</p>
            <span class="cliente-badge">Miembro Activo</span>
          </div>
        </div>
        <img class="cliente-hero-img" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=60" alt="Gym"/>
      </div>

      <!-- ACCESOS RÁPIDOS -->
      <div class="cliente-section-title">¿Qué quieres hacer hoy?</div>
      <div class="cliente-accesos">
        <div class="cliente-acceso-card" data-page="eventos">
          <div class="acceso-icon">📅</div>
          <div class="acceso-info">
            <div class="acceso-nombre">Eventos y Clases</div>
            <div class="acceso-desc">Consulta las próximas actividades del gimnasio</div>
          </div>
          <div class="acceso-arrow">→</div>
        </div>
        <div class="cliente-acceso-card" data-page="soporte">
          <div class="acceso-icon">💬</div>
          <div class="acceso-info">
            <div class="acceso-nombre">Soporte</div>
            <div class="acceso-desc">¿Tienes alguna duda? Contáctanos aquí</div>
          </div>
          <div class="acceso-arrow">→</div>
        </div>
      </div>

      <!-- MOTIVACIÓN DEL DÍA -->
      <div class="cliente-section-title">Motivación del día</div>
      <div class="cliente-motivacion" id="motivacionCard">
        <div class="motivacion-icon">🔥</div>
        <p class="motivacion-texto" id="motivacionTexto"></p>
        <button class="btn-nueva-motivacion" id="btnNuevaMotivacion">Otra frase →</button>
      </div>

      <!-- TIPS DE SALUD -->
      <div class="cliente-section-title">Tips de salud y bienestar</div>
      <div class="cliente-tips" id="tipsGrid"></div>

      <!-- NOTICIAS DEL GYM -->
      <div class="cliente-section-title">Novedades del gimnasio</div>
      <div class="cliente-noticias">
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=70" alt="Yoga"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-blue">Clases</span>
            <h4>Nuevas clases de Yoga</h4>
            <p>Lunes y miércoles 6:00 AM con instructora certificada. ¡Inscríbete ya!</p>
          </div>
        </div>
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=70" alt="Promo"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-green">Promo</span>
            <h4>Trae un amigo y gana</h4>
            <p>Refiere a un amigo y obtén 15 días gratis en tu membresía. ¡Sin límite!</p>
          </div>
        </div>
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=70" alt="Nutrición"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-orange">Salud</span>
            <h4>Asesoría nutricional gratis</h4>
            <p>Cada viernes de 5–7 PM con nuestro nutricionista. ¡Cupos limitados!</p>
          </div>
        </div>
      </div>

    </div>`;
  }

  const MOTIVACIONES = [
    'El único mal entrenamiento es el que no hiciste.',
    'Tu cuerpo puede hacerlo. Es tu mente a quien debes convencer.',
    'No se trata de ser el mejor. Se trata de ser mejor que ayer.',
    'Cada repetición te acerca más a tu meta. ¡No pares!',
    'El dolor de hoy será tu orgullo mañana.',
    'Los resultados llegan cuando no te rindes.',
    'Haz que tu yo del futuro esté orgulloso de ti hoy.',
    'Un poco de progreso cada día suma grandes resultados.',
    'La disciplina es elegir entre lo que quieres ahora y lo que más quieres.',
    'El gym no cambia tu cuerpo, cambia tu mentalidad.',
  ];

  const TIPS = [
    { icon: '💧', titulo: 'Hidratación',     texto: 'Toma al menos 2 litros de agua al día. Antes, durante y después del ejercicio.' },
    { icon: '😴', titulo: 'Descanso',         texto: 'Duerme 7-8 horas. El músculo crece mientras descansas, no mientras entrenas.' },
    { icon: '🥗', titulo: 'Nutrición',        texto: 'Come proteínas en cada comida. Huevo, pollo, atún y legumbres son tus aliados.' },
    { icon: '🧘', titulo: 'Calentamiento',    texto: 'Siempre calienta 5-10 minutos antes de entrenar para evitar lesiones.' },
    { icon: '📈', titulo: 'Progresión',       texto: 'Aumenta el peso gradualmente. La sobrecarga progresiva es clave para crecer.' },
    { icon: '🚶', titulo: 'Movilidad',        texto: 'Haz estiramientos después de cada sesión para mejorar tu flexibilidad.' },
  ];

  let motivacionIdx = Math.floor(Math.random() * MOTIVACIONES.length);

  function afterRenderCliente() {
    // Motivación
    const textoEl = document.getElementById('motivacionTexto');
    if (textoEl) textoEl.textContent = `"${MOTIVACIONES[motivacionIdx]}"`;

    document.getElementById('btnNuevaMotivacion')?.addEventListener('click', () => {
      motivacionIdx = (motivacionIdx + 1) % MOTIVACIONES.length;
      const el = document.getElementById('motivacionTexto');
      if (el) {
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = `"${MOTIVACIONES[motivacionIdx]}"`;
          el.style.opacity = '1';
        }, 200);
      }
    });

    // Tips
    const tipsEl = document.getElementById('tipsGrid');
    if (tipsEl) {
      tipsEl.innerHTML = TIPS.map(t => `
        <div class="tip-card">
          <div class="tip-icon">${t.icon}</div>
          <div class="tip-titulo">${t.titulo}</div>
          <div class="tip-texto">${t.texto}</div>
        </div>
      `).join('');
    }

    // Accesos rápidos → navegación
    document.querySelectorAll('.cliente-acceso-card[data-page]').forEach(card => {
      card.addEventListener('click', () => window._router?.navigate(card.dataset.page));
    });
  }

  /* ══════════════════════════════
     VISTA ADMIN / ENTRENADOR
  ══════════════════════════════ */
  function getHTMLAdmin() {
    const stats = Store.getStats();
    const u     = Auth.getUsuario();
    return `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h2 class="page-title">Panel Principal</h2>
          <p class="page-sub">Bienvenido, ${u?.nombre || 'Admin'} · ${friendlyDate()}</p>
        </div>
        <div class="header-badge"><span class="live-dot"></span> En vivo</div>
      </div>

      <div class="alert-strip">
        <span class="alert-icon">📢</span>
        <p><strong>Nuevo:</strong> Clases de CrossFit disponibles todos los sábados a las 8:00 AM.</p>
        <button class="alert-close" onclick="this.parentElement.style.display='none'">×</button>
      </div>

      <div class="stats-grid">
        <div class="stat-card" data-color="blue">
          <div class="stat-icon-bg">👥</div>
          <div class="stat-label">Miembros Activos</div>
          <div class="stat-value" id="h-activos">${stats.activos}</div>
          <div class="stat-sub">${stats.nuevosEsteMes > 0 ? '↑ '+stats.nuevosEsteMes+' nuevos este mes' : 'Sin nuevos este mes'}</div>
        </div>
        <div class="stat-card" data-color="teal">
          <div class="stat-icon-bg">💰</div>
          <div class="stat-label">Ingresos Potenciales</div>
          <div class="stat-value" id="h-ingresos">${Store.formatCOP(stats.ingresos)}</div>
          <div class="stat-sub">${stats.activos} planes activos</div>
        </div>
        <div class="stat-card" data-color="orange">
          <div class="stat-icon-bg">🏋️</div>
          <div class="stat-label">Total Miembros</div>
          <div class="stat-value" id="h-total">${stats.total}</div>
          <div class="stat-sub">${stats.pendientes} pendientes de pago</div>
        </div>
        <div class="stat-card" data-color="purple">
          <div class="stat-icon-bg">⚠️</div>
          <div class="stat-label">Vencen en 30 días</div>
          <div class="stat-value" id="h-vencen">${stats.vencenProximo}</div>
          <div class="stat-sub">${stats.inactivos} miembros inactivos</div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="qa-btn" data-page="registro-miembro"><span>➕</span>Nuevo Miembro</button>
        <button class="qa-btn" data-page="miembros"><span>🔍</span>Ver Miembros</button>
        <button class="qa-btn" data-page="informes"><span>📈</span>Ver Informes</button>
        <button class="qa-btn" data-page="eventos"><span>📅</span>Eventos</button>
        <button class="qa-btn" data-page="soporte"><span>💬</span>Soporte</button>
      </div>

      <div class="home-grid">
        <div class="home-left">
          <div class="news-hero">
            <img class="news-hero-img" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=70" alt="Gym"/>
            <div class="news-hero-overlay">
              <span class="news-badge featured">🔥 Destacado</span>
              <h3>¡Renovación completa de la zona de pesas!</h3>
              <p>Nuevos equipos de última generación disponibles. Más de 50 máquinas actualizadas.</p>
              <span class="news-date">📅 15 de Marzo, 2026</span>
            </div>
          </div>
          <div class="news-grid" id="newsGrid"></div>
        </div>
        <div class="home-right">
          <div class="card">
            <div class="card-title">Distribución de Planes</div>
            <div class="donut-wrap" id="homeDonut"></div>
          </div>
          <div class="card" style="margin-top:20px;">
            <div class="card-title">Clases de Hoy</div>
            <div class="classes-list" id="todayClasses">
              <div class="empty-state" style="padding:20px;">
                <div class="empty-icon">🏋️</div>
                <p>Sin clases programadas hoy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function afterRenderAdmin() {
    const grid = document.getElementById('newsGrid');
    if (grid) {
      grid.innerHTML = NEWS_DATA.map(n => `
        <div class="news-card">
          <img src="${n.img}" alt="${n.title}"/>
          <div class="news-card-body">
            <span class="news-tag ${n.tagClass}">${n.tag}</span>
            <h4>${n.title}</h4>
            <p>${n.desc}</p>
            <span class="news-meta">${n.date}</span>
          </div>
        </div>`).join('');
    }
    const stats = Store.getStats();
    renderDonutChart('homeDonut', stats.planDist, stats.activos);
  }

  /* Actualiza tarjetas del admin sin re-render */
  function refreshStats() {
    const rol = Auth.getRol();
    if (rol === 'cliente') return;

    const stats = Store.getStats();
    const map = {
      'h-activos':  stats.activos,
      'h-ingresos': Store.formatCOP(stats.ingresos),
      'h-total':    stats.total,
      'h-vencen':   stats.vencenProximo,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && el.textContent !== String(val)) {
        el.textContent = val;
        el.style.transform = 'scale(1.15)';
        el.style.color = 'var(--primary-light)';
        setTimeout(() => { el.style.transform = ''; el.style.color = ''; }, 500);
      }
    });
    renderDonutChart('homeDonut', stats.planDist, stats.activos);
  }

  return { getHTML, afterRender, refreshStats };
})();
