# Máquina del Tiempo · Código: Cirugía del Futuro

Escape room médica **híbrida** sobre manejo de abdomen abierto. El material físico (fichas, cubos, cajas con candado, kit AbThera™) viaja en una maleta a cargo del Guía Especialista. Esta plataforma es el facilitador digital: registra a los participantes, conduce las 5 estaciones en orden, muestra las tarjetas de instrucciones, controla el tiempo, valida los códigos y lleva el puntaje en vivo.

**Metodología, diseño del juego y piezas físicas:** Nathalia Velasco · Simoné. Todos los derechos reservados.

## Pantallas

| Pantalla | Dirección | Quién |
|---|---|---|
| Consola de misión | `/` (index.html) | El celular de cada participante (iPhone o Android) |
| Consola de resultados | `/consola.html` | Pantalla grande o proyector: ranking en vivo, QR de ingreso, descarga CSV y reinicio con PIN |

## Cómo se juega

1. **Registro** en el celular: nombre completo, profesión (en mayúsculas), grupo, rol y autorización de datos (Ley 1581). 4 grupos × 7: 1 Líder Piloto, 1 Copiloto, 1 Comandante de Misión y 4 Tripulantes de Élite.
2. **Pórtico**: bienvenida del Guardián, credencial, tripulación y reglas.
3. **Estaciones 1 → 5** en orden obligatorio. El Comandante inicia el reloj, digita los códigos y avanza; el resto del grupo ve lo mismo en su celular. Si el celular del Comandante falla, otro integrante puede "tomar el mando".
4. **Retroalimentación** al cerrar cada estación (voz + texto).
5. **Cierre**: score total sobre 100 y posiciones.

## Reglas implementadas

- 12:00 de juego + 30 s de gracia. A las **12:30** la estación se cierra sola y queda en **cero** (respuestas y tiempo).
- **2 intentos** por código. Si fallan los dos, la pantalla muestra la respuesta correcta (0 puntos) para que puedan seguir aprendiendo y abrir el candado físico.
- Puntos por respuesta según el documento del cliente (4 + 4 + 4 + 2; en E3: 4 + 8 + 2).
- Bonificación por agilidad (se mide al pulsar VALIDAR Y FINALIZAR):
  - Estaciones 1, 2, 4 y 5: ≤ 5:00 → +6 · ≤ 8:00 → +5 · ≤ 11:00 → +4 · ≤ 12:30 → +3
  - Estación 3 (procedimiento físico con AbThera™): ≤ 7:00 → +6 · ≤ 9:30 → +5 · ≤ 11:30 → +4 · ≤ 12:30 → +3
- Lo que antes estaba en las paredes aparece en pantalla (tablero de tiempos, excepciones, check-list de cierre, parámetros de Prevena™).
- Aplicación Prevena™ (Prueba 5.3) dentro del celular, con código de activación.
- Voz automática del dispositivo; se elige una voz masculina de español latinoamericano cuando existe. La voz viene activada en el celular del Comandante.

## Modo demo y modo en vivo

- Sin configurar la base de datos, el juego funciona en **modo demo**: todo vive en un solo navegador. Para mostrarlo, abran `consola.html` en una pestaña y el juego en otras (cada pestaña es un jugador). PIN de reinicio en demo: `0000`.
- Para jugar con celulares reales: crear un proyecto gratuito en Supabase, ejecutar `supabase/instalar.sql` y pegar la URL y la clave pública en `js/config.js`.

## Archivos

```
index.html · consola.html
js/contenido.js   TODO el contenido: tarjetas, códigos, puntos, bandas, retroalimentación
js/huellas.js     Respuestas cifradas (SHA-256), no editar a mano
js/app.js         Consola de misión (celular)
js/consola.js     Consola de resultados
js/prevena.js     Aplicación Prevena™
js/datos.js       Conexión con la base de datos (Supabase o demo)
js/config.js      URL y clave de Supabase
supabase/instalar.sql
```

## Pendientes de contenido (revisión con el cliente)

- Clave de la Estación 3: el documento dice "125-8 (o 120)"; la resta da **117**, que es la que está programada.
- Estación 5: el documento deja "1257 o 125" y "6 o 5"; están programados **1257** y **6**.
- Pasos de la aplicación Prevena™: borrador, debe validarlos Solventum.
- Opciones del tablero de tiempos de la E4 (6 h a 7 días): propuesta.
- Pistas por estación: solo la E1 tiene pistas; las demás se cargarán tras la revisión.
- Mensaje de desbloqueo de la E4: el documento decía "fase de estaciones concluida" (falta la E5); se ajustó.
