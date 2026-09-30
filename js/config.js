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

  // Menú principal. "ruta" es relativa a la raíz del proyecto (doon.es/Inicio/, doon.es/carta/…).
  paginas: [
    { id: 'inicio', texto: 'Inicio', ruta: 'Inicio/' },
    { id: 'carta', texto: 'Carta', ruta: 'carta/' },
    { id: 'stand', texto: 'El stand', ruta: 'stand/' },
    { id: 'como-trabajamos', texto: 'Cómo trabajamos', ruta: 'como-trabajamos/' },
    { id: 'calendario', texto: 'Calendario', ruta: 'calendario/' },
  ],

  // Páginas legales, enlazadas desde el pie.
  legales: [
    { id: 'terminos', texto: 'Términos y condiciones', ruta: 'terminos/' },
    { id: 'privacidad', texto: 'Política de privacidad', ruta: 'privacidad/' },
    { id: 'cookies', texto: 'Política de cookies', ruta: 'cookies/' },
  ],

  // Botón destacado de la cabecera.
  llamada: { texto: 'Reservar fecha', ruta: 'calendario/#solicitud' },
};
