document.addEventListener('DOMContentLoaded', () => {
    inicializarFiltros();
    inicializarVinculosSecciones();
    inicializarPersonalizador();
    vincularCatalogoPersonalizador();
    inicializarContacto();
    gestionarVisibilidadWhatsApp();
});
function inicializarFiltros() {
    const botones = document.querySelectorAll('.boton-filtro');
    const items = document.querySelectorAll('.item-catalogo');

    // Configurar Fallback de imágenes antes de filtrar
    items.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            img.onerror = function() {
                const cat = item.getAttribute('data-category');
                if (cat === 'textiles') this.src = 'assets/imagenes/servicio_textiles.png';
                else if (cat === 'tasas') this.src = 'assets/imagenes/servicio_tazas.png';
                else if (cat === 'aluminio') this.src = 'assets/imagenes/servicio_aluminio.png';
                else this.src = 'assets/imagenes/servicio_souvenirs.jpg';
                this.onerror = null; // Prevenir bucle infinito
            };
        }
    });

    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            // Actualizar estado activo de los botones
            botones.forEach(b => b.classList.remove('activo'));
            boton.classList.add('activo');

            const filtro = boton.getAttribute('data-filter');

            items.forEach(item => {
                // Reset de estilos para asegurar visibilidad
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                
                if (filtro === 'all' || item.getAttribute('data-category') === filtro) {
                    item.style.display = 'block';
                    // Pequeño retardo para permitir que el navegador procese el display:block antes de la opacidad
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        if (item.style.opacity === '0') {
                            item.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });

    // Inicializar con "Todos" al cargar
    if (botones.length > 0) {
        document.querySelector('.boton-filtro[data-filter="all"]').click();
    }

    // Manejador para Botones de Consulta (WhatsApp Directo)
    const botonesConsulta = document.querySelectorAll('.boton-consultar');
    botonesConsulta.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const item = e.target.closest('.item-catalogo');
            const nombreProducto = item.querySelector('h4').innerText;
            const mensaje = encodeURIComponent(`Hola Creaciones Sublime, me interesa consultar el precio de: ${nombreProducto} 😊`);
            window.open(`https://wa.me/584242092923?text=${mensaje}`, '_blank');
        });
    });
}

