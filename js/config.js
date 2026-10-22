/* ==========================================================================
   CONFIGURACIÓN DE LA BASE DE DATOS
   --------------------------------------------------------------------------
   Para que los celulares de cada grupo y la consola de resultados se vean
   entre sí, el juego guarda los datos en Supabase (base de datos gratuita).

   Mientras estos dos valores estén vacíos, el juego funciona en MODO DEMO:
   todo se guarda solo en este navegador. Sirve para mostrarlo abriendo
   varias pestañas en un mismo computador, pero NO para jugar con celulares.

   Pega aquí los dos datos de tu proyecto de Supabase
   (Project Settings → API): la "Project URL" y la "anon public key".
   ========================================================================== */
window.CONFIG = {
  supabaseUrl: '',
  supabaseKey: ''
};
