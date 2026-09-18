/**
 * Inventario de bases de datos personales y evaluación del registro ante el
 * Registro Nacional de Bases de Datos.
 *
 * Fundamento:
 * · Ley 1581 de 2012 — régimen general de protección de datos personales.
 * · Ley 1581 de 2012, art. 5 — datos sensibles: los que afectan la intimidad
 *   o cuyo uso indebido puede generar discriminación.
 * · Ley 1581 de 2012, art. 7 — datos de niños, niñas y adolescentes.
 * · Decreto 1074 de 2015, arts. 2.2.2.25.1.1 y ss. — reglamentación.
 * · Circular Externa SIC 005 de 2017 — instrucciones del RNBD y el criterio de
 *   activos totales superiores a 100 000 UVT.
 * · Ley 1266 de 2008 — habeas data financiero, crediticio y comercial.
 *
 * Esta herramienta no radica nada ante la SIC. Estructura el inventario y
 * señala si el registro es exigible; el trámite se surte en el portal de la
 * Superintendencia.
 */

export type CategoriaTitular =
  | 'trabajadores'
  | 'candidatos'
  | 'clientes'
  | 'proveedores'
  | 'contratistas'
  | 'visitantes'
  | 'menores'
  | 'otros';

export type CategoriaDato =
  | 'identificacion'
  | 'contacto'
  | 'laboral'
  | 'academico'
  | 'financiero'
  | 'patrimonial'
  | 'salud'
  | 'biometrico'
  | 'sindical'
  | 'origenRacial'
  | 'orientacionSexual'
  | 'conviccionesPoliticasReligiosas'
  | 'ubicacion'
  | 'navegacion';

export interface DefinicionDato {
  readonly id: CategoriaDato;
  readonly rotulo: string;
  /** `true` si es dato sensible en los términos del art. 5 de la Ley 1581. */
  readonly sensible: boolean;
  readonly norma: string;
  readonly nota: string;
}

export const DATOS: readonly DefinicionDato[] = [
  {
    id: 'identificacion',
    rotulo: 'Identificación',
    sensible: false,
    norma: 'Ley 1581 de 2012',
    nota: 'Nombre, documento, fecha de nacimiento.',
  },
  {
    id: 'contacto',
    rotulo: 'Contacto',
    sensible: false,
    norma: 'Ley 1581 de 2012',
    nota: 'Dirección, teléfono, correo electrónico.',
  },
  {
    id: 'laboral',
    rotulo: 'Laboral',
    sensible: false,
    norma: 'Ley 1581 de 2012 · CST',
    nota: 'Cargo, salario, historia de vinculación.',
  },
  {
    id: 'academico',
    rotulo: 'Académico',
    sensible: false,
    norma: 'Ley 1581 de 2012',
    nota: 'Títulos, certificaciones, formación.',
  },
  {
    id: 'financiero',
    rotulo: 'Financiero y crediticio',
    sensible: false,
    norma: 'Ley 1266 de 2008',
    nota: 'Sujeto además al régimen especial de habeas data financiero.',
  },
  {
    id: 'patrimonial',
    rotulo: 'Patrimonial',
    sensible: false,
    norma: 'Ley 1581 de 2012',
    nota: 'Bienes, ingresos, declaraciones.',
  },
  {
    id: 'salud',
    rotulo: 'Salud',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5 · Ley 1751 de 2015',
    nota: 'Incluye incapacidades, exámenes ocupacionales y condiciones médicas. La historia clínica es reservada y no debe reposar en el expediente laboral.',
  },
  {
    id: 'biometrico',
    rotulo: 'Biométrico',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5',
    nota: 'Huella, rostro, iris, voz. Su uso para control de acceso exige autorización expresa y una alternativa no biométrica.',
  },
  {
    id: 'sindical',
    rotulo: 'Afiliación sindical',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5 · C. P. art. 39',
    nota: 'Su tratamiento indebido puede configurar persecución sindical.',
  },
  {
    id: 'origenRacial',
    rotulo: 'Origen racial o étnico',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5',
    nota: 'Solo se recoge con finalidad legítima y declarada, como acciones afirmativas.',
  },
  {
    id: 'orientacionSexual',
    rotulo: 'Vida sexual u orientación',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5',
    nota: 'Rara vez hay finalidad legítima para recogerlo en un contexto laboral.',
  },
  {
    id: 'conviccionesPoliticasReligiosas',
    rotulo: 'Convicciones políticas, religiosas o filosóficas',
    sensible: true,
    norma: 'Ley 1581 de 2012, art. 5',
    nota: 'El titular no está obligado a autorizar el tratamiento de datos sensibles.',
  },
  {
    id: 'ubicacion',
    rotulo: 'Ubicación y geolocalización',
    sensible: false,
    norma: 'Ley 1581 de 2012 · doctrina SIC',
    nota: 'El seguimiento continuo de trabajadores requiere proporcionalidad y aviso previo.',
  },
  {
    id: 'navegacion',
    rotulo: 'Navegación y uso de sistemas',
    sensible: false,
    norma: 'Ley 1581 de 2012 · doctrina SIC',
    nota: 'La monitorización del correo corporativo exige política previa conocida por el trabajador.',
  },
] as const;

