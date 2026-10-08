/*
 * CABECERA Y PIE COMUNES
 * Se escriben una sola vez aquí y cada página los usa con:
 *   <doon-header pagina="stand"></doon-header>
 *   <doon-footer></doon-footer>   (en las páginas legales: <doon-footer pagina="cookies">)
 * Las rutas se calculan desde la ubicación de este script, así que funcionan
 * igual abriendo los archivos en local que publicados en un servidor.
 */
(function () {
  'use strict';

  const { config } = window.DOON;
  const RAIZ = new URL('../', document.currentScript.src);
  const url = (ruta) => new URL(ruta, RAIZ).href;

  const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  const enlacesMenu = (actual, claseEnlace, paginas = config.paginas) =>
    paginas
      .map(({ id, texto, ruta }) => {
        const activo = id === actual ? ' aria-current="page"' : '';
        return `<li><a class="${claseEnlace}" href="${url(ruta)}"${activo}>${escapar(texto)}</a></li>`;
      })
      .join('');

  const marca = () => `
    <a class="marca" href="${url(config.paginas[0].ruta)}">
      <img class="marca__insignia" src="${url('img/llama-cara.png')}" alt="" width="48" height="48">
      <span class="marca__texto">
        <span class="marca__nombre">${escapar(config.marca)}</span>
        <span class="marca__lema">${escapar(config.lema)}</span>
      </span>
    </a>`;

  class DoonHeader extends HTMLElement {
    connectedCallback() {
      const actual = this.getAttribute('pagina');
      this.innerHTML = `
        <a class="saltar" href="#contenido">Saltar al contenido</a>
        <header class="cabecera">
          <div class="contenedor cabecera__barra">
            ${marca()}
            <button class="cabecera__menu" type="button" aria-expanded="false" aria-controls="menu-principal">
              <span class="cabecera__menu-icono" aria-hidden="true"></span>
              <span class="sr-only">Menú</span>
            </button>
            <nav id="menu-principal" class="navegacion" aria-label="Principal">
              <ul class="navegacion__lista">${enlacesMenu(actual, 'navegacion__enlace')}</ul>
              <a class="boton boton--primario navegacion__llamada" href="${url(config.llamada.ruta)}">${escapar(config.llamada.texto)}</a>
            </nav>
          </div>
        </header>`;
      this.activarMenuMovil();
    }

    activarMenuMovil() {
      const boton = this.querySelector('.cabecera__menu');
      const cabecera = this.querySelector('.cabecera');
      const cambiar = (abierto) => {
        boton.setAttribute('aria-expanded', String(abierto));
        cabecera.classList.toggle('cabecera--abierta', abierto);
      };
      boton.addEventListener('click', () => cambiar(boton.getAttribute('aria-expanded') !== 'true'));
      this.addEventListener('click', (evento) => {
        if (evento.target.closest('.navegacion a')) cambiar(false);
      });
      document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && cabecera.classList.contains('cabecera--abierta')) {
          cambiar(false);
          boton.focus();
        }
      });
    }
  }

  class DoonFooter extends HTMLElement {
    connectedCallback() {
      const email = escapar(config.email);
      const actual = this.getAttribute('pagina');
      const { instagram } = config.enlaces;
      const usuarioInstagram = instagram ? new URL(instagram).pathname.split('/').filter(Boolean)[0] : '';
      this.innerHTML = `
        <footer class="pie">
          <div class="contenedor pie__rejilla">
            <div class="pie__marca">
              <img class="pie__insignia" src="${url('img/icono-180.png')}" alt="" width="88" height="88">
              <p class="pie__nombre">${escapar(config.marca)}</p>
              <p class="pie__lema">Cool athletes drink coffee</p>
              <p class="pie__descripcion">Stand de café de especialidad para eventos deportivos.</p>
            </div>
            <nav aria-label="Pie de página">
              <h2 class="pie__titulo">Páginas</h2>
              <ul class="pie__lista">${enlacesMenu(null, 'pie__enlace')}</ul>
            </nav>
            <div>
              <h2 class="pie__titulo">Contacto</h2>
              <ul class="pie__lista">
                <li><a class="pie__enlace" href="mailto:${email}">${email}</a></li>
                ${instagram ? `<li><a class="pie__enlace" href="${escapar(instagram)}">Instagram · @${escapar(usuarioInstagram)}</a></li>` : ''}
                <li><a class="pie__enlace" href="${url(config.llamada.ruta)}">Solicitar reserva o información</a></li>
                <li>Stand itinerante · España</li>
              </ul>
            </div>
            <nav aria-label="Información legal">
              <h2 class="pie__titulo">Legal</h2>
              <ul class="pie__lista">${enlacesMenu(actual, 'pie__enlace', config.legales)}</ul>
            </nav>
          </div>
          <div class="contenedor pie__legal">
            <p>© ${new Date().getFullYear()} ${escapar(config.marca)} Specialty Coffee</p>
            <p>Café molido al momento · Vasos compostables</p>
          </div>
        </footer>`;
    }
  }

  customElements.define('doon-header', DoonHeader);
  customElements.define('doon-footer', DoonFooter);

  // Los enlaces apuntan a carpetas (doon.es/carta/). Al abrir los archivos con doble clic
  // el navegador no carga el index.html de una carpeta por sí solo, así que se añade aquí.
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach((enlace) => {
      const destino = new URL(enlace.href);
      if (destino.protocol === 'file:' && destino.pathname.endsWith('/')) {
        destino.pathname += 'index.html';
        enlace.href = destino.href;
      }
    });
  }
})();
