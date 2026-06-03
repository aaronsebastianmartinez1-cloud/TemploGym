/* =============================================
   TEMPLO GYM — APP.JS
   Sistema de Gestión Completo
   ============================================= */

'use strict';

// ─────────────────── STORE (localStorage) ───────────────────
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(`tg_${key}`) || '[]'),
  set: (key, val) => localStorage.setItem(`tg_${key}`, JSON.stringify(val)),
  nextId: (key) => {
    const arr = DB.get(key);
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
  }
};

// ─────────────────── SEED DATA (primera vez) ───────────────────
function seedData() {
  if (DB.get('seeded').length) return;

  const clientes = [
    { id:1, nombre:'Carlos Mendoza',  dni:'70123456', telefono:'987001001', email:'carlos@mail.com', genero:'M', fechaNac:'1990-03-15', observaciones:'Sin restricciones', activo:true },
    { id:2, nombre:'Lucía Ríos',      dni:'70234567', telefono:'987002002', email:'lucia@mail.com',  genero:'F', fechaNac:'1995-07-22', observaciones:'Evitar sentadilla profunda', activo:true },
    { id:3, nombre:'Miguel Torres',   dni:'70345678', telefono:'987003003', email:'miguel@mail.com', genero:'M', fechaNac:'1988-11-08', observaciones:'', activo:true },
    { id:4, nombre:'Sofía Vargas',    dni:'70456789', telefono:'987004004', email:'sofia@mail.com',  genero:'F', fechaNac:'1998-01-30', observaciones:'Embarazada, rutina suave', activo:false },
    { id:5, nombre:'Rodrigo Puma',    dni:'70567890', telefono:'987005005', email:'rodrigo@mail.com',genero:'M', fechaNac:'1993-06-17', observaciones:'', activo:true },
  ];

  const hoy = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  const addDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };

  const membresias = [
    { id:1, clienteId:1, plan:'Mensual',    monto:80,  fechaInicio: fmt(addDias(hoy,-20)), fechaFin: fmt(addDias(hoy,10)),  pago:'Efectivo' },
    { id:2, clienteId:2, plan:'Trimestral', monto:210, fechaInicio: fmt(addDias(hoy,-60)), fechaFin: fmt(addDias(hoy,30)),  pago:'Yape' },
    { id:3, clienteId:3, plan:'Mensual',    monto:80,  fechaInicio: fmt(addDias(hoy,-28)), fechaFin: fmt(addDias(hoy,2)),   pago:'Efectivo' },
    { id:4, clienteId:5, plan:'Anual',      monto:720, fechaInicio: fmt(addDias(hoy,-100)),fechaFin: fmt(addDias(hoy,265)), pago:'Transferencia' },
  ];

  const asistencia = [
    { id:1, clienteId:1, fecha: fmt(hoy), hora:'07:30' },
    { id:2, clienteId:2, fecha: fmt(hoy), hora:'08:15' },
    { id:3, clienteId:5, fecha: fmt(hoy), hora:'09:00' },
    { id:4, clienteId:3, fecha: fmt(addDias(hoy,-1)), hora:'18:45' },
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

  DB.set('clientes',  clientes);
  DB.set('membresias', membresias);
  DB.set('asistencia', asistencia);
  DB.set('rutinas',   rutinas);
  DB.set('seeded', [1]);
}