// Vincular Áreas de Trabajo con el Catálogo
function inicializarVinculosSecciones() {
    const tarjetasServicio = document.querySelectorAll('.tarjeta-servicio-pro');
    tarjetasServicio.forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            let servicio = tarjeta.getAttribute('data-servicio');
            // Mapeo: Tazas (Servicios) -> Tasas (Catálogo/Filtro)
            if (servicio === 'tazas') servicio = 'tasas';
            
            const botonFiltro = document.querySelector(`.boton-filtro[data-filter="${servicio}"]`);
            if (botonFiltro) {
                // Hacer clic en el filtro
                botonFiltro.click();
                
                // Scroll suave hacia el catálogo
                const seccionCatalogo = document.getElementById('catalogo');
                if (seccionCatalogo) {
                    seccionCatalogo.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Lógica del Personalizador Visual (Ahora asistido por Rut)
function inicializarPersonalizador() {
    const lienzo = document.getElementById('mainCanvas');
    if (!lienzo) return;
    
    const contexto = lienzo.getContext('2d');
    const distintivoCalidad = document.getElementById('qualityIndicator');

    lienzo.width = 400;
    lienzo.height = 400;

    const imagenBase = new Image();
    imagenBase.src = 'assets/imagenes/franelas/fracrist01.png'; // Imagen por defecto

    imagenBase.onload = () => dibujarPrevisualizacion();

    function dibujarPrevisualizacion() {
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        contexto.drawImage(imagenBase, 0, 0, 400, 400);
        
        // El texto y color se gestionarán ahora mediante la interacción con Rut
        // en el flujo de pedido de n8n.
    }

    // Escuchar cambios de imagen desde el catálogo
    document.addEventListener('cambiarImagenBase', (e) => {
        imagenBase.src = e.detail.src;
        if (distintivoCalidad) distintivoCalidad.style.display = 'none';
        
        // Scroll suave al personalizador para iniciar el chat con Rut
        const seccionPersonalizador = document.getElementById('personalizador');
        if (seccionPersonalizador) {
            seccionPersonalizador.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Manejador de Subida de Imagen (se mantiene como opción para que el cliente la use de referencia)
    const entradaCarga = document.getElementById('imageUpload');
    if (entradaCarga) {
        entradaCarga.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (archivo) {
                const lector = new FileReader();
                lector.onload = (evento) => {
                    const imgTemp = new Image();
                    imgTemp.src = evento.target.result;
                    imgTemp.onload = () => {
                        imagenBase.src = imgTemp.src;
                        if (distintivoCalidad) {
                            distintivoCalidad.style.display = 'block';
                            if (imgTemp.naturalWidth >= 2000) {
                                distintivoCalidad.style.background = '#4CAF50';
                                distintivoCalidad.innerText = '✨ Calidad Sublime';
                            } else {
                                distintivoCalidad.style.background = '#FF9800';
                                distintivoCalidad.innerText = '⚠️ Calidad Media';
                            }
                        }
                    };
                };
                lector.readAsDataURL(archivo);
            }
        });
    }
}

// Nueva función para vincular el catálogo con el personalizador
function vincularCatalogoPersonalizador() {
    // Vincular todos los botones del catálogo (Diseñar Ahora y Más Información) con el personalizador
    const todosLosBotonesCatalogo = document.querySelectorAll('.boton-personalizar, .boton-consultar');
    const seccionPersonalizador = document.getElementById('personalizador');

    todosLosBotonesCatalogo.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const item = e.target.closest('.item-catalogo');
            if (item) {
                const imgSrc = item.querySelector('img').getAttribute('src');
                const nombreProducto = item.querySelector('h4').innerText;
                
                // Disparar evento para cambiar la imagen en el canvas
                const event = new CustomEvent('cambiarImagenBase', { detail: { src: imgSrc } });
                document.dispatchEvent(event);

                // Inicializar chat de Rut con contexto de diseño
                if (window.iniciarChatRut) {
                    window.iniciarChatRut('diseno', nombreProducto);
                }

                // Scroll suave al personalizador
                if (seccionPersonalizador) {
                    seccionPersonalizador.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function inicializarContacto() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('cf-nombre').value;
        const whatsapp = document.getElementById('cf-whatsapp').value;
        const servicio = document.getElementById('cf-servicio').value;
        const mensaje = document.getElementById('cf-mensaje').value;
        const imagenInput = document.getElementById('cf-imagen');
        const tieneImagen = imagenInput.files && imagenInput.files.length > 0;

        // Construir mensaje de WhatsApp con formato
        const textoWA = encodeURIComponent(
            `🚀 *Nueva Solicitud de Creaciones Sublime*\n\n` +
            `*Nombre:* ${nombre}\n` +
            `*WhatsApp:* ${whatsapp}\n` +
            `*Interés:* ${servicio}\n` +
            `*Imagen:* ${tieneImagen ? '📸 Adjunta en el siguiente mensaje' : 'Sin imagen'}\n\n` +
            `*Detalles:* ${mensaje || 'Sin detalles adicionales.'}\n\n` +
            `_Enviado desde el formulario de contacto._`
        );

        // Envío diferido: Mostramos confirmación antes de abrir WhatsApp
        const boton = form.querySelector('button');
        const originalText = boton.innerHTML;
        boton.innerHTML = '✅ Preparando mensaje...';
        boton.style.background = '#075E54';
        
        setTimeout(() => {
            window.open(`https://wa.me/584242092923?text=${textoWA}`, '_blank');
            boton.innerHTML = originalText;
            boton.style.background = '';
            form.reset();
        }, 800);
    });
}

// Ocultar botón de WhatsApp cuando se está en la sección del personalizador
function gestionarVisibilidadWhatsApp() {
    const botonWhatsApp = document.getElementById('whatsapp-flotante');
    const seccionPersonalizador = document.getElementById('personalizador');

    if (!botonWhatsApp || !seccionPersonalizador) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si el personalizador es visible, ocultamos el botón de WhatsApp
                botonWhatsApp.style.opacity = '0';
                botonWhatsApp.style.visibility = 'hidden';
            } else {
                // Si no, lo mostramos
                botonWhatsApp.style.opacity = '1';
                botonWhatsApp.style.visibility = 'visible';
            }
        });
    }, {
        threshold: 0.2 // Se activa cuando el 20% de la sección es visible
    });

    observer.observe(seccionPersonalizador);
}

function actualizarPuntos(puntos) {
    console.log(`Puntos Sublime: ${puntos}`);
}
