/* ==========================================================================
   MÁQUINA DEL TIEMPO · Código: Cirugía del Futuro
   CONTENIDO DEL JUEGO (fuente: documento PLATAFORMA_MAQUINA_DEL_TIEMPO 2026)
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   --------------------------------------------------------------------------
   Este es el único archivo que hay que tocar para cambiar textos, tarjetas,
   pistas, puntos o bandas de tiempo. Las respuestas no están aquí: viven
   cifradas en huellas.js.
   ========================================================================== */

window.CONTENIDO = {
  juego: {
    titulo: 'MÁQUINA DEL TIEMPO',
    subtitulo: 'Código: Cirugía del Futuro',
    minutos: 12,                 /* tiempo oficial de juego por estación */
    segundosCierre: 750,         /* 12:30 → 30 s de gracia; después la estación se cierra sola */
    intentos: 2,                 /* intentos por código */
    pistasSegundos: [120, 240, 360],
    grupos: [
      { id: 'G1', nombre: 'Alquimistas de Da Vinci', color: '#05DD4D', simbolo: '⚡', enfoque: 'Guiados por el dominio absoluto de la anatomía y la geometría de la pared abdominal.' },
      { id: 'G2', nombre: 'Exploradores de Verne',   color: '#C9793F', simbolo: '⚙', enfoque: 'Inspirados por la ingeniería fantástica y los viajes hacia las profundidades del tejido visceral.' },
      { id: 'G3', nombre: 'Viajeros de Wells',       color: '#3D7BFF', simbolo: '⌛', enfoque: 'Maestros en anticipar las complicaciones futuras y moldear la línea de tiempo del paciente.' },
      { id: 'G4', nombre: 'Guardianes de Tesla',     color: '#F2B233', simbolo: '✦', enfoque: 'Expertos en dominar las presiones, la física médica y la energía del vacío en la pared abdominal.' }
    ],
    roles: [
      { id: 'PILOTO',     nombre: 'Líder Piloto de Vuelo', subtitulo: 'Coordinación & Consenso Clínico', cupo: 1,
        mision: ['Coordinar al equipo y marcar la estrategia de avance.', 'Guiar y validar las decisiones del consenso clínico.', 'Controlar el ritmo y el tiempo límite en cada estación.'] },
      { id: 'COPILOTO',   nombre: 'Copiloto', subtitulo: 'Custodio del Registro Manual', cupo: 1,
        mision: ['Llevar el registro riguroso en el cuaderno de campo.', 'Anotar pistas, variables clínicas y deducciones del grupo.', 'Custodiar el historial físico de la misión.'] },
      { id: 'COMANDANTE', nombre: 'Comandante de Misión', subtitulo: 'Custodio Digital', cupo: 1,
        mision: ['Custodiar y operar la consola digital del grupo.', 'Digitar códigos de validación y claves numéricas obtenidas.', 'Confirmar y enviar los resultados en cada estación.'] },
      { id: 'TRIPULANTE', nombre: 'Tripulante de Élite', subtitulo: 'Especialista Hands-On & Análisis', cupo: 4,
        mision: ['Inspeccionar minuciosamente el material táctico.', 'Descifrar acertijos y analizar los casos clínicos.', 'Ejecutar las maniobras prácticas y el ensamblaje.'] }
    ],
    autorizacion: 'Autorizo el tratamiento de mi nombre completo y mi profesión con la única finalidad de registrar mi participación y los resultados de esta experiencia académica, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. No se recolectan otros datos personales.',
    intro: [
      'Bienvenidos, doctores. Deténganse un segundo justo ahí… en el umbral exacto donde el presente se encuentra con el futuro.',
      'Lo que ven a su alrededor no es una capacitación ordinaria; es la entrada a un laberinto temporal. A partir de este instante, el quirófano deja de ser un espacio rígido de cuatro paredes para convertirse en un nexo donde el tiempo se mide en decisiones de alta precisión.',
      'Hoy, un paciente masculino de 38 años acaba de ingresar a nuestro sistema tras un colapso masivo en carretera. En la línea de tiempo convencional —la de las prácticas del pasado— las decisiones apresuradas lo condenarían a un año de complicaciones: hernias gigantes, fístulas, infecciones o un abdomen congelado. Pero ustedes no están aquí para seguir el curso ordinario de la historia. Están aquí para cambiarla.',
      'Su Credencial de Misión y Acceso Temporal los acredita ante los guardianes de cada cámara del laberinto. Y esta es su Consola Digital de Misión: aquí registrarán los códigos, las claves de bioingeniería y las respuestas clínicas que descifren. Cada código correcto alterará el destino del paciente en tiempo real.'
    ],
    reglas: [
      'En cada estación encontrarán una serie de pistas: enigmas clínicos, cajas con candados y la tecnología de Solventum.',
      'Tendrán 12 minutos por estación para explorar, resolver las pruebas y digitar sus códigos. Cada código tiene 2 intentos.',
      'El recorrido es en orden, de la Estación 1 a la 5, sin saltarse ninguna.',
      'Si el reloj cierra la estación antes de que la validen, esa estación queda en cero.',
      'Cuestionen las técnicas del pasado. Confíen en su criterio clínico. No dejen que la rutina guíe sus manos.'
    ],
    arranque: 'Estén atentos a la línea temporal del paciente porque el reloj empieza a correr. Doctores… ¡crucen el portal y protejan el mañana!'
  },

  /* Bandas de bonificación por tiempo (segundos desde el inicio de la estación
     hasta que el Comandante pulsa VALIDAR Y FINALIZAR). */
  bandas: {
    estandar: [
      { hasta: 300, puntos: 6, etiqueta: 'Menos de 5:00 min' },
      { hasta: 480, puntos: 5, etiqueta: 'Entre 5:01 y 8:00 min' },
      { hasta: 660, puntos: 4, etiqueta: 'Entre 8:01 y 11:00 min' },
      { hasta: 750, puntos: 3, etiqueta: 'Entre 11:01 y 12:30 min' }
    ],
    /* Estación 3: procedimiento físico con el dispositivo AbThera™ → más margen. */
    procedimiento: [
      { hasta: 420, puntos: 6, etiqueta: 'Menos de 7:00 min' },
      { hasta: 570, puntos: 5, etiqueta: 'Entre 7:01 y 9:30 min' },
      { hasta: 690, puntos: 4, etiqueta: 'Entre 9:31 y 11:30 min' },
      { hasta: 750, puntos: 3, etiqueta: 'Entre 11:31 y 12:30 min' }
    ]
  },

  estaciones: [
    /* ======================================================================
       ESTACIÓN 1
       ====================================================================== */
    {
      id: 'E1', numero: 1, bandas: 'estandar',
      nombre: 'El Umbral del Trauma', subtitulo: 'Fisura en la Línea de Vida',
      concepto: 'El paciente de 38 años ingresa al servicio de urgencias de un hospital de alto nivel de complejidad tras un accidente de tránsito de alta velocidad. Shock refractario, FAST positiva y laparotomía de urgencia: deben decidir si la cavidad abdominal puede cerrarse.',
      ingreso: {
        titulo: 'Tarjeta de Historia Clínica · Ingreso por ambulancia',
        texto: [
          'Paciente masculino de 38 años quien ingresa al servicio de urgencias de un hospital de alto nivel de complejidad. Describe el personal de la ambulancia que en el sitio del accidente hubo tres personas accidentadas y él es el único sobreviviente de un accidente de tránsito entre dos automóviles a alta velocidad. El paciente era el copiloto de uno de los automóviles, que recibió impacto lateral del lado derecho.',
          'Ingresa canalizado con dos yelcos #14 por donde se administran cristaloides; ha recibido 2 litros. Inmovilización con tabla y collar cervical. Responde a las preguntas de nombre y edad, sin embargo no recuerda bien lo que ocurrió y se nota confuso. Glasgow 14.',
          'Al examen físico se observa la marca del cinturón de seguridad, equimosis en hemitórax derecho y en abdomen en flanco e hipocondrio derechos.'
        ]
      },
      pruebas: [
        {
          id: '1.1', titulo: 'El Algoritmo del Diagnóstico',
          tarjeta: {
            reto: 'El Algoritmo del Diagnóstico (ABC y Búsqueda de Signos)',
            situacionTitulo: 'Situación clínica inicial',
            situacion: [
              ['Paciente', 'Masculino de 38 años (copiloto, colisión lateral de alta energía).'],
              ['Estado al ingreso', 'Inmovilizado con tabla rígida y collar cervical. Canalizado con 2 yelcos #14 (ha recibido 2 L de cristaloides).'],
              ['Examen físico', 'Confuso (Glasgow 14/15), marca de cinturón de seguridad y equimosis en flanco e hipocondrio derecho.']
            ],
            mision: [
              { t: 'Explorar la mesa', d: 'En la mesa encontrarán 10 Fichas de Acciones Clínicas.' },
              { t: 'Seleccionar y ordenar la secuencia', d: 'Identifiquen únicamente las 6 acciones prioritarias correspondientes a la atención inicial de este paciente y ordénenlas en secuencia lógica sobre la mesa.' },
              { t: 'Solicitar información crítica al Guía Especialista', d: 'Los datos diagnósticos clave están en un sobre sellado. Para que el Guía Especialista les entregue el Sobre de Exámenes Clínicos, el equipo debe:',
                sub: ['Tener colocada correctamente la secuencia de las 6 acciones en la mesa.', 'Solicitar verbalmente y en voz alta los Signos Vitales y la Ecografía FAST.'] }
            ],
            atencion: 'No intenten adivinar el diagnóstico sin haber asegurado la vía aérea, la ventilación y la perfusión del paciente. El tiempo corre.'
          },
          pistas: [
            'Pregúntense: si cierran hoy esta pared, ¿qué le pasa al paciente en las próximas 24 horas?',
            'Busquen la Tríada Letal, el Síndrome Compartimental Abdominal, el edema que impide cerrar sin tensión, el packing con second-look, la perfusión intestinal y la pérdida de pared.',
            'Las trampas son: uso profiláctico en apendicitis no complicada, inestabilidad leve que responde a 500 cc, cierre aponeurótico a tensión forzada y hematoma retroperitoneal zona III estable.'
          ],
          codigo: {
            id: '1.1', puntos: 4, placeholder: 'XXXX±',
            pregunta: 'Tras analizar los resultados del Sobre de Exámenes y confirmar el estado de shock refractario del paciente, ¿cuál es el código del hallazgo ecográfico que confirma el hemoperitoneo y justifica la laparotomía de urgencia inmediata?',
            formato: 'Sigla del examen + signo matemático de positividad',
            errores: [{ si: '^FAST$', msg: 'Van bien con el examen, pero les falta el signo que indica el resultado.' }],
            errorGeneral: 'Ese no es el hallazgo. Revisen el resultado de la imagen en el Sobre de Exámenes.'
          }
        },
        {
          id: '1.2', titulo: 'El Enigma de la Tríada de la Muerte',
          tarjeta: {
            reto: 'El Enigma de la Tríada de la Muerte (Shock Refractario)',
            situacionTitulo: 'Situación clínica en curso',
            situacion: [
              ['Estado crítico', 'El paciente no responde a los 2 litros de cristaloides administrados en el traslado.'],
              ['Parámetros obtenidos', 'Tensión Arterial 80/50 mmHg | Frecuencia Cardíaca 130 lpm | Temperatura 34.8 °C.'],
              ['Hallazgo por imagen', 'Ecografía FAST positiva (+) en espacio hepatorrenal (Morison) y cavidad, compatible con hemoperitoneo masivo.']
            ],
            mision: [
              { t: 'Identificar las 3 fichas de la Tríada', d: 'Ubiquen las 3 Fichas de Componentes Fisiológicos de la Tríada Letal:', sub: ['Ficha 1: Hipotermia', 'Ficha 2: Acidosis / Shock Refractario', 'Ficha 3: Coagulopatía / Hemoperitoneo'] },
              { t: 'Completar la Tríada Letal', d: 'Relacionen cada ficha con el parámetro clínico del paciente:', sub: ['Vinculen Hipotermia con la T° 34.8 °C.', 'Vinculen Acidosis / Shock Refractario con la TA 80/50 y la no respuesta a cristaloides.', 'Vinculen Coagulopatía / Hemoperitoneo con el líquido libre en FAST.'] },
              { t: 'Deducir y desbloquear el candado', d: 'Observen los dígitos marcados en color azul en la tarjeta de la Temperatura. Estos componen la combinación de 3 dígitos para abrir el candado de la Caja de Madera y acceder a la fase quirúrgica.' }
            ]
          },
          paneles: [{ tipo: 'monitor' }],
          pistas: [
            '¿Cuál de los tres componentes pueden medir directamente con los datos que ya tienen?',
            'La hipotermia está definida por debajo de 35 °C. Miren la temperatura del paciente.',
            'La combinación son los tres dígitos de la temperatura, sin el punto decimal.'
          ],
          codigo: {
            id: '1.2', puntos: 4, placeholder: '_ _ _', candado: true,
            pregunta: 'Para registrar el desbloqueo de la caja de seguridad y validar el hallazgo de la Tríada Letal: ¿cuál es la combinación de 3 dígitos utilizada para abrir el candado, derivada de la temperatura corporal crítica del paciente?',
            formato: 'Ingresen únicamente los 3 dígitos numéricos, sin puntos ni espacios',
            errores: [{ si: '[.,]', msg: 'Casi: el candado no tiene punto decimal. Solo los tres dígitos.' }, { si: '^\\d{4,}$', msg: 'El candado tiene exactamente 3 dígitos.' }],
            errorGeneral: 'El candado no cede. ¿Qué componente de la tríada se lee en la temperatura?'
          },
          revela: {
            titulo: 'Contenido revelado al abrir la caja',
            documento: {
              titulo: 'Reporte Quirúrgico de Laparotomía de Urgencias',
              encabezado: 'Historia clínica n.º 0508 · Señor Santiago Piedrahita · 38 años',
              lineas: [
                ['Hallazgos', 'Lesión hepática grado IV (hipocondrio derecho).'],
                ['', 'Hemoperitoneo masivo (2.500 cc).'],
                ['', 'Desgarro de epiplón sin sangrado activo.'],
                ['', 'Edema severo de asas intestinales.'],
                ['Procedimiento', 'Empaquetamiento (packing) hepático y control de daños inicial.']
              ]
            }
          }
        },
        {
          id: '1.3', titulo: 'La Decisión de Control de Daños',
          tarjeta: {
            reto: 'Matriz de Decisión Quirúrgica y Control de Daños',
            situacionTitulo: 'Situación intraoperatoria (reporte de laparotomía)',
            situacion: [
              ['Hallazgos', 'Lesión hepática grado IV (sangrante), hemoperitoneo masivo de 2,5 L, desgarro de epiplón sin sangrado activo y edema severo de asas intestinales.'],
              ['Objetivo de la misión', 'Definir el plan conductual inmediato para detener el colapso hemodinámico y evitar la pérdida del dominio abdominal.']
            ],
            mision: [
              { t: 'Evaluar las fichas', d: 'Encontrarán 7 Fichas de Conductas Quirúrgicas, cada una etiquetada con un número en su esquina superior.' },
              { t: 'Filtrar y matriciar', d: 'Seleccionen únicamente las 4 Conductas Correctas de Control de Daños indicadas para este escenario crítico y descarten las 3 alternativas inadecuadas o de riesgo (distractores).' },
              { t: 'Sumar y deducir el código clínico', d: 'Sumen los valores numéricos de las 4 fichas correctas seleccionadas. El resultado corresponde al código de volumen que valida el control del hemoperitoneo y completa la Estación 1.' }
            ],
            atencion: 'Prolongar la cirugía para realizar resecciones regladas o intentar cerrar a tensión una pared edematizada conducirá a la falla orgánica irreversible.'
          },
          pistas: [
            'La cirugía de control de daños tiene un solo objetivo inmediato: detener la hemorragia y la contaminación en el menor tiempo posible.',
            'Descarten todo lo que alargue la cirugía o cierre la pared: resecciones regladas, cirugías profilácticas y cierres a tensión.',
            'Las 4 correctas son: hemostasia de la lesión hepática, packing con compresas, CCD abreviada y dejar el abdomen abierto.'
          ],
          codigo: {
            id: '1.3', puntos: 4, placeholder: '_ _',
            pregunta: 'Tras analizar los hallazgos de la laparotomía abreviada y clasificar las 4 conductas quirúrgicas de control de daños correctas: ¿cuál es el valor numérico resultante de la suma de sus fichas, el cual equivale al volumen crítico (en decilitros) del hemoperitoneo evacuado?',
            formato: 'Ingresen únicamente el valor numérico final de dos dígitos',
            errores: [{ si: '^2[.,]?5$', msg: 'Ese es el volumen en litros. El código va en decilitros, sin decimales.' }],
            errorGeneral: 'La suma no coincide. ¿Alguna de sus fichas prolonga la cirugía o cierra a tensión?'
          }
        }
      ],
      clave: {
        id: '1.4', puntos: 2, placeholder: '_ _ _',
        pregunta: 'Clave Combinada de Salida de la Estación 1: revisen la bitácora y resten a la combinación del candado de la Tríada (Prueba 1.2) la suma de las Conductas de Control de Daños (Prueba 1.3).',
        formato: 'Valor numérico de tres dígitos',
        errores: [{ si: '^373$', msg: 'Sumaron. La clave de salida es una resta.' }],
        errorGeneral: 'La operación no da. Revisen en la bitácora los códigos 1.2 y 1.3.'
      },
      desbloqueo: '¡CÓDIGO DE TRASLADO AUTORIZADO! Paciente estabilizado hemodinámicamente con empaquetamiento hepático y abdomen abierto. Avanzando a la Estación 2: El Enigma del Vacío.',
      cierre: 'Excelente trabajo, Cronocirujanos. Identificaron con precisión que un shock refractario por lesión hepática grado IV con 2,5 L de hemoperitoneo e hipotermia severa de 34,8 °C exigía una Cirugía de Control de Daños inmediata. La decisión de empaquetar y mantener el abdomen abierto es la única opción que evita el colapso fisiológico del paciente en esta línea de tiempo. Ahora, crucen el portal hacia la Estación 2: El Enigma del Vacío, donde deberán definir la tecnología exacta para preservar esta pared abdominal.'
    },

    /* ======================================================================
       ESTACIÓN 2
       ====================================================================== */
    {
      id: 'E2', numero: 2, bandas: 'estandar',
      nombre: 'El Enigma del Vacío', subtitulo: 'Las 9 Claves de la Pared Temporal',
      concepto: 'Con la decisión de mantener el abdomen abierto, los Cronocirujanos deben evitar la retracción aponeurótica, la pérdida del dominio abdominal, las fístulas y las infecciones, descartando técnicas artesanales frente a la Terapia de Presión Negativa comercial.',
      pruebas: [
        {
          id: '2.1', titulo: 'El Filtro de Bioingeniería',
          tarjeta: {
            reto: 'El Filtro de Bioingeniería (Descifrar las 9 Funciones Ideales)',
            situacionTitulo: 'Situación clínica en curso',
            situacion: [
              ['Escenario', 'El paciente ha sido estabilizado mediante Cirugía de Control de Daños (CCD) y empaquetamiento hepático. Se encuentra con el abdomen abierto.'],
              ['Objetivo de la misión', 'Identificar los criterios científicos que debe cumplir el dispositivo ideal de Cierre Temporal del Abdomen (TPN comercial) para preservar el dominio fascial y evitar complicaciones catastróficas a 1 año.']
            ],
            mision: [
              { t: 'Explorar y depurar', d: 'Encontrarán 13 Fichas de Funciones de Cierre Temporal. Cuatro (4) de ellas contienen premisas falsas o prácticas artesanales de alto riesgo.' },
              { t: 'Filtrar y organizar', d: 'Descarten las 4 fichas distractoras y seleccionen únicamente las 9 Funciones Verdaderas del Dispositivo Ideal (basadas en la evidencia del Consenso). Ubíquenlas sobre la plantilla del tablero.' },
              { t: 'Verificar el ensamble', d: 'Una vez posicionadas las 9 fichas, gírenlas con cuidado por el respaldo. Si la selección es 100 % correcta, el reverso revelará la figura del Logo de Embajadores junto con el código alfanumérico de validación.' }
            ],
            atencion: 'La elección de un sistema artesanal o inadecuado provocará la pérdida irreversible del dominio fascial y fístulas enterocutáneas en la línea temporal del paciente.'
          },
          codigo: {
            id: '2.1', puntos: 4, placeholder: '_ _',
            pregunta: 'Tras descartar los mitos del pasado y encajar las 9 funciones esenciales de la Terapia de Presión Negativa comercial en el tablero de bioingeniería: ¿cuál es el código alfanumérico revelado en el reverso del ensamble que confirma el dominio fascial?',
            formato: 'Código alfanumérico de 2 caracteres',
            errorGeneral: 'Ese no es el código del reverso. Verifiquen que las 9 fichas formen la figura completa.'
          }
        },
        {
          id: '2.2', titulo: 'La Guerra de Tecnologías',
          tarjeta: {
            reto: 'La Guerra de Tecnologías (AbThera™ vs. Bolsa de Bogotá y Barker)',
            situacionTitulo: 'Situación clínica en curso',
            situacion: [
              ['Desafío técnico', 'Con las 9 funciones ideales identificadas, el equipo debe evaluar las opciones de Cierre Temporal del Abdomen disponibles en el arsenal quirúrgico.'],
              ['Objetivo de la misión', 'Comparar la eficacia clínica de cada tecnología, descifrar la combinación del candado y acceder al contenedor de suministros avanzados.']
            ],
            mision: [
              { t: 'Analizar y cruzar las 10 fichas', d: 'Encontrarán 7 Fichas de Limitaciones junto con 3 alternativas quirúrgicas. Agrupen las fichas con las 3 alternativas siguiendo la tabla de las 9 funciones.' },
              { t: 'Deducir el código del candado', d: 'Contabilicen cuántas de las 9 funciones ideales cumple cada una de las 3 alternativas para construir la clave de 3 dígitos:', sub: ['Dígito 1 (Bolsa de Bogotá): número de funciones que cumple.', 'Dígito 2 (Técnica de Barker): número de funciones que cumple.', 'Dígito 3 (Terapia AbThera™): número de funciones que cumple.'] },
              { t: 'Abrir la caja', d: 'Ingresen la combinación en el candado de la Caja de Madera para extraer la Tarjeta de Selección del Dispositivo y las Fichas de Relevancia Clínica Directa.' }
            ],
            atencion: 'Elegir una alternativa con bajo cumplimiento de funciones incrementará el riesgo de retracción fascial, pérdida del espacio peritoneal y desarrollo de fístulas enterocutáneas.'
          },
          codigo: {
            id: '2.2', puntos: 4, placeholder: '_ _ _', candado: true,
            pregunta: 'Para validar el análisis comparativo de tecnologías y desbloquear la caja de suministros avanzados: ¿cuál es la combinación de 3 dígitos obtenida al evaluar el nivel de cumplimiento de las 9 funciones ideales en la Bolsa de Bogotá, la Técnica de Barker y la Terapia AbThera™ (en ese orden exacto)?',
            formato: 'Ingresen únicamente los 3 dígitos, sin espacios ni guiones, en el orden de las alternativas',
            errores: [{ si: '^\\d{1,2}$|^\\d{4,}$', msg: 'La combinación tiene exactamente 3 dígitos, uno por alternativa.' }],
            errorGeneral: 'El candado no abre. Vuelvan a contar cuántas funciones cumple cada alternativa.'
          },
          revela: {
            titulo: 'Contenido revelado al abrir la caja · Relevancia clínica del dispositivo',
            tarjetas: [
              ['Remoción rápida y continua de efluentes y fluido peritoneal', 'En el estallido hepático se generan altos volúmenes de sangre y exudado irritante. El sistema remueve el efluente de forma activa, reduciendo la carga enzimática e inflamatoria en la cavidad.'],
              ['Prevención de la retracción aponeurótica / Preservación del dominio de pared', 'Proporciona tensión medial constante sobre los bordes de la fascia, evitando que los músculos rectos se retraigan lateralmente durante el periodo de abdomen abierto.'],
              ['Aislamiento y protección visceral profunda', 'La capa visceral fenestrada se extiende hacia las correderas parietocólicas y el fondo de saco, aislando las asas intestinales y el hígado lesionado para evitar adherencias al peritoneo parietal.'],
              ['Reducción activa del edema de asas intestinales', 'Al evacuar el líquido del tercer espacio y disminuir la inflamación visceral, facilita la descompresión abdominal y prepara el lecho para un cierre fascial primario temprano (idealmente antes de las 72 horas).']
            ]
          }
        },
        {
          id: '2.3', titulo: 'La Matriz Focalizada para Trauma',
          tarjeta: {
            reto: 'La Matriz Focalizada para Trauma',
            situacionTitulo: 'Situación clínica en curso',
            situacion: [
              ['Requerimiento específico', 'Paciente masculino de 38 años en shock, con empaquetamiento por lesión hepática grado IV y 2,5 L de hemoperitoneo evacuado.'],
              ['Objetivo de la misión', 'Aunque las 9 funciones de bioingeniería son ideales, el escenario de este paciente exige priorizar de inmediato las 5 necesidades vitales específicas para evitar la pérdida del dominio abdominal.']
            ],
            mision: [
              { t: 'Revisar y seleccionar las 5 necesidades críticas del caso', d: 'Identifiquen las 5 Fichas Relevantes para el trauma específico de este paciente junto con las 5 justificaciones.' },
              { t: 'Formar parejas', d: 'Organicen las fichas en parejas uniendo la relevancia con la justificación. Al posicionar correctamente las 10 fichas, observen los valores grabados junto al símbolo AbThera™ en el reverso. La suma de sus valores revela el código.' },
              { t: 'Solicitar la carta de cierre', d: 'Al descubrir el código, soliciten al Guía Especialista la carta de cierre.' }
            ],
            atencion: 'Errar en la priorización del drenaje o descuidar la tracción medial activa condenará al paciente a un abdomen congelado e imposible de cerrar.'
          },
          codigo: {
            id: '2.3', puntos: 4, placeholder: '_ _',
            pregunta: 'Tras priorizar las 5 funciones vitales de la Terapia AbThera™ para el control del empaquetamiento hepático y la tracción fascial: ¿cuál es el código numérico de validación obtenido, que representa el porcentaje adicional de afrontamiento y movilización fascial frente a otros sistemas?',
            formato: 'Ingresen únicamente el número de 2 dígitos',
            errorGeneral: 'La suma no coincide. Revisen que estén las 5 parejas correctas.'
          }
        }
      ],
      clave: {
        id: '2.4', puntos: 2, placeholder: '_ _ _',
        pregunta: 'Clave Final Combinada de la Estación 2: revisen sus apuntes y resten a la respuesta de la Prueba 2.2 la respuesta de la Prueba 2.3.',
        formato: 'Valor numérico de tres dígitos',
        errorGeneral: 'La operación no da. Revisen en la bitácora los códigos 2.2 y 2.3.'
      },
      desbloqueo: '¡TRANSFERENCIA A QUIRÓFANO AUTORIZADA! Criterios de bioingeniería validados y dominio fascial preservado. Avanzando a la Estación 3: listos para la calibración quirúrgica.',
      cierre: 'Extraordinario, Cronocirujanos. Han demostrado por qué las alternativas del pasado, como la Bolsa de Bogotá o la Técnica de Barker, llevan al paciente a la pérdida de dominio fascial y a adherencias severas. Frente a otras técnicas, es fundamental resaltar la reducción del riesgo de formación de adherencias: un dispositivo comercial ensamblado con materiales diseñados específicamente para su función y respaldado por suficiente evidencia científica que demuestra su seguridad en el manejo de nuestros pacientes. En nuestro paciente con empaquetamiento hepático, la Terapia AbThera™ no solo drena efluentes, sino que vigila activamente el resangrado y mantiene la tensión medial. Un paso firme hacia la Estación 3 para el ensamblaje práctico.'
    },

    /* ======================================================================
       ESTACIÓN 3
       ====================================================================== */
    {
      id: 'E3', numero: 3, bandas: 'procedimiento',
      nombre: 'El Taller del Cronógrafo', subtitulo: 'Calibración Quirúrgica del Abdomen',
      concepto: 'Fase práctica (hands-on) sobre el modelo anatómico. Los participantes ejecutan la secuencia de ensamble del sistema de presión negativa para abdomen abierto AbThera™. Un error de colocación, un corte erróneo de la lámina protectora o una fuga en la película adhesiva generará una falla de vacío.',
      pruebas: [
        {
          id: '3.1', titulo: 'El Rompecabezas de la Secuencia Quirúrgica',
          tarjeta: {
            reto: 'Secuencia Quirúrgica (los 8 pasos)',
            situacionTitulo: 'Situación clínica y técnica',
            situacion: [
              ['Escenario', 'El paciente con empaquetamiento hepático y abdomen abierto está listo en el quirófano simulado.'],
              ['Objetivo de la misión', 'Antes de proceder al ensamble práctico (hands-on) sobre el modelo anatómico, el equipo debe estructurar la secuencia exacta para la colocación de la Terapia AbThera™, garantizando la protección visceral, la remoción eficiente de efluentes y un sellado hermético sin errores técnicos.']
            ],
            mision: [
              { t: 'Evaluar las fichas de secuencia', d: 'Encontrarán 12 fichas para ordenar y clasificar.' },
              { t: 'Seleccionar y ordenar los 8 pasos', d: 'Descarten los errores técnicos y ordenen únicamente los 8 pasos correctos de la secuencia, formando un rectángulo de 4 parejas (2 × 4).' },
              { t: 'Verificar el ensamble posterior', d: 'Una vez dispuestas las 8 fichas en el rectángulo, gírenlas por el respaldo. Si la secuencia es correcta, la imagen ensamblada revelará el código alfanumérico que confirma la precisión procedimental.' }
            ],
            atencion: 'Alterar el orden de los pasos u omitir el manejo correcto de la lámina fenestrada comprometerá la viabilidad de las asas intestinales y provocará fallas en el vacío.'
          },
          codigo: {
            id: '3.1', puntos: 4, placeholder: '_ _',
            pregunta: 'Tras descartar los errores procedimentales y organizar los 8 pasos clave de la secuencia de colocación de la Terapia AbThera™: ¿cuál es el código alfanumérico que se revela en el respaldo del ensamble y confirma la precisión procedimental?',
            formato: 'Código alfanumérico de 2 caracteres',
            errorGeneral: 'Ese no es el código del respaldo. Revisen el orden de las 8 fichas.'
          }
        },
        {
          id: '3.2', titulo: 'El Desafío Psicomotriz Hands-On',
          tarjeta: {
            reto: 'El Desafío Psicomotriz "Hands-On" (Corte, Ajuste de Insumos y Monitoreo de Alarmas) · 6 minutos',
            situacionTitulo: 'Situación clínica y técnica',
            situacion: [
              ['Escenario', 'La secuencia procedimental está validada. Es momento de pasar de la teoría a la práctica en el quirófano simulado sobre el modelo anatómico.'],
              ['Objetivo de la misión', 'Realizar la colocación limpia de la Terapia AbThera™, liberar el instrumental mediante el código de física médica y responder a la gestión de alarmas del sistema.']
            ],
            mision: [
              { t: 'Asignación de roles para el hands-on', d: 'Distribuyan la ejecución en la mesa del modelo anatómico:', sub: [
                'Operador 1 (Protección Visceral): mide y adapta la Lámina Protectora Visceral al tamaño del abdomen, realiza el corte en medio del cuadrado de espuma y retira los sobrantes. Siempre cortar la capa protectora visceral en medio de los sellos y nunca exponer las espumas.',
                'Operador 2 (Espuma de Vacío): adapta y conforma los apósitos de espuma al lecho exacto de la laparotomía.',
                'Operador 3 (Sellado e Interfaz): coloca el adhesivo superando los bordes de la herida sin arrugas ni desperdicio y realiza el corte central radial de 2,5 cm usando la plantilla blanca del SensaT.R.A.C.™.',
                'Operador 4 (Conectividad y Vacío): acopla el cánister grande de 1.000 cc y verifica la permeabilidad de las líneas (clamps abiertos).'] },
              { t: 'Deducir el código', d: 'Para que el Guía Especialista les entregue el sobre de cierre, calculen y reciten en voz alta el código de 3 dígitos:', sub: ['Dígito 1: capacidad mínima del cánister de trauma.', 'Dígito 2: número obligatorio de apósitos de poliuretano azules que deben usarse.', 'Dígito 3: número de alarmas que genera el equipo.'] },
              { t: 'Finalización del ensamble y protocolo de alarmas', d: 'Con el sobre abierto, lean la pregunta de la tarjeta y escuchen atentamente al Guía Especialista.' }
            ]
          },
          codigo: {
            id: '3.2', puntos: 8, placeholder: '_ _ _',
            pregunta: '¿Cuál es el código de 3 dígitos comunicado al Guía Especialista (capacidad del cánister + apósitos azules + alarmas del equipo)?',
            formato: 'Código numérico de 3 dígitos',
            errores: [{ si: '^1000', msg: 'La capacidad va en litros: un solo dígito.' }],
            errorGeneral: 'Ese no es el código. Revisen los tres datos del dispositivo.'
          },
          revela: {
            titulo: 'Mensaje del sistema',
            mensaje: '¡SELLADO HERMÉTICO Y TERAPIA ACTIVA VERIFICADOS! Presión de −125 mmHg continua lograda sin fugas. Traslado seguro del paciente hacia la Unidad de Cuidado Intensivo.'
          }
        }
      ],
      clave: {
        id: '3.3', puntos: 2, placeholder: '_ _ _',
        pregunta: 'Clave Final Combinada de la Estación 3: resten al código del Hands-On (Prueba 3.2) el número de pasos de la secuencia de precisión (Prueba 3.1).',
        formato: 'Valor numérico de tres dígitos',
        errorGeneral: 'La operación no da. Revisen en la bitácora los códigos 3.1 y 3.2.'
      },
      desbloqueo: '¡SELLADO HERMÉTICO Y TERAPIA ACTIVA VERIFICADOS! Avanzando a la Estación 4: El Vínculo de Vigilancia.',
      cierre: 'Técnica impecable, Cronocirujanos. Recuerden siempre las tres reglas de oro en trauma: el cánister debe ser de gran capacidad (1.000 cc) debido al alto volumen de efluentes; nunca dejar en contacto las espumas con las asas intestinales; y siempre usar los 2 apósitos de poliuretano azules, el primero a nivel de aponeurosis y el segundo a nivel de la piel. Con el sistema sellado herméticamente a −125 mmHg y las líneas permeables sin fugas ni alarmas, nuestro paciente pasa de forma segura a la UCI para la fase de reanimación metabólica. Sigamos a la Estación 4.'
    },

    /* ======================================================================
       ESTACIÓN 4
       ====================================================================== */
    {
      id: 'E4', numero: 4, bandas: 'estandar',
      nombre: 'El Vínculo de Vigilancia', subtitulo: 'El Radar de la UCI',
      concepto: 'El paciente es trasladado a la Unidad de Cuidados Intensivos bajo Terapia de Presión Negativa. Los Cronocirujanos deben configurar el monitoreo clínico dual (variables del paciente e indicadores de la TPN) en la ventana crítica de 24 a 72 horas.',
      pruebas: [
        {
          id: '4.1', titulo: 'El Monitor Dual',
          tarjeta: {
            reto: 'El Monitor Dual (Monitoreo Paciente vs. Sistema)',
            situacionTitulo: 'Situación clínica en UCI',
            situacion: [
              ['Escenario', 'El paciente ha ingresado a la Unidad de Cuidado Intensivo con la Terapia AbThera™ instalada y funcionando. Se inicia la fase de reanimación metabólica y vigilancia activa.'],
              ['Objetivo de la misión', 'Clasificar los parámetros de monitoreo crítico separando las variables fisiológicas del paciente de los indicadores de funcionamiento del sistema, descartando distracciones de manejo.']
            ],
            mision: [
              { t: 'Explorar los cubos', d: 'Encontrarán un conjunto de cubos con variables clínicas e indicadores de monitoreo. Identifiquen y descarten los cubos trampa que no corresponden al manejo prioritario de este paciente.' },
              { t: 'Clasificar las 9 variables en el tablero dual', d: 'Organicen los 9 cubos verdaderos en las dos columnas (Paciente / Sistema). Observen los costados señalados con el símbolo del programa Embajadores y alineen las letras de cada cubo para formar la palabra de validación institucional.' }
            ],
            atencion: 'Confundir las variables de monitoreo del sistema con las del paciente puede enmascarar un choque hemorrágico persistente o una pérdida involuntaria de vacío.'
          },
          codigo: {
            id: '4.1', puntos: 4, placeholder: 'PALABRA',
            pregunta: 'Tras descartar las variables incorrectas y clasificar las 6 dimensiones del paciente y las 3 dimensiones del sistema AbThera™: ¿cuál es la palabra clave revelada al alinear las letras de los 9 cubos?',
            formato: 'Ingresen únicamente la palabra en mayúsculas, sin espacios',
            errorGeneral: 'Esa no es la palabra. Revisen que los 9 cubos sean los correctos y su orden.'
          }
        },
        {
          id: '4.2', titulo: 'La Ventana Temporal',
          tarjeta: {
            reto: 'La Ventana Temporal (El Estándar de las 72 Horas y Excepciones)',
            situacionTitulo: 'Situación clínica en UCI',
            situacion: [
              ['Desafío técnico', 'El paciente continúa con abdomen abierto y Terapia AbThera™ instalada. Es necesario determinar el intervalo óptimo para la reprogramación quirúrgica y reconocer los eventos que exigen interrumpir la ventana temporal.'],
              ['Objetivo de la misión', 'Identificar la ventana máxima estándar de revisión, seleccionar las 4 excepciones críticas de reintervención no programada y descifrar la combinación del candado de 4 dígitos.']
            ],
            mision: [
              { t: 'Marcar el tiempo estándar en el tablero', d: 'En el Tablero de Tiempos de la pantalla, identifiquen el intervalo máximo recomendado entre revisiones de cavidad abdominal sin complicaciones y márquenlo.' },
              { t: 'Depurar la lista de excepciones', d: 'Analicen las 7 situaciones de la pantalla y descarten las 3 opciones trampa o de manejo a pie de cama. Aíslen únicamente las 4 Excepciones Críticas que obligan a reintervenir al paciente antes de la ventana programada y tomen nota de sus valores numéricos.' },
              { t: 'Construir la clave de 4 dígitos', d: 'Apliquen la fórmula lógica para abrir la caja:', sub: ['Dígito 1: primer dígito del tiempo estándar en horas.', 'Dígito 2: segundo dígito del tiempo estándar en horas.', 'Dígito 3: cantidad total de excepciones críticas identificadas.', 'Dígito 4: suma total de los valores de las 4 excepciones críticas.'] }
            ],
            atencion: 'Sobrepasar el límite de horas sin revisar la cavidad incrementa exponencialmente el riesgo de adherencias complejas y pérdida irreversible de la pared abdominal.'
          },
          paneles: [
            { tipo: 'tablero-tiempos', titulo: 'Tablero de Tiempos · Revisión de la cavidad abdominal',
              opciones: ['6 H', '12 H', '24 H', '48 H', '72 H', '96 H', '7 DÍAS'] },
            { tipo: 'excepciones', titulo: 'Situaciones en la UCI',
              items: [
                ['Sangrados no controlados', 3], ['Aumento de presión abdominal de 2 mmHg', 8], ['Sospecha de fuga intestinal', 1],
                ['Temperatura corporal de 38,3 °C', 5], ['Isquemia intestinal', 2], ['Alarma de fuga en el sistema', 7], ['Equipo disfuncional', 3]
              ] }
          ],
          codigo: {
            id: '4.2', puntos: 4, placeholder: '_ _ _ _', candado: true,
            pregunta: 'Para registrar el intervalo de revisión en UCI y desbloquear el cofre de complicaciones y bondades: ¿cuál es la combinación de 4 dígitos del candado (horas estándar + número de excepciones + suma de valores)?',
            formato: 'Código numérico de 4 dígitos, sin espacios',
            errorGeneral: 'El candado no abre. Revisen el tiempo estándar, cuántas excepciones son críticas y la suma de sus valores.'
          }
        },
        {
          id: '4.3', titulo: 'La Balanza Clínica',
          tarjeta: {
            reto: 'La Balanza Clínica (Complicaciones vs. Beneficios TPN)',
            situacionTitulo: 'Situación clínica en UCI',
            situacion: [
              ['Escenario', 'Tras abrir la caja con el Kit de Matriz, el equipo debe consolidar el criterio clínico para la prevención de eventos adversos catastróficos en el paciente con abdomen abierto.'],
              ['Objetivo de la misión', 'Relacionar cada una de las 5 complicaciones fisiopatológicas del abdomen abierto con el beneficio terapéutico específico de la Terapia de Presión Negativa (AbThera™) que la previene o mitiga.']
            ],
            mision: [
              { t: 'Construir las 5 parejas clínicas', d: 'Encontrarán 5 Fichas de Complicaciones del Abdomen Abierto y 5 Fichas de Beneficios Terapéuticos de la TPN. Emparejen cada complicación con el beneficio que la neutraliza.' }
            ],
            atencion: 'Errar en el emparejamiento conceptual dejará desprotegida la cavidad frente a complicaciones catastróficas como fístulas o pérdida definitiva del dominio fascial.'
          },
          codigo: {
            id: '4.3', puntos: 4, placeholder: '_ _',
            pregunta: 'Tras consolidar el emparejamiento de la matriz clínica: ¿cuál es el valor resultante de la suma de la cantidad total de complicaciones más la cantidad total de bondades terapéuticas integradas en la balanza?',
            formato: 'Valor numérico de 2 dígitos',
            errorGeneral: 'Ese no es el valor. Cuenten las fichas de cada lado de la balanza.'
          }
        }
      ],
      clave: {
        id: '4.4', puntos: 2, placeholder: '_ _ _ _',
        pregunta: 'Clave Final Combinada de la Estación 4: sumen la respuesta de la Prueba 4.2 y la respuesta de la Prueba 4.3.',
        formato: 'Valor numérico de cuatro dígitos',
        errorGeneral: 'La operación no da. Revisen en la bitácora los códigos 4.2 y 4.3.'
      },
      desbloqueo: '¡CONTROL TEMPORAL Y MONITOREO INTENSIVO VERIFICADOS! Matriz de complicaciones neutralizada y ventana de revisión a 72 horas establecida. Avanzando a la Estación 5: El Salto Temporal.',
      cierre: '¡Excelente monitoreo, Cronocirujanos! Nunca olviden la regla de oro: la revisión máxima de la cavidad es a las 72 horas, a menos que se presente sangrado no controlado, fuga intestinal, isquemia o una falla irreversible del equipo. En este paciente con trauma complejo por estallido hepático, el uso oportuno y adecuado de la TPN fue la clave para controlar el alto volumen de efluentes, mitigar el edema de asas y prevenir la retracción aponeurótica. Con el paciente estabilizado en UCI y la ventana quirúrgica bajo control, estamos listos para avanzar a la Estación 5: el Cierre y Protección de la Incisión.'
    },

    /* ======================================================================
       ESTACIÓN 5
       ====================================================================== */
    {
      id: 'E5', numero: 5, bandas: 'estandar',
      nombre: 'El Salto Temporal', subtitulo: 'Sellado e Incisión de Alta Tensión',
      concepto: 'Tras la estabilización del edema visceral y la resolución del shock, el paciente está listo para el intento de cierre fascial definitivo. La incisión de alta tensión representa un alto riesgo de infección del sitio operatorio y dehiscencia.',
      pruebas: [
        {
          id: '5.1', titulo: 'El Check-List para el Cierre Definitivo',
          tarjeta: {
            reto: 'El Check-List para el Cierre Definitivo (Los 4 Factores)',
            situacionTitulo: 'Situación clínica en quirófano de reingreso',
            situacion: [
              ['Escenario', 'El paciente ha superado la etapa crítica, la reanimación metabólica fue exitosa y el edema de las asas intestinales ha cedido. Ha llegado el momento de reingresar a quirófano y decidir si es posible realizar el cierre fascial definitivo.'],
              ['Objetivo de la misión', 'Auditar los criterios clínicos y fisiológicos de la pared abdominal para confirmar si el paciente cumple estrictamente con los 4 factores requeridos para un cierre fascial primario seguro.']
            ],
            mision: [
              { t: 'Revisar las opciones', d: 'Exploren la lista de criterios de la pantalla. Descarten los factores de riesgo e incompatibilidad quirúrgica.' },
              { t: 'Seleccionar los 4 factores', d: 'Marquen los 4 Factores Críticos de Cierre en el Tablero Check-List de Quirófano y ordenen sus letras correspondientes.' }
            ],
            atencion: 'Intentar un cierre fascial forzado con variaciones de la presión en vía aérea base del paciente superiores a 4 mmHg pondrá al paciente en riesgo de falla ventilatoria e hipertensión abdominal.'
          },
          paneles: [
            { tipo: 'criterios', titulo: 'Tablero Check-List de Quirófano',
              items: [
                ['Presencia de secreción purulenta en lecho', 'S'],
                ['Control de foco de contaminación', 'C'],
                ['Cambios de variación de presión de vía aérea basal mayores a 4 mmHg al afrontar los bordes de la fascia', 'M'],
                ['Reconstitución del tracto gastrointestinal (ostomía o anastomosis)', 'A'],
                ['Pérdida del dominio de pared', 'Y'],
                ['Resolución del caso sin necesidad de nuevos lavados ni revisiones de la cavidad', 'R'],
                ['Necesidad programada de nuevo acceso a la cavidad abdominal', 'B'],
                ['Variaciones en las presiones de la vía aérea menores de 4 mmHg al afrontar los bordes de la fascia (bajo riesgo de falla ventilatoria e hipertensión abdominal)', 'E']
              ] }
          ],
          codigo: {
            id: '5.1', puntos: 4, placeholder: '_ _ _ _',
            pregunta: 'Tras auditar el estado del paciente y validar los 4 factores necesarios para el cierre fascial definitivo: ¿cuál es la palabra clave revelada por la secuencia de los criterios seleccionados?',
            formato: 'Ingresen únicamente la palabra de 4 letras en mayúsculas',
            errorGeneral: 'Esa no es la palabra. Revisen cuáles criterios permiten el cierre y cuáles lo contraindican.'
          }
        },
        {
          id: '5.2', titulo: 'El Enigma de la Herida Quirúrgica',
          tarjeta: {
            reto: 'El Enigma de la Herida Quirúrgica (Tensión y Prevena™)',
            situacionTitulo: 'Situación clínica en quirófano',
            situacion: [
              ['Escenario', 'Con los 4 criterios del check-list validados, la fascia del paciente ha sido afrontada. Al tratarse de un cierre de pared con alta tensión, el paciente presenta un riesgo extremadamente elevado de infección del sitio quirúrgico (ISQ), seroma, hematoma y dehiscencia.'],
              ['Objetivo de la misión', 'Obtener e instalar el sistema de manejo incisional Prevena™ sobre la herida cerrada para proteger la línea de sutura, descifrando los parámetros técnicos de la unidad.']
            ],
            mision: [
              { t: 'Evaluar el riesgo de la herida cerrada', d: 'Analicen las características de la línea de incisión tras la aproximación fascial de alta tensión. Exploren la pantalla para localizar los parámetros de funcionamiento del sistema Prevena™ que están ocultos.' },
              { t: 'Descifrar el código', d: 'Reúnan los valores técnicos para construir la combinación de 4 dígitos de la caja de suministros:', sub: ['Dígitos 1, 2 y 3: magnitud absoluta de la presión negativa continua prescrita para el manejo de la incisión.', 'Dígito 4: número de días continuos de terapia que entrega la unidad portátil de Prevena™.'] },
              { t: 'Desbloquear y colocar el dispositivo', d: 'Ingresen la combinación para acceder a la unidad Prevena™ y realicen el ensamble sobre el modelo de la incisión cerrada. Anoten el código en la bitácora del equipo.' }
            ],
            atencion: 'Anticiparse al riesgo cambia los resultados. La terapia de presión negativa incisional ayuda a reducir complicaciones de la herida y a proteger la recuperación del paciente.'
          },
          paneles: [
            { tipo: 'ocultos', titulo: 'Escáner de la unidad Prevena™ · toquen cada señal para revelarla',
              items: [
                ['Presión negativa continua', '−125 mmHg'],
                ['Duración de la terapia de la unidad portátil', 'Hasta 7 días'],
                ['Tipo de incisión', 'Laparotomía cerrada de alta tensión']
              ] }
          ],
          codigo: {
            id: '5.2', puntos: 4, placeholder: '_ _ _ _', candado: true,
            pregunta: 'Para validar la protección de la incisión cerrada de alta tensión y abrir la caja del sistema Prevena™ (presión continua + días de terapia continua): ¿cuál es el código de 4 dígitos introducido en el candado y registrado en la bitácora?',
            formato: 'Ingresen únicamente el número de 4 dígitos, sin espacios',
            errores: [{ si: '^-', msg: 'Sin el signo menos: se pide la magnitud absoluta.' }],
            errorGeneral: 'El candado no abre. Revisen la presión y los días de terapia en el escáner.'
          }
        },
        {
          id: '5.3', titulo: 'La Coraza Biológica',
          tarjeta: {
            reto: 'El Algoritmo Interactivo de Prevena™',
            situacionTitulo: 'Situación clínica en quirófano',
            situacion: [
              ['Escenario', 'El sistema Prevena™ ha sido activado y posicionado sobre la herida de laparotomía cerrada de alta tensión.'],
              ['Objetivo de la misión', 'Activar la aplicación interactiva, ejecutar la secuencia paso a paso de colocación digital y consolidar los beneficios clínicos demostrados que reducen la morbilidad de la incisión de alto riesgo.']
            ],
            mision: [
              { t: 'Desbloquear la aplicación Prevena™', d: 'Abran la aplicación Prevena™ desde su celular e ingresen el código de activación de la Prueba 5.2. Sigan las instrucciones para simular la preparación del lecho incisional, el posicionamiento del apósito sobre la sutura, el sellado de bordes y la activación del vacío.' },
              { t: 'Consolidar las ventajas clínicas de Prevena™', d: 'Al completar el flujo, la aplicación desplegará la evidencia sobre el manejo de la incisión de laparotomía. Verifiquen las ventajas clave alcanzadas.' }
            ],
            atencion: 'No esperen la complicación para actuar. En laparotomías de alta tensión, la protección de la incisión es una decisión crítica desde el cierre.'
          },
          paneles: [{ tipo: 'prevena' }],
          codigo: {
            id: '5.3', puntos: 4, placeholder: '_',
            pregunta: 'Tras completar el paso a paso en la aplicación y revisar la evidencia clínica desplegada al final: ¿cuál es la cantidad total de beneficios clínicos verificados que aporta la Terapia Prevena™ sobre la incisión de alto riesgo?',
            formato: 'Ingresen únicamente el número de 1 dígito',
            errorGeneral: 'Ese no es el número. Revisen la evidencia al final de la aplicación Prevena™.'
          }
        }
      ],
      clave: {
        id: '5.4', puntos: 2, placeholder: '_ _ _ _ _ _',
        pregunta: 'Clave Final Combinada de la Estación 5 · Hito histórico: el código que cierra la línea de tiempo está formado por los caracteres de las ventajas clínicas de Prevena™, en orden. Es la abreviatura del nacimiento del producto con el que han trabajado.',
        formato: 'Seis caracteres, letras y números, sin espacios',
        errorGeneral: 'Ese no es el hito. Revisen los caracteres de cada ventaja en la aplicación Prevena™.'
      },
      desbloqueo: '¡MISIÓN CUMPLIDA! Línea de tiempo quirúrgica completada con éxito. Cierre fascial y protección incisional validados.',
      cierre: '¡Felicidades, Cronocirujanos! Han completado con éxito la línea de tiempo. Tras asegurar el cierre de la cavidad al verificar que la variación de presión en la vía aérea era menor a 4 mmHg y no requerir más lavados, protegieron la incisión con Prevena™. A −125 mmHg por 7 días, redujeron la tensión lateral, aislaron la contaminación externa y previnieron la infección del sitio quirúrgico y la hernia incisional. ¡El paciente de 38 años ha recuperado su futuro!'
    }
  ],

  /* Aplicación Prevena™ (Prueba 5.3) · BORRADOR para validación de Solventum */
  prevena: {
    pasos: [
      { t: 'Preparar el lecho incisional', d: 'Limpiar y secar la piel alrededor de la incisión cerrada. La piel debe quedar seca y libre de residuos para lograr un buen sellado.' },
      { t: 'Seleccionar el apósito', d: 'Elegir un apósito Prevena™ cuya espuma cubra toda la longitud de la incisión, con margen a ambos extremos.' },
      { t: 'Posicionar el apósito sobre la sutura', d: 'Retirar la lámina protectora y centrar la espuma sobre la línea de sutura, sin estirar la piel ni dejar arrugas.' },
      { t: 'Sellar los bordes', d: 'Presionar firmemente el adhesivo contra la piel en todo el contorno y reforzar los bordes con las tiras de sellado si es necesario.' },
      { t: 'Conectar la unidad', d: 'Conectar el tubo del apósito a la unidad portátil Prevena™ y verificar que la conexión quede firme.' },
      { t: 'Activar el vacío', d: 'Encender la unidad. La presión negativa continua de −125 mmHg compacta la espuma; verificar que no haya fugas. La terapia se mantiene hasta por 7 días.' }
    ],
    ventajas: [
      ['Actúa como barrera contra la contaminación externa.', 'N'],
      ['Ayuda a mantener unidos los bordes de la incisión.', 'P'],
      ['Remueve fluidos y material infeccioso.', '2'],
      ['Reducción de la tensión lateral de la incisión.', '0'],
      ['Proporciona presión negativa de −125 mmHg hasta por 7 días.', '1'],
      ['Reducción del edema.', '0']
    ]
  },

  final: {
    titulo: '¡MISIÓN CUMPLIDA!',
    texto: 'Línea de tiempo quirúrgica completada con éxito. Cierre fascial y protección incisional validados. El paciente de 38 años ha recuperado su futuro.'
  }
};
