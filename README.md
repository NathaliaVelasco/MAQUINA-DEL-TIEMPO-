# Máquina del Tiempo · Código: Cirugía del Futuro

Escape room médica **híbrida** sobre manejo de abdomen abierto. El material físico (fichas, cubos, cajas con candado, kit AbThera™) viaja en una maleta a cargo del Guía Especialista. Este ecosistema digital es el facilitador: registra a los participantes, conduce las 5 estaciones en orden, muestra las tarjetas de instrucciones, controla el tiempo, valida los códigos y muestra los resultados en vivo.

**Metodología, diseño del juego y piezas físicas:** Nathalia Velasco · Simoné. Todos los derechos reservados.

## Pantallas

| Pantalla | Archivo | Quién la usa |
|---|---|---|
| Inicio | `index.html` | Acceso a todo |
| Demo del ecosistema | `demo.html` | Recorrido guiado para presentar: la ruta completa (Bitácora → juego → diagnóstico → Cierre de Ruta), las 6 pantallas en vivo, el diagnóstico y los roles. En la esquina, una nota con las claves de la sesión (se abre con el PIN del Guía) |
| Pórtico de Entrada | `entrada.html` + `js/entrada.js` + `js/diagnostico-contenido.js` | Cada participante en su celular: grupo, nombre, profesión, rol y autorización de datos; diagnóstico inicial; credencial; diagnóstico final con su avance y el porqué de cada pregunta |
| Sala de Escape | `sala.html` + `js/sala.js` | Solo el Comandante de Misión: bienvenida, Estaciones 1 a 5, códigos y retroalimentación |
| El Gran Tablero | `tablero.html` + `js/tablero.js` | Pantalla grande: resultados de los 4 grupos en vivo y QR de ingreso |
| Bitácora de Tránsito Temporal | `bitacora.html` + `js/bitacora.js` + `js/bitacora-contenido.js` + `css/bitacora.css` + `js/fondo-espacio.js` | Cada participante, 3 días antes del juego: 4 fases (pestañas) y 20 puntos del consenso internacional, con 44 casillas para completar que se verifican (2 intentos por casilla, avance guardado en el dispositivo) y descarga de la bitácora completada. Voz de Edoardo (ElevenLabs) solo en el cambio de fase: `audio/bitacora/fase-I.mp3` … `fase-IV.mp3` |
| Cierre de Ruta | `cierre-de-ruta.html` + `js/cierre-de-ruta.js` + `css/cierre-de-ruta.css` | Cualquier participante, al terminar: el juego de 5 postales en digital (frente con texto e ilustración, reverso con mensaje clave y referencias). Se puede abrir en una postal concreta con `#postal-1` … `#postal-5`. Tiene fondo propio de circuito (`js/fondo-circuito.js`) y sonido (`js/sonido-ruta.js`): usa `audio/cierre-ambiente.mp3` y `audio/cierre-giro.mp3` si existen; si no, genera el ambiente en el navegador |
| Guía Especialista | `guia.html` + `js/guia.js` | Administrador del juego (con PIN): genera los dos códigos (registro y Sala de Escape), QR con su código, grupos en vivo con su tripulación, reiniciar o borrar un grupo, nueva sesión, Excel con histórico y cambio de PIN |

## Reglas implementadas (las controla el servidor)

- **Diagnóstico antes y después** (individual, no suma puntos): 10 preguntas antes de la Estación 1 y 10 al cerrar la 5, con escala de certeza, rutina de pensamiento e imagen + palabra. Opciones mezcladas, sin volver atrás; el servidor califica y las respuestas correctas solo llegan al celular al terminar el diagnóstico final. La Estación 1 se abre cuando toda la tripulación terminó el inicial (o el Guía libera la Sala); El Gran Tablero revela al ganador cuando todos envían el final (o el Guía lo revela). Contenido: hoja MDT_Hoja_de_contenido.xlsx, pestañas DIAGNÓSTICO y DIAGNÓSTICO · TEXTOS.

