'use strict';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

const Auth = (() => {
  const save  = (t,u) => { localStorage.setItem('gym_token',t); localStorage.setItem('gym_usuario',JSON.stringify(u)); };
  const clear = ()    => { localStorage.removeItem('gym_token'); localStorage.removeItem('gym_usuario'); };
  const token   = ()  => localStorage.getItem('gym_token');
  const usuario = ()  => { try { return JSON.parse(localStorage.getItem('gym_usuario')); } catch { return null; } };
  const autenticado = () => !!token() && !!usuario();
  const rol   = ()    => usuario()?.rol || null;
  const headers = ()  => ({ 'Content-Type':'application/json', 'Authorization':`Bearer ${token()}` });

  async function login(email, password) {
    const r = await fetch(`${API_URL}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Error al iniciar sesión.');
    save(d.token, d.usuario);
    return d;
  }

  async function registro(datos) {
    const r = await fetch(`${API_URL}/auth/registro`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(datos) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Error al registrarse.');
    if (d.token) save(d.token, d.usuario);
    return d;
  }

  async function fetchAuth(endpoint, opts={}) {
    const r = await fetch(`${API_URL}${endpoint}`, { ...opts, headers:{ ...headers(), ...(opts.headers||{}) } });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Error en la solicitud.');
    return d;
  }

  return {
    login, registro, fetchAuth,
    cerrarSesion: clear,
    getToken:     token,
    getUsuario:   usuario,
    estaAutenticado: autenticado,
    getRol:       rol,
    headersAuth:  headers,
  };
})();
