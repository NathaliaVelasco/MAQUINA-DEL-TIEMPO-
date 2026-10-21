# Máquina del Tiempo · Código: Cirugía del Futuro

Escape room médica híbrida sobre **manejo de abdomen abierto**.
Las cajas, candados, fichas y cubos son físicos. Esta plataforma asume el rol del **Guía Especialista**: conduce cada paso en pantalla, libera información, valida códigos, da pistas por tiempo y cierra cada cámara con debriefing.

**Metodología, diseño del juego y piezas físicas:** Nathalia Velasco · Simoné. Todos los derechos reservados.

## Probar

Enlace de prueba (GitHub Pages): https://nathaliavelasco.github.io/maquina-del-tiempo-/

- Usar en una tablet en horizontal. También funciona en celular.
- La partida queda guardada en el dispositivo. Para empezar de cero: en la línea de tiempo, pulsar dos veces **Reiniciar partida**.
- Para probar sin esperar el reloj de pistas, se puede bajar `pistasSegundos` en `js/contenido.js`.

## Estado

| Cámara | Estado |
|---|---|
| E1 · El Umbral del Trauma | Prototipo funcional |
| E2 · El Enigma del Vacío | Pendiente |
| E3 · El Taller del Cronógrafo | Pendiente |
| E4 · El Vínculo de Vigilancia | Pendiente |
| E5 · El Salto Temporal | Pendiente |

## Reglas de juego implementadas

- Recorrido obligatorio E1 → E2 → E3 → E4 → E5. Una cámara se abre solo al cerrar la anterior.
- 12 minutos por cámara, reloj visible. Al llegar a cero se pierde la bonificación pero se puede terminar.
- Puntaje por cámara: 20 puntos = códigos (4 + 4 + 4 + 2) + bonificación por tiempo (6 / 5 / 4 / 3).
- Cada código tiene 3 intentos con puntos. Después, el Guía puede **liberar** el código (0 puntos) para que la misión no se detenga, igual que haría el facilitador humano con un candado.
- Pistas en 3 niveles según el tiempo sin avanzar en un paso (2, 4 y 6 minutos). La tercera es directa y descuenta 1 punto.
- Mensajes de error según el tipo de equivocación, sin revelar la respuesta.
- Voz del guía con la síntesis de voz del navegador (botón SONIDO para silenciar).

## Estructura

```
index.html         Página
css/estilos.css    Diseño visual
js/contenido.js    TODO el contenido del juego: textos, pasos, pistas, códigos, debriefing
js/app.js          Lógica de la plataforma (no hace falta tocarla para cambiar contenido)
```

Las respuestas de los códigos no están escritas en claro en `contenido.js`: se guarda su huella (SHA-256). Para cambiar una respuesta hay que regenerar la huella.

## Pendientes de contenido (revisión con el cliente)

- Prueba 1.1: la tarjeta original pide "4 acciones del ABC", pero las fichas físicas son indicaciones de abdomen abierto. El prototipo sigue las fichas.
- Reporte de laparotomía: se retiraron las fechas (2005 / nacimiento 1988 no daban 38 años).
- Mecánica 1.1 decía impacto izquierdo; se unificó a derecho.
