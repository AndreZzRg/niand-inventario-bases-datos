import { describe, expect, it } from 'vitest';

import {
  DATOS,
  MEDIDAS,
  TITULARES,
  UMBRAL_RNBD_UVT,
  consolidar,
  datoPorId,
  evaluarExigibilidad,
  evaluarRiesgo,
  tieneSensibles,
  transfiereAlExterior,
  type BaseDatos,
} from './inventario';

const UVT_2025 = 49_799;
const TODAS_LAS_MEDIDAS = MEDIDAS.map((m) => m.id);

const base = (p: Partial<BaseDatos> = {}): BaseDatos => ({
  id: 'b1',
  nombre: 'Nómina',
  area: 'Talento humano',
  finalidad:
    'Administrar la relación laboral, liquidar la nómina y cumplir las obligaciones de seguridad social.',
  titulares: ['trabajadores'],
  datos: ['identificacion', 'contacto', 'laboral'],
  volumen: 50,
  canalRecoleccion: 'Formato de vinculación',
  retencion: '10 años tras la terminación del contrato',
  encargados: [],
  medidas: TODAS_LAS_MEDIDAS,
  tieneAutorizacion: true,
  tienePoliticaPublicada: true,
  registradaEnRnbd: true,
  ...p,
});

describe('catálogo de categorías de datos', () => {
  it('declara norma y nota en cada categoría', () => {
    for (const d of DATOS) {
      expect(d.norma, d.id).toMatch(/Ley|Decreto|C\. P\./);
      expect(d.nota.length, d.id).toBeGreaterThan(20);
    }
  });

  it('marca como sensibles las categorías del art. 5 de la Ley 1581', () => {
    for (const id of [
      'salud',
      'biometrico',
      'sindical',
      'origenRacial',
      'orientacionSexual',
      'conviccionesPoliticasReligiosas',
    ] as const) {
      expect(datoPorId(id).sensible, id).toBe(true);
    }
  });

  it('no marca como sensible lo que no lo es', () => {
    for (const id of ['identificacion', 'contacto', 'laboral', 'financiero'] as const) {
      expect(datoPorId(id).sensible, id).toBe(false);
    }
  });

  it('remite el dato financiero al régimen de la Ley 1266', () => {
    expect(datoPorId('financiero').norma).toContain('1266');
  });

  it('rechaza una categoría inexistente', () => {
    // @ts-expect-error se comprueba la defensa en tiempo de ejecución
    expect(() => datoPorId('inventada')).toThrow(RangeError);
  });

  it('nombra todas las categorías de titulares', () => {
    for (const [, rotulo] of Object.entries(TITULARES)) {
      expect(rotulo.length).toBeGreaterThan(3);
    }
  });
});

describe('catálogo de medidas', () => {
  it('clasifica cada medida y cita su norma', () => {
    for (const m of MEDIDAS) {
      expect(['tecnica', 'administrativa', 'juridica'], m.id).toContain(m.tipo);
      expect(m.norma, m.id).toMatch(/Ley|Decreto/);
    }
  });

  it('marca como críticas las medidas propias de datos sensibles', () => {
    const criticas = MEDIDAS.filter((m) => m.criticaParaSensibles).map((m) => m.id);
    expect(criticas).toContain('cifrado');
    expect(criticas).toContain('control-acceso');
    expect(criticas).toContain('trazabilidad');
  });
});

