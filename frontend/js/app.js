/* ═══════════════════════════════════════
   APP.JS — Router, Auth, RBAC, Boot
═══════════════════════════════════════ */
'use strict';

/* ════════════════════
   ROUTER
════════════════════ */
const Router = (() => {
  const pages = {
    'inicio':           PageInicio,
    'registro-miembro': PageRegistro,
    'miembros':         PageMiembros,
    'informes':         PageInformes,
    'eventos':          PageEventos,
    'validacion':       PageValidacion,
    'soporte':          PageSoporte,
  };

  let _current = null;

  function navigate(pageId) {
    // Sin sesión → mostrar login
    if (!Auth.estaAutenticado()) {
      mostrarLogin();
      return;
    }
    // Verificar permiso RBAC
    if (!RBAC.puedeAcceder(pageId)) {
      showToast('No tienes permiso para acceder a esa sección.', 'warn');
      pageId = 'inicio';
    }

    const page = pages[pageId];
    if (!page) return;
    _current = pageId;

    // Ocultar login, mostrar app
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appPage').classList.add('visible');

    // Actualizar nav activo
    document.querySelectorAll('.nav-link').forEach(b => {
      b.classList.toggle('active', b.dataset.page === pageId);
    });

    // Renderizar página
    const content = document.getElementById('pageContent');
    content.innerHTML = page.getHTML();
    if (page.afterRender) page.afterRender();
  }

  function getCurrent() { return _current; }
  return { navigate, getCurrent };
})();

window._router = Router;

/* ════════════════════
   MOSTRAR / OCULTAR LOGIN
════════════════════ */
function mostrarLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appPage').classList.remove('visible');
}

/* ════════════════════
   NAVBAR dinámico según rol
════════════════════ */
function initNavbar() {
  const linksContainer = document.getElementById('navLinks');
  if (!linksContainer) return;

  const usuario = Auth.getUsuario();
  if (!usuario) return;

  const items = RBAC.getNavItems();
  linksContainer.innerHTML = items.map(item => `
    <button class="nav-link ${Router.getCurrent() === item.page ? 'active' : ''}" data-page="${item.page}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-text">${item.label}</span>
    </button>
  `).join('');

  linksContainer.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.page));
  });

  const nameEl = document.getElementById('navUserName');
  const roleEl = document.getElementById('navUserRole');
  const initEl = document.getElementById('navUserInit');
  if (nameEl) nameEl.textContent = `${usuario.nombre} ${usuario.apellido}`;
  if (roleEl) roleEl.innerHTML  = `<span class="role-badge ${usuario.rol}">${usuario.rol}</span>`;
  if (initEl) initEl.textContent = (usuario.nombre[0] || 'U').toUpperCase();
}

window._app = { initNavbar };

/* ════════════════════
   AUTH — LOGIN
════════════════════ */
async function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  const btnText  = document.getElementById('btnLoginText');

  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Ingresa correo y contraseña.'; return; }

  btnText.textContent = 'Ingresando...';
  document.getElementById('btnLogin').disabled = true;

  try {
    await Auth.login(email, password);
    initNavbar();
    Router.navigate('inicio');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btnText.textContent = 'INGRESAR';
    document.getElementById('btnLogin').disabled = false;
  }
}

/* ════════════════════
   AUTH — REGISTRO
════════════════════ */
async function handleRegistro() {
  const nombre    = document.getElementById('regNombre').value.trim();
  const apellido  = document.getElementById('regApellido').value.trim();
  const email     = document.getElementById('regEmail').value.trim();
  const password  = document.getElementById('regPassword').value;
  const telefono  = document.getElementById('regTelefono').value.trim();
  const rol       = document.querySelector('input[name="rol"]:checked')?.value;
  const errEl     = document.getElementById('regError');
  const btnText   = document.getElementById('btnRegTexto');

  errEl.style.color = '#f87171';
  errEl.textContent = '';

  if (!nombre || !apellido || !email || !password || !rol) {
    errEl.textContent = 'Completa todos los campos obligatorios.'; return;
  }

  btnText.textContent = 'Creando cuenta...';
  document.getElementById('btnRegistro').disabled = true;

  try {
    const data = await Auth.registro({ nombre, apellido, email, password, telefono, rol });

    if (data.estado === 'pendiente') {
      errEl.style.color = '#86efac';
      errEl.textContent = '✅ Cuenta creada. Espera la aprobación del administrador.';
      ['regNombre','regApellido','regEmail','regPassword','regTelefono']
        .forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
    } else {
      showToast(`¡Bienvenido, ${data.usuario.nombre}!`);
      initNavbar();
      Router.navigate('inicio');
    }
  } catch (err) {
    errEl.style.color = '#f87171';
    errEl.textContent = err.message;
  } finally {
    btnText.textContent = 'CREAR CUENTA';
    document.getElementById('btnRegistro').disabled = false;
  }
}

