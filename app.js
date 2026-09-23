/* =============================================
   TEMPLO GYM — APP.JS
   Sistema de Gestión (datos en localStorage)
   ============================================= */

'use strict';

// ─────────────────── STORE (localStorage) ───────────────────
const DB = {
  get: (key) => {
    try { return JSON.parse(localStorage.getItem(`tg_${key}`) || '[]'); }
    catch { return []; }
  },
  set: (key, val) => {
    try { localStorage.setItem(`tg_${key}`, JSON.stringify(val)); }
    catch { showToast('No se pudo guardar. Revisa el espacio del navegador.', 'error'); }
  },
  nextId: (key) => {
    const arr = DB.get(key);
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  }
};

// ─────────────────── FECHAS (hora local, no UTC) ───────────────────
const pad = n => String(n).padStart(2, '0');

function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseISODate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDias(str, n) {
  const d = parseISODate(str);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

function diasEntre(desde, hasta) {
  return Math.round((parseISODate(hasta) - parseISODate(desde)) / 86400000);
}

function hoy() { return toISODate(new Date()); }

function fmtFecha(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

// ─────────────────── SEED DATA (primera vez) ───────────────────
function seedData() {
  if (DB.get('seeded').length) return;

  const h = hoy();

  const clientes = [
    { id:1, nombre:'Carlos Mendoza',  dni:'70123456', telefono:'987001001', email:'carlos@mail.com', genero:'M', fechaNac:'1990-03-15', observaciones:'Sin restricciones', activo:true },
    { id:2, nombre:'Lucía Ríos',      dni:'70234567', telefono:'987002002', email:'lucia@mail.com',  genero:'F', fechaNac:'1995-07-22', observaciones:'Evitar sentadilla profunda', activo:true },
    { id:3, nombre:'Miguel Torres',   dni:'70345678', telefono:'987003003', email:'miguel@mail.com', genero:'M', fechaNac:'1988-11-08', observaciones:'', activo:true },
    { id:4, nombre:'Sofía Vargas',    dni:'70456789', telefono:'987004004', email:'sofia@mail.com',  genero:'F', fechaNac:'1998-01-30', observaciones:'Embarazada, rutina suave', activo:false },
    { id:5, nombre:'Rodrigo Puma',    dni:'70567890', telefono:'987005005', email:'rodrigo@mail.com',genero:'M', fechaNac:'1993-06-17', observaciones:'', activo:true },
  ];

  const membresias = [
    { id:1, clienteId:1, plan:'Mensual',    monto:80,  fechaInicio: addDias(h,-20),  fechaFin: addDias(h,10),  fechaPago: addDias(h,-20),  pago:'Efectivo' },
    { id:2, clienteId:2, plan:'Trimestral', monto:210, fechaInicio: addDias(h,-60),  fechaFin: addDias(h,30),  fechaPago: addDias(h,-60),  pago:'Yape' },
    { id:3, clienteId:3, plan:'Mensual',    monto:80,  fechaInicio: addDias(h,-28),  fechaFin: addDias(h,2),   fechaPago: addDias(h,-28),  pago:'Efectivo' },
    { id:4, clienteId:5, plan:'Anual',      monto:720, fechaInicio: addDias(h,-100), fechaFin: addDias(h,265), fechaPago: addDias(h,-100), pago:'Transferencia' },
  ];

  const asistencia = [
    { id:1, clienteId:1, fecha: h, hora:'07:30' },
    { id:2, clienteId:2, fecha: h, hora:'08:15' },
    { id:3, clienteId:5, fecha: h, hora:'09:00' },
    { id:4, clienteId:3, fecha: addDias(h,-1), hora:'18:45' },
  ];

  const rutinas = [
    {
      id:1, nombre:'Fuerza Total', clienteId:1, nivel:'Avanzado', dias:4,
      objetivo:'Hipertrofia muscular y fuerza máxima',
      ejercicios:'Press de Banca | 4x8\nSentadilla | 4x6\nPeso Muerto | 3x5\nPress Militar | 4x8\nDominadas | 4x8',
      notas:'Descanso 2-3 min entre series. Progresión semanal de 2.5kg.'
    },
    {
      id:2, nombre:'Cardio + Core', clienteId:2, nivel:'Principiante', dias:3,
      objetivo:'Pérdida de peso y tonificación',
      ejercicios:'Caminata inclinada | 20min\nAbdominales | 3x20\nPlanchas | 3x30s\nBicicleta estática | 15min',
      notas:'Mantener FC entre 120-140 bpm. Sin ejercicios de alto impacto.'
    },
    {
      id:3, nombre:'Upper/Lower Split', clienteId:0, nivel:'Intermedio', dias:4,
      objetivo:'Desarrollo muscular equilibrado',
      ejercicios:'Press Inclinado | 3x10\nRemo con Barra | 3x10\nCurl Bíceps | 3x12\nTríceps Polea | 3x12',
      notas:'Rutina genérica disponible para asignación.'
    },
  ];

  DB.set('clientes',   clientes);
  DB.set('membresias', membresias);
  DB.set('asistencia', asistencia);
  DB.set('rutinas',    rutinas);
  DB.set('seeded', [1]);
}

// ─────────────────── HELPERS ───────────────────
// Escapa texto del usuario antes de insertarlo como HTML
function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function inicialDe(nombre) {
  return nombre ? nombre.trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase() : '?';
}

function getCliente(id) {
  return DB.get('clientes').find(c => c.id === Number(id)) || null;
}

function avatar(nombre) {
  return `<div class="ri-avatar" aria-hidden="true">${esc(inicialDe(nombre))}</div>`;
}

// Estado de una membresía respecto a una fecha
function estadoMembresia(m, hoyStr = hoy()) {
  if (m.fechaInicio > hoyStr) return 'programada';
  if (m.fechaFin < hoyStr)    return 'vencida';
  if (m.fechaFin <= addDias(hoyStr, 7)) return 'por-vencer';
  return 'vigente';
}

const esVigente = (m, hoyStr) => ['vigente', 'por-vencer'].includes(estadoMembresia(m, hoyStr));

// Membresía vigente hoy (la que termina más tarde, si hay varias)
function membresiaActiva(clienteId, membresias = DB.get('membresias')) {
  const hoyStr = hoy();
  return membresias
    .filter(m => m.clienteId === Number(clienteId) && esVigente(m, hoyStr))
    .sort((a, b) => b.fechaFin.localeCompare(a.fechaFin))[0] || null;
}

// Última fecha cubierta por cualquier membresía del cliente (vigente o programada)
function ultimaCobertura(clienteId) {
  const hoyStr = hoy();
  return DB.get('membresias')
    .filter(m => m.clienteId === Number(clienteId) && m.fechaFin >= hoyStr)
    .reduce((max, m) => (m.fechaFin > max ? m.fechaFin : max), '');
}

const PILL_ESTADO = {
  'vigente':    '<span class="pill pill-green"><i class="fas fa-circle-check" aria-hidden="true"></i> Vigente</span>',
  'por-vencer': '<span class="pill pill-warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Por vencer</span>',
  'vencida':    '<span class="pill pill-red"><i class="fas fa-circle-xmark" aria-hidden="true"></i> Vencida</span>',
  'programada': '<span class="pill pill-info"><i class="fas fa-clock" aria-hidden="true"></i> Programada</span>',
};

function showToast(msg, tipo = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${tipo}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

let lastFocus = null;

function openModal(id) {
  lastFocus = document.activeElement;
  const overlay = document.getElementById(id);
  overlay.classList.add('open');
  const first = overlay.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
  if (first) setTimeout(() => first.focus(), 50);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  lastFocus?.focus?.();
}

function emptyState(icon, msg) {
  return `<div class="empty-state"><i class="${icon}" aria-hidden="true"></i><p>${esc(msg)}</p></div>`;
}

function marcarInvalido(id, invalido) {
  document.getElementById(id).setAttribute('aria-invalid', invalido ? 'true' : 'false');
}

// ─────────────────── NAVEGACIÓN ───────────────────
const titles = {
  dashboard:  'Dashboard',
  clientes:   'Clientes',
  membresias: 'Membresías',
  asistencia: 'Asistencia',
  rutinas:    'Rutinas'
};

function navigateTo(sec) {
  if (!titles[sec]) sec = 'dashboard';

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    n.removeAttribute('aria-current');
  });

  document.getElementById(`section-${sec}`)?.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-section="${sec}"]`);
  if (nav) { nav.classList.add('active'); nav.setAttribute('aria-current', 'page'); }

  document.getElementById('pageTitle').textContent = titles[sec];
  document.title = `${titles[sec]} — Templo Gym`;
  if (location.hash !== `#${sec}`) history.replaceState(null, '', `#${sec}`);

  renderers[sec]?.();
}

