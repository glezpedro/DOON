/*
 * PÁGINA DE ENLACES DE LA TARJETA NFC (doon.es/nfc)
 * Los enlaces externos salen de config.js (config.enlaces). Mientras uno esté vacío,
 * su botón permanece oculto; al rellenarlo aparece solo.
 */
(function () {
  'use strict';

  const { enlaces } = window.DOON.config;

  document.querySelectorAll('[data-enlace]').forEach((boton) => {
    const destino = enlaces[boton.dataset.enlace];
    if (!destino) return;
    boton.href = destino;
    boton.closest('li').hidden = false;
  });
})();