export function datoPorId(id: CategoriaDato): DefinicionDato {
  const d = DATOS.find((x) => x.id === id);
  if (!d) throw new RangeError(`Categoría de dato desconocida: "${id}"`);
  return d;
}

export const TITULARES: Record<CategoriaTitular, string> = {
  trabajadores: 'Trabajadores',
  candidatos: 'Candidatos y aspirantes',
  clientes: 'Clientes',
  proveedores: 'Proveedores',
  contratistas: 'Contratistas',
  visitantes: 'Visitantes',
  menores: 'Niños, niñas y adolescentes',
  otros: 'Otros titulares',
};

/* ══ Base de datos ═══════════════════════════════════════════════ */

export interface Encargado {
  readonly nombre: string;
  readonly finalidad: string;
  /** País donde se tratan los datos. «Colombia» si es local. */
  readonly pais: string;
}

export interface BaseDatos {
  readonly id: string;
  readonly nombre: string;
  readonly area: string;
  readonly finalidad: string;
  readonly titulares: readonly CategoriaTitular[];
  readonly datos: readonly CategoriaDato[];
  /** Número aproximado de titulares. */
  readonly volumen: number;
  readonly canalRecoleccion: string;
  /** Tiempo de conservación declarado. */
  readonly retencion: string;
  readonly encargados: readonly Encargado[];
  /** Identificadores de `MEDIDAS` implementadas. */
  readonly medidas: readonly string[];
  readonly tieneAutorizacion: boolean;
  readonly tienePoliticaPublicada: boolean;
  readonly registradaEnRnbd: boolean;
}

export interface Medida {
  readonly id: string;
  readonly rotulo: string;
  readonly tipo: 'tecnica' | 'administrativa' | 'juridica';
  readonly norma: string;
  /** `true` si es indispensable cuando hay datos sensibles. */
  readonly criticaParaSensibles: boolean;
}