function setSidebar(open) {
  document.getElementById('sidebar').classList.toggle('open', open);
  document.getElementById('menuToggle').setAttribute('aria-expanded', String(open));
}

// ─────────────────── DASHBOARD ───────────────────
function renderDashboard() {
  const clientes   = DB.get('clientes');
  const membresias = DB.get('membresias');
  const asistencia = DB.get('asistencia');

  const hoyStr  = hoy();
  const ayerStr = addDias(hoyStr, -1);
  const mesStr  = hoyStr.slice(0, 7);

  const activos    = clientes.filter(c => c.activo).length;
  const vigentes   = membresias.filter(m => esVigente(m, hoyStr));
  const asistHoy   = asistencia.filter(a => a.fecha === hoyStr).length;
  const asistAyer  = asistencia.filter(a => a.fecha === ayerStr).length;
  const pagosMes   = membresias.filter(m => (m.fechaPago || m.fechaInicio).startsWith(mesStr));
  const ingresos   = pagosMes.reduce((s, m) => s + (Number(m.monto) || 0), 0);

  // Por vencer: excluye clientes que ya renovaron (tienen otra membresía que termina después)
  const porVencer = membresias
    .filter(m => estadoMembresia(m, hoyStr) === 'por-vencer')
    .filter(m => !membresias.some(o => o.id !== m.id && o.clienteId === m.clienteId && o.fechaFin > m.fechaFin))
    .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin));

  const mesNombre = new Date().toLocaleDateString('es-PE', { month: 'long' });

  document.getElementById('statClientes').textContent       = activos;
  document.getElementById('statClientesFoot').textContent   = `de ${clientes.length} registrados`;
  document.getElementById('statMembresias').textContent     = vigentes.length;
  document.getElementById('statMembresiasFoot').textContent = porVencer.length
    ? `${porVencer.length} vence${porVencer.length !== 1 ? 'n' : ''} esta semana` : 'Ninguna vence esta semana';
  document.getElementById('statAsistencia').textContent     = asistHoy;
  document.getElementById('statAsistenciaFoot').textContent = `Ayer: ${asistAyer}`;
  document.getElementById('statIngresos').textContent       = `S/ ${ingresos.toLocaleString('es-PE')}`;
  document.getElementById('statIngresosFoot').textContent   = `${pagosMes.length} pago${pagosMes.length !== 1 ? 's' : ''} en ${mesNombre}`;

  // Últimas asistencias
  const ultimas = [...asistencia]
    .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora))
    .slice(0, 5);
  document.getElementById('recentAsistencia').innerHTML = ultimas.length ? ultimas.map(a => {
    const c = getCliente(a.clienteId);
    const cuando = a.fecha === hoyStr ? 'Hoy' : a.fecha === ayerStr ? 'Ayer' : fmtFecha(a.fecha);
    return `<div class="recent-item">
      ${avatar(c?.nombre)}
      <div class="ri-info">
        <div class="ri-name">${esc(c?.nombre || 'Cliente eliminado')}</div>
        <div class="ri-sub">DNI ${esc(c?.dni || '—')}</div>
      </div>
      <div class="ri-extra">${cuando}<br/>${esc(a.hora)}</div>
    </div>`;
  }).join('') : emptyState('fas fa-door-open', 'Sin asistencias registradas');

  // Membresías por vencer
  document.getElementById('proximasVencer').innerHTML = porVencer.length ? porVencer.map(m => {
    const c = getCliente(m.clienteId);
    const diff = diasEntre(hoyStr, m.fechaFin);
    const texto = diff === 0 ? 'Vence hoy' : `Vence en<br/>${diff} día${diff !== 1 ? 's' : ''}`;
    return `<div class="recent-item">
      ${avatar(c?.nombre)}
      <div class="ri-info">
        <div class="ri-name">${esc(c?.nombre || '—')}</div>
        <div class="ri-sub">${esc(m.plan)} · ${esc(c?.telefono || 'sin teléfono')}</div>
      </div>
      <div class="ri-extra warn">${texto}</div>
    </div>`;
  }).join('') : emptyState('fas fa-id-card', 'Ninguna vence esta semana');

  // Clientes recientes
  const rc = clientes.slice(-5).reverse();
  document.getElementById('recentClientes').innerHTML = rc.length ? rc.map(c => `
    <div class="recent-item">
      ${avatar(c.nombre)}
      <div class="ri-info">
        <div class="ri-name">${esc(c.nombre)}</div>
        <div class="ri-sub">${esc(c.email || c.telefono || '—')}</div>
      </div>
      <div class="ri-extra">${c.activo ? '<span class="pill pill-green">Activo</span>' : '<span class="pill pill-muted">Inactivo</span>'}</div>
    </div>
  `).join('') : emptyState('fas fa-users', 'Sin clientes aún');
}

