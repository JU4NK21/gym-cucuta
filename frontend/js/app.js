/* ══════════════════════════════════════
   APP.JS — Router, Auth, RBAC
══════════════════════════════════════ */
'use strict';

/* ════════ ROUTER ════════ */
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
    if (!Auth.estaAutenticado()) { mostrarLogin(); return; }
    if (!RBAC.puedeAcceder(pageId)) {
      showToast('No tienes permiso para acceder a esa sección.', 'warn');
      pageId = 'inicio';
    }
    const page = pages[pageId];
    if (!page) return;
    _current = pageId;

    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('appPage').classList.add('visible');

    document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));

    const content = document.getElementById('pageContent');
    content.innerHTML = page.getHTML();
    if (page.afterRender) page.afterRender();
  }

  function getCurrent() { return _current; }
  return { navigate, getCurrent };
})();

window._router = Router;

/* ════════ SHOW/HIDE LOGIN ════════ */
function mostrarLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appPage').classList.remove('visible');
}

/* ════════ NAVBAR ════════ */
function initNavbar() {
  const container = document.getElementById('navLinks');
  if (!container) return;
  const u = Auth.getUsuario();
  if (!u) return;

  container.innerHTML = RBAC.getNavItems().map(item => `
    <button class="nav-link" data-page="${item.page}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-text">${item.label}</span>
    </button>
  `).join('');

  container.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => Router.navigate(btn.dataset.page));
  });

  const ni = document.getElementById('navUserInit');
  const nn = document.getElementById('navUserName');
  const nr = document.getElementById('navUserRole');
  if (ni) ni.textContent = (u.nombre?.[0] || 'U').toUpperCase();
  if (nn) nn.textContent = `${u.nombre} ${u.apellido}`;
  if (nr) nr.innerHTML  = `<span class="role-badge ${u.rol}">${u.rol}</span>`;
}

window._app = { initNavbar };

/* ════════ LOGIN ════════ */
async function handleLogin() {
  const email    = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;
  const errEl    = document.getElementById('loginError');
  const btnText  = document.getElementById('btnLoginText');
  const btn      = document.getElementById('btnLogin');

  if (errEl) errEl.textContent = '';
  if (!email || !password) { if (errEl) errEl.textContent = 'Ingresa correo y contraseña.'; return; }

  if (btnText) btnText.textContent = 'Ingresando...';
  if (btn) btn.disabled = true;

  try {
    await Auth.login(email, password);
    initNavbar();
    Router.navigate('inicio');
  } catch(err) {
    if (errEl) errEl.textContent = err.message;
  } finally {
    if (btnText) btnText.textContent = 'INGRESAR';
    if (btn) btn.disabled = false;
  }
}

/* ════════ REGISTRO ════════ */
async function handleRegistro() {
  const nombre   = document.getElementById('regNombre')?.value.trim();
  const apellido = document.getElementById('regApellido')?.value.trim();
  const email    = document.getElementById('regEmail')?.value.trim();
  const password = document.getElementById('regPassword')?.value;
  const telefono = document.getElementById('regTelefono')?.value.trim();
  const rol      = document.querySelector('input[name="rol"]:checked')?.value;
  const errEl    = document.getElementById('regError');
  const btnText  = document.getElementById('btnRegTexto');
  const btn      = document.getElementById('btnRegistro');

  if (errEl) { errEl.style.color = '#f87171'; errEl.textContent = ''; }
  if (!nombre||!apellido||!email||!password||!rol) {
    if (errEl) errEl.textContent = 'Completa todos los campos obligatorios.'; return;
  }

  if (btnText) btnText.textContent = 'Creando cuenta...';
  if (btn) btn.disabled = true;

  try {
    const data = await Auth.registro({ nombre, apellido, email, password, telefono, rol });
    if (data.estado === 'pendiente') {
      if (errEl) { errEl.style.color = '#86efac'; errEl.textContent = '✅ Cuenta creada. Espera la aprobación del administrador.'; }
      ['regNombre','regApellido','regEmail','regPassword','regTelefono'].forEach(id => {
        const el = document.getElementById(id); if(el) el.value = '';
      });
    } else {
      showToast(`¡Bienvenido, ${data.usuario.nombre}!`);
      initNavbar();
      Router.navigate('inicio');
    }
  } catch(err) {
    if (errEl) { errEl.style.color = '#f87171'; errEl.textContent = err.message; }
  } finally {
    if (btnText) btnText.textContent = 'CREAR CUENTA';
    if (btn) btn.disabled = false;
  }
}

/* ════════ LOGOUT ════════ */
function handleLogout() {
  if (!confirm('¿Deseas cerrar sesión?')) return;
  Auth.cerrarSesion();
  mostrarLogin();
}

/* ════════ TABS ════════ */
function initTabs() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      const fl = document.getElementById('formLogin');
      const fr = document.getElementById('formRegistro');
      if (fl) fl.style.display = which === 'login'    ? 'block' : 'none';
      if (fr) fr.style.display = which === 'registro' ? 'block' : 'none';
    });
  });
}

/* ════════ ROL SELECTOR ════════ */
function initRolSelector() {
  document.querySelectorAll('input[name="rol"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.rol-card').forEach(c => c.classList.remove('selected'));
      radio.closest('.rol-option')?.querySelector('.rol-card')?.classList.add('selected');
    });
  });
}

/* ════════ MODAL ════════ */
function initModal() {
  document.getElementById('btnCloseModal')?.addEventListener('click', () => closeModal('editModal'));
  document.getElementById('btnCancelEdit')?.addEventListener('click', () => closeModal('editModal'));
  document.getElementById('btnSaveEdit')?.addEventListener('click', () => {
    const modal = document.getElementById('editModal');
    const id    = modal._editId;
    if (!id) return;
    closeModal('editModal');
    PageMiembros.saveEdit(id);
  });
  document.getElementById('editModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeModal('editModal');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal('editModal'); });
}

/* ════════ STORE SUBS ════════ */
Store.subscribe(type => {
  if (type !== 'members') return;
  const cur = Router.getCurrent();
  if (cur === 'inicio')   PageInicio.refreshStats?.();
  if (cur === 'miembros') PageMiembros.onStoreUpdate?.();
  if (cur === 'informes') PageInformes.onStoreUpdate?.();
});

/* ════════ NAV DELEGATION ════════ */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-page]');
  if (btn && !btn.classList.contains('nav-link')) Router.navigate(btn.dataset.page);
});

/* ════════ BOOT ════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Asignar eventos a botones del login
  document.getElementById('btnLogin')?.addEventListener('click', handleLogin);
  document.getElementById('btnRegistro')?.addEventListener('click', handleRegistro);
  document.getElementById('loginPassword')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('btnLogout')?.addEventListener('click', handleLogout);

  initTabs();
  initRolSelector();
  initModal();

  if (Auth.estaAutenticado()) {
    initNavbar();
    Router.navigate('inicio');
  } else {
    mostrarLogin();
  }
});