/* ════════════════════
   LOGOUT
════════════════════ */
function handleLogout() {
  if (!confirm('¿Deseas cerrar sesión?')) return;
  Auth.cerrarSesion();
  mostrarLogin();
}

/* ════════════════════
   TABS LOGIN / REGISTRO
════════════════════ */
function initTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      document.getElementById('formLogin').style.display    = which === 'login'    ? 'block' : 'none';
      document.getElementById('formRegistro').style.display = which === 'registro' ? 'block' : 'none';
    });
  });
}

/* ════════════════════
   ROL SELECTOR
════════════════════ */
function initRolSelector() {
  document.querySelectorAll('input[name="rol"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.rol-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.rol-option').querySelector('.rol-card').classList.add('selected');
    });
  });
}

/* ════════════════════
   MODAL EDITAR MIEMBRO
════════════════════ */
function initModal() {
  document.getElementById('btnCloseModal')?.addEventListener('click', () => closeModal('editModal'));
  document.getElementById('btnCancelEdit')?.addEventListener('click', () => closeModal('editModal'));
  document.getElementById('btnSaveEdit')?.addEventListener('click', () => {
    const modal = document.getElementById('editModal');
    const idx   = modal._editIndex;
    if (idx === undefined || idx < 0) return;
    Store.updateMember(idx, {
      nombres:   document.getElementById('e-nombres').value.trim(),
      apellidos: document.getElementById('e-apellidos').value.trim(),
      telefono:  document.getElementById('e-telefono').value.trim(),
      email:     document.getElementById('e-email').value.trim(),
      plan:      document.getElementById('e-plan').value,
      estado:    document.getElementById('e-estado').value,
      notas:     document.getElementById('e-notas').value.trim(),
    });
    closeModal('editModal');
    showToast('💾 Cambios guardados correctamente.');
  });
  document.getElementById('editModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeModal('editModal');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal('editModal');
  });
}

/* ════════════════════
   STORE SUBSCRIPTIONS
════════════════════ */
Store.subscribe(type => {
  if (type !== 'members') return;
  const cur = Router.getCurrent();
  if (cur === 'inicio')   PageInicio.refreshStats?.();
  if (cur === 'miembros') PageMiembros.onStoreUpdate?.();
  if (cur === 'informes') PageInformes.onStoreUpdate?.();
});

/* ════════════════════
   NAV DELEGATION (quick-actions, etc.)
════════════════════ */
function initNavDelegation() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-page]');
    if (btn && !btn.classList.contains('nav-link')) {
      Router.navigate(btn.dataset.page);
    }
  });
}

/* ════════════════════
   BOOT
════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // ── Login / Registro ──
  document.getElementById('btnLogin')?.addEventListener('click', handleLogin);
  document.getElementById('btnRegistro')?.addEventListener('click', handleRegistro);
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });

  // ── Tabs y selector de rol ──
  initTabs();
  initRolSelector();

  // ── Logout ──
  document.getElementById('btnLogout')?.addEventListener('click', handleLogout);

  // ── Navegación delegada ──
  initNavDelegation();

  // ── Modal ──
  initModal();

  // ── Sesión activa? ──
  if (Auth.estaAutenticado()) {
    initNavbar();
    Router.navigate('inicio');
  } else {
    mostrarLogin();
  }
});