// ─────────────────── CLIENTES ───────────────────
let editingClienteId = null;

function renderClientes(filter = '') {
  let data = DB.get('clientes');
  if (filter) {
    const f = filter.toLowerCase();
    data = data.filter(c =>
      c.nombre.toLowerCase().includes(f) ||
      c.dni.includes(f) ||
      (c.email || '').toLowerCase().includes(f)
    );
  }

  const tbody = document.getElementById('bodyClientes');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState('fas fa-users', filter ? 'Ningún cliente coincide con la búsqueda' : 'Sin clientes registrados')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((c, i) => `
    <tr>
      <td class="muted num">${i + 1}</td>
      <td><div class="cell-user">${avatar(c.nombre)}<strong>${esc(c.nombre)}</strong></div></td>
      <td class="mono">${esc(c.dni)}</td>
      <td class="mono">${esc(c.telefono || '—')}</td>
      <td>${esc(c.email || '—')}</td>
      <td>${c.activo
        ? '<span class="pill pill-green"><i class="fas fa-circle" aria-hidden="true"></i> Activo</span>'
        : '<span class="pill pill-muted"><i class="fas fa-circle" aria-hidden="true"></i> Inactivo</span>'
      }</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary btn-icon" data-action="edit-cliente" data-id="${c.id}" aria-label="Editar ${esc(c.nombre)}"><i class="fas fa-pen" aria-hidden="true"></i></button>
          <button class="btn btn-sm btn-danger btn-icon" data-action="delete-cliente" data-id="${c.id}" aria-label="Eliminar ${esc(c.nombre)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editCliente(id) {
  const c = getCliente(id);
  if (!c) return;
  editingClienteId = c.id;
  document.getElementById('modalClienteTitle').textContent = 'Editar cliente';
  document.getElementById('cNombre').value        = c.nombre;
  document.getElementById('cDNI').value           = c.dni;
  document.getElementById('cActivo').value        = c.activo ? '1' : '0';
  document.getElementById('cTelefono').value      = c.telefono || '';
  document.getElementById('cEmail').value         = c.email || '';
  document.getElementById('cFechaNac').value      = c.fechaNac || '';
  document.getElementById('cGenero').value        = c.genero || '';
  document.getElementById('cObservaciones').value = c.observaciones || '';
  ['cNombre', 'cDNI', 'cEmail'].forEach(f => marcarInvalido(f, false));
  openModal('modalCliente');
}

function deleteCliente(id) {
  const c = getCliente(id);
  if (!c) return;

  const membresias = DB.get('membresias');
  const asistencia = DB.get('asistencia');
  const nMem  = membresias.filter(m => m.clienteId === id).length;
  const nAsis = asistencia.filter(a => a.clienteId === id).length;

  let msg = `¿Eliminar a ${c.nombre}?`;
  if (nMem || nAsis) {
    msg += `\n\nTambién se borrarán ${nMem} membresía(s) y ${nAsis} registro(s) de asistencia.` +
           `\nSi solo dejó de venir, mejor edítalo y márcalo como "Inactivo".`;
  }
  if (!confirm(msg)) return;

  DB.set('clientes',   DB.get('clientes').filter(x => x.id !== id));
  DB.set('membresias', membresias.filter(m => m.clienteId !== id));
  DB.set('asistencia', asistencia.filter(a => a.clienteId !== id));
  DB.set('rutinas',    DB.get('rutinas').map(r => r.clienteId === id ? { ...r, clienteId: 0 } : r));

  renderClientes(document.getElementById('filterClientes').value);
  populateClienteSelects();
  showToast('Cliente eliminado', 'warn');
}

function saveCliente() {
  const nombre = document.getElementById('cNombre').value.trim();
  const dni    = document.getElementById('cDNI').value.trim();
  const emailEl = document.getElementById('cEmail');

  marcarInvalido('cNombre', !nombre);
  marcarInvalido('cDNI', !/^\d{8}$/.test(dni));
  marcarInvalido('cEmail', !emailEl.checkValidity());

  if (!nombre || !dni) return showToast('Nombre y DNI son obligatorios', 'error');
  if (!/^\d{8}$/.test(dni)) return showToast('El DNI debe tener 8 dígitos numéricos', 'error');
  if (!emailEl.checkValidity()) return showToast('El email no es válido', 'error');

  const data = DB.get('clientes');
  if (data.some(c => c.dni === dni && c.id !== editingClienteId)) {
    marcarInvalido('cDNI', true);
    return showToast('Ya existe un cliente con ese DNI', 'error');
  }

  const campos = {
    nombre, dni,
    activo:   document.getElementById('cActivo').value === '1',
    telefono: document.getElementById('cTelefono').value.trim(),
    email:    emailEl.value.trim(),
    fechaNac: document.getElementById('cFechaNac').value,
    genero:   document.getElementById('cGenero').value,
    observaciones: document.getElementById('cObservaciones').value.trim(),
  };

  if (editingClienteId) {
    const idx = data.findIndex(c => c.id === editingClienteId);
    if (idx > -1) data[idx] = { ...data[idx], ...campos };
    showToast('Cliente actualizado');
  } else {
    data.push({ id: DB.nextId('clientes'), ...campos });
    showToast('Cliente registrado');
  }

  DB.set('clientes', data);
  closeModal('modalCliente');
  renderClientes(document.getElementById('filterClientes').value);
  populateClienteSelects();
}

// ─────────────────── MEMBRESÍAS ───────────────────
let editingMembresiaId = null;

function renderMembresias(filter = '') {
  let data = DB.get('membresias');
  const hoyStr = hoy();

  if (filter) {
    const f = filter.toLowerCase();
    data = data.filter(m => {
      const c = getCliente(m.clienteId);
      return (c?.nombre || '').toLowerCase().includes(f) || m.plan.toLowerCase().includes(f);
    });
  }

  // Más recientes primero
  data = [...data].sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio));

  const tbody = document.getElementById('bodyMembresias');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('fas fa-id-card', filter ? 'Ninguna membresía coincide con la búsqueda' : 'Sin membresías registradas')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((m, i) => {
    const c = getCliente(m.clienteId);
    const estado = estadoMembresia(m, hoyStr);
    return `
      <tr>
        <td class="muted num">${i + 1}</td>
        <td><div class="cell-user">${avatar(c?.nombre)}${c ? esc(c.nombre) : '<em class="muted">Sin cliente</em>'}</div></td>
        <td><span class="pill pill-muted">${esc(m.plan)}</span></td>
        <td class="mono">${fmtFecha(m.fechaInicio)}</td>
        <td class="mono ${estado === 'vencida' ? 'danger' : ''}">${fmtFecha(m.fechaFin)}</td>
        <td class="money">S/ ${esc(m.monto)}</td>
        <td>${PILL_ESTADO[estado]}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-sm btn-secondary btn-icon" data-action="edit-membresia" data-id="${m.id}" aria-label="Editar membresía"><i class="fas fa-pen" aria-hidden="true"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" data-action="delete-membresia" data-id="${m.id}" aria-label="Eliminar membresía"><i class="fas fa-trash" aria-hidden="true"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Al crear una membresía, si el cliente ya tiene una vigente, sugiere empezar al día siguiente de su vencimiento
function sugerirInicio() {
  const hint = document.getElementById('mFechaHint');
  if (editingMembresiaId) { hint.textContent = ''; return; }

  const cobertura = ultimaCobertura(document.getElementById('mCliente').value);
  if (cobertura) {
    document.getElementById('mFechaInicio').value = addDias(cobertura, 1);
    hint.textContent = `Renovación: su membresía actual cubre hasta el ${fmtFecha(cobertura)}.`;
  } else {
    document.getElementById('mFechaInicio').value = hoy();
    hint.textContent = '';
  }
}

function editMembresia(id) {
  const m = DB.get('membresias').find(x => x.id === id);
  if (!m) return;
  editingMembresiaId = id;
  populateClienteSelects();
  document.getElementById('modalMembresiaTitle').textContent = 'Editar membresía';
  document.getElementById('mCliente').value     = m.clienteId;
  document.getElementById('mFechaInicio').value = m.fechaInicio;
  document.getElementById('mMonto').value       = m.monto;
  document.getElementById('mPago').value        = m.pago;
  document.getElementById('mFechaHint').textContent = '';

  const planSel = document.getElementById('mPlan');
  const opt = [...planSel.options].find(o => o.value.split('|')[0] === m.plan);
  if (opt) planSel.value = opt.value;

  openModal('modalMembresia');
}

function deleteMembresia(id) {
  if (!confirm('¿Eliminar esta membresía? Esta acción no se puede deshacer.')) return;
  DB.set('membresias', DB.get('membresias').filter(m => m.id !== id));
  renderMembresias(document.getElementById('filterMembresias').value);
  showToast('Membresía eliminada', 'warn');
}

function saveMembresia() {
  const clienteId   = Number(document.getElementById('mCliente').value);
  const planVal     = document.getElementById('mPlan').value;
  const fechaInicio = document.getElementById('mFechaInicio').value;
  const monto       = parseFloat(document.getElementById('mMonto').value);

  if (!clienteId || !planVal || !fechaInicio) return showToast('Completa los campos obligatorios', 'error');
  if (!isNaN(monto) && monto < 0) return showToast('El monto no puede ser negativo', 'error');

  const [plan, precioBase, dias] = planVal.split('|');
  const fechaFin = addDias(fechaInicio, Number(dias));

  const campos = {
    clienteId, plan, fechaInicio, fechaFin,
    monto: isNaN(monto) ? Number(precioBase) : monto,
    pago:  document.getElementById('mPago').value,
  };

  const data = DB.get('membresias');

  if (editingMembresiaId) {
    const idx = data.findIndex(m => m.id === editingMembresiaId);
    if (idx > -1) data[idx] = { ...data[idx], ...campos };
    showToast('Membresía actualizada');
  } else {
    data.push({ id: DB.nextId('membresias'), ...campos, fechaPago: hoy() });
    showToast(`Membresía registrada hasta el ${fmtFecha(fechaFin)}`);
  }

  DB.set('membresias', data);
  closeModal('modalMembresia');
  renderMembresias(document.getElementById('filterMembresias').value);
}

// ─────────────────── ASISTENCIA ───────────────────
function asistenciaFiltrada(filter) {
  const data = DB.get('asistencia');
  return (filter ? data.filter(a => a.fecha === filter) : data)
    .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
}

function renderAsistencia(filter = '') {
  const data = asistenciaFiltrada(filter);
  const membresias = DB.get('membresias');

  const tbody = document.getElementById('bodyAsistencia');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6">${emptyState('fas fa-door-open', filter ? `Sin asistencias el ${fmtFecha(filter)}` : 'Sin registros de asistencia')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((a, i) => {
    const c = getCliente(a.clienteId);
    const mem = membresiaActiva(a.clienteId, membresias);
    return `
      <tr>
        <td class="muted num">${i + 1}</td>
        <td><div class="cell-user">${avatar(c?.nombre)}${esc(c?.nombre || 'Cliente eliminado')}</div></td>
        <td class="mono">${esc(c?.dni || '—')}</td>
        <td class="mono">${fmtFecha(a.fecha)}</td>
        <td class="mono">${esc(a.hora)}</td>
        <td>${mem
          ? '<span class="pill pill-green"><i class="fas fa-circle-check" aria-hidden="true"></i> Vigente</span>'
          : '<span class="pill pill-red"><i class="fas fa-circle-xmark" aria-hidden="true"></i> Sin membresía</span>'
        }</td>
      </tr>
    `;
  }).join('');
}