- 4 grupos × 7: 1 Líder Piloto, 1 Copiloto, 1 Comandante de Misión y 4 Tripulantes de Élite.
- Dos códigos distintos: uno de **registro** (Pórtico de Entrada, todos) y otro de la **Sala de Escape** (solo Comandantes). Los genera el Guía Especialista.
- Dentro de cada estación las pruebas van **en orden** (1.1 → 1.2 → 1.3 → clave de salida): la siguiente se abre al resolver la anterior.
- Recorrido obligatorio E1 → E5. Una estación no se abre si la anterior no se cerró, ni si otro grupo la está usando (una sola maleta).
- 12:00 de juego + 30 s de gracia. A las **12:30** la estación se cierra sola y queda en **cero** (respuestas y tiempo).
- **2 intentos** por código. Al segundo fallo se muestra la respuesta correcta (0 puntos) para aprender y poder abrir el candado físico.
- Puntos por respuesta definidos por el cliente (4 + 4 + 4 + 2; en E3: 4 + 8 + 2) + bonificación por agilidad al pulsar VALIDAR Y FINALIZAR:
  - E1, E2, E4 y E5: ≤ 5:00 → +6 · ≤ 8:00 → +5 · ≤ 11:00 → +4 · ≤ 12:30 → +3
  - E3 (procedimiento físico con AbThera™): ≤ 6:00 → +6 · ≤ 9:00 → +5 · ≤ 11:30 → +4 · ≤ 12:30 → +3
- Lo que antes estaba en las paredes aparece en pantalla: monitor de signos vitales, tablero de tiempos, situaciones de UCI, check-list de cierre, archivo técnico de Prevena™ y la imagen de evidencia con las 6 ventajas y el sello NP2010 (se muestra al resolver el código 5.2).
- La aplicación Prevena™ es del cliente (desarrollo externo): la consola solo enlaza a ella. El enlace va en `appPrevena.url` dentro de `js/contenido.js`.
- Voz automática del dispositivo: se elige una voz masculina en español latinoamericano cuando existe. Velocidad ágil por defecto (botón VOZ: voz y velocidad Normal / Ágil / Rápida).
- Fondo dinámico (`js/fondo.js`): barrido de radar, pulsos, partículas y línea de escaneo; se pausa cuando la pantalla no está visible.
- Las respuestas **no están en este repositorio**: se cargan en la base de datos con un archivo privado.

## Base de datos (Supabase)

1. `servidor/1_instalar.sql` crea la estructura y las reglas desde cero (borra todo).
2. `2_respuestas_PRIVADO.sql` carga respuestas, los dos códigos y el PIN (no se publica; lo tiene Simoné).
3. `servidor/actualizar_base_ya_instalada.sql` actualiza una base ya instalada sin borrar datos (diagnóstico antes y después, Liberar Sala, Revelar ganador y 3 pestañas nuevas del Excel). Las respuestas del diagnóstico van en el archivo privado.
4. Excel desde el panel del Guía Especialista: pestañas Puntajes (sesión, fecha, grupo, integrantes, puntos por estación y totales), Participantes, Estaciones, Diagnóstico, Reflexiones y Resumen diagnóstico; de la sesión actual o histórico.
5. La URL y la clave pública del proyecto van en `js/config.js`.

## Contenido

Todos los textos (tarjetas, pantallas, retroalimentación) están en `js/contenido.js`.

## Publicación

El sitio que se comparte es **www.experienciasimone.com/maquina-del-tiempo/**: una copia de este repositorio dentro del repositorio de la página de Simoné (`nathaliavelasco.github.io`, carpeta `maquina-del-tiempo`). Su portada (`index.html`) es propia: solo lleva a la Bitácora y al Cierre de Ruta. Cada cambio se hace aquí y se vuelve a copiar.

## Pendientes de contenido (revisión con el cliente)

- Diagnóstico: validación clínica de las 20 preguntas por los cirujanos de Solventum. La A7 (intervalo de 72 h) revela la clave de la prueba 4.2.
- Diagnóstico: el mensaje al terminar el inicial ("Diagnóstico inicial completo…") es una propuesta; no está en la hoja de contenido.

- Clave de la Estación 3: el documento dice "125-8 (o 120)"; la resta da **117**, que es la programada.
- Estación 5: el documento deja "1257 o 125" y "6 o 5"; están programados **1257** y **6**.
- Enlace de la aplicación Prevena™ del cliente: pendiente.
- Clave final NP2010 y su mecánica: revisar con el cliente.
- Opciones del tablero de tiempos de la E4 (6 h a 7 días): propuesta.
- Pistas: solo la E1 tiene pistas de ejemplo; se cargarán tras la revisión.
- Texto de autorización de datos: validar con el área legal de Solventum.
