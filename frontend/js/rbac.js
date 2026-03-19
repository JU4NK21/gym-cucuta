/* ═══════════════════════════════════════
   RBAC.JS — Control de acceso por roles
═══════════════════════════════════════ */
'use strict';

const RBAC = (() => {

  /* Permisos por rol */
  const PERMISOS = {
    admin: {
      paginas:  ['inicio', 'registro-miembro', 'miembros', 'informes', 'eventos', 'soporte', 'validacion'],
      acciones: ['ver_informes', 'ver_miembros', 'validar_entrenadores', 'gestionar_usuarios']
    },
    entrenador: {
      paginas:  ['inicio', 'registro-miembro', 'miembros', 'eventos', 'soporte'],
      acciones: ['ver_miembros']
    },
    cliente: {
      paginas:  ['inicio', 'eventos', 'soporte'],
      acciones: []
    }
  };

  function puedeAcceder(pagina) {
    const rol = Auth.getRol();
    if (!rol) return false;
    return PERMISOS[rol]?.paginas.includes(pagina) || false;
  }

  function tienePermiso(accion) {
    const rol = Auth.getRol();
    if (!rol) return false;
    return PERMISOS[rol]?.acciones.includes(accion) || false;
  }

  /* Construir menú según rol */
  function getPaginasDisponibles() {
    const rol = Auth.getRol();
    if (!rol) return [];
    return PERMISOS[rol]?.paginas || [];
  }

  /* Configuración del navbar según rol */
  const NAV_CONFIG = [
    { page: 'inicio',           icon: '🏠', label: 'Inicio' },
    { page: 'registro-miembro', icon: '➕', label: 'Registrar' },
    { page: 'miembros',         icon: '👥', label: 'Miembros' },
    { page: 'informes',         icon: '📊', label: 'Informes' },
    { page: 'eventos',          icon: '📅', label: 'Eventos' },
    { page: 'validacion',       icon: '✅', label: 'Validaciones' },
    { page: 'soporte',          icon: '💬', label: 'Soporte' },
  ];

  function getNavItems() {
    const disponibles = getPaginasDisponibles();
    return NAV_CONFIG.filter(item => disponibles.includes(item.page));
  }

  return { puedeAcceder, tienePermiso, getNavItems, getPaginasDisponibles };
})();