function checkin() {
  const input = document.getElementById('checkinDNI');
  const dni = input.value.trim();
  const fb  = document.getElementById('checkinFeedback');

  if (!/^\d{8}$/.test(dni)) {
    fb.innerHTML = '<span class="feedback-err"><i class="fas fa-circle-exclamation" aria-hidden="true"></i> Ingresa un DNI válido (8 dígitos)</span>';
    return;
  }

  const cliente = DB.get('clientes').find(c => c.dni === dni);
  if (!cliente) {
    fb.innerHTML = `<span class="feedback-err"><i class="fas fa-circle-xmark" aria-hidden="true"></i> No se encontró ningún cliente con DNI ${esc(dni)}</span>`;
    return;
  }

  if (!cliente.activo) {
    fb.innerHTML = `<span class="feedback-warn"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> ${esc(cliente.nombre)} está marcado como inactivo<small>Edita el cliente para reactivarlo.</small></span>`;
    return;
  }

  const fecha = hoy();
  const hora  = new Date().toTimeString().slice(0, 5);

  const asistencia = DB.get('asistencia');
  const yaRegistrado = asistencia.find(a => a.clienteId === cliente.id && a.fecha === fecha);
  if (yaRegistrado) {
    fb.innerHTML = `<span class="feedback-warn"><i class="fas fa-circle-info" aria-hidden="true"></i> ${esc(cliente.nombre)} ya registró su entrada hoy a las ${esc(yaRegistrado.hora)}</span>`;
    input.select();
    return;
  }

  asistencia.push({ id: DB.nextId('asistencia'), clienteId: cliente.id, fecha, hora });
  DB.set('asistencia', asistencia);

  const mem = membresiaActiva(cliente.id);
  if (mem) {
    const diff = diasEntre(fecha, mem.fechaFin);
    const aviso = diff <= 7 ? ` — vence en ${diff} día${diff !== 1 ? 's' : ''}` : '';
    fb.innerHTML = `<span class="${diff <= 7 ? 'feedback-warn' : 'feedback-ok'}">
      <i class="fas fa-circle-check" aria-hidden="true"></i> Bienvenido, <strong>${esc(cliente.nombre)}</strong> (${hora})
      <small>Membresía ${esc(mem.plan)} vigente hasta el ${fmtFecha(mem.fechaFin)}${aviso}</small>
    </span>`;
  } else {
    fb.innerHTML = `<span class="feedback-warn">
      <i class="fas fa-triangle-exclamation" aria-hidden="true"></i> Entrada registrada: <strong>${esc(cliente.nombre)}</strong> (${hora})
      <small>No tiene membresía vigente. Cobrar o renovar.</small>
    </span>`;
  }

  input.value = '';
  input.focus();
  renderAsistencia(document.getElementById('filterFecha').value);
  showToast(`Check-in: ${cliente.nombre}`);
}

