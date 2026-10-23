# Máquina del Tiempo · Código: Cirugía del Futuro

Escape room médica **híbrida** sobre manejo de abdomen abierto. El material físico (fichas, cubos, cajas con candado, kit AbThera™) viaja en una maleta a cargo del Guía Especialista. Este ecosistema digital es el facilitador: registra a los participantes, conduce las 5 estaciones en orden, muestra las tarjetas de instrucciones, controla el tiempo, valida los códigos y muestra los resultados en vivo.

**Metodología, diseño del juego y piezas físicas:** Nathalia Velasco · Simoné. Todos los derechos reservados.

## Pantallas

| Pantalla | Archivo | Quién la usa |
|---|---|---|
| Inicio | `index.html` | Acceso a todo |
| Demo del ecosistema | `demo.html` | Recorrido guiado para presentar: los 7 momentos, las 4 pantallas funcionando en vivo y los roles |
| Pórtico de Entrada | `entrada.html` + `js/entrada.js` | Cada participante en su celular: grupo, nombre, profesión, rol y autorización de datos |
| Sala de Escape | `sala.html` + `js/sala.js` | Solo el Comandante de Misión: bienvenida, Estaciones 1 a 5, códigos y retroalimentación |
| El Gran Tablero | `tablero.html` + `js/tablero.js` | Pantalla grande: resultados de los 4 grupos en vivo y QR de ingreso |
| Guía Especialista | `guia.html` + `js/guia.js` | Administrador del juego (con PIN): genera el código de acceso, QR con el código, grupos en vivo con su tripulación, reiniciar o borrar un grupo, nueva sesión, descarga CSV y cambio de PIN |

## Reglas implementadas (las controla el servidor)

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
3. `servidor/actualizar_base_ya_instalada.sql` actualiza una base ya instalada sin borrar datos (códigos separados, pruebas en orden, Excel con histórico).
4. Excel desde el panel del Guía Especialista: pestañas Puntajes (sesión, fecha, grupo, integrantes, puntos por estación y totales), Participantes y Estaciones; de la sesión actual o histórico.
3. La URL y la clave pública del proyecto van en `js/config.js`.

## Contenido

Todos los textos (tarjetas, pantallas, retroalimentación) están en `js/contenido.js`.

## Pendientes de contenido (revisión con el cliente)

- Clave de la Estación 3: el documento dice "125-8 (o 120)"; la resta da **117**, que es la programada.
- Estación 5: el documento deja "1257 o 125" y "6 o 5"; están programados **1257** y **6**.
- Enlace de la aplicación Prevena™ del cliente: pendiente.
- Clave final NP2010 y su mecánica: revisar con el cliente.
- Opciones del tablero de tiempos de la E4 (6 h a 7 días): propuesta.
- Pistas: solo la E1 tiene pistas de ejemplo; se cargarán tras la revisión.
- Texto de autorización de datos: validar con el área legal de Solventum.
