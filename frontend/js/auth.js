/* ═══════════════════════════════════════
   AUTH.JS — Servicio de autenticación
═══════════════════════════════════════ */
'use strict';

/* Detecta automáticamente si está en local o en producción */
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

const Auth = (() => {

  function guardarSesion(token, usuario) {
    localStorage.setItem('gym_token',   token);
    localStorage.setItem('gym_usuario', JSON.stringify(usuario));
  }

  function cerrarSesion() {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_usuario');
  }

  function getToken()   { return localStorage.getItem('gym_token'); }
  function getUsuario() {
    const u = localStorage.getItem('gym_usuario');
    return u ? JSON.parse(u) : null;
  }
  function estaAutenticado() { return !!getToken() && !!getUsuario(); }
  function getRol() { return getUsuario()?.rol || null; }

  function headersAuth() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión.');
    guardarSesion(data.token, data.usuario);
    return data;
  }

  async function registro(datos) {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrarse.');
    if (data.token) guardarSesion(data.token, data.usuario);
    return data;
  }

  async function fetchAuth(endpoint, opciones = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...opciones,
      headers: { ...headersAuth(), ...(opciones.headers || {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la solicitud.');
    return data;
  }

  return { login, registro, cerrarSesion, getToken, getUsuario, estaAutenticado, getRol, headersAuth, fetchAuth };
})();
