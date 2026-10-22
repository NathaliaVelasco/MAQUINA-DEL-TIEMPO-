/* ==========================================================================
   MÁQUINA DEL TIEMPO · Código: Cirugía del Futuro
   CONTENIDO DEL JUEGO (textos que se ven y se escuchan)
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   --------------------------------------------------------------------------
   Aquí NO hay respuestas: los códigos se validan en el servidor.
   Fuente: PLATAFORMA_MAQUINA_DEL_TIEMPO_ABDOMEN_ABIERTO_2026
   ========================================================================== */

window.CONTENIDO = {
  juego: {
    titulo: 'MÁQUINA DEL TIEMPO',
    subtitulo: 'Código: Cirugía del Futuro',
    minutos: 12,
    pistasSegundos: [120, 240, 360],

    grupos: [
      { id: 'davinci', nombre: 'Alquimistas de Da Vinci', color: '#05dd4d', simbolo: '⚡', enfoque: 'Guiados por el dominio absoluto de la anatomía y la geometría de la pared abdominal.' },
      { id: 'verne',   nombre: 'Exploradores de Verne',   color: '#c98a4b', simbolo: '⚙', enfoque: 'Inspirados por la ingeniería fantástica y los viajes hacia las profundidades del tejido visceral.' },
      { id: 'wells',   nombre: 'Viajeros de Wells',       color: '#3d7bff', simbolo: '⌛', enfoque: 'Maestros en anticipar las complicaciones futuras y moldear la línea de tiempo del paciente.' },
      { id: 'tesla',   nombre: 'Guardianes de Tesla',     color: '#f2b233', simbolo: '✦', enfoque: 'Expertos en dominar las presiones, la física médica y la energía del vacío en la pared abdominal.' }
    ],

    roles: {
      piloto:     { nombre: 'Líder Piloto de Vuelo', subtitulo: 'Coordinación & Consenso Clínico', cupo: 1,
                    mision: ['Coordinar al equipo y marcar la estrategia de avance.', 'Guiar y validar las decisiones del consenso clínico.', 'Controlar el ritmo y el tiempo límite en cada estación.'] },
      copiloto:   { nombre: 'Copiloto', subtitulo: 'Custodio del Registro Manual', cupo: 1,
                    mision: ['Llevar el registro riguroso en el cuaderno de campo.', 'Anotar pistas, variables clínicas y deducciones del grupo.', 'Custodiar el historial físico de la misión.'] },
      comandante: { nombre: 'Comandante de Misión', subtitulo: 'Custodio Digital', cupo: 1,
                    mision: ['Custodiar y operar el celular de la Consola de Misión.', 'Digitar códigos de validación y claves numéricas obtenidas.', 'Confirmar y enviar los resultados en cada estación.'] },
      tripulante: { nombre: 'Tripulante de Élite', subtitulo: 'Especialista Hands-On & Análisis', cupo: 4,
                    mision: ['Inspeccionar minuciosamente el material táctico de la maleta.', 'Descifrar acertijos y analizar los casos clínicos.', 'Ejecutar las maniobras prácticas y el ensamblaje.'] }
    },

    autorizacion: 'Autorizo el tratamiento de mi nombre completo y mi profesión únicamente para registrar mi participación en esta experiencia académica, conforme a la Ley 1581 de 2012 de protección de datos personales. No se solicitan otros datos.',

    bienvenida: [
      'Bienvenidos, doctores. Deténganse un segundo justo ahí... en el umbral exacto donde el presente se encuentra con el futuro.',
      'Lo que ven a su alrededor no es una capacitación ordinaria: es la entrada a un laberinto temporal. A partir de este instante, el quirófano deja de ser un espacio rígido de cuatro paredes para convertirse en un nexo donde el tiempo se mide en decisiones de alta precisión.',
      'Hoy, un paciente masculino de 38 años acaba de ingresar a nuestro sistema tras un colapso masivo en carretera. En la línea de tiempo convencional, la de las prácticas del pasado, las decisiones apresuradas lo condenarían a un año de complicaciones: hernias gigantes, fístulas, infecciones o un abdomen congelado.',
      'Pero ustedes no están aquí para seguir el curso ordinario de la historia. Están aquí para cambiarla. Su Credencial de Misión los acredita ante los guardianes de cada cámara del laberinto. Y en esta Consola Digital de Misión registrarán los códigos, las claves de bioingeniería y las respuestas clínicas que descifren. Cada código correcto alterará el destino del paciente en tiempo real.'
    ],
    reglas: [
      'En cada estación encontrarán una serie de pistas en la maleta: enigmas clínicos, cajas con candados y la tecnología de Solventum.',
      'Tendrán 12 minutos por estación para explorar, resolver las pruebas y digitar sus códigos. Cada código tiene 2 intentos.',
      'El recorrido es en orden, de la Estación 1 a la 5. Si el reloj cierra la estación, esa estación no suma puntos.',
      'Cuestionen las técnicas del pasado. Confíen en su criterio clínico. No dejen que la rutina guíe sus manos.'
    ],
    portal: 'Estén atentos a la línea temporal del paciente porque el reloj empieza a correr. Doctores... ¡crucen el portal y protejan el mañana!',

    final: {
      mensaje: '¡MISIÓN CUMPLIDA!',
      detalle: 'Línea de tiempo quirúrgica completada con éxito. Cierre fascial y protección de la incisión validados.',
      frase: '¡Felicidades, Cronocirujanos! Han completado con éxito la línea de tiempo. Tras asegurar el cierre de la cavidad al verificar que la variación de presión en la vía aérea era menor a 4 mmHg y no requerir más lavados, protegieron la incisión con Prevena™. A -125 mmHg por 7 días, redujeron la tensión lateral, aislaron la contaminación externa y previnieron la infección del sitio quirúrgico y la hernia incisional. ¡El paciente de 38 años ha recuperado su futuro!'
    }
  },

  estaciones: [
    /* ====================================================================== E1 */
    {
      id: 'E1', numero: 1,
      nombre: 'El Umbral del Trauma', subtitulo: 'Fisura en la Línea de Vida',
      lugar: 'Urgencias · Hospital de alta complejidad',
      narrativa: 'El paciente de 38 años ingresa tras un accidente de tránsito de alta velocidad. Era el copiloto de un vehículo que recibió un impacto lateral del lado derecho; de las tres personas involucradas, es el único sobreviviente. Ingresa inmovilizado con tabla rígida y collar cervical, con dos yelcos #14 y 2 litros de cristaloides. Responde su nombre y edad, pero está confuso: Glasgow 14/15. Presenta marca del cinturón de seguridad y equimosis en hemitórax, flanco e hipocondrio derechos.',
      pruebas: [
        {
          id: '1.1', titulo: 'El Algoritmo del Diagnóstico', reto: 'El Algoritmo del Diagnóstico (ABC y Búsqueda de Signos)',
          situacionTitulo: 'Situación clínica inicial',
          situacion: [
            ['Paciente', 'Masculino de 38 años (copiloto, colisión lateral de alta energía).'],
            ['Estado al ingreso', 'Inmovilizado con tabla rígida y collar cervical. Canalizado con 2 yelcos #14 (ha recibido 2 L de cristaloides).'],
            ['Examen físico', 'Confuso (Glasgow 14/15), marca de cinturón de seguridad y equimosis en flanco e hipocondrio derecho.']
          ],
          mision: [
            ['Explorar la maleta', 'Encontrarán 10 Fichas de Acciones Clínicas.'],
            ['Seleccionar y ordenar la secuencia', 'Identifiquen únicamente las 6 acciones prioritarias correspondientes a la atención inicial de este paciente y ordénenlas en secuencia lógica.'],
            ['Solicitar información crítica', 'Los datos diagnósticos clave están sellados. Para recibirlos, el equipo debe tener colocada correctamente la secuencia de las 6 acciones y solicitar en voz alta los Signos Vitales y la Ecografía FAST.']
          ],
          atencion: 'No intenten adivinar el diagnóstico sin haber asegurado la vía aérea, la ventilación y la perfusión del paciente. El tiempo corre.',
          pantalla: [{ tipo: 'monitor', boton: 'SOLICITAR SIGNOS VITALES Y FAST',
            vitales: [['TA', '80/50', 'mmHg', 'alerta'], ['FC', '130', 'lpm', 'alerta'], ['T°', '34.8', '°C', 'destacar'], ['Glasgow', '14', '/15', '']],
            imagen: ['Ecografía FAST', 'POSITIVA (+)', 'Líquido libre en espacio hepatorrenal (Morison) y en toda la cavidad abdominal. Compatible con hemoperitoneo masivo.'],
            nota: 'Sin respuesta a 2 L de cristaloides: shock refractario.',
            voz: 'Signos vitales: tensión arterial ochenta sobre cincuenta. Frecuencia cardíaca ciento treinta. Temperatura treinta y cuatro punto ocho grados. Ecografía FAST positiva: líquido libre en Morison y en toda la cavidad.' }],
          codigo: { pregunta: 'Tras analizar los resultados de los exámenes y confirmar el estado de shock refractario del paciente, ¿cuál es el código del hallazgo ecográfico que confirma el hemoperitoneo y justifica la laparotomía de urgencia inmediata?', formato: 'Sigla del examen + signo matemático de positividad', placeholder: 'XXXX±' },
          pistas: ['Pregúntense: si cierran hoy esta pared, ¿qué le pasa al paciente en las próximas 24 horas?',
                   'Busquen la Tríada Letal, el Síndrome Compartimental Abdominal, el edema que impide cerrar sin tensión, el packing con second-look y la necesidad de reevaluar perfusión.',
                   'El código combina el nombre del examen de trauma con el signo de un resultado positivo.']
        },
        {
          id: '1.2', titulo: 'El Enigma de la Tríada de la Muerte', reto: 'El Enigma de la Tríada de la Muerte (Shock Refractario)',
          situacionTitulo: 'Situación clínica en curso',
          situacion: [
            ['Estado crítico', 'El paciente no responde a los 2 litros de cristaloides administrados en el traslado.'],
            ['Parámetros obtenidos', 'Tensión Arterial 80/50 mmHg | Frecuencia Cardíaca 130 lpm | Temperatura 34.8 °C.'],
            ['Hallazgo por imagen', 'Ecografía FAST positiva (+) en espacio hepatorrenal (Morison) y cavidad, compatible con hemoperitoneo masivo.']
          ],
          mision: [
            ['Identificar las 3 fichas de la Tríada', 'Ubiquen las 3 Fichas de Componentes Fisiológicos de la Tríada Letal: Hipotermia · Acidosis / Shock Refractario · Coagulopatía / Hemoperitoneo.'],
            ['Completar la Tríada Letal', 'Relacionen cada ficha con el parámetro clínico del paciente: Hipotermia con la T° 34.8 °C; Acidosis / Shock Refractario con la TA 80/50 y la no respuesta a cristaloides; Coagulopatía / Hemoperitoneo con el líquido libre en FAST.'],
            ['Deducir y desbloquear el candado', 'Observen los dígitos marcados en color azul en la tarjeta de la Temperatura. Componen la combinación de 3 dígitos del candado de la Caja de Madera, que da acceso a la fase quirúrgica.']
          ],
          atencion: 'Hipotermia, acidosis y coagulopatía se alimentan entre sí. Si no rompen el círculo, ninguna sutura salvará a este paciente.',
          codigo: { pregunta: 'Para registrar el desbloqueo de la caja de seguridad y validar el hallazgo de la Tríada Letal: ¿cuál es la combinación de 3 dígitos utilizada para abrir el candado, derivada de la temperatura corporal crítica del paciente?', formato: 'Únicamente los 3 dígitos numéricos, sin puntos ni espacios', placeholder: '_ _ _', candado: true },
          pistas: ['¿Cuál de los tres componentes de la Tríada pueden leer directamente en los datos que ya tienen?',
                   'La hipotermia está definida por debajo de 35 °C.',
                   'Miren los dígitos en azul de la tarjeta de temperatura, sin el punto decimal.']
        },
        {
          id: '1.3', titulo: 'La Decisión de Control de Daños', reto: 'Matriz de Decisión Quirúrgica y Control de Daños',
          situacionTitulo: 'Situación intraoperatoria (reporte de laparotomía)',
          situacion: [
            ['Hallazgos', 'Lesión hepática Grado IV (sangrante), hemoperitoneo masivo de 2,5 L, desgarro de epiplón sin sangrado activo y edema severo de asas intestinales.'],
            ['Objetivo de la misión', 'Definir el plan conductual inmediato para detener el colapso hemodinámico y evitar la pérdida del dominio abdominal.']
          ],
          mision: [
            ['Evaluar las fichas', 'Encontrarán 7 Fichas de Conductas Quirúrgicas, cada una etiquetada con un número en su esquina superior.'],
            ['Filtrar y matriciar', 'Seleccionen únicamente las 4 Conductas Correctas de Control de Daños indicadas para este escenario crítico y descarten las 3 alternativas inadecuadas o de riesgo.'],
            ['Sumar y deducir el código clínico', 'Sumen los valores numéricos de las 4 fichas correctas. El resultado corresponde al código de volumen que valida el control del hemoperitoneo.']
          ],
          atencion: 'Prolongar la cirugía para realizar resecciones regladas o intentar cerrar a tensión una pared edematizada conducirá a la falla orgánica irreversible.',
          pantalla: [{ tipo: 'documento', titulo: 'Reporte Quirúrgico · Laparotomía de Urgencia', encabezado: 'Historia clínica n.º 0508 · Santiago Piedrahita · 38 años',
            lineas: [['Hallazgos', 'Lesión hepática grado IV (hipocondrio derecho).'], ['', 'Hemoperitoneo masivo: 2.500 cc.'], ['', 'Desgarro de epiplón sin sangrado activo.'], ['', 'Edema severo de asas intestinales.'], ['Procedimiento', 'Empaquetamiento (packing) hepático y control de daños inicial.']] }],
          codigo: { pregunta: 'Tras clasificar las 4 conductas quirúrgicas de control de daños correctas: ¿cuál es el valor numérico resultante de la suma de sus fichas, que equivale al volumen crítico (en decilitros) del hemoperitoneo evacuado?', formato: 'Únicamente el valor numérico final de dos dígitos', placeholder: '_ _' },
          pistas: ['La cirugía de control de daños tiene un objetivo inmediato: detener la hemorragia y la contaminación en el menor tiempo posible.',
                   'Descarten todo lo que alargue la cirugía o cierre la pared.',
                   'El resultado debe coincidir con el volumen del reporte, expresado en decilitros.']
        }
      ],
      clave: { id: '1.4', titulo: 'Clave combinada de salida', pregunta: 'Revisen la bitácora: a la combinación del candado de la Tríada (1.2) réstenle la suma de Conducta CCD (1.3).', formato: 'Valor numérico de tres dígitos', placeholder: '_ _ _' },
      desbloqueo: { titulo: '¡CÓDIGO DE TRASLADO AUTORIZADO!', texto: 'Paciente estabilizado hemodinámicamente con empaquetamiento hepático y abdomen abierto. Avanzando a Estación 2: El Enigma del Vacío.' },
      cierre: 'Excelente trabajo, Cronocirujanos. Identificaron con precisión que un shock refractario por lesión hepática Grado IV con 2,5 L de hemoperitoneo e hipotermia severa de 34,8 °C exigía una Cirugía de Control de Daños inmediata. La decisión de empaquetar y mantener el abdomen abierto es la única opción que evita el colapso fisiológico del paciente en esta línea de tiempo. Ahora, crucen el portal hacia la Estación 2: El Enigma del Vacío, donde deberán definir la tecnología exacta para preservar esta pared abdominal.'
    },

    /* ====================================================================== E2 */
    {
      id: 'E2', numero: 2,
      nombre: 'El Enigma del Vacío', subtitulo: 'Las 9 Claves de la Pared Temporal',
      lugar: 'Quirófano · Laparotomía abreviada',
      narrativa: 'Con la decisión de mantener el abdomen abierto tras la laparotomía abreviada, los Cronocirujanos deben evitar la retracción aponeurótica, la pérdida del dominio abdominal, las fístulas y las infecciones. Deben descifrar las 9 funciones ideales del sistema de cierre temporal del abdomen y descartar las técnicas artesanales del pasado.',
      pruebas: [
        {
          id: '2.1', titulo: 'El Filtro de Bioingeniería', reto: 'El Filtro de Bioingeniería (Descifrar las 9 Funciones Ideales)',
          situacionTitulo: 'Situación clínica en curso',
          situacion: [
            ['Escenario', 'El paciente ha sido estabilizado mediante Cirugía de Control de Daños (CCD) y empaquetamiento hepático. Se encuentra con el abdomen abierto.'],
            ['Objetivo de la misión', 'Identificar los criterios científicos que debe cumplir el dispositivo ideal de Cierre Temporal del Abdomen (TPN comercial) para preservar el dominio fascial y evitar complicaciones catastróficas a 1 año.']
          ],
          mision: [
            ['Explorar y depurar', 'Encontrarán 13 Fichas de Funciones de Cierre Temporal. Cuatro (4) de ellas contienen premisas falsas o prácticas artesanales de alto riesgo.'],
            ['Filtrar y organizar', 'Descarten las 4 fichas distractoras y seleccionen únicamente las 9 Funciones Verdaderas del Dispositivo Ideal (basadas en la evidencia del Consenso). Ubíquenlas sobre la plantilla del tablero.'],
            ['Verificar el ensamble', 'Una vez posicionadas las 9 fichas, gírenlas con cuidado por el respaldo. Si la selección es 100% correcta, el reverso revelará la figura del Logo de Embajadores junto con el código alfanumérico de validación.']
          ],
          atencion: 'La elección de un sistema artesanal o inadecuado provocará la pérdida irreversible del dominio fascial y fístulas enterocutáneas en la línea temporal del paciente.',
          codigo: { pregunta: 'Tras descartar los mitos del pasado y encajar las 9 funciones esenciales de la Terapia de Presión Negativa comercial en el tablero de bioingeniería: ¿cuál es el código alfanumérico revelado en el reverso del ensamble que confirma el dominio fascial?', formato: 'Código alfanumérico de 2 caracteres', placeholder: '_ _' },
          pistas: []
        },
        {
          id: '2.2', titulo: 'La Guerra de Tecnologías', reto: 'La Guerra de Tecnologías (AbThera™ vs. Bolsa de Bogotá y Barker)',
          situacionTitulo: 'Situación clínica en curso',
          situacion: [
            ['Desafío técnico', 'Con las 9 funciones ideales identificadas, el equipo debe evaluar las opciones de Cierre Temporal del Abdomen disponibles en el arsenal quirúrgico.'],
            ['Objetivo de la misión', 'Comparar la eficacia clínica de cada tecnología, descifrar la combinación del candado y acceder al contenedor de suministros avanzados.']
          ],
          mision: [
            ['Analizar y cruzar las 10 fichas', 'Encontrarán 7 Fichas de Limitaciones junto con 3 alternativas quirúrgicas. Agrupen las fichas con las 3 alternativas siguiendo la tabla de las 9 funciones.'],
            ['Deducir el código del candado', 'Contabilicen cuántas de las 9 funciones ideales cumple cada alternativa. Dígito 1: Bolsa de Bogotá. Dígito 2: Técnica de Barker. Dígito 3: Terapia AbThera™.'],
            ['Abrir la caja', 'Ingresen la combinación en el candado de la Caja de Madera para extraer la Tarjeta de Selección del Dispositivo y las 4 Fichas de Relevancia Clínica Directa.']
          ],
          atencion: 'Elegir una alternativa con bajo cumplimiento de funciones incrementará el riesgo de retracción fascial, pérdida del espacio peritoneal y desarrollo de fístulas enterocutáneas.',
          codigo: { pregunta: 'Para validar el análisis comparativo de tecnologías y desbloquear la caja de suministros avanzados: ¿cuál es la combinación de 3 dígitos obtenida al evaluar el cumplimiento de las 9 funciones ideales en la Bolsa de Bogotá, la Técnica de Barker y la Terapia AbThera™ (en ese orden exacto)?', formato: 'Únicamente los 3 dígitos, sin espacios ni guiones, en el orden de las alternativas', placeholder: '_ _ _', candado: true },
          pistas: []
        },
        {
          id: '2.3', titulo: 'La Matriz Focalizada para Trauma', reto: 'La Matriz Focalizada para Trauma',
          situacionTitulo: 'Situación clínica en curso',
          situacion: [
            ['Requerimiento específico', 'Paciente masculino de 38 años en shock, con empaquetamiento por lesión hepática Grado IV y 2,5 L de hemoperitoneo evacuado.'],
            ['Objetivo de la misión', 'Aunque las 9 funciones de bioingeniería son ideales, el escenario de este paciente exige priorizar de inmediato las 5 necesidades vitales específicas para evitar la pérdida del dominio abdominal.']
          ],
          mision: [
            ['Seleccionar las 5 necesidades críticas', 'Identifiquen las 5 Fichas Relevantes para el trauma específico de este paciente junto con sus 5 justificaciones.'],
            ['Formar parejas', 'Organicen las fichas en parejas uniendo la relevancia con la justificación. Al posicionar correctamente las 10 fichas, observen los valores grabados junto al símbolo AbThera™ en el reverso: la suma de sus valores revela el código.'],
            ['Carta de cierre', 'Al descubrir el código, soliciten al Guía Especialista la carta de cierre.']
          ],
          atencion: 'Errar en la priorización del drenaje o descuidar la tracción medial activa condenará al paciente a un abdomen congelado e imposible de cerrar.',
          codigo: { pregunta: 'Tras priorizar las 5 funciones vitales de la Terapia AbThera™ para el control del empaquetamiento hepático y la tracción fascial: ¿cuál es el código numérico de validación obtenido, que representa el porcentaje adicional de afrontamiento y movilización fascial frente a otros sistemas?', formato: 'Únicamente el número de 2 dígitos', placeholder: '_ _' },
          pistas: []
        }
      ],
      clave: { id: '2.4', titulo: 'Clave final combinada', pregunta: 'Revisen sus apuntes: a la respuesta de la prueba 2.2 réstenle la respuesta de la prueba 2.3.', formato: 'Valor numérico de tres dígitos', placeholder: '_ _ _' },
      desbloqueo: { titulo: '¡TRANSFERENCIA A QUIRÓFANO AUTORIZADA!', texto: 'Criterios de bioingeniería validados y dominio fascial preservado. Avanzando a la Estación 3: listos para la calibración quirúrgica.' },
      cierre: 'Extraordinario, Cronocirujanos. Han demostrado por qué las alternativas del pasado, como la Bolsa de Bogotá o la Técnica de Barker, llevan al paciente a la pérdida de dominio fascial y a adherencias severas. Frente a otras técnicas, es fundamental resaltar la reducción del riesgo de formación de adherencias: un dispositivo comercial ensamblado con materiales diseñados específicamente para su función y respaldado por evidencia científica que demuestra su seguridad en el manejo de nuestros pacientes. En nuestro paciente con empaquetamiento hepático, la Terapia AbThera™ no solo drena efluentes, sino que vigila activamente el resangrado y mantiene la tensión medial. Un paso firme hacia la Estación 3 para el ensamblaje práctico.'
    },

    /* ====================================================================== E3 */
    {
      id: 'E3', numero: 3,
      nombre: 'El Taller del Cronógrafo', subtitulo: 'Calibración Quirúrgica del Abdomen',
      lugar: 'Quirófano simulado · Hands-On',
      narrativa: 'Fase práctica sobre el modelo anatómico. Los participantes ejecutan la secuencia de ensamble del sistema de presión negativa para abdomen abierto AbThera™. Un error de colocación, un corte erróneo de la lámina protectora o una fuga en la película adhesiva generará una falla de vacío.',
      pruebas: [
        {
          id: '3.1', titulo: 'El Rompecabezas de la Secuencia Quirúrgica', reto: 'Secuencia Quirúrgica (Los 8 Pasos)',
          situacionTitulo: 'Situación clínica y técnica',
          situacion: [
            ['Escenario', 'El paciente con empaquetamiento hepático y abdomen abierto está listo en el quirófano simulado.'],
            ['Objetivo de la misión', 'Antes del ensamble práctico (Hands-On) sobre el modelo anatómico, estructurar la secuencia exacta de colocación de la Terapia AbThera™, garantizando la protección visceral, la remoción eficiente de efluentes y un sellado hermético sin errores técnicos.']
          ],
          mision: [
            ['Evaluar las fichas de secuencia', 'Encontrarán 12 fichas para ordenar y clasificar.'],
            ['Seleccionar y ordenar los 8 pasos', 'Descarten los errores técnicos y ordenen únicamente los 8 Pasos Correctos de la Secuencia, formando un rectángulo de 4 parejas (2 × 4).'],
            ['Verificar el ensamble posterior', 'Giren las 8 fichas por el respaldo. Si la secuencia es correcta, la imagen ensamblada revelará el código alfanumérico que confirma la precisión procedimental.']
          ],
          atencion: 'Alterar el orden de los pasos o cometer omisiones en el manejo de la lámina fenestrada comprometerá la viabilidad de las asas intestinales y provocará fallas en el vacío.',
          codigo: { pregunta: 'Tras descartar los errores procedimentales y organizar los 8 pasos clave de la secuencia de colocación de la Terapia AbThera™: ¿cuál es el código alfanumérico que se revela en el respaldo del ensamble y confirma la precisión procedimental?', formato: 'Código alfanumérico de 2 caracteres', placeholder: '_ _' },
          pistas: []
        },
        {
          id: '3.2', titulo: 'El Desafío Psicomotriz Hands-On', reto: 'Corte, Ajuste de Insumos y Monitoreo de Alarmas',
          situacionTitulo: 'Escenario',
          situacion: [
            ['Escenario', 'La secuencia procedimental está validada. Es momento de pasar de la teoría a la práctica sobre el modelo anatómico.'],
            ['Objetivo de la misión', 'Realizar la colocación limpia de la Terapia AbThera™, liberar el instrumental mediante el código de física médica y responder a la gestión de alarmas del sistema.']
          ],
          mision: [
            ['Asignación de roles para el Hands-On', 'Operador 1 (Protección Visceral): mide y adapta la Lámina Protectora Visceral al tamaño del abdomen; corta en medio del cuadrado de espuma, entre los sellos, sin exponer nunca las espumas, y retira los sobrantes. Operador 2 (Espuma de Vacío): adapta y conforma los apósitos de espuma al lecho de la laparotomía. Operador 3 (Sellado e Interfaz): coloca el adhesivo superando los bordes de la herida sin arrugas ni desperdicio y realiza el corte central de 2,5 cm con la plantilla blanca del SensaT.R.A.C.™. Operador 4 (Conectividad y Vacío): acopla el Cánister Grande de 1.000 cc y verifica la permeabilidad de las líneas (clamps abiertos).'],
            ['Deducir el código', 'Para que el Guía Especialista les entregue el sobre de cierre, calculen y reciten en voz alta el código de 3 dígitos. Dígito 1: capacidad mínima del Cánister de Trauma. Dígito 2: número obligatorio de apósitos de poliuretano azules. Dígito 3: número de alarmas que genera el equipo.'],
            ['Finalización del ensamble y protocolo de alarmas', 'Con el sobre abierto, lean la pregunta de la tarjeta y escuchen atentamente al Guía Especialista.']
          ],
          atencion: '',
          codigo: { pregunta: '¿Cuál es el código de 3 dígitos comunicado al Guía Especialista?', formato: 'Código numérico de 3 dígitos', placeholder: '_ _ _' },
          pistas: []
        }
      ],
      clave: { id: '3.3', titulo: 'Clave final combinada', pregunta: 'Revisen la bitácora: al código del Hands-On (3.2) réstenle el número de pasos de la secuencia de precisión (3.1).', formato: 'Valor numérico de tres dígitos', placeholder: '_ _ _' },
      desbloqueo: { titulo: '¡SELLADO HERMÉTICO Y TERAPIA ACTIVA VERIFICADOS!', texto: 'Presión de -125 mmHg continua lograda sin fugas. Traslado seguro del paciente hacia la Unidad de Cuidado Intensivo. Avanzando a la Estación 4.' },
      cierre: 'Técnica impecable, Cronocirujanos. Recuerden siempre las tres reglas de oro en trauma: el cánister debe ser de gran capacidad, 1.000 cc, debido al alto volumen de efluentes; nunca dejar en contacto las espumas con las asas intestinales; y siempre usar los 2 apósitos de poliuretano azules, el primero a nivel de aponeurosis y el segundo a nivel de la piel. Con el sistema sellado herméticamente a -125 mmHg y las líneas permeables sin fugas ni alarmas, nuestro paciente pasa de forma segura a la UCI para la fase de reanimación metabólica. Sigamos a la Estación 4.'
    },

    /* ====================================================================== E4 */
    {
      id: 'E4', numero: 4,
      nombre: 'El Vínculo de Vigilancia', subtitulo: 'El Radar de la UCI',
      lugar: 'Unidad de Cuidados Intensivos · 24 a 72 horas',
      narrativa: 'El paciente es trasladado a la Unidad de Cuidados Intensivos bajo Terapia de Presión Negativa. Los Cronocirujanos deben configurar el monitoreo clínico dual —variables del paciente e indicadores de la TPN— en la ventana crítica de 24 a 72 horas para prevenir complicaciones del abdomen abierto.',
      pruebas: [
        {
          id: '4.1', titulo: 'El Monitor Dual', reto: 'El Monitor Dual (Monitoreo Paciente vs. Sistema)',
          situacionTitulo: 'Situación clínica en UCI',
          situacion: [
            ['Escenario', 'El paciente ha ingresado a la UCI con la Terapia AbThera™ instalada y funcionando. Se inicia la fase de reanimación metabólica y vigilancia activa.'],
            ['Objetivo de la misión', 'Clasificar los parámetros de monitoreo crítico separando las variables fisiológicas del paciente de los indicadores de funcionamiento del sistema, descartando distracciones de manejo.']
          ],
          mision: [
            ['Explorar los cubos', 'Encontrarán un conjunto de cubos con variables clínicas e indicadores de monitoreo. Identifiquen y descarten los cubos trampa que no corresponden al manejo prioritario de este paciente.'],
            ['Clasificar las 9 variables en el tablero dual', 'Organicen los 9 cubos verdaderos en las dos columnas: Paciente y Sistema. Observen los costados señalados con el símbolo del programa Embajadores y alineen sus letras para formar la palabra de validación institucional.']
          ],
          atencion: 'Confundir las variables de monitoreo del sistema con las del paciente puede enmascarar un choque hemorrágico persistente o una pérdida involuntaria de vacío.',
          codigo: { pregunta: 'Tras descartar las variables incorrectas y clasificar las 6 dimensiones del paciente y las 3 del sistema AbThera™: ¿cuál es la palabra clave revelada al alinear las letras de los 9 cubos?', formato: 'Únicamente la palabra, en mayúsculas y sin espacios', placeholder: 'PALABRA' },
          pistas: []
        },
        {
          id: '4.2', titulo: 'La Ventana Temporal', reto: 'La Ventana Temporal (El Estándar de las 72 Horas y Excepciones)',
          situacionTitulo: 'Situación clínica en UCI',
          situacion: [
            ['Desafío técnico', 'El paciente continúa con abdomen abierto y Terapia AbThera™ instalada. Es necesario determinar el intervalo óptimo para la reprogramación quirúrgica y reconocer los eventos que exigen interrumpir la ventana temporal.'],
            ['Objetivo de la misión', 'Identificar la ventana máxima estándar de revisión, seleccionar las 4 excepciones críticas de reintervención no programada y descifrar la combinación del candado de 4 dígitos.']
          ],
          mision: [
            ['Marcar el tiempo estándar', 'En el Tablero de Tiempos de esta pantalla, identifiquen el intervalo máximo recomendado entre revisiones de la cavidad abdominal sin complicaciones y fijen el adhesivo con el símbolo «S» de Solventum sobre la opción correcta.'],
            ['Depurar la lista de excepciones', 'Analicen las 7 situaciones de esta pantalla y descarten las 3 trampas o de manejo a pie de cama. Aíslen únicamente las 4 Excepciones Críticas que obligan a reintervenir antes de la ventana programada y tomen nota de sus valores.'],
            ['Construir la clave de 4 dígitos', 'Dígito 1: primer dígito del tiempo estándar en horas. Dígito 2: segundo dígito del tiempo estándar en horas. Dígito 3: cantidad de excepciones críticas identificadas. Dígito 4: suma de los valores de las 4 excepciones críticas.']
          ],
          atencion: 'Sobrepasar el límite de horas sin revisar la cavidad incrementa exponencialmente el riesgo de adherencias complejas y pérdida irreversible de la pared abdominal.',
          pantalla: [
            { tipo: 'tablero', titulo: 'Tablero de tiempos · Revisión de cavidad', columnas: ['INTERVALO', 'DESTINO', 'ESTADO'],
              filas: [['6 H', 'Revisión de cavidad', 'PROGRAMADO'], ['12 H', 'Revisión de cavidad', 'PROGRAMADO'], ['24 H', 'Revisión de cavidad', 'PROGRAMADO'], ['48 H', 'Revisión de cavidad', 'PROGRAMADO'], ['72 H', 'Revisión de cavidad', 'PROGRAMADO'], ['96 H', 'Revisión de cavidad', 'PROGRAMADO'], ['7 DÍAS', 'Revisión de cavidad', 'PROGRAMADO']],
              instruccion: 'Toquen una fila para fijar el adhesivo «S» de Solventum.' },
            { tipo: 'fichas', titulo: 'Situaciones en UCI', instruccion: 'Cada situación tiene un valor. Solo 4 son excepciones críticas.',
              items: [['Sangrado no controlado', '3'], ['Sospecha de fuga intestinal', '1'], ['Isquemia intestinal', '2'], ['Equipo disfuncional', '3'], ['Aumento de la presión abdominal de 2 mmHg', '8'], ['Alarma de fuga en el sistema', '7'], ['Temperatura corporal de 38,3 °C', '5']] }
          ],
          codigo: { pregunta: 'Para registrar el intervalo de revisión en UCI y desbloquear el cofre de complicaciones y bondades: ¿cuál es la combinación de 4 dígitos del candado (horas estándar + n.º de excepciones + suma de valores)?', formato: 'Código numérico de 4 dígitos, sin espacios', placeholder: '_ _ _ _', candado: true },
          pistas: []
        },
        {
          id: '4.3', titulo: 'La Balanza Clínica', reto: 'La Balanza Clínica (Complicaciones vs. Beneficios TPN)',
          situacionTitulo: 'Situación clínica en UCI',
          situacion: [
            ['Escenario', 'Tras abrir la caja con el Kit de Matriz, el equipo debe consolidar el criterio clínico para la prevención de eventos adversos catastróficos en el paciente con abdomen abierto.'],
            ['Objetivo de la misión', 'Relacionar cada una de las 5 complicaciones fisiopatológicas del abdomen abierto con el beneficio terapéutico específico de la Terapia de Presión Negativa (AbThera™) que la previene o mitiga.']
          ],
          mision: [
            ['Construir las 5 parejas clínicas', 'Encontrarán 5 Fichas de Complicaciones del Abdomen Abierto y 5 Fichas de Beneficios Terapéuticos de la TPN. Emparejen cada complicación con el beneficio que la neutraliza.']
          ],
          atencion: 'Errar en el emparejamiento conceptual dejará desprotegida la cavidad frente a complicaciones catastróficas como fístulas o pérdida definitiva del dominio fascial.',
          codigo: { pregunta: 'Tras consolidar el emparejamiento de la matriz clínica: ¿cuál es el valor resultante de sumar la cantidad total de complicaciones más la cantidad total de bondades terapéuticas integradas en la balanza?', formato: 'Únicamente el valor numérico de 2 dígitos', placeholder: '_ _' },
          pistas: []
        }
      ],
      clave: { id: '4.4', titulo: 'Clave final combinada', pregunta: 'Sumen la respuesta de la prueba 4.2 y la respuesta de la prueba 4.3.', formato: 'Valor numérico de cuatro dígitos', placeholder: '_ _ _ _' },
      desbloqueo: { titulo: '¡CONTROL TEMPORAL Y MONITOREO INTENSIVO VERIFICADOS!', texto: 'Matriz de complicaciones neutralizada y ventana de revisión a 72 horas establecida. El equipo ha demostrado dominio completo de la Terapia AbThera™ en UCI.' },
      cierre: '¡Excelente monitoreo, Cronocirujanos! Nunca olviden la regla de oro: la revisión máxima de la cavidad es a las 72 horas, a menos que se presente sangrado no controlado, fuga intestinal, isquemia o una falla irreversible del equipo. En este paciente con trauma complejo por estallido hepático, el uso oportuno y adecuado de la TPN fue la clave para controlar el alto volumen de efluentes, mitigar el edema de asas y prevenir la retracción aponeurótica. Con el paciente estabilizado en UCI y la ventana quirúrgica bajo control, estamos listos para avanzar a la Estación 5: el cierre y la protección de la incisión.'
    },

    /* ====================================================================== E5 */
    {
      id: 'E5', numero: 5,
      nombre: 'El Salto Temporal', subtitulo: 'Sellado e Incisión de Alta Tensión',
      lugar: 'Quirófano de reingreso',
      narrativa: 'Tras la estabilización del edema visceral y la resolución del shock, el paciente está listo para el intento de cierre fascial definitivo. El trauma blando por la desaceleración y la incisión de alta tensión representan un alto riesgo de infección del sitio operatorio y dehiscencia.',
      pruebas: [
        {
          id: '5.1', titulo: 'El Check-List para el Cierre Definitivo', reto: 'El Check-List para el Cierre Definitivo (Los 4 Factores)',
          situacionTitulo: 'Situación clínica en quirófano de reingreso',
          situacion: [
            ['Escenario', 'El paciente ha superado la etapa crítica, la reanimación metabólica fue exitosa y el edema de las asas intestinales ha cedido. Ha llegado el momento de reingresar a quirófano y decidir si es posible el cierre fascial definitivo.'],
            ['Objetivo de la misión', 'Auditar los criterios clínicos y fisiológicos de la pared abdominal para confirmar si el paciente cumple estrictamente con los 4 factores requeridos para un cierre fascial primario seguro.']
          ],
          mision: [
            ['Revisar las opciones', 'Exploren la lista de criterios del Tablero Check-List de esta pantalla. Descarten los factores de riesgo e incompatibilidad quirúrgica.'],
            ['Seleccionar los 4 factores con el logo de Embajadores', 'Fijen el distintivo del programa Embajadores sobre los 4 Factores Críticos de Cierre y ordenen sus letras correspondientes.']
          ],
          atencion: 'Intentar un cierre fascial forzado con variaciones de la presión de la vía aérea superiores a 4 mmHg pondrá al paciente en riesgo de falla ventilatoria e hipertensión abdominal.',
          pantalla: [
            { tipo: 'checklist', titulo: 'Tablero Check-List de Quirófano', instruccion: 'Toquen un criterio para fijar el distintivo de Embajadores.',
              items: [['S', 'Presencia de secreción purulenta en el lecho.'],
                      ['C', 'Control del foco de contaminación.'],
                      ['M', 'Variación de la presión de la vía aérea basal mayor a 4 mmHg al afrontar los bordes de la fascia.'],
                      ['A', 'Reconstitución del tracto gastrointestinal (ostomía o anastomosis).'],
                      ['Y', 'Pérdida del dominio de la pared.'],
                      ['R', 'Resolución del caso sin necesidad de nuevos lavados ni revisiones de la cavidad.'],
                      ['B', 'Necesidad programada de un nuevo acceso a la cavidad abdominal.'],
                      ['E', 'Variaciones en las presiones de la vía aérea menores de 4 mmHg al afrontar los bordes de la fascia: cierre con bajo riesgo de falla ventilatoria e hipertensión abdominal.']] }
          ],
          codigo: { pregunta: 'Tras auditar el estado del paciente y validar los 4 factores necesarios para el cierre fascial definitivo: ¿cuál es la palabra clave revelada por la secuencia de los criterios seleccionados?', formato: 'Únicamente la palabra de 4 letras, en mayúsculas', placeholder: '_ _ _ _' },
          pistas: []
        },
        {
          id: '5.2', titulo: 'El Enigma de la Herida Quirúrgica', reto: 'El Enigma de la Herida Quirúrgica (Tensión y Prevena™)',
          situacionTitulo: 'Situación clínica en quirófano',
          situacion: [
            ['Escenario', 'Con los 4 criterios validados, la fascia del paciente ha sido afrontada. Al tratarse de un cierre de pared con alta tensión, el paciente presenta un riesgo extremadamente elevado de infección del sitio quirúrgico (ISQ), seroma, hematoma y dehiscencia.'],
            ['Objetivo de la misión', 'Obtener e instalar el Sistema de Manejo Incisional Prevena™ sobre la herida cerrada para proteger la línea de sutura, descifrando los parámetros técnicos de la unidad.']
          ],
          mision: [
            ['Evaluar el riesgo de la herida cerrada', 'Analicen las características de la línea de incisión tras la aproximación fascial de alta tensión. Consulten el Archivo Técnico Prevena™ de esta pantalla.'],
            ['Descifrar el código', 'Dígitos 1, 2 y 3: magnitud absoluta de la presión negativa continua prescrita para el manejo de la incisión. Dígito 4: número de días continuos de terapia que entrega la unidad portátil Prevena™.'],
            ['Desbloquear y colocar el dispositivo', 'Ingresen la combinación en el candado para acceder a la unidad Prevena™ y realicen el ensamble sobre el modelo de la incisión cerrada. Anoten el código en la bitácora: lo necesitarán para activar la app Prevena™.']
          ],
          atencion: 'Anticiparse al riesgo cambia los resultados. La terapia de presión negativa incisional ayuda a reducir complicaciones de la herida y a proteger la recuperación del paciente.',
          pantalla: [
            { tipo: 'archivo', titulo: 'Archivo Técnico · Prevena™', instruccion: 'Parámetros de la unidad portátil de manejo incisional.',
              items: [['Modo de terapia', 'Presión negativa continua'], ['Presión de trabajo', '-125 mmHg'], ['Duración de la terapia', 'Hasta 7 días continuos'], ['Indicación', 'Incisiones cerradas de alto riesgo'], ['Unidad', 'Portátil, de un solo uso']] }
          ],
          codigo: { pregunta: 'Para validar la protección de la incisión cerrada de alta tensión y abrir la caja del sistema Prevena™ (presión continua + días de terapia): ¿cuál es el código de 4 dígitos del candado?', formato: 'Únicamente el número de 4 dígitos, sin espacios', placeholder: '_ _ _ _', candado: true },
          pistas: []
        },
        {
          id: '5.3', titulo: 'La Coraza Biológica', reto: 'El Algoritmo Interactivo de Prevena™',
          situacionTitulo: 'Situación clínica en quirófano',
          situacion: [
            ['Escenario', 'El sistema Prevena™ ha sido activado y posicionado sobre la herida de laparotomía cerrada de alta tensión.'],
            ['Objetivo de la misión', 'Activar la app Prevena™, ejecutar la secuencia paso a paso de colocación digital y consolidar los 6 beneficios clínicos demostrados que reducen la morbilidad de la incisión de alto riesgo.']
          ],
          mision: [
            ['Desbloquear la app Prevena™', 'Abran la app Prevena™ en uno o varios celulares de la tripulación e ingresen el código de activación de la prueba 5.2. Sigan las instrucciones en pantalla: preparación del lecho incisional, posicionamiento del apósito, sellado de bordes y activación del vacío.'],
            ['Consolidar las ventajas clínicas', 'Al completar el flujo, la app desplegará la evidencia sobre el manejo de la incisión de laparotomía. Verifiquen las ventajas clave alcanzadas y registren sus símbolos en la bitácora.']
          ],
          atencion: 'No esperen la complicación para actuar. En laparotomías de alta tensión, la protección de la incisión es una decisión crítica desde el cierre.',
          pantalla: [{ tipo: 'prevena' }],
          codigo: { pregunta: 'Tras completar el paso a paso en la app Prevena™ y revisar la evidencia clínica: ¿cuál es la cantidad total de beneficios clínicos verificados que aporta la terapia Prevena™ sobre la incisión de alto riesgo?', formato: 'Únicamente el número de 1 dígito', placeholder: '_' },
          pistas: []
        }
      ],
      clave: { id: '5.4', titulo: 'Clave final · Hito histórico', pregunta: 'Unan, en el orden en que aparecen en la app Prevena™, los símbolos de las ventajas clínicas. Esa secuencia es el hito histórico que sella la línea de tiempo.', formato: 'Letras y números juntos, sin espacios', placeholder: '_ _ _ _ _ _' },
      desbloqueo: { titulo: '¡LÍNEA DE TIEMPO SELLADA!', texto: 'Cierre fascial definitivo y protección de la incisión validados.' },
      cierre: '¡Felicidades, Cronocirujanos! Han completado con éxito la línea de tiempo. Tras asegurar el cierre de la cavidad al verificar que la variación de presión en la vía aérea era menor a 4 mmHg y no requerir más lavados, protegieron la incisión con Prevena™. A -125 mmHg por 7 días, redujeron la tensión lateral, aislaron la contaminación externa y previnieron la infección del sitio quirúrgico y la hernia incisional. ¡El paciente de 38 años ha recuperado su futuro!'
    }
  ],

  /* App Prevena™ (prevena.html). BORRADOR para validación de Solventum. */
  prevena: {
    pasos: [
      { titulo: 'Preparar el lecho incisional', texto: 'Limpien y sequen la piel alrededor de la incisión cerrada. La piel debe estar libre de vello, humedad y residuos para lograr un sellado hermético.' },
      { titulo: 'Posicionar el apósito', texto: 'Retiren el respaldo del apósito y céntrenlo sobre la línea de sutura, de modo que la espuma cubra toda la incisión.' },
      { titulo: 'Sellar los bordes', texto: 'Presionen suavemente los bordes del adhesivo sobre la piel, sin arrugas, hasta lograr un sellado completo.' },
      { titulo: 'Conectar la unidad', texto: 'Unan la tubuladura del apósito a la unidad portátil Prevena™.' },
      { titulo: 'Activar el vacío', texto: 'Enciendan la unidad: la terapia inicia en presión negativa continua de -125 mmHg.' },
      { titulo: 'Verificar el sellado', texto: 'El apósito se comprime y adquiere un aspecto arrugado. Sin alarma de fuga, la terapia está activa.' }
    ]
  }
};
