/* ==========================================================================
   MÁQUINA DEL TIEMPO · Código: Cirugía del Futuro
   CONTENIDO DEL JUEGO
   Metodología y diseño del juego: Nathalia Velasco · Simoné
   --------------------------------------------------------------------------
   Este archivo es el único que hay que tocar para cambiar textos, pistas,
   tiempos o estaciones. La lógica de la plataforma vive en app.js.

   Tipos de paso:
     accion      → se trabaja en la mesa física; la pantalla guía y espera "HECHO".
     solicitud   → el equipo pide información al Guía; la pantalla la revela.
     revelacion  → la pantalla muestra un documento (ej. reporte quirúrgico).
     codigo      → el Comandante digita un código; se valida aquí.

   Las respuestas NO están escritas en claro: se guarda su huella (SHA-256)
   y el código se compara con ella. Para cambiar una respuesta, pídele a
   Claude que regenere la huella.
   ========================================================================== */

window.CONTENIDO = {
  juego: {
    titulo: 'MÁQUINA DEL TIEMPO',
    subtitulo: 'Código: Cirugía del Futuro',
    minutosPorEstacion: 12,
    intentosPorCodigo: 3,
    /* Pistas: segundos sin avanzar en un paso para que aparezca cada nivel. */
    pistasSegundos: [120, 240, 360],
    costoPistaDirecta: 1,
    bonosTiempo: [
      { hasta: 300, puntos: 6, etiqueta: 'Menos de 5:00 min' },
      { hasta: 480, puntos: 5, etiqueta: 'Entre 5:01 y 8:00 min' },
      { hasta: 660, puntos: 4, etiqueta: 'Entre 8:01 y 11:00 min' },
      { hasta: 720, puntos: 3, etiqueta: 'Entre 11:01 y 12:00 min' }
    ],
    grupos: [
      { id: 'davinci', nombre: 'Alquimistas de Da Vinci', color: '#2fd27a', simbolo: '⚡' },
      { id: 'verne',   nombre: 'Exploradores de Verne',   color: '#c9793f', simbolo: '⚙' },
      { id: 'wells',   nombre: 'Viajeros de Wells',       color: '#3d7bff', simbolo: '⌛' },
      { id: 'tesla',   nombre: 'Guardianes de Tesla',     color: '#f2b233', simbolo: '✦' }
    ],
    intro: [
      'Bienvenidos, doctores. Deténganse un segundo justo ahí… en el umbral exacto donde el presente se encuentra con el futuro.',
      'Lo que ven a su alrededor no es una capacitación ordinaria: es la entrada a un laberinto temporal. A partir de este instante, el quirófano deja de ser un espacio de cuatro paredes y se convierte en un nexo donde el tiempo se mide en decisiones de alta precisión.',
      'Un paciente masculino de 38 años acaba de ingresar tras un colapso masivo en carretera. En la línea de tiempo convencional, las decisiones apresuradas lo condenarían a un año de hernias gigantes, fístulas, infecciones o un abdomen congelado.',
      'Ustedes no están aquí para seguir el curso ordinario de la historia. Están aquí para cambiarla. Tendrán 12 minutos por cámara. Yo los acompañaré en esta pantalla.',
      'Ajusten sus relojes. La línea temporal del paciente acaba de fracturarse. Doctores… crucen el portal y protejan el mañana.'
    ],
    roles: [
      { id: 'piloto',     nombre: 'Líder Piloto de Vuelo', mision: 'Coordina, marca el ritmo y valida el consenso clínico.' },
      { id: 'copiloto',   nombre: 'Copiloto',              mision: 'Custodio del registro manual: anota pistas y códigos en la bitácora.' },
      { id: 'comandante', nombre: 'Comandante de Misión',  mision: 'Custodio digital: opera esta tablet y digita los códigos.' },
      { id: 'tripulacion',nombre: 'Tripulantes de Élite',  mision: 'Inspeccionan la mesa, descifran candados y ejecutan el hands-on.' }
    ]
  },

  estaciones: [
    /* ======================================================================
       ESTACIÓN 1
       ====================================================================== */
    {
      id: 'E1',
      numero: 1,
      nombre: 'El Umbral del Trauma',
      subtitulo: 'Fisura en la Línea de Vida',
      lugar: 'Sala de urgencias · Hospital de alta complejidad',
      nodoLinea: 'Supervivencia inicial',
      briefing: {
        titulo: 'Ingreso por ambulancia',
        texto: [
          'Paciente masculino de 38 años. Copiloto de un automóvil que recibió un impacto lateral derecho a alta velocidad. De las tres personas involucradas, es el único sobreviviente.',
          'Ingresa inmovilizado con tabla rígida y collar cervical, canalizado con dos yelcos #14 por los que ha recibido 2 litros de cristaloides.',
          'Responde su nombre y edad, pero no recuerda bien lo ocurrido y se nota confuso. Glasgow 14/15.',
          'Al examen físico: marca del cinturón de seguridad, equimosis en hemitórax derecho, flanco e hipocondrio derechos.'
        ]
      },
      pasos: [
        {
          id: 'e1-explorar', tipo: 'accion', rol: 'Toda la tripulación',
          titulo: 'Exploren la mesa',
          instruccion: 'Retiren la tela negra de la mesa de operaciones. El Líder Piloto lee en voz alta la Tarjeta de Historia Clínica de ingreso. Sobre la mesa hay 10 fichas clínicas.',
          guia: 'El reloj ya corre. Lean el ingreso completo antes de tocar una sola ficha: cada detalle del mecanismo del trauma importa.',
          boton: 'MESA EXPLORADA'
        },
        {
          id: 'e1-indicaciones', tipo: 'accion', rol: 'Tripulantes de Élite',
          titulo: 'Separen las indicaciones reales',
          instruccion: 'De las 10 fichas, solo algunas son indicaciones reales para NO cerrar la cavidad abdominal. Descarten las trampas y ordenen en línea sobre la mesa las indicaciones verdaderas para este paciente.',
          guia: 'No todo paciente inestable necesita un abdomen abierto. Busquen la fisiología, no la costumbre.',
          pistas: [
            'Pregúntense: si cierran hoy esta pared, ¿qué le pasa al paciente en las próximas 24 horas?',
            'Busquen la Tríada Letal, el Síndrome Compartimental Abdominal, el edema que impide cerrar sin tensión, el packing con second-look y la necesidad de reevaluar perfusión.',
            'Las trampas son: uso profiláctico en apendicitis no complicada, inestabilidad leve que responde a 500 cc, cierre aponeurótico a tensión forzada y hematoma retroperitoneal zona III estable.'
          ],
          boton: 'INDICACIONES EN LÍNEA'
        },
        {
          id: 'e1-solicitud', tipo: 'solicitud', rol: 'Líder Piloto de Vuelo',
          titulo: 'Exijan los datos críticos',
          instruccion: 'Con las fichas ya en línea, el Líder Piloto solicita en voz alta los signos vitales y la ecografía FAST.',
          guia: 'Un especialista no entrega exámenes a quien adivina. Pídanlos en voz alta, como en el box de trauma.',
          botonSolicitud: 'SOLICITAR SIGNOS VITALES Y FAST',
          revela: {
            tipo: 'monitor',
            vitales: [
              { etiqueta: 'TA', valor: '80/50', unidad: 'mmHg', alerta: true },
              { etiqueta: 'FC', valor: '130', unidad: 'lpm', alerta: true },
              { etiqueta: 'T°', valor: '34.8', unidad: '°C', alerta: true, destacar: true },
              { etiqueta: 'Glasgow', valor: '14', unidad: '/15', alerta: false }
            ],
            imagen: {
              titulo: 'Ecografía FAST',
              resultado: 'POSITIVA (+)',
              detalle: 'Líquido libre en espacio hepatorrenal (Morison) y en toda la cavidad abdominal. Compatible con hemoperitoneo masivo.'
            },
            nota: 'Sin respuesta a 2 L de cristaloides: shock refractario.'
          },
          boton: 'DATOS ANALIZADOS'
        },
        {
          id: 'e1-c11', tipo: 'codigo', codigo: '1.1', rol: 'Comandante de Misión', puntos: 4,
          titulo: 'Código 1.1 · El hallazgo que justifica la laparotomía',
          pregunta: 'Tras analizar los resultados y confirmar el shock refractario, ¿cuál es el código del hallazgo ecográfico que confirma el hemoperitoneo y justifica la laparotomía de urgencia inmediata?',
          formato: 'Sigla del examen + signo matemático de positividad',
          placeholder: 'EJ: XXXX±',
          huellas: ['aa3c8e462a9374ba0a38d2c98a7ab74370e1640e620a6684888cf115620b47f2'],
          liberar: 'K1RTQUY=',
          errores: [
            { si: '^FAST$', msg: 'Van bien con el examen, pero les falta el signo que indica el resultado.' },
            { si: 'ECO|ECOGRAFIA', msg: 'Usen la sigla exacta del examen de trauma, no el nombre genérico.' }
          ],
          errorGeneral: 'Ese no es el hallazgo. Vuelvan al resultado de la imagen en el monitor.',
          bitacora: 'Copiloto: registren el código 1.1 en la bitácora.'
        },
        {
          id: 'e1-triada', tipo: 'accion', rol: 'Tripulantes de Élite',
          titulo: 'Completen la Tríada Letal',
          instruccion: 'Sobre la Caja de Madera hay un diagrama con tres espacios vacíos. Relacionen cada ficha (Hipotermia · Acidosis / Shock refractario · Coagulopatía / Hemoperitoneo) con el parámetro del paciente. Los dígitos marcados en azul en la tarjeta de temperatura forman la combinación del candado.',
          guia: 'Hipotermia, acidosis y coagulopatía se alimentan entre sí. Si no rompen el círculo, ninguna sutura salvará a este paciente.',
          pistas: [
            '¿Cuál de los tres componentes pueden medir directamente con los datos que ya tienen en pantalla?',
            'La hipotermia está definida por debajo de 35 °C. Miren la temperatura del paciente.',
            'La combinación son los tres dígitos de la temperatura, sin el punto decimal.'
          ],
          boton: 'TRÍADA COMPLETA'
        },
        {
          id: 'e1-c12', tipo: 'codigo', codigo: '1.2', rol: 'Comandante de Misión', puntos: 4, candado: true,
          titulo: 'Código 1.2 · El candado de la Tríada',
          pregunta: '¿Cuál es la combinación de 3 dígitos que abre el candado de la Caja de Madera, derivada de la temperatura corporal crítica del paciente?',
          formato: 'Solo los 3 dígitos, sin puntos ni espacios',
          placeholder: '_ _ _',
          huellas: ['6a9dadec2da9c4e0f646b66d82850b148d2e87e5b97f977016b6bd50c7bc1bab'],
          liberar: 'ODQz',
          errores: [
            { si: '[.,]', msg: 'Casi: el candado no tiene punto decimal. Solo los tres dígitos.' },
            { si: '^\\d{4,}$', msg: 'El candado tiene exactamente 3 dígitos.' }
          ],
          errorGeneral: 'El candado no cede. ¿Qué componente de la tríada se lee en la temperatura?',
          bitacora: 'Abran la caja. Copiloto: registren el código 1.2 en la bitácora.'
        },
        {
          id: 'e1-reporte', tipo: 'revelacion', rol: 'Toda la tripulación',
          titulo: 'Lean el reporte de laparotomía',
          instruccion: 'Dentro de la caja encontraron el Reporte Quirúrgico de Laparotomía de Urgencia. También lo tienen en pantalla.',
          guia: 'Ya están dentro de la cavidad. Ahora la pregunta no es qué pueden reparar, sino qué deben dejar de hacer para que el paciente sobreviva.',
          documento: {
            titulo: 'Reporte Quirúrgico · Laparotomía de Urgencia',
            encabezado: 'Historia clínica n.º 0508 · Paciente: Santiago Piedrahita · 38 años',
            lineas: [
              ['Hallazgos', 'Lesión hepática grado IV (hipocondrio derecho), sangrante.'],
              ['', 'Hemoperitoneo masivo: 2.500 cc.'],
              ['', 'Desgarro de epiplón sin sangrado activo.'],
              ['', 'Edema severo de asas intestinales.'],
              ['Procedimiento', 'Empaquetamiento (packing) hepático y control de daños inicial.']
            ]
          },
          boton: 'REPORTE LEÍDO'
        },
        {
          id: 'e1-matriz', tipo: 'accion', rol: 'Tripulantes de Élite',
          titulo: 'Armen la matriz de control de daños',
          instruccion: 'En la mesa hay 7 fichas de conductas quirúrgicas, cada una con un número en la esquina. Seleccionen solo las 4 conductas correctas de Control de Daños para este escenario, descarten las 3 de riesgo y sumen sus valores.',
          guia: 'Prolongar la cirugía o cerrar a tensión una pared edematizada lleva a falla orgánica irreversible. Piensen en cirugía abreviada.',
          pistas: [
            'La cirugía de control de daños tiene un solo objetivo inmediato: detener la hemorragia y la contaminación en el menor tiempo posible.',
            'Descarten todo lo que alargue la cirugía o cierre la pared: resecciones regladas, cirugías profilácticas y cierres a tensión.',
            'Las 4 correctas son: hemostasia de la lesión hepática, packing con compresas, CCD abreviada y dejar el abdomen abierto.'
          ],
          boton: 'MATRIZ ARMADA'
        },
        {
          id: 'e1-c13', tipo: 'codigo', codigo: '1.3', rol: 'Comandante de Misión', puntos: 4,
          titulo: 'Código 1.3 · El volumen crítico',
          pregunta: 'Tras clasificar las 4 conductas de control de daños correctas, ¿cuál es el valor resultante de la suma de sus fichas? Equivale al volumen crítico (en decilitros) del hemoperitoneo evacuado.',
          formato: 'Valor numérico de dos dígitos',
          placeholder: '_ _',
          huellas: ['c5f7f89b7c1880604dad9962f2a9a56b9baa87101fcebd0e750988a6d6fbc344'],
          liberar: 'NTI=',
          errores: [
            { si: '^2[.,]?5$', msg: 'Ese es el volumen en litros. El código va en decilitros, sin decimales.' }
          ],
          errorGeneral: 'La suma no coincide con el volumen del reporte. ¿Alguna de sus fichas prolonga la cirugía o cierra a tensión?',
          bitacora: 'Copiloto: registren el código 1.3 en la bitácora.'
        },
        {
          id: 'e1-c14', tipo: 'codigo', codigo: '1.4', rol: 'Comandante de Misión', puntos: 2, salida: true,
          titulo: 'Clave de salida · Estación 1',
          pregunta: 'Revisen la bitácora: resten a la clave del candado de la Tríada (1.2) la suma de la Conducta CCD (1.3). Ese resultado desacopla el Umbral del Trauma.',
          formato: 'Valor numérico de tres dígitos',
          placeholder: '_ _ _',
          huellas: ['30953f1bc2138051fa2290795a9efeb14465d8fe8bdf61e3fcd389a5ac0a932f'],
          liberar: 'MzIz',
          errores: [
            { si: '^373$', msg: 'Sumaron. La clave de salida es una resta.' }
          ],
          errorGeneral: 'La operación no da. Revisen en la bitácora los códigos 1.2 y 1.3.',
          bitacora: ''
        }
      ],
      cierre: {
        mensaje: '¡CÓDIGO DE TRASLADO AUTORIZADO!',
        detalle: 'Paciente estabilizado hemodinámicamente con empaquetamiento hepático y abdomen abierto.',
        especialista: 'Excelente trabajo, Cronocirujanos. Identificaron que un shock refractario por lesión hepática grado IV, con 2,5 L de hemoperitoneo e hipotermia de 34,8 °C, exigía una Cirugía de Control de Daños inmediata. Empaquetar y mantener el abdomen abierto es la única opción que evita el colapso fisiológico del paciente en esta línea de tiempo.',
        aprendizajes: [
          'El abdomen abierto se indica por fisiología, no por rutina: Tríada Letal, SCA (PIA > 20 mmHg con disfunción de órgano), edema que impide cerrar sin tensión, packing con second-look, necesidad de reevaluar perfusión o pérdida de pared.',
          'La Tríada Letal (hipotermia < 35 °C, acidosis pH < 7,2, coagulopatía) obliga a abreviar la cirugía.',
          'Control de daños = detener sangrado y contaminación, empaquetar y diferir el cierre. Cerrar a tensión una pared edematizada es crear un síndrome compartimental.'
        ],
        lineaVida: 'Nodo 1 restaurado · El paciente sobrevive a la primera hora. Su fascia sigue en juego.',
        siguiente: 'Crucen el portal hacia la Estación 2: El Enigma del Vacío, donde definirán la tecnología exacta para preservar esta pared abdominal.'
      }
    },

    /* Estaciones 2 a 5: se construyen a partir del documento de Natha. */
    { id: 'E2', numero: 2, nombre: 'El Enigma del Vacío',      subtitulo: 'Las 9 claves de la pared temporal', nodoLinea: 'Tecnología de cierre temporal', enConstruccion: true },
    { id: 'E3', numero: 3, nombre: 'El Taller del Cronógrafo', subtitulo: 'Calibración quirúrgica del abdomen', nodoLinea: 'Ensamble de la terapia',        enConstruccion: true },
    { id: 'E4', numero: 4, nombre: 'El Vínculo de Vigilancia', subtitulo: 'El radar de la UCI',                 nodoLinea: 'Vigilancia 24-72 h',            enConstruccion: true },
    { id: 'E5', numero: 5, nombre: 'El Salto Temporal',        subtitulo: 'Sellado e incisión de alta tensión', nodoLinea: 'Cierre y protección',           enConstruccion: true }
  ]
};