export const MEDIDAS: readonly Medida[] = [
  {
    id: 'control-acceso',
    rotulo: 'Control de acceso por rol',
    tipo: 'tecnica',
    norma: 'Ley 1581 de 2012, art. 17 lit. d',
    criticaParaSensibles: true,
  },
  {
    id: 'cifrado',
    rotulo: 'Cifrado en reposo y en tránsito',
    tipo: 'tecnica',
    norma: 'Ley 1581 de 2012, art. 17 lit. d',
    criticaParaSensibles: true,
  },
  {
    id: 'respaldo',
    rotulo: 'Respaldo y plan de recuperación',
    tipo: 'tecnica',
    norma: 'Ley 1581 de 2012, art. 17 lit. d',
    criticaParaSensibles: false,
  },
  {
    id: 'trazabilidad',
    rotulo: 'Registro de accesos y trazabilidad',
    tipo: 'tecnica',
    norma: 'Ley 1581 de 2012, art. 17 lit. d',
    criticaParaSensibles: true,
  },
  {
    id: 'politica',
    rotulo: 'Política de tratamiento publicada',
    tipo: 'juridica',
    norma: 'Decreto 1074 de 2015, art. 2.2.2.25.3.1',
    criticaParaSensibles: false,
  },
  {
    id: 'aviso',
    rotulo: 'Aviso de privacidad en el punto de recolección',
    tipo: 'juridica',
    norma: 'Ley 1581 de 2012, art. 15 · Decreto 1074 de 2015',
    criticaParaSensibles: false,
  },
  {
    id: 'contrato-encargado',
    rotulo: 'Contrato de transmisión con cada encargado',
    tipo: 'juridica',
    norma: 'Decreto 1074 de 2015, art. 2.2.2.25.5.2',
    criticaParaSensibles: false,
  },
  {
    id: 'responsable',
    rotulo: 'Área o persona responsable designada',
    tipo: 'administrativa',
    norma: 'Ley 1581 de 2012, art. 23',
    criticaParaSensibles: false,
  },
  {
    id: 'procedimiento-reclamos',
    rotulo: 'Procedimiento de consultas y reclamos',
    tipo: 'administrativa',
    norma: 'Ley 1581 de 2012, arts. 14 y 15',
    criticaParaSensibles: false,
  },
  {
    id: 'capacitacion',
    rotulo: 'Capacitación del personal que trata los datos',
    tipo: 'administrativa',
    norma: 'Ley 1581 de 2012, art. 17',
    criticaParaSensibles: true,
  },
  {
    id: 'incidentes',
    rotulo: 'Procedimiento de reporte de incidentes a la SIC',
    tipo: 'administrativa',
    norma: 'Ley 1581 de 2012, art. 17 lit. n',
    criticaParaSensibles: true,
  },
  {
    id: 'supresion',
    rotulo: 'Política de retención y supresión',
    tipo: 'administrativa',
    norma: 'Ley 1581 de 2012, art. 4 lit. e',
    criticaParaSensibles: false,
  },
] as const;

/* ══ Exigibilidad del RNBD ═══════════════════════════════════════ */

/** Umbral de activos totales del criterio de la Circular 005 de 2017, en UVT. */
export const UMBRAL_RNBD_UVT = 100_000;

export type NaturalezaResponsable = 'sociedad' | 'esal' | 'entidadPublica' | 'personaNatural';

export interface PerfilResponsable {
  readonly naturaleza: NaturalezaResponsable;
  /** Activos totales en pesos. */
  readonly activos: number;
  /** Valor de la UVT del año que se evalúa. */
  readonly uvt: number;
}

export interface Exigibilidad {
  readonly exigible: boolean;
  readonly activosEnUvt: number;
  readonly razon: string;
  readonly norma: string;
  readonly advertencias: readonly string[];
}

/**
 * ¿Debe registrar sus bases ante el RNBD?
 *
 * Conforme al criterio de la Circular Externa 005 de 2017 de la SIC, el
 * registro recae sobre sociedades y entidades sin ánimo de lucro con activos
 * totales superiores a 100 000 UVT, y sobre las entidades públicas. Las
 * personas naturales no están sujetas al registro, pero sí a todas las demás
 * obligaciones de la Ley 1581 de 2012.
 */
export function evaluarExigibilidad(p: PerfilResponsable): Exigibilidad {
  const activosEnUvt = p.uvt > 0 ? p.activos / p.uvt : 0;
  const advertencias = [
    'Esta evaluación aplica el criterio de la Circular Externa 005 de 2017. Verifique la instrucción vigente de la SIC antes de concluir que no está obligado.',
    'Estar exento del registro no exime de ninguna otra obligación de la Ley 1581 de 2012: política, autorización, aviso de privacidad, seguridad y atención de los derechos del titular siguen siendo exigibles.',
  ];

  if (p.naturaleza === 'entidadPublica') {
    return {
      exigible: true,
      activosEnUvt,
      razon:
        'Las entidades públicas deben registrar sus bases de datos con independencia de sus activos.',
      norma: 'Circular Externa SIC 005 de 2017',
      advertencias,
    };
  }

  if (p.naturaleza === 'personaNatural') {
    return {
      exigible: false,
      activosEnUvt,
      razon:
        'Las personas naturales no están sujetas al registro en el RNBD, pero sí al resto del régimen de protección de datos.',
      norma: 'Circular Externa SIC 005 de 2017',
      advertencias,
    };
  }

  const exigible = activosEnUvt > UMBRAL_RNBD_UVT;
  return {
    exigible,
    activosEnUvt,
    razon: exigible
      ? `Los activos totales equivalen a ${Math.round(activosEnUvt).toLocaleString('es-CO')} UVT y superan el umbral de ${UMBRAL_RNBD_UVT.toLocaleString('es-CO')} UVT.`
      : `Los activos totales equivalen a ${Math.round(activosEnUvt).toLocaleString('es-CO')} UVT y no superan el umbral de ${UMBRAL_RNBD_UVT.toLocaleString('es-CO')} UVT.`,
    norma: 'Circular Externa SIC 005 de 2017 · Decreto 1074 de 2015',
    advertencias,
  };
}

