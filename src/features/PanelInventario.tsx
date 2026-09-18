/**
 * Módulo «Inventario»: la lista de bases de datos y su estado general.
 */
import { useState } from 'react';
import { DatabaseZap, Plus, Sparkles } from 'lucide-react';

import {
  Boton,
  Campo,
  Dato,
  Entrada,
  Insignia,
  Llamado,
  Tabla,
  Tarjeta,
  Td,
  Th,
  Vacio,
  cx,
  type Tono,
} from '../brand/ui';
import { consolidar, evaluarRiesgo, tieneSensibles } from '../domain/inventario';
import type { NivelRiesgo } from '../domain/inventario';
import { numero } from '../lib/formato';
import { useBase, useEstado } from '../store';

export const TONO_RIESGO: Record<NivelRiesgo, Tono> = {
  bajo: 'ok',
  medio: 'info',
  alto: 'alerta',
  critico: 'riesgo',
};

export function PanelInventario() {
  const { bases, crear, seleccionar, cargarEjemplo } = useEstado();
  const actual = useBase();
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState('');
  const c = consolidar(bases);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Dato rotulo="Bases inventariadas" valor={c.bases} tono="marca" />
        <Dato rotulo="Titulares alcanzados" valor={numero(c.titulares, 0)} />
        <Dato
          rotulo="Con datos sensibles"
          valor={c.conSensibles}
          tono={c.conSensibles > 0 ? 'alerta' : 'ok'}
        />
        <Dato
          rotulo="Riesgo promedio"
          valor={`${c.riesgoPromedio} / 100`}
          tono={c.riesgoPromedio >= 45 ? 'riesgo' : c.riesgoPromedio >= 20 ? 'alerta' : 'ok'}
        />
      </div>

      <Llamado tono="info" titulo="Qué guarda esta herramienta" icono={<DatabaseZap size={18} />}>
        Solo <strong>metadatos</strong>: qué bases existen, con qué finalidad, sobre qué categorías
        de datos y bajo qué medidas. Aquí no se registra ningún dato personal de un titular real, y
        nada sale de su navegador.
      </Llamado>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Tarjeta titulo="Agregar base de datos">
          <div className="space-y-4">
            <Campo etiqueta="Nombre de la base" requerido>
              {(id) => (
                <Entrada
                  id={id}
                  value={nombre}
                  placeholder="Nómina y contratación"
                  onChange={(e) => setNombre(e.target.value)}
                />
              )}
            </Campo>
            <Campo etiqueta="Área responsable">
              {(id) => (
                <Entrada
                  id={id}
                  value={area}
                  placeholder="Talento humano"
                  onChange={(e) => setArea(e.target.value)}
                />
              )}
            </Campo>
            <div className="flex flex-wrap gap-2">
              <Boton
                disabled={nombre.trim().length < 3}
                onClick={() => {
                  crear(nombre.trim(), area.trim());
                  setNombre('');
                  setArea('');
                }}
              >
                <Plus size={15} /> Agregar
              </Boton>
              {bases.length === 0 && (
                <Boton variante="secundario" onClick={cargarEjemplo}>
                  <Sparkles size={15} /> Cargar inventario típico
                </Boton>
              )}
            </div>
          </div>

          {bases.length === 0 && (
            <p className="mt-5 text-sm text-texto-2">
              El inventario típico carga las cuatro bases que casi toda empresa con nómina tiene,
              sin medidas ni autorizaciones marcadas: sirve para ver de inmediato cuánto falta.
            </p>
          )}
        </Tarjeta>

        <Tarjeta titulo="Bases inventariadas">
          {bases.length === 0 ? (
            <Vacio titulo="El inventario está vacío">
              Empiece por las bases que sabe que existen: nómina, selección, clientes y control de
              acceso. Casi siempre hay más de las que se recuerdan.
            </Vacio>
          ) : (
            <Tabla>
              <thead>
                <tr>
                  <Th>Base</Th>
                  <Th numerico>Titulares</Th>
                  <Th>Riesgo</Th>
                  <Th>RNBD</Th>
                </tr>
              </thead>
              <tbody>
                {bases.map((b) => {
                  const r = evaluarRiesgo(b);
                  return (
                    <tr key={b.id} className={cx(b.id === actual?.id && 'bg-indigo/6')}>
                      <Td>
                        <button
                          type="button"
                          onClick={() => seleccionar(b.id === actual?.id ? null : b.id)}
                          className="text-left font-medium text-marca hover:underline"
                        >
                          {b.nombre}
                        </button>
                        <span className="block text-xs text-texto-3">
                          {b.area || 'Sin área'}
                          {tieneSensibles(b) && ' · contiene datos sensibles'}
                        </span>
                      </Td>
                      <Td numerico>{numero(b.volumen, 0)}</Td>
                      <Td>
                        <Insignia tono={TONO_RIESGO[r.nivel]}>
                          {r.nivel} · {r.puntaje}
                        </Insignia>
                      </Td>
                      <Td>
                        <Insignia tono={b.registradaEnRnbd ? 'ok' : 'neutro'}>
                          {b.registradaEnRnbd ? 'registrada' : 'sin registrar'}
                        </Insignia>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Tabla>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
