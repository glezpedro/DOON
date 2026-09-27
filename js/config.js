/*
 * CONFIGURACIÓN GENERAL DE LA WEB
 * Datos que se repiten en varias páginas. Cambia aquí y se actualiza toda la web.
 */
window.DOON = window.DOON || {};

window.DOON.config = {
  marca: 'DOÓN',
  lema: 'Specialty coffee',

  // Correo al que llegan las solicitudes de reserva e información.
  email: 'info@doon.es',

  // Opcional: URL de un servicio de formularios (Formspree, Getform, Web3Forms…).
  // Si se deja vacío, al enviar el formulario se abre el correo del cliente con la solicitud ya redactada.
  formEndpoint: '',

  // Menú principal. "ruta" es relativa a la raíz del proyecto.
  paginas: [
    { id: 'inicio', texto: 'Inicio', ruta: 'web/Inicio/index.html' },
    { id: 'carta', texto: 'Carta', ruta: 'web/carta/index.html' },
    { id: 'stand', texto: 'El stand', ruta: 'web/stand/index.html' },
    { id: 'como-trabajamos', texto: 'Cómo trabajamos', ruta: 'web/como-trabajamos/index.html' },
    { id: 'calendario', texto: 'Calendario', ruta: 'web/calendario/index.html' },
  ],

  // Botón destacado de la cabecera.
  llamada: { texto: 'Reservar fecha', ruta: 'web/calendario/index.html#solicitud' },
};
