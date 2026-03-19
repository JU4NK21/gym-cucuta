/* ══════════════════════════════════════
   PAGES/INICIO.JS — Vista diferenciada por rol
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
    if (rol === 'cliente') {
      afterRenderCliente();
    } else {
      afterRenderAdmin();
    }
  }

  /* ══════════════════════════════
     VISTA ADMIN / ENTRENADOR
  ══════════════════════════════ */
  function getHTMLAdmin() {
    const stats = Store.getStats();
    const u     = Auth.getUsuario();
    const rol   = Auth.getRol();
    const hora  = new Date().getHours();
    const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches';

    return `
    <div class="page-enter">

      <!-- HERO ADMIN -->
      <div class="admin-hero">
        <div class="admin-hero-bg"></div>
        <div class="admin-hero-content">
          <div class="admin-hero-left">
            <div class="admin-hero-greeting">${saludo}, <span class="accent">${u?.nombre || 'Admin'}</span> 👋</div>
            <div class="admin-hero-date">${friendlyDate()}</div>
            <div class="admin-hero-badges">
              <span class="hero-badge-role ${rol}">${rol.charAt(0).toUpperCase() + rol.slice(1)}</span>
              <span class="hero-badge-live"><span class="live-dot"></span>Sistema activo</span>
            </div>
          </div>
          <div class="admin-hero-right">
            <div class="admin-hero-stat">
              <span class="hero-stat-num" id="h-activos">${stats.activos}</span>
              <span class="hero-stat-label">Miembros activos</span>
            </div>
            <div class="admin-hero-divider"></div>
            <div class="admin-hero-stat">
              <span class="hero-stat-num" id="h-ingresos">${Store.formatCOP(stats.ingresos)}</span>
              <span class="hero-stat-label">Ingresos potenciales</span>
            </div>
            <div class="admin-hero-divider"></div>
            <div class="admin-hero-stat">
              <span class="hero-stat-num" id="h-total">${stats.total}</span>
              <span class="hero-stat-label">Total miembros</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ALERTA -->
      <div class="alert-strip" id="alertStrip">
        <span class="alert-icon">📢</span>
        <p><strong>Nuevo:</strong> Clases de CrossFit disponibles todos los sábados a las 8:00 AM.</p>
        <button class="alert-close" onclick="document.getElementById('alertStrip').style.display='none'">×</button>
      </div>

      <!-- ACCESOS RÁPIDOS -->
      <div class="admin-quick-title">Accesos rápidos</div>
      <div class="admin-quick-grid">
        <button class="admin-qa-card" data-page="registro-miembro">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#0ea5e9,#0284c7)">➕</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Nuevo Miembro</span>
            <span class="qa-card-desc">Registrar persona</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>
        <button class="admin-qa-card" data-page="miembros">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#14b8a6,#0f766e)">👥</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Ver Miembros</span>
            <span class="qa-card-desc">Gestionar registros</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>
        ${rol === 'admin' ? `
        <button class="admin-qa-card" data-page="informes">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#a855f7,#7e22ce)">📊</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Ver Informes</span>
            <span class="qa-card-desc">Estadísticas del gym</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>
        <button class="admin-qa-card" data-page="validacion">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#f97316,#c2410c)">✅</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Validaciones</span>
            <span class="qa-card-desc">Aprobar entrenadores</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>` : ''}
        <button class="admin-qa-card" data-page="eventos">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#eab308,#a16207)">📅</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Eventos</span>
            <span class="qa-card-desc">Calendario del gym</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>
        <button class="admin-qa-card" data-page="soporte">
          <div class="qa-card-icon" style="background:linear-gradient(135deg,#22c55e,#15803d)">💬</div>
          <div class="qa-card-text">
            <span class="qa-card-name">Soporte</span>
            <span class="qa-card-desc">Centro de ayuda</span>
          </div>
          <span class="qa-card-arrow">→</span>
        </button>
      </div>

      <!-- STATS DETALLADAS -->
      <div class="admin-stats-row">
        <div class="stat-card" data-color="blue">
          <div class="stat-icon-bg">👥</div>
          <div class="stat-label">Miembros Activos</div>
          <div class="stat-value" id="s-activos">${stats.activos}</div>
          <div class="stat-sub">${stats.nuevosEsteMes > 0 ? '↑ '+stats.nuevosEsteMes+' nuevos este mes' : 'Sin nuevos este mes'}</div>
        </div>
        <div class="stat-card" data-color="teal">
          <div class="stat-icon-bg">💰</div>
          <div class="stat-label">Ingresos Potenciales</div>
          <div class="stat-value" id="s-ingresos">${Store.formatCOP(stats.ingresos)}</div>
          <div class="stat-sub">${stats.activos} planes activos</div>
        </div>
        <div class="stat-card" data-color="orange">
          <div class="stat-icon-bg">🏋️</div>
          <div class="stat-label">Total Miembros</div>
          <div class="stat-value" id="s-total">${stats.total}</div>
          <div class="stat-sub">${stats.pendientes} pendientes de pago</div>
        </div>
        <div class="stat-card" data-color="purple">
          <div class="stat-icon-bg">⚠️</div>
          <div class="stat-label">Vencen Pronto</div>
          <div class="stat-value" id="s-vencen">${stats.vencenProximo}</div>
          <div class="stat-sub">${stats.inactivos} miembros inactivos</div>
        </div>
      </div>

      <!-- GRID INFERIOR -->
      <div class="home-grid">
        <div class="home-left">
          <div class="news-hero">
            <img class="news-hero-img" src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=70" alt="Gym"/>
            <div class="news-hero-overlay">
              <span class="news-badge featured">🔥 Destacado</span>
              <h3>¡Renovación completa de la zona de pesas!</h3>
              <p>Nuevos equipos de última generación. Más de 50 máquinas actualizadas.</p>
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
          <div class="card" style="margin-top:16px;">
            <div class="card-title">Clases de Hoy</div>
            <div id="todayClasses">
              <div class="empty-state" style="padding:16px;">
                <div class="empty-icon" style="font-size:28px;">🏋️</div>
                <p style="font-size:13px;">Sin clases programadas hoy.</p>
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

  function refreshStats() {
    const rol = Auth.getRol();
    if (rol === 'cliente') return;
    const stats = Store.getStats();
    const map = {
      'h-activos':  stats.activos,
      'h-ingresos': Store.formatCOP(stats.ingresos),
      'h-total':    stats.total,
      's-activos':  stats.activos,
      's-ingresos': Store.formatCOP(stats.ingresos),
      's-total':    stats.total,
      's-vencen':   stats.vencenProximo,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && el.textContent !== String(val)) {
        el.textContent = val;
        el.style.transform = 'scale(1.12)';
        el.style.color = 'var(--primary-light)';
        setTimeout(() => { el.style.transform = ''; el.style.color = ''; }, 400);
      }
    });
    renderDonutChart('homeDonut', stats.planDist, stats.activos);
  }

  /* ══════════════════════════════
     VISTA CLIENTE
  ══════════════════════════════ */
  function getHTMLCliente() {
    const u    = Auth.getUsuario();
    const hora = new Date().getHours();
    const saludo = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches';

    return `
    <div class="page-enter cliente-home">
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

      <div class="cliente-section-title">Motivación del día</div>
      <div class="cliente-motivacion">
        <div class="motivacion-icon">🔥</div>
        <p class="motivacion-texto" id="motivacionTexto"></p>
        <button class="btn-nueva-motivacion" id="btnNuevaMotivacion">Otra frase →</button>
      </div>

      <div class="cliente-section-title">Tips de salud y bienestar</div>
      <div class="cliente-tips" id="tipsGrid"></div>

      <div class="cliente-section-title">Novedades del gimnasio</div>
      <div class="cliente-noticias">
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=70" alt="Yoga"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-blue">Clases</span>
            <h4>Nuevas clases de Yoga</h4>
            <p>Lunes y miércoles 6:00 AM con instructora certificada.</p>
          </div>
        </div>
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=70" alt="Promo"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-green">Promo</span>
            <h4>Trae un amigo y gana</h4>
            <p>Refiere a un amigo y obtén 15 días gratis en tu membresía.</p>
          </div>
        </div>
        <div class="cliente-noticia">
          <img src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=70" alt="Nutrición"/>
          <div class="noticia-body">
            <span class="noticia-tag tag-orange">Salud</span>
            <h4>Asesoría nutricional gratis</h4>
            <p>Cada viernes de 5–7 PM con nuestro nutricionista.</p>
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
    { icon:'💧', titulo:'Hidratación',   texto:'Toma al menos 2 litros de agua al día. Antes, durante y después del ejercicio.' },
    { icon:'😴', titulo:'Descanso',      texto:'Duerme 7-8 horas. El músculo crece mientras descansas, no mientras entrenas.' },
    { icon:'🥗', titulo:'Nutrición',     texto:'Come proteínas en cada comida. Huevo, pollo, atún y legumbres son tus aliados.' },
    { icon:'🧘', titulo:'Calentamiento', texto:'Siempre calienta 5-10 minutos antes de entrenar para evitar lesiones.' },
    { icon:'📈', titulo:'Progresión',    texto:'Aumenta el peso gradualmente. La sobrecarga progresiva es clave para crecer.' },
    { icon:'🚶', titulo:'Movilidad',     texto:'Haz estiramientos después de cada sesión para mejorar tu flexibilidad.' },
  ];

  let motivacionIdx = Math.floor(Math.random() * MOTIVACIONES.length);

  function afterRenderCliente() {
    const textoEl = document.getElementById('motivacionTexto');
    if (textoEl) textoEl.textContent = `"${MOTIVACIONES[motivacionIdx]}"`;

    document.getElementById('btnNuevaMotivacion')?.addEventListener('click', () => {
      motivacionIdx = (motivacionIdx + 1) % MOTIVACIONES.length;
      const el = document.getElementById('motivacionTexto');
      if (el) {
        el.style.opacity = '0';
        setTimeout(() => { el.textContent = `"${MOTIVACIONES[motivacionIdx]}"`;  el.style.opacity = '1'; }, 200);
      }
    });

    const tipsEl = document.getElementById('tipsGrid');
    if (tipsEl) {
      tipsEl.innerHTML = TIPS.map(t => `
        <div class="tip-card">
          <div class="tip-icon">${t.icon}</div>
          <div class="tip-titulo">${t.titulo}</div>
          <div class="tip-texto">${t.texto}</div>
        </div>`).join('');
    }

    document.querySelectorAll('.cliente-acceso-card[data-page]').forEach(card => {
      card.addEventListener('click', () => window._router?.navigate(card.dataset.page));
    });
  }

  return { getHTML, afterRender, refreshStats };
})();
