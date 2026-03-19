/* ══════════════════════════════════════
   STORE.JS — Estado central + motor de
   estadísticas en tiempo real
══════════════════════════════════════ */
'use strict';

const Store = (() => {

  /* ── Estado privado ── */
  let _members  = [];
  let _events   = [];
  let _listeners = [];   // callbacks que se ejecutan al cambiar datos

  /* ── Suscripción reactiva ── */
  function subscribe(fn) { _listeners.push(fn); }

  function _notify(type) {
    _listeners.forEach(fn => { try { fn(type); } catch(e) { console.warn(e); } });
  }

  /* ════════════════════════
     MIEMBROS
  ════════════════════════ */
  function getMembers()  { return [..._members]; }
  function getMember(i)  { return _members[i]; }

  function addMember(member) {
    member.id = Date.now();
    _members.push(member);
    _notify('members');
  }

  function updateMember(index, data) {
    if (!_members[index]) return;
    Object.assign(_members[index], data);
    _notify('members');
  }

  function deleteMember(index) {
    _members.splice(index, 1);
    _notify('members');
  }

  /* ════════════════════════
     EVENTOS
  ════════════════════════ */
  function getEvents()  { return [..._events]; }

  function addEvent(event) {
    _events.push(event);
    _notify('events');
  }

  /* ════════════════════════
     ESTADÍSTICAS EN TIEMPO REAL
     Se calculan dinámicamente desde _members
  ════════════════════════ */
  function getStats() {
    const total    = _members.length;
    const activos  = _members.filter(m => m.estado === 'Activo').length;
    const inactivos= _members.filter(m => m.estado === 'Inactivo').length;
    const pendientes= _members.filter(m => m.estado === 'Pendiente').length;

    // Ingresos: suma del valor de cada plan activo
    const planPrice = { Mensual:120000, Trimestral:320000, Semestral:580000, Anual:1000000 };
    const ingresos = _members
      .filter(m => m.estado === 'Activo')
      .reduce((sum, m) => {
        const key = (m.plan || '').split(' - ')[0];
        return sum + (planPrice[key] || 0);
      }, 0);

    // Distribución de planes (%)
    const planCount = { Mensual:0, Trimestral:0, Semestral:0, Anual:0 };
    _members.forEach(m => {
      const key = (m.plan || '').split(' - ')[0];
      if (planCount[key] !== undefined) planCount[key]++;
    });
    const planDist = Object.entries(planCount).map(([label, count]) => ({
      label,
      val: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
      color: { Mensual:'#0ea5e9', Trimestral:'#38bdf8', Semestral:'#7dd3fc', Anual:'#bae6fd' }[label]
    }));

    // Nuevos este mes
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const nuevosEsteMes = _members.filter(m => m.fechaRegistro && m.fechaRegistro.startsWith(thisMonth)).length;

    // Vencimientos próximos (30 días)
    const soon = new Date(); soon.setDate(soon.getDate() + 30);
    const vencenProximo = _members.filter(m => {
      if (!m.vence) return false;
      const v = new Date(m.vence);
      return v >= now && v <= soon;
    }).length;

    return { total, activos, inactivos, pendientes, ingresos, planDist, nuevosEsteMes, vencenProximo };
  }

  /* Formatea ingresos en formato COP legible */
  function formatCOP(n) {
    if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`;
    if (n >= 1000)    return `$${(n/1000).toFixed(0)}K`;
    return `$${n.toLocaleString('es-CO')}`;
  }

  return { subscribe, getMembers, getMember, addMember, updateMember, deleteMember, getEvents, addEvent, getStats, formatCOP };

})();
