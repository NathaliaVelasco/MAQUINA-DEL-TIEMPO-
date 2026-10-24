/* ==========================================================================
   BITÁCORA DE TRÁNSITO TEMPORAL · contenido
   Texto tomado literalmente del documento "Bitacora Digitál" (no modificar datos).
   Cajas blancas: [[respuesta]] dentro de un texto se convierte en una casilla
   para completar. Varias respuestas válidas se separan con |. [[]] = respuesta
   libre (el documento no trae la palabra).
   Metodología y diseño: Nathalia Velasco · Simoné
   ========================================================================== */
window.BITACORA = {
  titulo: 'Manejo quirúrgico del trauma abdominal',
  subtitulo: 'Bitácora de tránsito temporal',
  sello: 'Consenso internacional de expertos',
  fases: [
    {
      id: 'I',
      nombre: 'Indicación y toma de decisiones críticas',
      objetivo: 'Evitar el retraso terapéutico o el uso injustificado del AA mediante criterios objetivos de inclusión y fisiológicos claros.',
      puntos: [
        {
          n: 1,
          titulo: 'Identificación de la Tríada DE LA MUERTE o Shock Refractario (Control de Daños)',
          descripcion: [],
          clave: 'El hallazgo de estos tres parámetros obliga a iniciar de inmediato la Cirugía de Control de [[Daños]] (CCD) con empaquetamiento y abdomen abierto.',
          conceptos: [
            { t: 'Hipotermia', d: 'Temperatura corporal menor a 35°C.' },
            { t: 'Acidosis metabólica', d: 'pH menor a 7.2.' },
            { t: 'Coagulopatía', d: 'Alteración de la [[]]' }
          ],
          acciones: 'La identificación temprana de la Tríada DE LA MUERTE es esencial para mejorar la supervivencia del paciente en shock refractario. La decisión rápida y coordinada del equipo salva vidas.'
        },
        {
          n: 2,
          titulo: 'Medición de la Presión Intraabdominal (PIA)',
          descripcion: ['Asociada a disfunción de cualquier órgano:'],
          lista: ['Oliguria', 'Aumento de presiones en ventilación mecánica', 'Hipotensión'],
          descripcion2: 'Establece el diagnóstico definitivo de Síndrome Compartimental Abdominal (SCA).',
          conceptos: [
            { t: 'Registro cuantitativo', d: 'Medición de la PIA mediante técnica indirecta, idealmente intravesical.' },
            { t: 'Frecuencia', d: 'Control cada [[4 a 6|4-6|4 - 6]] horas.' },
            { t: 'Umbral diagnóstico', d: 'PIA mayor a [[20 mmHg|20|20mmhg]] confirmada.' }
          ],
          acciones: 'La medición seriada de la PIA permite detectar oportunamente el Síndrome Compartimental Abdominal. La integración del valor > 20 mmHg con disfunción orgánica confirma el diagnóstico y orienta la intervención inmediata.'
        },
        {
          n: 3,
          titulo: 'Evaluación de Falla en el Manejo Médico del SCA',
          descripcion: ['Verificación y registro del fracaso del protocolo no invasivo tras un ciclo de evaluación rápida.'],
          clave: 'Si las medidas médicas conservadoras fracasan tras esta evaluación inicial, debe procederse a [[Laparotomía]] descompresiva quirúrgica de urgencia.',
          conceptos: [
            { t: 'Descompresión digestiva', d: 'Descompresión nasogástrica y rectal.' },
            { t: 'Optimización terapéutica', d: 'Sedoanalgesia óptima y parálisis neuromuscular transitoria.' },
            { t: 'Evaluación y balance', d: 'Evacuación de colecciones intraabdominales guiada por ecografía/TAC y [[balance hídrico]] neutro o negativo con diuréticos o TRRC.' }
          ],
          acciones: 'Confirmar y documentar el fracaso del manejo médico del SCA antes de la descompresión quirúrgica urgente. La valoración rápida y el registro preciso facilitan una decisión oportuna y segura.'
        },
        {
          n: 4,
          titulo: 'Evaluación transoperatoria visual y objetiva de la distensión del asas intestinales, el mesenterio y el espacio retroperitoneal',
          descripcion: [],
          clave: 'Si la aproximación suave de los [[bordes aponeuróticos]] con pinzas de tracción genera una presión de cierre excesiva que amenaza con desencadenar un SCA secundario inmediato, se prohíbe el cierre fascial primario y se indica formalmente el AA.',
          conceptos: [
            { t: 'Distensión intestinal', d: 'Evaluación de la distención de las asas intestinales' },
            { t: 'Mesenterio y retroperitoneo', d: 'Valoración del edema del mesenterio y del espacio retroperitoneal.' },
            { t: 'Prueba de cierre aponeurótico', d: 'Aproximación suave con pinzas de tracción para identificar [[presión de cierre excesiva]].' }
          ],
          acciones: 'Documentar el edema visceral masivo y la pérdida de dominio. Ante presión de cierre excesiva, evitar el cierre fascial primario e indicar formalmente el AA para prevenir un SCA secundario inmediato.'
        }
      ]
    },
    {
      id: 'II',
      nombre: 'Manejo transoperatorio y preservación de la pared abdominal',
      objetivo: 'Proteger el dominio abdominal, aislar las vísceras y prevenir la retracción lateral irreversible del complejo muscular transverso-oblicuo.',
      puntos: [
        {
          n: 5,
          titulo: 'Justificación de Sepsis Intraabdominal Severa (Laparotomía Planificada / Relaparotomía)',
          descripcion: ['Documentación explícita en la historia clínica del paciente de los factores que exigen un second-look quirúrgico programado en un intervalo estricto de 24 a 48 horas.'],
          clave: 'El second-look quirúrgico debe programarse entre [[24 y 48 horas|24 y 48|24 a 48 horas|24-48 horas]] cuando el control infeccioso, la viabilidad intestinal o la evolución del tejido necrótico no puedan definirse de manera definitiva en la primera intervención.',
          conceptos: [
            { t: 'Focos infecciosos no controlables', d: 'Focos infecciosos no controlables en el primer tiempo.' },
            { t: 'Viabilidad intestinal dudosa', d: 'Viabilidad intestinal dudosa que requiera reevaluación de [[isquemia]].' },
            { t: '[[Desbridamiento]] de tejido necrótico retroperitoneal', d: 'Necesidad de un desbridamiento de tejido necrótico retroperitoneal en evolución.' }
          ],
          acciones: 'Documentar el edema visceral masivo y la pérdida de dominio. Ante presión de cierre excesiva, evitar el cierre fascial primario e indicar formalmente el AA para prevenir un SCA secundario inmediato.'
        },
        {
          n: 6,
          titulo: 'Selección de la Técnica de Cierre [[Temporal]] de Elección (TTP)',
          descripcion: ['Aplicación prioritaria de Terapia de presión negativa (TPN) sobre otro tipo de técnicas para el manejo temporal del abdomen abierto.'],
          clave: 'El Consenso de Milán y el registro IROA respaldan la TPN por su capacidad para depurar fluido peritoneal inflamatorio, reducir el edema visceral y facilitar un cierre aponeurótico [[definitivo]] exitoso.',
          conceptos: [
            { t: 'Depuración de fluido peritoneal inflamatorio', d: 'Capacidad de la TPN para depurar fluido peritoneal inflamatorio.' },
            { t: 'Reducción del edema visceral', d: 'Capacidad de la TPN para reducir el edema visceral.' },
            { t: 'Cierre aponeurótico definitivo exitoso', d: 'Capacidad de la TPN para facilitar un cierre aponeurótico definitivo exitoso.' }
          ],
          acciones: 'Priorizar la TPN como técnica de cierre temporal frente a métodos de contención pasiva, especialmente por su efecto en la depuración del fluido inflamatorio, la disminución del edema visceral y la mayor probabilidad de lograr un cierre aponeurótico exitoso.'
        },
        {
          n: 7,
          titulo: 'Aislamiento, Cobertura y Protección Visceral Profunda',
          descripcion: ['Colocación minuciosa de una barrera plástica fenestrada de poliuretano no adherente, que cubra la totalidad de las vísceras expuestas.'],
          clave: 'Evitar que el epiplón o las asas intestinales se adhieran a la pared abdominal anterior o a la fascia',
          conceptos: [
            { t: 'Barrera plástica fenestrada no adherente', d: 'Colocación minuciosa de una barrera plástica fenestrada de poliuretano no adherente.' },
            { t: 'Canales parietocólicos y fondo de saco de [[Douglas]]', d: 'Extensión profunda en los canales parietocólicos bilaterales y el fondo de saco de Douglas.' },
            { t: 'Prevención de fístulas', d: 'Evitar que el epiplón o las [[asas]] intestinales se adhieran a la pared abdominal anterior o a la fascia, previniendo la formación de fístulas.' }
          ],
          acciones: 'La protección visceral, al disminuir el riesgo de adherencias a la pared, disminuye la posibilidad de fístulas intestinales y aumenta las tasas de cierre de la pared abdominal'
        },
        {
          n: 8,
          titulo: 'Modo de succión continua',
          descripcion: ['Programación del sistema de TPN en modo continuo para mantener una presión negativa estable y constante.'],
          clave: 'La presión [[negativa]] debe modularse cuidadosamente para reducir el riesgo de fístula iatrogénica, especialmente en contextos de mayor vulnerabilidad tisular.',
          conceptos: [
            { t: '[[Modo de succión continua]]', d: 'Programación del sistema de TPN en modo de terapia de presión negativa modo continuo para mantener una presión negativa constante.' },
            { t: 'Rango inicial de presión', d: 'Ajuste inicial recomendado entre -100 mmHg y -125 mmHg, según la tolerancia tisular y el objetivo terapéutico.' },
            { t: 'Modulación en situaciones de riesgo', d: 'Disminuir la intensidad hacia valores menores, por ejemplo -75 mmHg, si existe anastomosis intestinal reciente, sospecha de isquemia de pared del asa o fragilidad capilar extrema.' }
          ],
          acciones: 'La presión negativa debe modularse cuidadosamente para reducir el riesgo de fístula iatrogénica, especialmente en contextos de mayor vulnerabilidad tisular.'
        },
        {
          n: 9,
          titulo: 'Implementación de Tracción Fascial Dinámica Continua (TFDC)',
          descripcion: ['Integración obligatoria de un sistema de tracción fascial anclado directamente a los bordes de la aponeurosis y combinado con la TPN.'],
          clave: 'La tracción fascial continua, anclada a la aponeurosis y asociada a la TPN, es clave para mantener la fascia medializada y evitar su retracción progresiva.',
          conceptos: [
            { t: 'Sistema de tracción fascial', d: 'Implementación obligatoria de un sistema de tracción fascial dinámica continua mediante suturas cruzadas de polipropileno loop, mallas de tracción o sistemas mecánicos fasciales comerciales.' },
            { t: '[[Anclaje directo]] a la aponeurosis', d: 'El sistema debe fijarse directamente a los bordes de la aponeurosis para mantener control sobre la tensión fascial.' },
            { t: 'Combinación con TPN y control de retracción', d: 'La TFDC debe combinarse con la TPN para contrarrestar la tracción lateral de los músculos anchos del abdomen y prevenir la [[retracción de la fascia]] hacia las líneas axilares.' }
          ],
          acciones: 'Incorporar de forma obligatoria un sistema de TFDC anclado a la aponeurosis y combinado con TPN, para oponerse a la tracción lateral muscular y favorecer la preservación de la fascia en posición adecuada.'
        },
        {
          n: 10,
          titulo: 'Clasificación de Björck y Marcación de Bordes Aponeuróticos',
          descripcion: ['Clasificación formal del abdomen abierto en cada intervención y preservación visual de los bordes de fascia sana para proteger el plano de cierre futuro.'],
          clave: 'Clasificar el abdomen y preservar los bordes aponeuróticos permite seguir [[su evolución]] y [[mantener]] intacto el tejido necesario para una futura aproximación fascial.',
          conceptos: [
            { t: 'Clasificación de Björck modificada', d: 'Registrar en cada intervención el grado del abdomen abierto: Grado 1 sin adherencias, Grado 2 con adherencias, Grado 3 abdomen congelado y Grado 4 abdomen congelado con fístula enteroatmosférica establecida.' },
            { t: 'Identificación de fascia sana', d: 'Identificar visualmente y marcar los [[bordes aponeuróticos]] viables para conservar una referencia anatómica clara durante las intervenciones sucesivas.' },
            { t: 'Preservación del plano de sutura', d: 'Evitar desbridamientos agresivos o innecesarios que puedan destruir los bordes fasciales y comprometer el plano anatómico destinado al cierre futuro.' }
          ],
          acciones: 'Documentar el grado de Björck en cada intervención, marcar la fascia sana y limitar el desbridamiento únicamente al tejido que lo requiera, priorizando la conservación del plano anatómico de sutura futura.'
        }
      ]
    },
    {
      id: 'III',
      nombre: 'Monitorización y cuidado postoperatorio en UCI',
      objetivo: 'Controlar el balance sistémico del paciente, optimizar la perfusión y prevenir activamente la fístula enteroatmosférica (FEA).',
      puntos: [
        {
          n: 11,
          titulo: 'Monitoreo Continuo de la PIA Post-Descompresión en UCI',
          descripcion: ['Medición y registro seriado de la presión intraabdominal cada [[4 a 6 horas|4-6 horas|4 a 6]] para detectar precozmente alteraciones recurrentes.'],
          clave: 'La monitorización seriada de la PIA permite reconocer tempranamente una nueva elevación de la presión abdominal antes de que progrese a una complicación recurrente.',
          conceptos: [
            { t: 'Medición cada [[4–6 horas|4-6 horas|4 a 6 horas|4-6]]', d: 'Medir y registrar la presión intraabdominal de forma periódica en el paciente críticamente enfermo durante su vigilancia en UCI.' },
            { t: 'Detección de HIA persistente', d: 'Identificar precozmente la hipertensión intraabdominal persistente cuando la PIA se mantenga por encima de [[12]] mmHg.' },
            { t: 'Vigilancia de recurrencia', d: 'Detectar un síndrome compartimental abdominal recurrente asociado a acumulación de líquido o ineficacia del sistema de drenaje.' }
          ],
          acciones: 'Registrar la PIA cada 4 a 6 horas y considerar como señal de alarma una elevación persistente por encima de 12 mmHg, especialmente si existe acumulación de líquido o sospecha de drenaje ineficaz.'
        },
        {
          n: 12,
          titulo: 'Cuantificación, Tipificación y Registro del Gasto del AA',
          descripcion: ['Control horario y registro estricto de las características del líquido recolectado en los contenedores de TPN para identificar cambios sugestivos de complicaciones.'],
          clave: 'La evolución del gasto y de las características del drenaje puede ofrecer una señal precoz de [[sangrado o|sangrado]] de comunicación con el tracto digestivo.',
          conceptos: [
            { t: 'Control horario del volumen', d: 'Cuantificar y registrar estrictamente cada hora el volumen de líquido recolectado en los contenedores del sistema de TPN.' },
            { t: 'Color y consistencia del drenaje', d: 'Documentar las características del líquido, incluyendo su color —seroso, hemático, purulento o entérico— y su consistencia.' },
            { t: 'Cambios como señal de alerta', d: 'Un cambio súbito del volumen o la aparición de [[contenido biliar]] o entérico debe alertar sobre una posible complicación hemorrágica o una fístula digestiva temprana.' }
          ],
          acciones: 'Registrar de forma horaria el volumen, color y consistencia del gasto del abdomen abierto, prestando especial atención a incrementos súbitos y a la aparición de contenido biliar o entérico como signos de alarma que requieren valoración inmediata.'
        },
        {
          n: 13,
          titulo: 'Inspección No Invasiva de la Viabilidad de Asas y Perfusión',
          descripcion: ['Evaluación periódica de las asas intestinales visibles a través del apósito transparente de la TPN para detectar precozmente signos de compromiso vascular.'],
          clave: 'Los cambios de coloración, turgencia o perfusión pueden anticipar un deterioro de la viabilidad [[intestinal]] antes del siguiente recambio en el quirófano.',
          conceptos: [
            { t: 'Evaluación visual periódica', d: 'Inspeccionar de forma seriada las asas intestinales visibles a través del apósito transparente del [[sistema de TPN|sistema TPN|TPN]].' },
            { t: 'Color, turgencia y perfusión', d: 'Valorar el color, la turgencia y la perfusión de las asas como indicadores de viabilidad intestinal durante el seguimiento en UCI.' },
            { t: 'Signos de compromiso vascular', d: 'Vigilar la acumulación de fibrina y la aparición de áreas pálidas o violáceas que puedan sugerir compromiso vascular mesentérico.' }
          ],
          acciones: 'Realizar inspecciones periódicas a través del apósito transparente y considerar la presencia de fibrina, palidez o coloración violácea como señales de alerta que requieren valoración del posible compromiso vascular mesentérico antes del próximo recambio quirúrgico.'
        },
        {
          n: 14,
          titulo: 'Reanimación Hídrica Guiada por Objetivos y Presión de Perfusión Abdominal',
          descripcion: ['Terapia de fluidos restrictiva y guiada por metas de perfusión para evitar la sobrecarga hídrica y preservar una adecuada microcirculación [[esplácnica]].'],
          clave: 'El equilibrio entre una reanimación suficiente y la prevención de la sobrecarga hídrica es esencial para mantener la perfusión esplácnica sin incrementar el edema visceral.',
          conceptos: [
            { t: 'Fluidoterapia restrictiva y guiada', d: 'Implementar una terapia de fluidos restrictiva y orientada por metas microcirculatorias, evitando una administración excesiva de volumen.' },
            { t: 'Prevención de sobrecarga hídrica', d: 'Evitar la sobrecarga de líquidos, ya que perpetúa el edema de las asas intestinales y puede retrasar el cierre abdominal definitivo.' },
            { t: 'PPA mayor a [[60]] mmHg', d: 'Mantener una presión de perfusión abdominal superior a 60 mmHg para favorecer la viabilidad de la microcirculación esplácnica. La PPA se obtiene mediante la relación PAM − PIA.' }
          ],
          acciones: 'Guiar la reposición de fluidos por objetivos de perfusión, limitar la sobrecarga de volumen y vigilar la relación entre PAM y PIA, procurando mantener una PPA superior a 60 mmHg para preservar la microcirculación esplácnica y favorecer el cierre abdominal.'
        },
        {
          n: 15,
          titulo: 'Soporte Nutricional Enteral Precoz y Preservación de la Barrera Mucosa',
          descripcion: ['Inicio temprano de nutrición enteral a dosis trófica para preservar la integridad intestinal y reducir las consecuencias del catabolismo crítico.'],
          clave: 'El aporte enteral temprano contribuye a mantener la función de la mucosa intestinal y limitar el deterioro [[metabólico]] asociado al estado crítico.',
          conceptos: [
            { t: 'Inicio precoz en 24–48 horas', d: 'Iniciar la nutrición enteral dentro de las primeras [[24 a 48|24-48|24 y 48]] horas postoperatorias, preferiblemente por vía nasoyeyunal cuando esté indicada.' },
            { t: 'Alimentación a dosis trófica', d: 'Administrar nutrición enteral a dosis trófica, siempre que no existan signos de isquemia intestinal o una fístula de alto gasto no controlada.' },
            { t: 'Preservación de la barrera mucosa', d: 'La nutrición enteral precoz ayuda a prevenir la atrofia de las vellosidades, reducir la translocación bacteriana y contrarrestar el catabolismo severo.' }
          ],
          acciones: 'Iniciar nutrición enteral trófica durante las primeras 24 a 48 horas cuando las condiciones intestinales lo permitan, evitando su instauración ante signos de isquemia o fístula de alto gasto no controlada y priorizando la preservación de la barrera mucosa.'
        }
      ]
    },
    {
      id: 'IV',
      nombre: 'Planificación del cierre fascial definitivo',
      objetivo: 'Maximizar la tasa de cierre anatómico primario completo y evitar la catástrofe del abdomen congelado.',
      puntos: [
        {
          n: 16,
          titulo: 'Evaluación Diaria Multidisciplinaria de la Ventana de Cierre',
          descripcion: ['Valoración clínica conjunta diaria para identificar el momento fisiológico más favorable para programar el cierre fascial definitivo.'],
          clave: 'El cierre fascial debe programarse cuando la evolución hemodinámica, metabólica y abdominal indique que el paciente ha alcanzado una ventana fisiológica favorable.',
          conceptos: [
            { t: 'Evaluación multidisciplinaria diaria', d: 'Realizar cada mañana una discusión clínica conjunta entre el cirujano tratante y el intensivista sobre la evolución global del paciente.' },
            { t: 'Estabilidad [[hemodinámica]] y sistémica', d: 'Valorar el estado hemodinámico, el retiro de vasopresores, la disminución del balance acumulado y la corrección de la coagulopatía.' },
            { t: 'Reducción del [[edema]] y ventana de cierre', d: 'Evaluar la disminución del edema de las asas intestinales para reconocer activamente una ventana fisiológica favorable para el cierre fascial definitivo.' }
          ],
          acciones: 'Reevaluar diariamente y de forma conjunta la estabilidad hemodinámica, el retiro de vasopresores, el balance acumulado, la coagulopatía y el edema intestinal para identificar oportunamente el momento idóneo para realizar el cierre fascial definitivo.'
        },
        {
          n: 17,
          titulo: 'Programación de Recambios Quirúrgicos Seriados y Lavados',
          descripcion: ['Planificación de reingresos periódicos a quirófano para lavado, inspección abdominal y recambio del sistema de TPN dentro de intervalos seguros.'],
          clave: 'Mantener intervalos regulares de recambio limita la contaminación local y reduce la posibilidad de adherencias progresivas que favorezcan la formación de un abdomen congelado.',
          conceptos: [
            { t: 'Recambio cada [[48]] -72 horas', d: 'Programar y ejecutar los reingresos a quirófano para el recambio del sistema de TPN cada 48 a 72 horas como máximo.' },
            { t: 'Lavado e inspección seriada', d: 'Realizar lavado peritoneal e inspección directa del abdomen durante cada intervención, evaluando su evolución antes de [[reinstalar]] el sistema de TPN.' },
            { t: 'Prevención de infección y abdomen congelado', d: 'Evitar prolongar el intervalo entre recambios, ya que aumenta el riesgo de infección local, crecimiento bacteriano bajo el apósito y fijación de la fascia a las vísceras.' }
          ],
          acciones: 'No exceder las 72 horas entre recambios quirúrgicos del sistema de TPN; programar cada reingreso con lavado e inspección abdominal para reducir el riesgo de proliferación bacteriana, infección y fijación fascial a las vísceras.'
        },
        {
          n: 18,
          titulo: 'Aproximación Fascial Progresiva Sucesiva en cada Lavado',
          descripcion: ['Aproximación medial progresiva de los bordes fasciales en cada revisión quirúrgica, aprovechando la reducción gradual del edema visceral.'],
          clave: 'Cada revisión quirúrgica representa una oportunidad para medializar la fascia y disminuir progresivamente el defecto a medida que cede el [[edema visceral]].',
          conceptos: [
            { t: 'Aproximación medial progresiva', d: 'Realizar sistemáticamente tensión y aproximación medial de los bordes fasciales durante cada revisión quirúrgica.' },
            { t: 'Avance de la tracción fascial', d: 'Ajustar y avanzar progresivamente la sutura de tracción fascial en cada lavado, conforme disminuya el edema de las vísceras.' },
            { t: 'Cierre parcial hacia el centro', d: 'Realizar cierres [[parciales secuenciales]] desde los extremos superior e inferior de la incisión hacia el centro, reduciendo progresivamente el defecto fascial.' }
          ],
          acciones: 'No limitar los lavados al recambio del sistema: en cada intervención se debe avanzar la tracción fascial y aproximar progresivamente los bordes desde ambos extremos hacia el centro, aprovechando cada reducción del edema visceral para acercarse al cierre definitivo.'
        },
        {
          n: 19,
          titulo: 'Auditoría y Registro de Tasa de Cierre según Estándar Internacional',
          descripcion: ['Seguimiento sistemático del defecto aponeurótico con la meta de alcanzar el cierre fascial definitivo primario dentro de los primeros [[8]] a 10 días.'],
          clave: 'El tiempo hasta el cierre y la reducción progresiva del defecto fascial funcionan como indicadores objetivos de éxito y calidad en el manejo del abdomen abierto.',
          conceptos: [
            { t: 'Evaluación del progreso fascial', d: 'Registrar de forma seriada la evolución y reducción del defecto aponeurótico durante el proceso de cierre abdominal.' },
            { t: 'Meta de cierre en 8–[[10]] días', d: 'Orientar el manejo hacia la obtención del cierre fascial definitivo primario dentro de los primeros 8 a 10 días posteriores a la primera laparotomía.' },
            { t: 'Estándar internacional IROA', d: 'Comparar los resultados obtenidos con las metas internacionales de calidad documentadas en el registro IROA, que reporta tasas de cierre exitoso de hasta el 82%.' }
          ],
          acciones: 'Documentar sistemáticamente la evolución del defecto y priorizar las estrategias que permitan alcanzar el cierre fascial primario dentro de los primeros 8 a 10 días, utilizando la tasa de cierre como indicador de desempeño y calidad asistencial.'
        },
        {
          n: 20,
          titulo: 'Protocolo de Abdomen Abierto Catastrófico o Congelado',
          descripcion: ['Cambio de estrategia ante un abdomen congelado Björck grado [[3/4|3 o 4|3 y 4|3-4]] cuando la aproximación fascial ya no es segura o existe riesgo de fístula por tracción excesiva.'],
          clave: 'Cuando el cierre fascial deja de ser seguro, la prioridad cambia de forzar la aproximación a proteger las vísceras, obtener cobertura estable y preparar una reconstrucción diferida.',
          conceptos: [
            { t: 'Suspensión de la tracción forzada', d: 'Detener de inmediato los intentos de aproximación fascial cuando exista adherencia masiva de las asas o riesgo inminente de fístula por tensión excesiva.' },
            { t: 'Curación por segunda intención', d: 'Transicionar hacia una estrategia segura de cicatrización abierta, promoviendo la formación de tejido de granulación sobre las asas intestinales.' },
            { t: 'Cobertura y reconstrucción diferida', d: 'Realizar posteriormente cobertura con injertos de piel de espesor parcial y planificar la reconstrucción formal de la pared abdominal a mediano plazo, típicamente entre [[6 y 12|6 a 12|6-12]] meses.' }
          ],
          acciones: 'Ante un abdomen congelado Björck grado [[3/4|3 o 4|3 y 4|3-4]] o riesgo de fístula por tracción, suspender la aproximación fascial forzada y adoptar una estrategia escalonada de granulación, cobertura cutánea y reconstrucción definitiva diferida.'
        }
      ]
    }
  ]
};
