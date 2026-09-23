/* =============================================
   TEMPLO GYM — LANDING.JS
   ============================================= */

'use strict';

// Número de WhatsApp del gimnasio (código de país + número, sin + ni espacios)
const WHATSAPP = '51987654321';

// ─── ENLACES DE WHATSAPP CON MENSAJE ───
document.querySelectorAll('[data-wa]').forEach(a => {
  a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.wa)}`;
});

// ─── AÑO Y AÑOS DE EXPERIENCIA ───
const anioActual = new Date().getFullYear();
document.getElementById('year').textContent = anioActual;
document.querySelectorAll('[data-years-since]').forEach(el => {
  el.textContent = anioActual - Number(el.dataset.yearsSince);
});

// ─── MENÚ MÓVIL ───
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  navToggle.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ─── NAV ACTIVA SEGÚN SECCIÓN VISIBLE ───
const navAnchors = [...navLinks.querySelectorAll('a:not(.btn)')];
const seccionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => {
      if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });

['nosotros', 'clases', 'planes', 'contacto', 'acceso'].forEach(id => {
  const el = document.getElementById(id);
  if (el) seccionObserver.observe(el);
});

// ─── ANIMACIÓN DE ENTRADA ───
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 50}ms`;
  fadeObserver.observe(el);
});

// ─── LOGIN ───
const loginForm = document.getElementById('loginForm');
const userEl    = document.getElementById('loginUser');
const passEl    = document.getElementById('loginPass');
const errEl     = document.getElementById('loginError');
const errText   = document.getElementById('loginErrorText');
const btnLogin  = document.getElementById('btnLogin');
const btnLoginHTML = btnLogin.innerHTML;

// Si ya hay sesión abierta, ofrece ir directo al panel
if (TG_AUTH.session()) {
  btnLogin.innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i> Ir al panel (sesión activa)';
  btnLogin.dataset.goPanel = '1';
}

function mostrarError(msg) {
  errText.textContent = msg;
  errEl.classList.add('show');
  const card = document.getElementById('loginCard');
  card.classList.remove('shake');
  void card.offsetWidth; // reinicia la animación
  card.classList.add('shake');
}

document.getElementById('togglePass').addEventListener('click', function () {
  const visible = passEl.type === 'text';
  passEl.type = visible ? 'password' : 'text';
  this.setAttribute('aria-pressed', String(!visible));
  this.setAttribute('aria-label', visible ? 'Mostrar contraseña' : 'Ocultar contraseña');
  this.querySelector('i').className = visible ? 'fas fa-eye' : 'fas fa-eye-slash';
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  if (btnLogin.dataset.goPanel && !userEl.value && !passEl.value) {
    location.href = 'admin.html';
    return;
  }

  const user = userEl.value.trim().toLowerCase();
  const pass = passEl.value;

  userEl.setAttribute('aria-invalid', String(!user));
  passEl.setAttribute('aria-invalid', String(!pass));
  if (!user || !pass) return mostrarError('Ingresa tu usuario y contraseña.');

  errEl.classList.remove('show');
  btnLogin.disabled = true;
  btnLogin.innerHTML = '<span class="spinner" aria-hidden="true"></span> Verificando...';

  try {
    if (await TG_AUTH.login(user, pass)) {
      btnLogin.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Bienvenido';
      location.href = 'admin.html';
      return;
    }
    passEl.value = '';
    passEl.setAttribute('aria-invalid', 'true');
    mostrarError('Usuario o contraseña incorrectos.');
    passEl.focus();
  } catch (err) {
    mostrarError(err.message);
  }

  btnLogin.disabled = false;
  btnLogin.innerHTML = btnLoginHTML;
  delete btnLogin.dataset.goPanel;
});
