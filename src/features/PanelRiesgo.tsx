/**
 * Módulo «Mapa de riesgo»: dónde está concentrada la exposición.
 */
import { ShieldAlert } from 'lucide-react';

import { Dato, Insignia, Llamado, Tarjeta, Vacio, cx } from '../brand/ui';
import {
  consolidar,
  evaluarRiesgo,
  tieneSensibles,
  transfiereAlExterior,
} from '../domain/inventario';
import { numero } from '../lib/formato';
import { useEstado } from '../store';
import { TONO_RIESGO } from './PanelInventario';

export function PanelRiesgo() {
  const { bases, seleccionar } = useEstado();

  if (bases.length === 0) {
    return (
      <Vacio titulo="No hay nada que evaluar">
        Agregue bases en el módulo <strong>Inventario</strong> y el mapa se construye solo.
      </Vacio>
    );
  }

  const c = consolidar(bases);
  const evaluadas = bases
    .map((b) => ({ base: b, evaluacion: evaluarRiesgo(b) }))
    .sort((a, b) => b.evaluacion.puntaje - a.evaluacion.puntaje);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Dato
          rotulo="Riesgo promedio"
          valor={`${c.riesgoPromedio} / 100`}
          tono={c.riesgoPromedio >= 45 ? 'riesgo' : c.riesgoPromedio >= 20 ? 'alerta' : 'ok'}
        />
        <Dato
          rotulo="Hallazgos graves"
          valor={c.hallazgosGraves}
          tono={c.hallazgosGraves ? 'riesgo' : 'ok'}
        />
        <Dato
          rotulo="Sin autorización"
          valor={c.sinAutorizacion}
          tono={c.sinAutorizacion ? 'riesgo' : 'ok'}
        />
        <Dato
          rotulo="Con transferencia internacional"
          valor={c.conTransferencia}
          tono={c.conTransferencia ? 'alerta' : 'neutro'}
        />
      </div>

      <Llamado tono="info" titulo="Qué significa este puntaje" icono={<ShieldAlert size={18} />}>
        Es una <strong>escala interna</strong> para comparar bases entre sí y priorizar el trabajo.
        No es una calificación oficial ni predice la decisión de una autoridad. Combina sensibilidad
        de los datos, volumen de titulares, transferencias y medidas ausentes.
      </Llamado>

      <Tarjeta titulo="Bases ordenadas por exposición">
        <div className="space-y-4">
          {evaluadas.map(({ base: b, evaluacion: e }) => (
            <div key={b.id} className="rounded-xl border border-borde bg-superficie-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => seleccionar(b.id)}
                  className="font-display text-sm font-semibold text-marca hover:underline"
                >
                  {b.nombre}
                </button>
                <Insignia tono={TONO_RIESGO[e.nivel]}>
                  {e.nivel} · {e.puntaje}/100
                </Insignia>
                {tieneSensibles(b) && <Insignia tono="riesgo">sensibles</Insignia>}
                {transfiereAlExterior(b) && <Insignia tono="alerta">transferencia</Insignia>}
                <span className="ml-auto text-xs text-texto-3">
                  {numero(b.volumen, 0)} titulares
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-superficie-2">
                <div
                  className={cx(
                    'h-full rounded-full transition-[width] duration-500',
                    e.nivel === 'critico'
                      ? 'bg-alerta'
                      : e.nivel === 'alto'
                        ? 'bg-ambar-suave'
                        : e.nivel === 'medio'
                          ? 'bg-destello'
                          : 'bg-senal',
                  )}
                  style={{ width: `${e.puntaje}%` }}
                />
              </div>

              {e.factores.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {e.factores.map((f) => (
                    <li key={f.factor}>
                      <Insignia tono="neutro">
                        {f.factor} · +{f.puntos}
                      </Insignia>
                    </li>
                  ))}
                </ul>
              )}

              {e.hallazgos.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {e.hallazgos.map((h) => (
                    <li
                      key={h.mensaje}
                      className={cx(
                        'rounded-lg border px-3 py-2 text-sm',
                        h.grave
                          ? 'border-alerta/35 bg-alerta/6'
                          : 'border-ambar-suave/40 bg-ambar-suave/8',
                      )}
                    >
                      <p className="text-texto-2">{h.mensaje}</p>
                      <p className="eyebrow mt-1">{h.norma}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Tarjeta>
    </div>
  );
}