/* ══ Riesgo por base ═════════════════════════════════════════════ */

export type NivelRiesgo = 'bajo' | 'medio' | 'alto' | 'critico';

export interface EvaluacionRiesgo {
  readonly puntaje: number;
  readonly nivel: NivelRiesgo;
  readonly factores: readonly { readonly factor: string; readonly puntos: number }[];
  readonly hallazgos: readonly {
    readonly mensaje: string;
    readonly norma: string;
    readonly grave: boolean;
  }[];
}

export function tieneSensibles(b: BaseDatos): boolean {
  return b.datos.some((d) => datoPorId(d).sensible);
}

export function transfiereAlExterior(b: BaseDatos): boolean {
  return b.encargados.some(
    (e) => e.pais.trim().toLowerCase() !== 'colombia' && e.pais.trim() !== '',
  );
}

/**
 * Riesgo de una base: combina sensibilidad, volumen, transferencias y las
 * medidas ausentes. El puntaje es una escala interna comparable entre bases,
 * no una calificación oficial.
 */
export function evaluarRiesgo(b: BaseDatos): EvaluacionRiesgo {
  const factores: { factor: string; puntos: number }[] = [];
  const hallazgos: { mensaje: string; norma: string; grave: boolean }[] = [];

  const sensibles = b.datos.filter((d) => datoPorId(d).sensible);
  if (sensibles.length > 0) {
    const puntos = Math.min(sensibles.length * 8, 30);
    factores.push({ factor: `Trata ${sensibles.length} categorías de datos sensibles`, puntos });
  }

  if (b.titulares.includes('menores')) {
    factores.push({ factor: 'Trata datos de niños, niñas y adolescentes', puntos: 15 });
    hallazgos.push({
      mensaje:
        'El tratamiento de datos de menores solo procede cuando responde al interés superior del niño y respeta sus derechos fundamentales, con autorización del representante legal.',
      norma: 'Ley 1581 de 2012, art. 7 · Decreto 1074 de 2015',
      grave: false,
    });
  }

  if (b.volumen > 10_000) factores.push({ factor: 'Más de 10 000 titulares', puntos: 12 });
  else if (b.volumen > 1_000) factores.push({ factor: 'Más de 1 000 titulares', puntos: 6 });

  if (transfiereAlExterior(b)) {
    factores.push({ factor: 'Transfiere datos fuera de Colombia', puntos: 12 });
    hallazgos.push({
      mensaje:
        'Hay transferencia internacional. Procede a países con nivel adecuado de protección según la SIC, o con autorización expresa del titular, o mediante cláusulas contractuales que garanticen el nivel de protección.',
      norma: 'Ley 1581 de 2012, art. 26 · Circular SIC 005 de 2017',
      grave: false,
    });
  }

  const faltantes = MEDIDAS.filter((m) => !b.medidas.includes(m.id));
  const criticasFaltantes = faltantes.filter((m) => m.criticaParaSensibles && sensibles.length > 0);

  factores.push({
    factor: `${faltantes.length} medidas de seguridad sin implementar`,
    puntos: faltantes.length * 3,
  });

  if (criticasFaltantes.length > 0) {
    hallazgos.push({
      mensaje: `Faltan medidas indispensables para datos sensibles: ${criticasFaltantes.map((m) => m.rotulo).join(', ')}.`,
      norma: 'Ley 1581 de 2012, art. 17',
      grave: true,
    });
  }

  if (!b.tieneAutorizacion) {
    factores.push({ factor: 'Sin autorización del titular documentada', puntos: 20 });
    hallazgos.push({
      mensaje:
        'No hay autorización documentada. La carga de probarla es del responsable, y debe ser previa, expresa e informada para cada finalidad.',
      norma: 'Ley 1581 de 2012, arts. 9 y 12',
      grave: true,
    });
  }

  if (!b.tienePoliticaPublicada) {
    factores.push({ factor: 'Sin política de tratamiento publicada', puntos: 10 });
    hallazgos.push({
      mensaje: 'La política de tratamiento debe estar adoptada y accesible al titular.',
      norma: 'Decreto 1074 de 2015, art. 2.2.2.25.3.1',
      grave: true,
    });
  }

  if (b.finalidad.trim().length < 20) {
    factores.push({ factor: 'Finalidad no declarada con suficiencia', puntos: 10 });
    hallazgos.push({
      mensaje:
        'La finalidad debe ser específica, explícita y legítima. Una finalidad genérica —«fines administrativos»— no habilita ningún tratamiento.',
      norma: 'Ley 1581 de 2012, art. 4 lit. b',
      grave: true,
    });
  }

  if (b.retencion.trim().length < 3) {
    factores.push({ factor: 'Sin tiempo de retención definido', puntos: 6 });
    hallazgos.push({
      mensaje:
        'El principio de temporalidad exige que los datos no se conserven más allá del tiempo necesario para la finalidad.',
      norma: 'Ley 1581 de 2012, art. 11',
      grave: false,
    });
  }

  const encargadosSinContrato =
    b.encargados.length > 0 && !b.medidas.includes('contrato-encargado');
  if (encargadosSinContrato) {
    factores.push({ factor: 'Encargados sin contrato de transmisión', puntos: 10 });
    hallazgos.push({
      mensaje:
        'Toda transmisión a un encargado requiere contrato que fije el alcance del tratamiento, las obligaciones del encargado y las medidas de seguridad.',
      norma: 'Decreto 1074 de 2015, art. 2.2.2.25.5.2',
      grave: true,
    });
  }

  const puntaje = Math.min(
    factores.reduce((s, f) => s + f.puntos, 0),
    100,
  );

  const nivel: NivelRiesgo =
    puntaje >= 70 ? 'critico' : puntaje >= 45 ? 'alto' : puntaje >= 20 ? 'medio' : 'bajo';

  return { puntaje, nivel, factores, hallazgos };
}