// ─────────────────── HELPERS ───────────────────
function fmtFecha(str) {
  if (!str) return '—';
  const [y,m,d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function hoy() { return new Date().toISOString().split('T')[0]; }

function inicialDe(nombre) {
  return nombre ? nombre.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : '?';
}

function getCliente(id) {
  return DB.get('clientes').find(c => c.id === Number(id)) || null;
}

function membresiaActiva(clienteId) {
  const hoyStr = hoy();
  return DB.get('membresias').find(m =>
    m.clienteId === Number(clienteId) &&
    m.fechaFin >= hoyStr
  ) || null;
}

function showToast(msg, tipo = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${tipo}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.classList.remove('show'); }, 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function emptyState(icon, msg) {
  return `<div class="empty-state"><i class="${icon}"></i><p>${msg}</p></div>`;
}

// ─────────────────── NAVEGACIÓN ───────────────────
const titles = {
  dashboard:  'Dashboard',
  clientes:   'Clientes',
  membresias: 'Membresías',
  asistencia: 'Asistencia',
  rutinas:    'Rutinas'
};

let currentSection = 'dashboard';

function navigateTo(sec) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`section-${sec}`);
  if (el) el.classList.add('active');

  const nav = document.querySelector(`[data-section="${sec}"]`);
  if (nav) nav.classList.add('active');

  document.getElementById('pageTitle').textContent = titles[sec] || sec;
  currentSection = sec;

  // Re-render la sección activa
  renderers[sec]?.();
}

// ─────────────────── DASHBOARD ───────────────────
function renderDashboard() {
  const clientes   = DB.get('clientes');
  const membresias = DB.get('membresias');
  const asistencia = DB.get('asistencia');

  const hoyStr = hoy();
  const activos   = clientes.filter(c => c.activo).length;
  const vigentes  = membresias.filter(m => m.fechaFin >= hoyStr).length;
  const asistHoy  = asistencia.filter(a => a.fecha === hoyStr).length;
  const ingresos  = membresias.reduce((s,m) => s + (m.monto||0), 0);

  document.getElementById('statClientes').textContent   = activos;
  document.getElementById('statMembresias').textContent = vigentes;
  document.getElementById('statAsistencia').textContent = asistHoy;
  document.getElementById('statIngresos').textContent   = `S/ ${ingresos.toLocaleString()}`;

  // Últimas asistencias
  const ul = asistencia.slice(-5).reverse();
  const rl = document.getElementById('recentAsistencia');
  rl.innerHTML = ul.length ? ul.map(a => {
    const c = getCliente(a.clienteId);
    return `<div class="recent-item">
      <div class="ri-avatar">${inicialDe(c?.nombre||'?')}</div>
      <div class="ri-info">
        <div class="ri-name">${c?.nombre||'Desconocido'}</div>
        <div class="ri-sub">DNI: ${c?.dni||'—'}</div>
      </div>
      <div class="ri-extra">${fmtFecha(a.fecha)}<br/>${a.hora}</div>
    </div>`;
  }).join('') : emptyState('fas fa-door-open','Sin asistencias hoy');

  // Membresías por vencer (próximos 7 días)
  const enSiete = new Date(); enSiete.setDate(enSiete.getDate()+7);
  const enSieteStr = enSiete.toISOString().split('T')[0];
  const porVencer = membresias.filter(m => m.fechaFin >= hoyStr && m.fechaFin <= enSieteStr);
  const pv = document.getElementById('proximasVencer');
  pv.innerHTML = porVencer.length ? porVencer.map(m => {
    const c = getCliente(m.clienteId);
    const diff = Math.ceil((new Date(m.fechaFin) - new Date(hoyStr)) / 86400000);
    return `<div class="recent-item">
      <div class="ri-avatar">${inicialDe(c?.nombre||'?')}</div>
      <div class="ri-info">
        <div class="ri-name">${c?.nombre||'—'}</div>
        <div class="ri-sub">${m.plan}</div>
      </div>
      <div class="ri-extra" style="color:var(--warn)">Vence en<br/>${diff} día${diff!==1?'s':''}</div>
    </div>`;
  }).join('') : emptyState('fas fa-id-card','Ninguna vence esta semana');

  // Clientes recientes
  const rc = clientes.slice(-5).reverse();
  document.getElementById('recentClientes').innerHTML = rc.length ? rc.map(c => `
    <div class="recent-item">
      <div class="ri-avatar">${inicialDe(c.nombre)}</div>
      <div class="ri-info">
        <div class="ri-name">${c.nombre}</div>
        <div class="ri-sub">${c.email||c.telefono||'—'}</div>
      </div>
      <div class="ri-extra">${c.activo ? '<span class="pill pill-green">Activo</span>' : '<span class="pill pill-muted">Inactivo</span>'}</div>
    </div>
  `).join('') : emptyState('fas fa-users','Sin clientes aún');
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
      (c.email||'').toLowerCase().includes(f)
    );
  }

  const tbody = document.getElementById('bodyClientes');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7">${emptyState('fas fa-users','Sin clientes registrados')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((c, i) => `
    <tr>
      <td style="color:var(--text-muted)">${i+1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="ri-avatar" style="width:32px;height:32px;font-size:12px">${inicialDe(c.nombre)}</div>
          <strong>${c.nombre}</strong>
        </div>
      </td>
      <td style="font-family:'Barlow Condensed';letter-spacing:1px">${c.dni}</td>
      <td>${c.telefono||'—'}</td>
      <td>${c.email||'—'}</td>
      <td>${c.activo
        ? '<span class="pill pill-green"><i class="fas fa-circle" style="font-size:6px"></i> Activo</span>'
        : '<span class="pill pill-muted"><i class="fas fa-circle" style="font-size:6px"></i> Inactivo</span>'
      }</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-sm btn-secondary" onclick="editCliente(${c.id})"><i class="fas fa-pen"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deleteCliente(${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.editCliente = function(id) {
  const c = getCliente(id);
  if (!c) return;
  editingClienteId = id;
  document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
  document.getElementById('cNombre').value       = c.nombre;
  document.getElementById('cDNI').value          = c.dni;
  document.getElementById('cTelefono').value     = c.telefono||'';
  document.getElementById('cEmail').value        = c.email||'';
  document.getElementById('cFechaNac').value     = c.fechaNac||'';
  document.getElementById('cGenero').value       = c.genero||'';
  document.getElementById('cObservaciones').value= c.observaciones||'';
  openModal('modalCliente');
};

