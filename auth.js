/* =============================================
   TEMPLO GYM — AUTH.JS
   Sesión del personal (solo en el navegador).
   IMPORTANTE: esto evita accesos casuales, pero NO es
   seguridad real. Cuando haya backend, el login debe
   validarse en el servidor.
   ============================================= */

'use strict';

const TG_AUTH = (() => {
  const KEY = 'tg_session';
  const DURACION_MS = 12 * 60 * 60 * 1000; // 12 horas

  // Contraseñas guardadas como SHA-256 (no en texto plano).
  // Para cambiar una: abre la consola del navegador en index.html,
  // ejecuta  await TG_AUTH.hash('nuevaClave')  y pega el resultado aquí.
  const USERS = {
    admin:  { nombre: 'Administrador', rol: 'Administrador', hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' },
    templo: { nombre: 'Recepción',     rol: 'Staff',         hash: 'b617525f8d6ee7b752fc19f0f40c6f2440d21f713813079fe1bb750d4a447ff1' },
  };

  async function hash(texto) {
    if (!window.crypto?.subtle) {
      throw new Error('Tu navegador no permite el cifrado en esta página. Ábrela con https o localhost.');
    }
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function login(usuario, clave) {
    const u = USERS[usuario];
    if (!u) return false;
    if ((await hash(clave)) !== u.hash) return false;
    const sesion = { usuario, nombre: u.nombre, rol: u.rol, expira: Date.now() + DURACION_MS };
    try { sessionStorage.setItem(KEY, JSON.stringify(sesion)); } catch { return false; }
    return true;
  }

  function session() {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY));
      if (!s || s.expira < Date.now()) return null;
      return s;
    } catch { return null; }
  }

  function logout() {
    try { sessionStorage.removeItem(KEY); } catch { /* sin acceso a storage */ }
  }

  // Úsalo al inicio de páginas privadas
  function requireSession() {
    if (!session()) location.replace('index.html#acceso');
  }

  return { hash, login, session, logout, requireSession };
})();
