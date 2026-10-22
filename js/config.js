/* Conexión con la base de datos (Supabase).
   La "clave pública" (publishable/anon) es segura para publicar: solo permite
   llamar a las funciones del juego; las tablas y las respuestas no se pueden leer. */
window.SERVIDOR = {
  url: '',     // ej. https://xxxxxxxx.supabase.co
  clave: ''    // ej. sb_publishable_xxxxxxxx   (o la clave "anon public")
};