describe('exigibilidad del RNBD (Circular SIC 005 de 2017)', () => {
  it('obliga a la sociedad que supera 100 000 UVT en activos', () => {
    const r = evaluarExigibilidad({
      naturaleza: 'sociedad',
      activos: UVT_2025 * (UMBRAL_RNBD_UVT + 1),
      uvt: UVT_2025,
    });
    expect(r.exigible).toBe(true);
    expect(r.razon).toMatch(/superan el umbral/);
  });

  it('no la obliga justo en el umbral', () => {
    const r = evaluarExigibilidad({
      naturaleza: 'sociedad',
      activos: UVT_2025 * UMBRAL_RNBD_UVT,
      uvt: UVT_2025,
    });
    expect(r.exigible).toBe(false);
  });

  it('obliga a toda entidad pública sin mirar activos', () => {
    const r = evaluarExigibilidad({ naturaleza: 'entidadPublica', activos: 0, uvt: UVT_2025 });
    expect(r.exigible).toBe(true);
    expect(r.razon).toMatch(/entidades públicas/);
  });

  it('exime del registro a la persona natural sin eximirla del régimen', () => {
    const r = evaluarExigibilidad({
      naturaleza: 'personaNatural',
      activos: 10_000_000_000,
      uvt: UVT_2025,
    });
    expect(r.exigible).toBe(false);
    expect(r.razon).toMatch(/resto del régimen/);
  });

  it('advierte siempre que la exención no libera de las demás obligaciones', () => {
    const r = evaluarExigibilidad({ naturaleza: 'sociedad', activos: 1000, uvt: UVT_2025 });
    expect(r.advertencias.some((a) => a.includes('no exime de ninguna otra obligación'))).toBe(
      true,
    );
  });

  it('pide verificar la instrucción vigente antes de concluir', () => {
    const r = evaluarExigibilidad({ naturaleza: 'esal', activos: 1000, uvt: UVT_2025 });
    expect(r.advertencias.some((a) => a.includes('instrucción vigente'))).toBe(true);
  });

  it('no divide por cero si la UVT es cero', () => {
    const r = evaluarExigibilidad({ naturaleza: 'sociedad', activos: 1000, uvt: 0 });
    expect(Number.isFinite(r.activosEnUvt)).toBe(true);
    expect(r.activosEnUvt).toBe(0);
  });
});

describe('detección de sensibles y transferencias', () => {
  it('detecta los datos sensibles de la base', () => {
    expect(tieneSensibles(base())).toBe(false);
    expect(tieneSensibles(base({ datos: ['identificacion', 'salud'] }))).toBe(true);
  });

  it('detecta la transferencia internacional', () => {
    expect(transfiereAlExterior(base())).toBe(false);
    expect(
      transfiereAlExterior(
        base({ encargados: [{ nombre: 'Proveedor', finalidad: 'Nube', pais: 'Colombia' }] }),
      ),
    ).toBe(false);
    expect(
      transfiereAlExterior(
        base({ encargados: [{ nombre: 'Proveedor', finalidad: 'Nube', pais: 'Estados Unidos' }] }),
      ),
    ).toBe(true);
  });
});

