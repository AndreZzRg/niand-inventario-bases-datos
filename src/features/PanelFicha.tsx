/**
 * Módulo «Ficha de base de datos»: el detalle de una base concreta.
 */
import { Plus, Trash2 } from 'lucide-react';

import {
  AreaTexto,
  Boton,
  Campo,
  Entrada,
  Insignia,
  Llamado,
  Tarjeta,
  Vacio,
  cx,
} from '../brand/ui';
import { DATOS, MEDIDAS, TITULARES, datoPorId } from '../domain/inventario';
import type { CategoriaDato, CategoriaTitular } from '../domain/inventario';
import { useBase, useEstado } from '../store';

export function PanelFicha() {
  const { actualizar, eliminar, alternarMedida } = useEstado();
  const b = useBase();

  if (!b) {
    return (
      <Vacio titulo="Seleccione una base de datos">
        Elija una en el módulo <strong>Inventario</strong> para completar su ficha.
      </Vacio>
    );
  }

  const alternar = <T,>(lista: readonly T[], valor: T): T[] =>
    lista.includes(valor) ? lista.filter((x) => x !== valor) : [...lista, valor];

  return (
    <div className="space-y-6">
      <Tarjeta
        titulo={b.nombre}
        descripcion={b.area || 'Sin área responsable'}
        acciones={
          <Boton variante="fantasma" tamano="sm" onClick={() => eliminar(b.id)}>
            <Trash2 size={14} />
          </Boton>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre de la base">
              {(id) => (
                <Entrada
                  id={id}
                  value={b.nombre}
                  onChange={(e) => actualizar(b.id, { nombre: e.target.value })}
                />
              )}
            </Campo>
            <Campo etiqueta="Área responsable">
              {(id) => (
                <Entrada
                  id={id}
                  value={b.area}
                  onChange={(e) => actualizar(b.id, { area: e.target.value })}
                />
              )}
            </Campo>
          </div>

          <Campo
            etiqueta="Finalidad del tratamiento"
            requerido
            ayuda="Específica, explícita y legítima. «Fines administrativos» no habilita nada."
            error={
              b.finalidad.length > 0 && b.finalidad.trim().length < 20
                ? 'Desarrolle la finalidad: es el fundamento de todo el tratamiento.'
                : null
            }
          >
            {(id) => (
              <AreaTexto
                id={id}
                rows={3}
                value={b.finalidad}
                onChange={(e) => actualizar(b.id, { finalidad: e.target.value })}
              />
            )}
          </Campo>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Número de titulares">
              {(id) => (
                <Entrada
                  id={id}
                  type="number"
                  min={0}
                  value={b.volumen}
                  onChange={(e) => actualizar(b.id, { volumen: Number(e.target.value) })}
                />
              )}
            </Campo>
            <Campo etiqueta="Canal de recolección">
              {(id) => (
                <Entrada
                  id={id}
                  value={b.canalRecoleccion}
                  placeholder="Formulario web"
                  onChange={(e) => actualizar(b.id, { canalRecoleccion: e.target.value })}
                />
              )}
            </Campo>
            <Campo etiqueta="Tiempo de retención" ayuda="Principio de temporalidad, art. 11.">
              {(id) => (
                <Entrada
                  id={id}
                  value={b.retencion}
                  placeholder="5 años desde…"
                  onChange={(e) => actualizar(b.id, { retencion: e.target.value })}
                />
              )}
            </Campo>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Categorías de titulares</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TITULARES) as CategoriaTitular[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={b.titulares.includes(t)}
                  onClick={() => actualizar(b.id, { titulares: alternar(b.titulares, t) })}
                  className={cx(
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    b.titulares.includes(t)
                      ? 'border-marca bg-marca text-marca-contraste'
                      : 'border-borde bg-superficie-3 text-texto-2 hover:border-borde-fuerte',
                  )}
                >
                  {TITULARES[t]}
                </button>
              ))}
            </div>
            {b.titulares.includes('menores') && (
              <Llamado tono="alerta" className="mt-3">
                El tratamiento de datos de niños, niñas y adolescentes solo procede cuando responde
                a su interés superior y respeta sus derechos fundamentales, con autorización del
                representante legal (Ley 1581 de 2012, art. 7).
              </Llamado>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Categorías de datos tratados</legend>
            <div className="space-y-2">
              {DATOS.map((d) => {
                const activo = b.datos.includes(d.id as CategoriaDato);
                return (
                  <label
                    key={d.id}
                    className={cx(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                      activo
                        ? d.sensible
                          ? 'border-alerta/40 bg-alerta/6'
                          : 'border-marca bg-indigo/8'
                        : 'border-borde bg-superficie-3 hover:border-borde-fuerte',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-[var(--marca)]"
                      checked={activo}
                      onChange={() => actualizar(b.id, { datos: alternar(b.datos, d.id) })}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{d.rotulo}</span>
                        {d.sensible && <Insignia tono="riesgo">sensible</Insignia>}
                      </span>
                      <span className="mt-0.5 block text-xs text-texto-2">{d.nota}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Encargados del tratamiento</legend>
            <div className="space-y-2">
              {b.encargados.map((e, i) => (
                <div
                  key={`${e.nombre}-${i}`}
                  className="grid gap-2 sm:grid-cols-[1fr_1fr_10rem_auto]"
                >
                  <Entrada
                    value={e.nombre}
                    aria-label="Nombre del encargado"
                    placeholder="Proveedor"
                    onChange={(ev) =>
                      actualizar(b.id, {
                        encargados: b.encargados.map((x, j) =>
                          j === i ? { ...x, nombre: ev.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Entrada
                    value={e.finalidad}
                    aria-label="Finalidad del encargo"
                    placeholder="Alojamiento en nube"
                    onChange={(ev) =>
                      actualizar(b.id, {
                        encargados: b.encargados.map((x, j) =>
                          j === i ? { ...x, finalidad: ev.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Entrada
                    value={e.pais}
                    aria-label="País de tratamiento"
                    placeholder="Colombia"
                    onChange={(ev) =>
                      actualizar(b.id, {
                        encargados: b.encargados.map((x, j) =>
                          j === i ? { ...x, pais: ev.target.value } : x,
                        ),
                      })
                    }
                  />
                  <Boton
                    variante="fantasma"
                    tamano="sm"
                    onClick={() =>
                      actualizar(b.id, { encargados: b.encargados.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 size={14} />
                  </Boton>
                </div>
              ))}
              <Boton
                variante="secundario"
                tamano="sm"
                onClick={() =>
                  actualizar(b.id, {
                    encargados: [...b.encargados, { nombre: '', finalidad: '', pais: 'Colombia' }],
                  })
                }
              >
                <Plus size={14} /> Agregar encargado
              </Boton>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Medidas implementadas</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {MEDIDAS.map((m) => (
                <label
                  key={m.id}
                  className={cx(
                    'flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors',
                    b.medidas.includes(m.id)
                      ? 'border-senal/35 bg-senal/6'
                      : 'border-borde bg-superficie-3 hover:border-borde-fuerte',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 accent-[var(--marca)]"
                    checked={b.medidas.includes(m.id)}
                    onChange={() => alternarMedida(b.id, m.id)}
                  />
                  <span>
                    <span className="font-medium">{m.rotulo}</span>
                    <span className="eyebrow mt-0.5 block">
                      {m.tipo} · {m.norma}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2 border-t border-borde pt-4">
            {(
              [
                [
                  'tieneAutorizacion',
                  'Autorización del titular documentada',
                  'Ley 1581, arts. 9 y 12',
                ],
                [
                  'tienePoliticaPublicada',
                  'Política de tratamiento publicada',
                  'Decreto 1074 de 2015',
                ],
                ['registradaEnRnbd', 'Registrada en el RNBD', 'Circular SIC 005 de 2017'],
              ] as const
            ).map(([campo, rotulo, norma]) => (
              <label key={campo} className="flex items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[var(--marca)]"
                  checked={b[campo]}
                  onChange={(e) => actualizar(b.id, { [campo]: e.target.checked })}
                />
                <span>
                  <strong>{rotulo}</strong>
                  <span className="eyebrow mt-0.5 block">{norma}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </Tarjeta>

      {b.datos.some((d) => datoPorId(d).sensible) && (
        <Llamado tono="riesgo" titulo="Esta base contiene datos sensibles">
          El tratamiento de datos sensibles está prohibido como regla general y solo procede en los
          casos del artículo 6 de la Ley 1581 de 2012. El titular <strong>no está obligado</strong>{' '}
          a autorizarlo, y hay que informárselo de forma expresa al pedir la autorización.
        </Llamado>
      )}
    </div>
  );
}