function csvCampo(v) {
  return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

function exportAsistencia() {
  const filtro = document.getElementById('filterFecha').value;
  const data = asistenciaFiltrada(filtro);
  if (!data.length) return showToast('No hay registros para exportar', 'warn');

  const membresias = DB.get('membresias');
  const filas = [['N°', 'Cliente', 'DNI', 'Fecha', 'Hora', 'Estado membresía']];
  data.forEach((a, i) => {
    const c = getCliente(a.clienteId);
    const mem = membresiaActiva(a.clienteId, membresias);
    filas.push([i + 1, c?.nombre || '?', c?.dni || '?', fmtFecha(a.fecha), a.hora, mem ? 'Vigente' : 'Sin membresía']);
  });

  // BOM para que Excel muestre bien las tildes
  const csv = '﻿' + filas.map(f => f.map(csvCampo).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `asistencia_templogym_${filtro || 'completo_' + hoy()}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`Exportados ${data.length} registros`);
}

// ─────────────────── RUTINAS ───────────────────
let editingRutinaId = null;

function renderRutinas(filter = '') {
  let data = DB.get('rutinas');
  if (filter) {
    const f = filter.toLowerCase();
    data = data.filter(r =>
      r.nombre.toLowerCase().includes(f) ||
      r.nivel.toLowerCase().includes(f) ||
      (r.objetivo || '').toLowerCase().includes(f)
    );
  }

  const grid = document.getElementById('rutinasGrid');
  if (!data.length) {
    grid.innerHTML = emptyState('fas fa-dumbbell', filter ? 'Ninguna rutina coincide con la búsqueda' : 'Sin rutinas registradas');
    return;
  }

  grid.innerHTML = data.map(r => {
    const c = r.clienteId ? getCliente(r.clienteId) : null;
    const ejercicios = (r.ejercicios || '').split('\n').filter(Boolean);
    const nivelColor = { Principiante: 'pill-green', Intermedio: 'pill-warn', Avanzado: 'pill-red' }[r.nivel] || 'pill-muted';

    return `
      <article class="rutina-card">
        <h3 class="rutina-title">${esc(r.nombre)}</h3>
        <div class="rutina-meta">
          <span class="pill ${nivelColor}">${esc(r.nivel)}</span>
          <span class="pill pill-muted"><i class="fas fa-calendar-day" aria-hidden="true"></i> ${esc(r.dias)} días/sem</span>
          ${c
            ? `<span class="pill pill-gold"><i class="fas fa-user" aria-hidden="true"></i> ${esc(c.nombre.split(' ')[0])}</span>`
            : '<span class="pill pill-muted">Sin asignar</span>'}
        </div>
        ${r.objetivo ? `<p class="rutina-goal">${esc(r.objetivo)}</p>` : ''}
        <ul class="rutina-exercises">
          ${ejercicios.slice(0, 5).map(e => {
            const [nombre, series] = e.split('|').map(x => x.trim());
            return `<li>${esc(nombre)} ${series ? `<span>${esc(series)}</span>` : ''}</li>`;
          }).join('')}
          ${ejercicios.length > 5 ? `<li class="more">+${ejercicios.length - 5} más...</li>` : ''}
        </ul>
        ${r.notas ? `<p class="rutina-notes">${esc(r.notas)}</p>` : ''}
        <div class="rutina-footer">
          <span>${ejercicios.length} ejercicios</span>
          <div class="action-btns">
            <button class="btn btn-sm btn-secondary btn-icon" data-action="edit-rutina" data-id="${r.id}" aria-label="Editar rutina ${esc(r.nombre)}"><i class="fas fa-pen" aria-hidden="true"></i></button>
            <button class="btn btn-sm btn-danger btn-icon" data-action="delete-rutina" data-id="${r.id}" aria-label="Eliminar rutina ${esc(r.nombre)}"><i class="fas fa-trash" aria-hidden="true"></i></button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function editRutina(id) {
  const r = DB.get('rutinas').find(x => x.id === id);
  if (!r) return;
  editingRutinaId = id;
  populateClienteSelects();
  document.getElementById('modalRutinaTitle').textContent = 'Editar rutina';
  document.getElementById('rNombre').value     = r.nombre;
  document.getElementById('rCliente').value    = r.clienteId || '';
  document.getElementById('rNivel').value      = r.nivel;
  document.getElementById('rDias').value       = r.dias;
  document.getElementById('rObjetivo').value   = r.objetivo || '';
  document.getElementById('rEjercicios').value = r.ejercicios || '';
  document.getElementById('rNotas').value      = r.notas || '';
  openModal('modalRutina');
}

function deleteRutina(id) {
  if (!confirm('¿Eliminar esta rutina?')) return;
  DB.set('rutinas', DB.get('rutinas').filter(r => r.id !== id));
  renderRutinas(document.getElementById('filterRutinas').value);
  showToast('Rutina eliminada', 'warn');
}

function saveRutina() {
  const nombre = document.getElementById('rNombre').value.trim();
  marcarInvalido('rNombre', !nombre);
  if (!nombre) return showToast('El nombre es obligatorio', 'error');

  const dias = Math.min(7, Math.max(1, Number(document.getElementById('rDias').value) || 3));

  const data = DB.get('rutinas');
  const rutina = {
    nombre,
    clienteId:  Number(document.getElementById('rCliente').value) || 0,
    nivel:      document.getElementById('rNivel').value,
    dias,
    objetivo:   document.getElementById('rObjetivo').value.trim(),
    ejercicios: document.getElementById('rEjercicios').value.trim(),
    notas:      document.getElementById('rNotas').value.trim(),
  };

  if (editingRutinaId) {
    const idx = data.findIndex(r => r.id === editingRutinaId);
    if (idx > -1) data[idx] = { ...data[idx], ...rutina };
    showToast('Rutina actualizada');
  } else {
    data.push({ id: DB.nextId('rutinas'), ...rutina });
    showToast('Rutina guardada');
  }

  DB.set('rutinas', data);
  closeModal('modalRutina');
  renderRutinas(document.getElementById('filterRutinas').value);
}

// ─────────────────── SELECTS DE CLIENTES ───────────────────
function populateClienteSelects() {
  const clientes = [...DB.get('clientes')].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  const opts = clientes.map(c =>
    `<option value="${c.id}">${esc(c.nombre)} — ${esc(c.dni)}${c.activo ? '' : ' (inactivo)'}</option>`
  ).join('');
  document.getElementById('mCliente').innerHTML = opts || '<option value="">Sin clientes</option>';

  document.getElementById('rCliente').innerHTML = '<option value="">Sin asignar</option>' +
    clientes.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
}

// ─────────────────── RENDERERS MAP ───────────────────
const renderers = {
  dashboard:  renderDashboard,
  clientes:   () => renderClientes(document.getElementById('filterClientes').value),
  membresias: () => renderMembresias(document.getElementById('filterMembresias').value),
  asistencia: () => renderAsistencia(document.getElementById('filterFecha').value),
  rutinas:    () => renderRutinas(document.getElementById('filterRutinas').value),
};

// ─────────────────── FECHA EN TOPBAR ───────────────────
function updateDate() {
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('topbarDate').textContent =
    new Date().toLocaleDateString('es-PE', opts).toUpperCase();
}

// ─────────────────── SESIÓN ───────────────────
function renderUsuario() {
  const s = TG_AUTH.session();
  if (!s) return;
  document.getElementById('userName').textContent   = s.nombre;
  document.getElementById('userRole').textContent   = s.rol;
  document.getElementById('userAvatar').textContent = inicialDe(s.nombre);
}

// ─────────────────── EVENT LISTENERS ───────────────────
const ACCIONES = {
  'edit-cliente':     editCliente,
  'delete-cliente':   deleteCliente,
  'edit-membresia':   editMembresia,
  'delete-membresia': deleteMembresia,
  'edit-rutina':      editRutina,
  'delete-rutina':    deleteRutina,
};

function initEvents() {
  // Botones de acción en tablas y tarjetas (delegación)
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (btn) ACCIONES[btn.dataset.action]?.(Number(btn.dataset.id));
  });

  // Navegación
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(nav.dataset.section);
      setSidebar(false);
    });
  });
  window.addEventListener('hashchange', () => navigateTo(location.hash.slice(1)));

  // Menú móvil
  document.getElementById('menuToggle').addEventListener('click', () =>
    setSidebar(!document.getElementById('sidebar').classList.contains('open')));
  document.getElementById('sidebarBackdrop').addEventListener('click', () => setSidebar(false));

  // Cerrar sesión
  document.getElementById('btnLogout').addEventListener('click', () => {
    TG_AUTH.logout();
    location.href = 'index.html';
  });

  // Modales: botones, clic fuera y tecla Escape
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const abierto = document.querySelector('.modal-overlay.open');
    if (abierto) closeModal(abierto.id);
    else setSidebar(false);
  });

  // Búsqueda global
  document.getElementById('globalSearch').addEventListener('input', function () {
    const val = this.value.trim();
    document.getElementById('filterClientes').value = val;
    if (val) navigateTo('clientes');
    else if (document.getElementById('section-clientes').classList.contains('active')) renderClientes();
  });

  // ── Clientes ──
  document.getElementById('btnNuevoCliente').addEventListener('click', () => {
    editingClienteId = null;
    document.getElementById('modalClienteTitle').textContent = 'Nuevo cliente';
    document.getElementById('modalCliente').querySelectorAll('input, textarea').forEach(el => {
      el.value = '';
      el.removeAttribute('aria-invalid');
    });
    document.getElementById('cGenero').value = '';
    document.getElementById('cActivo').value = '1';
    openModal('modalCliente');
  });
  document.getElementById('btnGuardarCliente').addEventListener('click', saveCliente);
  document.getElementById('filterClientes').addEventListener('input', e => renderClientes(e.target.value));
  document.getElementById('cDNI').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });

  // ── Membresías ──
  document.getElementById('btnNuevaMembresia').addEventListener('click', () => {
    editingMembresiaId = null;
    populateClienteSelects();
    document.getElementById('modalMembresiaTitle').textContent = 'Nueva membresía';
    document.getElementById('mPlan').selectedIndex = 0;
    document.getElementById('mMonto').value = document.getElementById('mPlan').value.split('|')[1];
    document.getElementById('mPago').selectedIndex = 0;
    sugerirInicio();
    openModal('modalMembresia');
  });
  document.getElementById('btnGuardarMembresia').addEventListener('click', saveMembresia);
  document.getElementById('filterMembresias').addEventListener('input', e => renderMembresias(e.target.value));
  document.getElementById('mCliente').addEventListener('change', sugerirInicio);
  document.getElementById('mPlan').addEventListener('change', function () {
    const precio = this.value.split('|')[1];
    if (precio) document.getElementById('mMonto').value = precio;
  });

  // ── Asistencia ──
  document.getElementById('btnCheckin').addEventListener('click', checkin);
  document.getElementById('checkinDNI').addEventListener('keydown', e => { if (e.key === 'Enter') checkin(); });
  document.getElementById('checkinDNI').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
  document.getElementById('filterFecha').addEventListener('change', e => renderAsistencia(e.target.value));
  document.getElementById('btnLimpiarFecha').addEventListener('click', () => {
    document.getElementById('filterFecha').value = '';
    renderAsistencia();
  });
  document.getElementById('btnExportAsistencia').addEventListener('click', exportAsistencia);

  // ── Rutinas ──
  document.getElementById('btnNuevaRutina').addEventListener('click', () => {
    editingRutinaId = null;
    populateClienteSelects();
    document.getElementById('modalRutinaTitle').textContent = 'Nueva rutina';
    document.getElementById('modalRutina').querySelectorAll('input, textarea').forEach(el => {
      el.value = '';
      el.removeAttribute('aria-invalid');
    });
    document.getElementById('rCliente').value = '';
    document.getElementById('rNivel').selectedIndex = 0;
    document.getElementById('rDias').value = '3';
    openModal('modalRutina');
  });
  document.getElementById('btnGuardarRutina').addEventListener('click', saveRutina);
  document.getElementById('filterRutinas').addEventListener('input', e => renderRutinas(e.target.value));
}

// ─────────────────── INIT ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  renderUsuario();
  populateClienteSelects();
  updateDate();
  setInterval(updateDate, 60000);
  initEvents();
  navigateTo(location.hash.slice(1) || 'dashboard');
});
