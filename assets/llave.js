// Contraseña del sitio COM: se pide una sola vez y queda guardada en este navegador.
//
// Los datos privados (teléfonos, descripciones completas) están cifrados en el repo con AES-GCM.
// La llave sale de la contraseña con PBKDF2-SHA256; la sal, las vueltas y una prueba para saber
// si la contraseña es correcta están en bases/llave.json (que NO contiene la contraseña).
// Se guarda la llave ya derivada, no la contraseña. Si la contraseña cambia, la prueba deja de
// coincidir y se vuelve a pedir.
//
// Uso:  const llave = await COMLlave.obtener('bases/llave.json');   // pide la contraseña si hace falta
//       const datos = await COMLlave.abrir(llave, 'bases/bolsones-privado.json');
const COMLlave = (() => {
  const GUARDADA = 'com.llave';
  const desde64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const a64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));

  async function descifrar(llave, { iv, ct }) {
    const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: desde64(iv) }, llave, desde64(ct));
    return new TextDecoder().decode(plano);
  }

  async function sirve(llave, info) {
    try { return (await descifrar(llave, info.prueba)) === 'COM'; } catch { return false; }
  }

  async function derivar(clave, info) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: desde64(info.sal), iterations: info.vueltas },
      base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }

  async function guardada(info) {
    let cruda = null;
    try { cruda = localStorage.getItem(GUARDADA); } catch { }
    if (!cruda) return null;
    try {
      const llave = await crypto.subtle.importKey('raw', desde64(cruda), 'AES-GCM', true, ['decrypt']);
      return (await sirve(llave, info)) ? llave : null;
    } catch { return null; }
  }

  // Pantalla de contraseña: tapa toda la página hasta que se pone la correcta
  function pedir(info) {
    return new Promise(resolve => {
      const css = document.createElement('style');
      css.textContent = `
        .llave-fondo{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;
          background:radial-gradient(circle at 15% 8%,#EDEEF9 0%,transparent 45%),radial-gradient(circle at 88% 92%,#E7F3EE 0%,transparent 45%),#F7F6F3;
          font-family:'DM Sans',system-ui,sans-serif;color:#1A1714}
        .llave-caja{width:min(360px,100%);background:#fff;border:1px solid #E2DED6;border-radius:18px;padding:1.8rem 1.6rem 1.6rem;
          box-shadow:0 12px 32px rgba(26,23,20,.10),0 2px 6px rgba(26,23,20,.06);text-align:center}
        .llave-ico{width:52px;height:52px;margin:0 auto .9rem;border-radius:14px;display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,#0f172a 0%,#16213e 55%,#1b3f74 100%)}
        .llave-ico svg{width:24px;height:24px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
        .llave-t{font-size:18px;font-weight:700;letter-spacing:-.3px}
        .llave-s{font-size:13px;color:#6B6560;margin:.3rem 0 1.2rem}
        .llave-in{width:100%;font:inherit;font-size:15px;padding:.75rem .9rem;border:1px solid #E2DED6;border-radius:11px;outline:none;text-align:center}
        .llave-in:focus{border-color:#1b3f74;box-shadow:0 0 0 3px rgba(27,63,116,.12)}
        .llave-b{width:100%;margin-top:.7rem;font:inherit;font-size:14px;font-weight:700;color:#fff;border:0;border-radius:11px;padding:.75rem;cursor:pointer;
          background:linear-gradient(135deg,#0f172a 0%,#16213e 55%,#1b3f74 100%)}
        .llave-b:disabled{opacity:.6;cursor:default}
        .llave-e{min-height:1.2em;margin-top:.7rem;font-size:12.5px;font-weight:600;color:#B02020}`;
      const fondo = document.createElement('div');
      fondo.className = 'llave-fondo';
      fondo.innerHTML = `<form class="llave-caja">
          <div class="llave-ico"><svg viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
          <div class="llave-t">Centro Operativo de Montevideo</div>
          <div class="llave-s">Ingresá la contraseña para continuar</div>
          <input class="llave-in" type="password" autocomplete="current-password" placeholder="Contraseña" autofocus>
          <button class="llave-b" type="submit">Entrar</button>
          <div class="llave-e"></div>
        </form>`;
      document.head.appendChild(css);
      document.body.appendChild(fondo);
      const form = fondo.querySelector('form'), inp = fondo.querySelector('input'), btn = fondo.querySelector('button'), err = fondo.querySelector('.llave-e');
      inp.focus();
      form.onsubmit = async e => {
        e.preventDefault();
        if (!inp.value) return;
        btn.disabled = true; btn.textContent = 'Verificando…'; err.textContent = '';
        const llave = await derivar(inp.value, info);
        if (await sirve(llave, info)) {
          try { localStorage.setItem(GUARDADA, a64(await crypto.subtle.exportKey('raw', llave))); } catch { }
          fondo.remove(); css.remove();
          resolve(llave);
        } else {
          err.textContent = 'Contraseña incorrecta';
          btn.disabled = false; btn.textContent = 'Entrar';
          inp.select();
        }
      };
    });
  }

  async function obtener(rutaLlave) {
    const res = await fetch(rutaLlave + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo leer la llave (HTTP ' + res.status + ')');
    const info = await res.json();
    return (await guardada(info)) || pedir(info);
  }

  async function abrir(llave, ruta) {
    const res = await fetch(ruta + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return JSON.parse(await descifrar(llave, await res.json()));
  }

  return { obtener, abrir };
})();