describe('evaluación de riesgo', () => {
  it('da riesgo bajo a una base bien gobernada', () => {
    const r = evaluarRiesgo(base());
    expect(r.nivel).toBe('bajo');
    expect(r.hallazgos.filter((h) => h.grave)).toHaveLength(0);
  });

  it('sube el riesgo con datos sensibles', () => {
    const sin = evaluarRiesgo(base());
    const con = evaluarRiesgo(base({ datos: ['identificacion', 'salud', 'biometrico'] }));
    expect(con.puntaje).toBeGreaterThan(sin.puntaje);
  });

  it('marca como grave la ausencia de autorización', () => {
    const r = evaluarRiesgo(base({ tieneAutorizacion: false }));
    expect(r.hallazgos.some((h) => h.grave && h.norma.includes('arts. 9 y 12'))).toBe(true);
  });

  it('marca como grave la falta de política publicada', () => {
    const r = evaluarRiesgo(base({ tienePoliticaPublicada: false }));
    expect(r.hallazgos.some((h) => h.grave && h.mensaje.includes('política de tratamiento'))).toBe(
      true,
    );
  });

  it('rechaza una finalidad genérica', () => {
    const r = evaluarRiesgo(base({ finalidad: 'Fines varios' }));
    expect(r.hallazgos.some((h) => h.mensaje.includes('específica, explícita y legítima'))).toBe(
      true,
    );
  });

  it('exige contrato con los encargados', () => {
    const r = evaluarRiesgo(
      base({
        encargados: [{ nombre: 'Operador', finalidad: 'Nómina', pais: 'Colombia' }],
        medidas: TODAS_LAS_MEDIDAS.filter((m) => m !== 'contrato-encargado'),
      }),
    );
    expect(r.hallazgos.some((h) => h.grave && h.norma.includes('2.2.2.25.5.2'))).toBe(true);
  });

  it('señala las medidas críticas ausentes cuando hay sensibles', () => {
    const r = evaluarRiesgo(
      base({
        datos: ['identificacion', 'salud'],
        medidas: TODAS_LAS_MEDIDAS.filter((m) => m !== 'cifrado'),
      }),
    );
    expect(r.hallazgos.some((h) => h.grave && h.mensaje.includes('Cifrado'))).toBe(true);
  });

  it('no las señala cuando no hay datos sensibles', () => {
    const r = evaluarRiesgo(base({ medidas: TODAS_LAS_MEDIDAS.filter((m) => m !== 'cifrado') }));
    expect(r.hallazgos.some((h) => h.mensaje.includes('indispensables para datos sensibles'))).toBe(
      false,
    );
  });

  it('advierte sobre los datos de menores', () => {
    const r = evaluarRiesgo(base({ titulares: ['menores'] }));
    expect(r.hallazgos.some((h) => h.norma.includes('art. 7'))).toBe(true);
  });

  it('advierte sobre la transferencia internacional', () => {
    const r = evaluarRiesgo(
      base({ encargados: [{ nombre: 'Nube', finalidad: 'Alojamiento', pais: 'Irlanda' }] }),
    );
    expect(r.hallazgos.some((h) => h.norma.includes('art. 26'))).toBe(true);
  });

  it('escala el riesgo con el volumen de titulares', () => {
    const pocos = evaluarRiesgo(base({ volumen: 50 }));
    const muchos = evaluarRiesgo(base({ volumen: 50_000 }));
    expect(muchos.puntaje).toBeGreaterThan(pocos.puntaje);
  });

  it('llega a crítico cuando se acumulan los factores', () => {
    const r = evaluarRiesgo(
      base({
        datos: ['salud', 'biometrico', 'sindical'],
        titulares: ['menores'],
        volumen: 100_000,
        encargados: [{ nombre: 'Nube', finalidad: 'Alojamiento', pais: 'Singapur' }],
        medidas: [],
        tieneAutorizacion: false,
        tienePoliticaPublicada: false,
        finalidad: 'Varios',
        retencion: '',
      }),
    );
    expect(r.nivel).toBe('critico');
    expect(r.puntaje).toBeLessThanOrEqual(100);
  });

  it('nunca supera el puntaje máximo', () => {
    const r = evaluarRiesgo(
      base({
        datos: DATOS.map((d) => d.id),
        medidas: [],
        tieneAutorizacion: false,
        volumen: 999_999,
      }),
    );
    expect(r.puntaje).toBeLessThanOrEqual(100);
  });
});

describe('consolidado del inventario', () => {
  it('devuelve ceros con un inventario vacío', () => {
    const c = consolidar([]);
    expect(c.bases).toBe(0);
    expect(c.riesgoPromedio).toBe(0);
  });

  it('suma titulares y cuenta las bases con sensibles', () => {
    const c = consolidar([
      base({ id: 'a', volumen: 100 }),
      base({ id: 'b', volumen: 250, datos: ['identificacion', 'salud'] }),
    ]);
    expect(c.bases).toBe(2);
    expect(c.titulares).toBe(350);
    expect(c.conSensibles).toBe(1);
  });

  it('cuenta las bases sin autorización y sin registrar', () => {
    const c = consolidar([
      base({ id: 'a', tieneAutorizacion: false }),
      base({ id: 'b', registradaEnRnbd: false }),
    ]);
    expect(c.sinAutorizacion).toBe(1);
    expect(c.sinRegistrar).toBe(1);
  });

  it('promedia el riesgo de todas las bases', () => {
    const c = consolidar([
      base({ id: 'a' }),
      base({ id: 'b', medidas: [], tieneAutorizacion: false }),
    ]);
    expect(c.riesgoPromedio).toBeGreaterThan(0);
    expect(c.hallazgosGraves).toBeGreaterThan(0);
  });
});
