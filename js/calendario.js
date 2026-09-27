/*
 * CALENDARIO DE DISPONIBILIDAD Y FORMULARIO DE SOLICITUD
 * Fechas ocupadas: js/disponibilidad.js · Correo y servicio de formularios: js/config.js
 */
(function () {
  'use strict';

  const { config, fechasOcupadas } = window.DOON;

  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const ETIQUETA_ESTADO = { libre: 'libre', ocupado: 'ocupado', pasado: 'no disponible' };
  const PASOS_TECLADO = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
  const MESES_A_LA_VISTA = 18;
  const MAX_FINDES = 6;
  const MS_DIA = 86400000;

  /* ---------- Utilidades de fecha (siempre en hora local) ---------- */
  const crearFecha = (anio, mes, dia) => new Date(anio, mes, dia);
  const sumarDias = (fecha, dias) => crearFecha(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
  const sumarMeses = (fecha, meses) => crearFecha(fecha.getFullYear(), fecha.getMonth() + meses, 1);
  const inicioDeMes = (fecha) => crearFecha(fecha.getFullYear(), fecha.getMonth(), 1);
  const mismoDia = (a, b) => Boolean(a && b) && a.getTime() === b.getTime();
  const dos = (n) => String(n).padStart(2, '0');
  const aClave = (fecha) => `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
  const deClave = (clave) => {
    const [anio, mes, dia] = String(clave).split('-').map(Number);
    return anio && mes && dia ? crearFecha(anio, mes - 1, dia) : null;
  };

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  const textoDia = (fecha) => `${DIAS[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  const textoDiaCompleto = (fecha) => `${textoDia(fecha)} de ${fecha.getFullYear()}`;
  const textoNumerico = (fecha) => `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
  const textoRango = (inicio, fin) =>
    fin ? `Del ${textoDia(inicio)} al ${textoDiaCompleto(fin)}` : capitalizar(textoDiaCompleto(inicio));
  const diasEntre = (inicio, fin) => Math.round((fin - inicio) / MS_DIA) + 1;

  const ahora = new Date();
  const hoy = crearFecha(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const primerMes = inicioDeMes(hoy);
  const ultimoMes = sumarMeses(primerMes, MESES_A_LA_VISTA - 1);
  const ultimoDia = sumarDias(sumarMeses(ultimoMes, 1), -1);

  /* ---------- Disponibilidad ---------- */
  const ocupadas = new Set();
  fechasOcupadas.forEach(({ desde, hasta }) => {
    const fin = deClave(hasta || desde);
    for (let fecha = deClave(desde); fecha && fecha <= fin; fecha = sumarDias(fecha, 1)) {
      ocupadas.add(aClave(fecha));
    }
  });

  function estadoDe(fecha) {
    if (fecha < hoy) return 'pasado';
    return ocupadas.has(aClave(fecha)) ? 'ocupado' : 'libre';
  }

  function ocupadasEntre(inicio, fin) {
    const resultado = [];
    for (let fecha = inicio; fecha <= fin; fecha = sumarDias(fecha, 1)) {
      if (ocupadas.has(aClave(fecha))) resultado.push(fecha);
    }
    return resultado;
  }

  function findesLibres() {
    const resultado = [];
    let sabado = sumarDias(hoy, (6 - hoy.getDay() + 7) % 7);
    while (resultado.length < MAX_FINDES && sabado < ultimoDia) {
      if (ocupadasEntre(sabado, sumarDias(sabado, 1)).length === 0) resultado.push(sabado);
      sabado = sumarDias(sabado, 7);
    }
    return resultado;
  }

  /* ---------- Estado y referencias ---------- */
  const estado = { mes: primerMes, inicio: null, fin: null, foco: hoy };

  const $ = (selector) => document.querySelector(selector);
  const dom = {
    titulo: $('[data-titulo-mes]'),
    dias: $('[data-dias]'),
    navAnterior: $('[data-mes="-1"]'),
    navSiguiente: $('[data-mes="1"]'),
    seleccion: $('[data-panel-seleccion]'),
    seleccionFecha: $('[data-seleccion-fecha]'),
    seleccionTexto: $('[data-seleccion-texto]'),
    botonReserva: $('[data-abrir-solicitud="reserva"]'),
    findes: $('[data-findes]'),
    formulario: $('[data-formulario]'),
    avisoFechas: $('[data-aviso-fechas]'),
    notaEnvio: $('[data-nota-envio]'),
    confirmacion: $('[data-confirmacion]'),
    confirmacionTexto: $('[data-confirmacion-texto]'),
    nuevaSolicitud: $('[data-nueva-solicitud]'),
  };
  const campos = dom.formulario.elements;
  const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const enMesVisible = (fecha) =>
    fecha.getFullYear() === estado.mes.getFullYear() && fecha.getMonth() === estado.mes.getMonth();

  /* ---------- Pintado del calendario ---------- */
  function marcaSeleccion(fecha) {
    const { inicio, fin } = estado;
    if (!inicio) return null;
    if (mismoDia(fecha, inicio)) return fin ? 'inicio' : 'unico';
    if (mismoDia(fecha, fin)) return 'fin';
    if (fin && fecha > inicio && fecha < fin) return 'rango';
    return null;
  }

  function diaEnfocable() {
    return [estado.foco, estado.inicio, hoy, estado.mes].find(
      (fecha) => fecha && fecha >= hoy && enMesVisible(fecha)
    );
  }

  function crearDia(fecha, enfocable) {
    const estadoDia = estadoDe(fecha);
    const marca = marcaSeleccion(fecha);
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'calendario__dia';
    boton.textContent = fecha.getDate();
    boton.dataset.fecha = aClave(fecha);
    boton.dataset.estado = estadoDia;
    boton.disabled = estadoDia === 'pasado';
    boton.tabIndex = mismoDia(fecha, enfocable) ? 0 : -1;
    boton.setAttribute('aria-pressed', String(Boolean(marca)));
    boton.setAttribute('aria-label', `${capitalizar(textoDiaCompleto(fecha))}: ${ETIQUETA_ESTADO[estadoDia]}`);
    if (marca) boton.dataset.seleccion = marca;
    if (mismoDia(fecha, hoy)) {
      boton.dataset.hoy = '';
      boton.setAttribute('aria-current', 'date');
    }
    const celda = document.createElement('li');
    celda.append(boton);
    return celda;
  }

  function pintarCalendario() {
    const { mes } = estado;
    dom.titulo.textContent = `${capitalizar(MESES[mes.getMonth()])} ${mes.getFullYear()}`;
    dom.navAnterior.disabled = mes <= primerMes;
    dom.navSiguiente.disabled = mes >= ultimoMes;

    const huecos = (mes.getDay() + 6) % 7; // la semana empieza en lunes
    const totalDias = sumarDias(sumarMeses(mes, 1), -1).getDate();
    const enfocable = diaEnfocable();
    const celdas = Array.from({ length: huecos }, () => {
      const hueco = document.createElement('li');
      hueco.setAttribute('aria-hidden', 'true');
      return hueco;
    });
    for (let dia = 1; dia <= totalDias; dia++) {
      celdas.push(crearDia(crearFecha(mes.getFullYear(), mes.getMonth(), dia), enfocable));
    }
    dom.dias.replaceChildren(...celdas);
  }

  function pintarSeleccion() {
    const { inicio, fin } = estado;
    let estadoPanel = 'vacio';
    let fecha = 'Elige un día';
    let texto = 'Pulsa un día libre del calendario. Si tu evento dura varios días, pulsa después el último día.';

    if (inicio) {
      fecha = textoRango(inicio, fin);
      if (ocupadasEntre(inicio, fin || inicio).length) {
        estadoPanel = 'ocupado';
        texto = 'Esta fecha ya está ocupada. Si quieres, pídenos información y te avisamos si se libera.';
      } else {
        estadoPanel = 'libre';
        texto = fin
          ? `${diasEntre(inicio, fin)} días seguidos, todos libres.`
          : 'Día libre. ¿Tu evento dura más? Pulsa el último día en el calendario.';
      }
    }

    dom.seleccion.dataset.estado = estadoPanel;
    dom.seleccionFecha.textContent = fecha;
    dom.seleccionTexto.textContent = texto;
    dom.botonReserva.disabled = estadoPanel === 'ocupado';
  }

  function crearBotonFinde(sabado) {
    const domingo = sumarDias(sabado, 1);
    const mesCorto = (fecha) => MESES[fecha.getMonth()].slice(0, 3);
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'findes__boton';
    boton.dataset.fecha = aClave(sabado);
    boton.textContent = sabado.getMonth() === domingo.getMonth()
      ? `${sabado.getDate()}–${domingo.getDate()} ${mesCorto(sabado)}`
      : `${sabado.getDate()} ${mesCorto(sabado)} – ${domingo.getDate()} ${mesCorto(domingo)}`;
    boton.setAttribute('aria-label', `Fin de semana del ${textoDia(sabado)} al ${textoDiaCompleto(domingo)}`);
    boton.setAttribute('aria-pressed', String(mismoDia(estado.inicio, sabado) && mismoDia(estado.fin, domingo)));
    const elemento = document.createElement('li');
    elemento.append(boton);
    return elemento;
  }

  function pintarFindes() {
    const findes = findesLibres();
    if (findes.length) {
      dom.findes.replaceChildren(...findes.map(crearBotonFinde));
      return;
    }
    const vacio = document.createElement('li');
    vacio.textContent = 'No quedan fines de semana completos libres en los próximos meses.';
    dom.findes.replaceChildren(vacio);
  }

  function actualizar() {
    pintarCalendario();
    pintarSeleccion();
    pintarFindes();
  }

  /* ---------- Interacción con el calendario ---------- */
  function seleccionar(inicio, fin) {
    estado.inicio = inicio;
    estado.fin = fin;
    if (inicio) {
      estado.foco = inicio;
      estado.mes = inicioDeMes(inicio);
    }
    actualizar();
    volcarEnFormulario();
  }

  function elegirDia(fecha) {
    const { inicio, fin } = estado;
    const ampliaRango = inicio && !fin && fecha > inicio && ocupadasEntre(inicio, fecha).length === 0;
    if (ampliaRango) {
      estado.fin = fecha;
    } else if (inicio && !fin && mismoDia(fecha, inicio)) {
      estado.inicio = null;
    } else {
      estado.inicio = fecha;
      estado.fin = null;
    }
    estado.foco = fecha;
    actualizar();
    volcarEnFormulario();
  }

  function cambiarMes(desplazamiento) {
    const mes = sumarMeses(estado.mes, desplazamiento);
    if (mes < primerMes || mes > ultimoMes) return;
    estado.mes = mes;
    pintarCalendario();
  }

  function moverFoco(evento) {
    const paso = PASOS_TECLADO[evento.key];
    const actual = evento.target.closest('[data-fecha]');
    if (!paso || !actual) return;
    evento.preventDefault();
    const destino = sumarDias(deClave(actual.dataset.fecha), paso);
    if (destino < hoy || destino > ultimoDia) return;
    estado.foco = destino;
    if (!enMesVisible(destino)) estado.mes = inicioDeMes(destino);
    pintarCalendario();
    dom.dias.querySelector(`[data-fecha="${aClave(destino)}"]`).focus();
  }

  /* ---------- Formulario ---------- */
  function volcarEnFormulario() {
    campos.fecha_inicio.value = estado.inicio ? aClave(estado.inicio) : '';
    campos.fecha_fin.value = estado.fin ? aClave(estado.fin) : '';
    validarFechas();
  }

  function leerFechasDelFormulario() {
    const inicio = deClave(campos.fecha_inicio.value);
    const fin = deClave(campos.fecha_fin.value);
    estado.inicio = inicio;
    estado.fin = inicio && fin && fin > inicio ? fin : null;
    if (inicio && inicio >= primerMes && inicio <= ultimoDia) {
      estado.mes = inicioDeMes(inicio);
      estado.foco = inicio;
    }
    actualizar();
    validarFechas();
  }

  function mensajeFechas() {
    const inicio = deClave(campos.fecha_inicio.value);
    const fin = deClave(campos.fecha_fin.value);
    if (fin && !inicio) return 'Indica también la fecha de inicio.';
    if (!inicio) return '';
    if (inicio < hoy) return 'La fecha de inicio ya ha pasado.';
    if (fin && fin < inicio) return 'La fecha de fin no puede ser anterior a la de inicio.';
    if (campos.tipo.value !== 'reserva') return '';
    const conflictos = ocupadasEntre(inicio, fin || inicio);
    return conflictos.length
      ? `Ya tenemos ocupado: ${conflictos.map(textoNumerico).join(', ')}. Elige otra fecha o marca «Solicitar información».`
      : '';
  }

  function validarFechas() {
    const mensaje = mensajeFechas();
    campos.fecha_inicio.required = campos.tipo.value === 'reserva';
    campos.fecha_inicio.setCustomValidity(mensaje);
    dom.avisoFechas.textContent = mensaje;
  }

  function primerCampoPendiente() {
    return Array.from(campos).find(
      (campo) => campo.willValidate && campo.type !== 'checkbox' && !campo.validity.valid
    );
  }

  function abrirSolicitud(tipo) {
    campos.tipo.value = tipo;
    volcarEnFormulario();
    $('#solicitud').scrollIntoView({ behavior: menosMovimiento ? 'auto' : 'smooth', block: 'start' });
    (primerCampoPendiente() || campos.evento).focus({ preventScroll: true });
  }

  const etiquetaDe = (campo) =>
    campo.type === 'radio'
      ? campo.closest('fieldset').querySelector('legend').textContent.trim()
      : campo.labels[0].textContent.trim();

  function valorDe(campo) {
    if (campo.type === 'date') return textoNumerico(deClave(campo.value));
    if (campo.type === 'radio') return campo.closest('label').querySelector('.opcion__titulo').textContent.trim();
    if (campo.tagName === 'SELECT') return campo.selectedOptions[0].text;
    return campo.value.trim();
  }

  function componerCuerpo() {
    return Array.from(campos)
      .filter((campo) => campo.name && campo.type !== 'checkbox' && campo.value.trim() !== '')
      .filter((campo) => campo.type !== 'radio' || campo.checked)
      .map((campo) => `${etiquetaDe(campo)}: ${valorDe(campo)}`)
      .join('\n');
  }

  function componerAsunto() {
    const partes = [campos.tipo.value === 'reserva' ? 'Reserva stand DOÓN' : 'Información stand DOÓN'];
    if (campos.fecha_inicio.value) partes.push(textoNumerico(deClave(campos.fecha_inicio.value)));
    const referencia = campos.evento.value.trim() || campos.localidad.value.trim();
    if (referencia) partes.push(referencia);
    return partes.join(' · ');
  }

  async function enviarAServicio(asunto, cuerpo) {
    const datos = new FormData(dom.formulario);
    datos.append('_subject', asunto);
    datos.append('resumen', cuerpo);
    try {
      const respuesta = await fetch(config.formEndpoint, {
        method: 'POST',
        body: datos,
        headers: { Accept: 'application/json' },
      });
      return respuesta.ok;
    } catch {
      return false;
    }
  }

  function mostrarConfirmacion(texto, conCorreo) {
    dom.confirmacionTexto.textContent = texto;
    if (conCorreo) {
      const enlace = document.createElement('a');
      enlace.href = `mailto:${config.email}`;
      enlace.textContent = config.email;
      dom.confirmacionTexto.append(' ', enlace, '.');
    }
    dom.formulario.hidden = true;
    dom.confirmacion.hidden = false;
    dom.confirmacion.focus();
  }

  async function enviar(evento) {
    evento.preventDefault();
    validarFechas();
    if (!dom.formulario.reportValidity()) return;

    const asunto = componerAsunto();
    const cuerpo = componerCuerpo();
    if (config.formEndpoint && (await enviarAServicio(asunto, cuerpo))) {
      mostrarConfirmacion('Hemos recibido tu solicitud. Te responderemos por correo lo antes posible.', false);
      return;
    }
    window.location.href = `mailto:${config.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    mostrarConfirmacion('Se ha abierto tu aplicación de correo con la solicitud ya redactada: solo tienes que enviarla. Si no se ha abierto, escríbenos a', true);
  }

  function reiniciarFormulario() {
    dom.formulario.reset();
    seleccionar(null, null);
    dom.confirmacion.hidden = true;
    dom.formulario.hidden = false;
    campos.tipo[0].focus();
  }

  /* ---------- Arranque ---------- */
  dom.dias.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-fecha]');
    if (boton && !boton.disabled) elegirDia(deClave(boton.dataset.fecha));
  });
  dom.dias.addEventListener('keydown', moverFoco);
  dom.navAnterior.addEventListener('click', () => cambiarMes(-1));
  dom.navSiguiente.addEventListener('click', () => cambiarMes(1));
  dom.findes.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-fecha]');
    if (!boton) return;
    const sabado = deClave(boton.dataset.fecha);
    seleccionar(sabado, sumarDias(sabado, 1));
  });
  document.querySelectorAll('[data-abrir-solicitud]').forEach((boton) => {
    boton.addEventListener('click', () => abrirSolicitud(boton.dataset.abrirSolicitud));
  });
  dom.formulario.addEventListener('change', (evento) => {
    if (evento.target.type === 'date') leerFechasDelFormulario();
    if (evento.target.name === 'tipo') validarFechas();
  });
  dom.formulario.addEventListener('submit', enviar);
  dom.nuevaSolicitud.addEventListener('click', reiniciarFormulario);

  campos.fecha_inicio.min = aClave(hoy);
  campos.fecha_fin.min = aClave(hoy);
  dom.notaEnvio.textContent = config.formEndpoint
    ? 'Te responderemos por correo para cerrar los detalles.'
    : 'Al enviar se abrirá tu aplicación de correo con la solicitud ya redactada.';

  actualizar();
  validarFechas();
})();