window.deleteCliente = function(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  let data = DB.get('clientes').filter(c => c.id !== id);
  DB.set('clientes', data);
  renderClientes();
  renderDashboard();
  showToast('Cliente eliminado', 'warn');
};

function saveCliente() {
  const nombre = document.getElementById('cNombre').value.trim();
  const dni    = document.getElementById('cDNI').value.trim();
  if (!nombre || !dni) return showToast('Nombre y DNI son requeridos', 'error');
  if (dni.length !== 8) return showToast('DNI debe tener 8 dígitos', 'error');

  const data = DB.get('clientes');

  if (editingClienteId) {
    const idx = data.findIndex(c => c.id === editingClienteId);
    if (idx > -1) {
      data[idx] = { ...data[idx],
        nombre, dni,
        telefono: document.getElementById('cTelefono').value.trim(),
        email:    document.getElementById('cEmail').value.trim(),
        fechaNac: document.getElementById('cFechaNac').value,
        genero:   document.getElementById('cGenero').value,
        observaciones: document.getElementById('cObservaciones').value.trim(),
      };
    }
    showToast('Cliente actualizado ✓');
  } else {
    // Verificar DNI único
    if (data.find(c => c.dni === dni)) return showToast('Ya existe un cliente con ese DNI', 'error');
    data.push({
      id: DB.nextId('clientes'),
      nombre, dni,
      telefono: document.getElementById('cTelefono').value.trim(),
      email:    document.getElementById('cEmail').value.trim(),
      fechaNac: document.getElementById('cFechaNac').value,
      genero:   document.getElementById('cGenero').value,
      observaciones: document.getElementById('cObservaciones').value.trim(),
      activo: true
    });
    showToast('Cliente registrado ✓');
  }

  DB.set('clientes', data);
  closeModal('modalCliente');
  renderClientes();
  renderDashboard();
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
      return (c?.nombre||'').toLowerCase().includes(f) || m.plan.toLowerCase().includes(f);
    });
  }

  const tbody = document.getElementById('bodyMembresias');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8">${emptyState('fas fa-id-card','Sin membresías registradas')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((m, i) => {
    const c = getCliente(m.clienteId);
    const vigente = m.fechaFin >= hoyStr;
    const enSiete = new Date(hoyStr); enSiete.setDate(enSiete.getDate()+7);
    const proxVencer = m.fechaFin <= enSiete.toISOString().split('T')[0] && vigente;

    let estadoPill = vigente
      ? (proxVencer
          ? '<span class="pill pill-warn">⚠ Por vencer</span>'
          : '<span class="pill pill-green">Vigente</span>')
      : '<span class="pill pill-red">Vencida</span>';

    return `
      <tr>
        <td style="color:var(--text-muted)">${i+1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="ri-avatar" style="width:30px;height:30px;font-size:11px">${inicialDe(c?.nombre||'?')}</div>
            ${c?.nombre||'<em style="color:var(--muted)">Sin cliente</em>'}
          </div>
        </td>
        <td><span class="pill pill-muted">${m.plan}</span></td>
        <td>${fmtFecha(m.fechaInicio)}</td>
        <td style="color:${vigente?'var(--text)':'var(--red)'}">${fmtFecha(m.fechaFin)}</td>
        <td style="color:var(--gold);font-weight:600">S/ ${m.monto}</td>
        <td>${estadoPill}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-sm btn-secondary" onclick="editMembresia(${m.id})"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteMembresia(${m.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.editMembresia = function(id) {
  const data = DB.get('membresias');
  const m = data.find(x => x.id === id);
  if (!m) return;
  editingMembresiaId = id;
  document.getElementById('modalMembresiaTitle').textContent = 'Editar Membresía';
  document.getElementById('mCliente').value     = m.clienteId;
  document.getElementById('mFechaInicio').value = m.fechaInicio;
  document.getElementById('mMonto').value       = m.monto;
  document.getElementById('mPago').value        = m.pago;

  // Seleccionar plan
  const planSel = document.getElementById('mPlan');
  for (let opt of planSel.options) {
    if (opt.value.startsWith(m.plan)) { planSel.value = opt.value; break; }
  }

  openModal('modalMembresia');
};

window.deleteMembresia = function(id) {
  if (!confirm('¿Eliminar esta membresía?')) return;
  DB.set('membresias', DB.get('membresias').filter(m => m.id !== id));
  renderMembresias();
  renderDashboard();
  showToast('Membresía eliminada', 'warn');
};

function saveMembresia() {
  const clienteId  = Number(document.getElementById('mCliente').value);
  const planVal    = document.getElementById('mPlan').value;
  const fechaInicio= document.getElementById('mFechaInicio').value;
  const monto      = parseFloat(document.getElementById('mMonto').value);

  if (!clienteId || !planVal || !fechaInicio) return showToast('Completa los campos requeridos', 'error');

  const [plan, precioBase, dias] = planVal.split('|');
  const inicio = new Date(fechaInicio);
  inicio.setDate(inicio.getDate() + Number(dias));
  const fechaFin = inicio.toISOString().split('T')[0];

  const data = DB.get('membresias');

  if (editingMembresiaId) {
    const idx = data.findIndex(m => m.id === editingMembresiaId);
    if (idx > -1) {
      data[idx] = { ...data[idx], clienteId, plan, fechaInicio, fechaFin,
        monto: isNaN(monto) ? Number(precioBase) : monto,
        pago: document.getElementById('mPago').value
      };
    }
    showToast('Membresía actualizada ✓');
  } else {
    data.push({
      id: DB.nextId('membresias'),
      clienteId, plan, fechaInicio, fechaFin,
      monto: isNaN(monto) ? Number(precioBase) : monto,
      pago: document.getElementById('mPago').value
    });
    showToast('Membresía registrada ✓');
  }

  DB.set('membresias', data);
  closeModal('modalMembresia');
  renderMembresias();
  renderDashboard();
}

// ─────────────────── ASISTENCIA ───────────────────
function renderAsistencia(filter = '') {
  let data = DB.get('asistencia');
  if (filter) data = data.filter(a => a.fecha === filter);
  data = [...data].reverse();

  const tbody = document.getElementById('bodyAsistencia');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6">${emptyState('fas fa-door-open','Sin registros de asistencia')}</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((a, i) => {
    const c = getCliente(a.clienteId);
    const mem = membresiaActiva(a.clienteId);
    return `
      <tr>
        <td style="color:var(--text-muted)">${i+1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="ri-avatar" style="width:30px;height:30px;font-size:11px">${inicialDe(c?.nombre||'?')}</div>
            ${c?.nombre||'Desconocido'}
          </div>
        </td>
        <td style="font-family:'Barlow Condensed';letter-spacing:1px">${c?.dni||'—'}</td>
        <td>${fmtFecha(a.fecha)}</td>
        <td style="font-size:1rem;font-family:'Barlow Condensed';letter-spacing:1px">${a.hora}</td>
        <td>${mem
          ? '<span class="pill pill-green">Membresía Vigente</span>'
          : '<span class="pill pill-red">Sin Membresía</span>'
        }</td>
      </tr>
    `;
  }).join('');
}

function checkin() {
  const dni = document.getElementById('checkinDNI').value.trim();
  const fb  = document.getElementById('checkinFeedback');

  if (!dni || dni.length !== 8) {
    fb.innerHTML = '<span class="feedback-err"><i class="fas fa-exclamation-circle"></i> Ingresa un DNI válido (8 dígitos)</span>';
    return;
  }

  const cliente = DB.get('clientes').find(c => c.dni === dni);
  if (!cliente) {
    fb.innerHTML = `<span class="feedback-err"><i class="fas fa-times-circle"></i> No se encontró cliente con DNI ${dni}</span>`;
    return;
  }

  if (!cliente.activo) {
    fb.innerHTML = `<span class="feedback-warn"><i class="fas fa-exclamation-triangle"></i> ${cliente.nombre} está inactivo</span>`;
    return;
  }

  const mem = membresiaActiva(cliente.id);
  const now  = new Date();
  const hora = now.toTimeString().slice(0,5);
  const fecha= hoy();

  // Evitar doble check-in el mismo día
  const yaRegistrado = DB.get('asistencia').find(a => a.clienteId === cliente.id && a.fecha === fecha);
  if (yaRegistrado) {
    fb.innerHTML = `<span class="feedback-warn"><i class="fas fa-info-circle"></i> ${cliente.nombre} ya registró entrada hoy a las ${yaRegistrado.hora}</span>`;
    return;
  }

  const asistencia = DB.get('asistencia');
  asistencia.push({ id: DB.nextId('asistencia'), clienteId: cliente.id, fecha, hora });
  DB.set('asistencia', asistencia);

  const memMsg = mem
    ? `Membresía ${mem.plan} vigente hasta ${fmtFecha(mem.fechaFin)}`
    : '⚠ Sin membresía activa';

  fb.innerHTML = `<span class="feedback-ok">
    <i class="fas fa-check-circle"></i> ¡Bienvenido, <strong>${cliente.nombre}</strong>! (${hora})<br/>
    <small style="color:var(--text-muted)">${memMsg}</small>
  </span>`;

  document.getElementById('checkinDNI').value = '';
  renderAsistencia(document.getElementById('filterFecha').value);
  renderDashboard();
  showToast(`Check-in: ${cliente.nombre}`);
}

function exportAsistencia() {
  const data = DB.get('asistencia');
  let csv = 'N°,Cliente,DNI,Fecha,Hora,Estado Membresía\n';
  data.forEach((a, i) => {
    const c = getCliente(a.clienteId);
    const mem = membresiaActiva(a.clienteId);
    csv += `${i+1},"${c?.nombre||'?'}","${c?.dni||'?'}",${fmtFecha(a.fecha)},${a.hora},"${mem?'Vigente':'Sin Membresía'}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `asistencia_templogym_${hoy()}.csv`;
  a.click();
  showToast('Exportado como CSV ✓');
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
      (r.objetivo||'').toLowerCase().includes(f)
    );
  }

  const grid = document.getElementById('rutinasGrid');
  if (!data.length) {
    grid.innerHTML = emptyState('fas fa-dumbbell','Sin rutinas registradas');
    return;
  }

  grid.innerHTML = data.map(r => {
    const c = r.clienteId ? getCliente(r.clienteId) : null;
    const ejercicios = (r.ejercicios||'').split('\n').filter(Boolean);
    const nivelColor = { Principiante:'pill-green', Intermedio:'pill-warn', Avanzado:'pill-red' }[r.nivel] || 'pill-muted';

    return `
      <div class="rutina-card">
        <div class="rutina-title">${r.nombre}</div>
        <div class="rutina-meta">
          <span class="pill ${nivelColor}">${r.nivel}</span>
          <span class="pill pill-muted"><i class="fas fa-calendar-day"></i> ${r.dias} días/sem</span>
          ${c ? `<span class="pill pill-muted"><i class="fas fa-user"></i> ${c.nombre.split(' ')[0]}</span>` : '<span class="pill pill-muted">Sin asignar</span>'}
        </div>
        ${r.objetivo ? `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px">${r.objetivo}</p>` : ''}
        <ul class="rutina-exercises">
          ${ejercicios.slice(0,5).map(e => {
            const [nombre, series] = e.split('|').map(x=>x.trim());
            return `<li>${nombre} ${series ? `<span>${series}</span>` : ''}`;
          }).join('')}
          ${ejercicios.length > 5 ? `<li style="color:var(--gold)">+${ejercicios.length-5} más...</li>` : ''}
        </ul>
        ${r.notas ? `<p style="font-size:0.75rem;color:var(--gold-dim);font-style:italic;margin-bottom:10px">"${r.notas}"</p>` : ''}
        <div class="rutina-footer">
          <span style="font-size:0.75rem;color:var(--text-muted)">${ejercicios.length} ejercicios</span>
          <div class="action-btns">
            <button class="btn btn-sm btn-secondary" onclick="editRutina(${r.id})"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteRutina(${r.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.editRutina = function(id) {
  const r = DB.get('rutinas').find(x => x.id === id);
  if (!r) return;
  editingRutinaId = id;
  document.getElementById('modalRutinaTitle').textContent = 'Editar Rutina';
  document.getElementById('rNombre').value    = r.nombre;
  document.getElementById('rCliente').value   = r.clienteId||'';
  document.getElementById('rNivel').value     = r.nivel;
  document.getElementById('rDias').value      = r.dias;
  document.getElementById('rObjetivo').value  = r.objetivo||'';
  document.getElementById('rEjercicios').value= r.ejercicios||'';
  document.getElementById('rNotas').value     = r.notas||'';
  openModal('modalRutina');
};

window.deleteRutina = function(id) {
  if (!confirm('¿Eliminar esta rutina?')) return;
  DB.set('rutinas', DB.get('rutinas').filter(r => r.id !== id));
  renderRutinas();
  showToast('Rutina eliminada', 'warn');
};

function saveRutina() {
  const nombre = document.getElementById('rNombre').value.trim();
  if (!nombre) return showToast('El nombre es requerido', 'error');

  const data = DB.get('rutinas');
  const rutina = {
    nombre,
    clienteId: Number(document.getElementById('rCliente').value)||0,
    nivel:     document.getElementById('rNivel').value,
    dias:      Number(document.getElementById('rDias').value)||3,
    objetivo:  document.getElementById('rObjetivo').value.trim(),
    ejercicios:document.getElementById('rEjercicios').value.trim(),
    notas:     document.getElementById('rNotas').value.trim(),
  };

  if (editingRutinaId) {
    const idx = data.findIndex(r => r.id === editingRutinaId);
    if (idx > -1) data[idx] = { ...data[idx], ...rutina };
    showToast('Rutina actualizada ✓');
  } else {
    data.push({ id: DB.nextId('rutinas'), ...rutina });
    showToast('Rutina guardada ✓');
  }

  DB.set('rutinas', data);
  closeModal('modalRutina');
  renderRutinas();
}

// ─────────────────── SELECTS DE CLIENTES ───────────────────
function populateClienteSelects() {
  const clientes = DB.get('clientes');
  const opts = clientes.map(c => `<option value="${c.id}">${c.nombre} — ${c.dni}</option>`).join('');
  document.getElementById('mCliente').innerHTML = opts || '<option value="">Sin clientes</option>';

  const rOpts = `<option value="">Sin asignar</option>` + clientes.map(c =>
    `<option value="${c.id}">${c.nombre}</option>`
  ).join('');
  document.getElementById('rCliente').innerHTML = rOpts;
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
  const now = new Date();
  const opts = { weekday:'long', day:'numeric', month:'long', year:'numeric' };
  document.getElementById('topbarDate').textContent =
    now.toLocaleDateString('es-PE', opts).toUpperCase();
}

// ─────────────────── BÚSQUEDA GLOBAL ───────────────────
document.getElementById('globalSearch').addEventListener('input', function() {
  const val = this.value.trim();
  if (!val) return;
  navigateTo('clientes');
  document.getElementById('filterClientes').value = val;
  renderClientes(val);
});

// ─────────────────── EVENT LISTENERS ───────────────────
function initEvents() {
  // Navegación sidebar
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(nav.dataset.section);
      // Cerrar sidebar en móvil
      document.getElementById('sidebar').classList.remove('open');
    });
  });

  // Menú móvil
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Cerrar modales
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  // ── Clientes ──
  document.getElementById('btnNuevoCliente').addEventListener('click', () => {
    editingClienteId = null;
    document.getElementById('modalClienteTitle').textContent = 'Nuevo Cliente';
    document.getElementById('modalCliente').querySelectorAll('input, select, textarea').forEach(el => el.value = '');
    openModal('modalCliente');
  });
  document.getElementById('btnGuardarCliente').addEventListener('click', saveCliente);
  document.getElementById('filterClientes').addEventListener('input', e => renderClientes(e.target.value));

  // ── Membresías ──
  document.getElementById('btnNuevaMembresia').addEventListener('click', () => {
    editingMembresiaId = null;
    document.getElementById('modalMembresiaTitle').textContent = 'Nueva Membresía';
    document.getElementById('mFechaInicio').value = hoy();
    document.getElementById('mMonto').value = '';
    populateClienteSelects();
    openModal('modalMembresia');
  });
  document.getElementById('btnGuardarMembresia').addEventListener('click', saveMembresia);
  document.getElementById('filterMembresias').addEventListener('input', e => renderMembresias(e.target.value));

  // Auto-rellenar monto al cambiar plan
  document.getElementById('mPlan').addEventListener('change', function() {
    const precio = this.value.split('|')[1];
    if (precio) document.getElementById('mMonto').value = precio;
  });

  // ── Asistencia ──
  document.getElementById('btnCheckin').addEventListener('click', checkin);
  document.getElementById('checkinDNI').addEventListener('keypress', e => { if (e.key==='Enter') checkin(); });
  document.getElementById('filterFecha').addEventListener('change', e => renderAsistencia(e.target.value));
  document.getElementById('btnExportAsistencia').addEventListener('click', exportAsistencia);

  // ── Rutinas ──
  document.getElementById('btnNuevaRutina').addEventListener('click', () => {
    editingRutinaId = null;
    document.getElementById('modalRutinaTitle').textContent = 'Nueva Rutina';
    document.getElementById('modalRutina').querySelectorAll('input, select, textarea').forEach(el => el.value = '');
    document.getElementById('rDias').value = '3';
    populateClienteSelects();
    openModal('modalRutina');
  });
  document.getElementById('btnGuardarRutina').addEventListener('click', saveRutina);
  document.getElementById('filterRutinas').addEventListener('input', e => renderRutinas(e.target.value));
}

// ─────────────────── INIT ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  populateClienteSelects();
  updateDate();
  setInterval(updateDate, 60000);
  initEvents();
  navigateTo('dashboard');
});