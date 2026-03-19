/* ══════════════════════════════════════
   DATA.JS — Datos estáticos iniciales
══════════════════════════════════════ */
'use strict';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const PLAN_DAYS = { Mensual:30, Trimestral:90, Semestral:180, Anual:365 };

const FAQ_DATA = [
  { q:'¿Cómo registrar un nuevo miembro?',
    a:'Ve al menú "Registrar". Completa los campos obligatorios (*) y haz clic en "Registrar Miembro". Las estadísticas se actualizan automáticamente.' },
  { q:'¿Cómo editar la información de un miembro?',
    a:'Ve a "Miembros", busca al miembro y haz clic en ✏️. Se abrirá un formulario con su información para modificarla.' },
  { q:'¿Cómo ver los informes actualizados?',
    a:'En "Informes" los datos se calculan en tiempo real desde los miembros registrados. Puedes cambiar entre vista mensual y anual.' },
  { q:'¿Cómo agregar un evento al calendario?',
    a:'En "Eventos", usa el formulario a la derecha del calendario. Completa nombre, fecha, hora y tipo, luego haz clic en "Agregar".' },
  { q:'¿Cómo buscar un miembro específico?',
    a:'En "Miembros" usa la barra de búsqueda para filtrar por nombre, cédula o correo. También puedes filtrar por estado.' },
  { q:'¿Cómo cambiar mi contraseña?',
    a:'Contacta al administrador del sistema. En próximas versiones se habilitará la opción de cambio desde el perfil de usuario.' },
];

const NEWS_DATA = [
  { tag:'Clases', tagClass:'tag-blue', img:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=70', title:'Nuevas clases de Yoga', desc:'Lunes y miércoles 6:00 AM con instructora certificada.', date:'10 mar' },
  { tag:'Promo',  tagClass:'tag-green', img:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=70', title:'Promoción traer un amigo', desc:'Trae a un amigo y obtén 15 días gratis en tu membresía.', date:'8 mar' },
  { tag:'Salud',  tagClass:'tag-orange', img:'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=70', title:'Asesoría nutricional gratis', desc:'Todos los viernes 5–7 PM con nuestro nutricionista.', date:'5 mar' },
  { tag:'Evento', tagClass:'tag-blue', img:'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&q=70', title:'Torneo Fitness Cúcuta 2026', desc:'Inscripciones abiertas para el gran evento del 28 de Marzo.', date:'1 mar' },
];