/* ══ Consolidado ═════════════════════════════════════════════════ */

export interface Consolidado {
  readonly bases: number;
  readonly titulares: number;
  readonly conSensibles: number;
  readonly conTransferencia: number;
  readonly sinAutorizacion: number;
  readonly sinRegistrar: number;
  readonly riesgoPromedio: number;
  readonly hallazgosGraves: number;
}

export function consolidar(bases: readonly BaseDatos[]): Consolidado {
  if (bases.length === 0) {
    return {
      bases: 0,
      titulares: 0,
      conSensibles: 0,
      conTransferencia: 0,
      sinAutorizacion: 0,
      sinRegistrar: 0,
      riesgoPromedio: 0,
      hallazgosGraves: 0,
    };
  }

  const evaluaciones = bases.map(evaluarRiesgo);
  return {
    bases: bases.length,
    titulares: bases.reduce((s, b) => s + b.volumen, 0),
    conSensibles: bases.filter(tieneSensibles).length,
    conTransferencia: bases.filter(transfiereAlExterior).length,
    sinAutorizacion: bases.filter((b) => !b.tieneAutorizacion).length,
    sinRegistrar: bases.filter((b) => !b.registradaEnRnbd).length,
    riesgoPromedio: Math.round(
      evaluaciones.reduce((s, e) => s + e.puntaje, 0) / evaluaciones.length,
    ),
    hallazgosGraves: evaluaciones.reduce(
      (s, e) => s + e.hallazgos.filter((h) => h.grave).length,
      0,
    ),
  };
}
