/**
 * Módulo «Exigibilidad RNBD»: si el registro procede y qué sigue.
 */
import { Building2, ExternalLink, Info } from 'lucide-react';

import {
  Campo,
  Dato,
  Entrada,
  Insignia,
  Llamado,
  Seleccion,
  Tabla,
  Tarjeta,
  Td,
  Th,
} from '../brand/ui';
import { UMBRAL_RNBD_UVT, evaluarExigibilidad } from '../domain/inventario';
import type { NaturalezaResponsable } from '../domain/inventario';
import { numero, pesos } from '../lib/formato';
import { useEstado } from '../store';

const NATURALEZAS: ReadonlyArray<[NaturalezaResponsable, string]> = [
  ['sociedad', 'Sociedad comercial'],
  ['esal', 'Entidad sin ánimo de lucro'],
  ['entidadPublica', 'Entidad pública'],
  ['personaNatural', 'Persona natural'],
];

export function PanelExigibilidad() {
  const { responsable, bases, setResponsable } = useEstado();
  const r = evaluarExigibilidad(responsable);
  const sinRegistrar = bases.filter((b) => !b.registradaEnRnbd).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Dato
          rotulo="¿Debe registrar en el RNBD?"
          valor={r.exigible ? 'Sí' : 'No'}
          tono={r.exigible ? 'riesgo' : 'ok'}
        />
        <Dato
          rotulo="Activos en UVT"
          valor={numero(r.activosEnUvt, 0)}
          detalle={`Umbral: ${numero(UMBRAL_RNBD_UVT, 0)} UVT`}
        />
        <Dato
          rotulo="Bases sin registrar"
          valor={sinRegistrar}
          tono={r.exigible && sinRegistrar > 0 ? 'riesgo' : 'neutro'}
        />
      </div>

      <Tarjeta
        titulo="Responsable del tratamiento"
        descripcion="Determina si el registro es exigible."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre o razón social">
            {(id) => (
              <Entrada
                id={id}
                value={responsable.nombre}
                onChange={(e) => setResponsable({ nombre: e.target.value })}
              />
            )}
          </Campo>
          <Campo etiqueta="NIT">
            {(id) => (
              <Entrada
                id={id}
                value={responsable.nit}
                onChange={(e) => setResponsable({ nit: e.target.value })}
              />
            )}
          </Campo>
          <Campo etiqueta="Naturaleza jurídica">
            {(id) => (
              <Seleccion
                id={id}
                value={responsable.naturaleza}
                onChange={(e) =>
                  setResponsable({ naturaleza: e.target.value as NaturalezaResponsable })
                }
              >
                {NATURALEZAS.map(([v, rot]) => (
                  <option key={v} value={v}>
                    {rot}
                  </option>
                ))}
              </Seleccion>
            )}
          </Campo>
          <Campo etiqueta="Activos totales" ayuda={`Equivalen a ${numero(r.activosEnUvt, 0)} UVT.`}>
            {(id) => (
              <Entrada
                id={id}
                type="number"
                min={0}
                step={1_000_000}
                value={responsable.activos}
                onChange={(e) => setResponsable({ activos: Number(e.target.value) })}
              />
            )}
          </Campo>
          <Campo
            etiqueta="Valor de la UVT del año evaluado"
            ayuda="Verifíquelo en la resolución de la DIAN."
          >
            {(id) => (
              <Entrada
                id={id}
                type="number"
                min={1}
                value={responsable.uvt}
                onChange={(e) => setResponsable({ uvt: Number(e.target.value) })}
              />
            )}
          </Campo>
        </div>

        <p className="mt-4 text-sm text-texto-2">
          Activos declarados: <strong>{pesos(responsable.activos)}</strong>.
        </p>
      </Tarjeta>

      <Llamado
        tono={r.exigible ? 'riesgo' : 'ok'}
        titulo={r.exigible ? 'El registro es exigible' : 'El registro no es exigible'}
        icono={<Building2 size={18} />}
      >
        <p>{r.razon}</p>
        <p className="eyebrow mt-1.5">{r.norma}</p>
      </Llamado>

      {r.advertencias.map((a) => (
        <Llamado key={a} tono="alerta" icono={<Info size={18} />}>
          {a}
        </Llamado>
      ))}

      <Tarjeta titulo="Qué exige la Ley 1581 con independencia del registro">
        <Tabla>
          <thead>
            <tr>
              <Th>Obligación</Th>
              <Th>Norma</Th>
              <Th>¿Depende del registro?</Th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                [
                  'Política de tratamiento adoptada y accesible',
                  'Decreto 1074 de 2015, art. 2.2.2.25.3.1',
                ],
                ['Aviso de privacidad en cada punto de recolección', 'Ley 1581 de 2012, art. 15'],
                ['Autorización previa, expresa e informada', 'Ley 1581 de 2012, arts. 9 y 12'],
                ['Canal de consultas y reclamos operativo', 'Ley 1581 de 2012, arts. 14 y 15'],
                ['Medidas de seguridad proporcionales al riesgo', 'Ley 1581 de 2012, art. 17'],
                ['Reporte de incidentes de seguridad a la SIC', 'Ley 1581 de 2012, art. 17 lit. n'],
                ['Supresión al cumplirse la finalidad', 'Ley 1581 de 2012, art. 11'],
              ] as const
            ).map(([obligacion, norma]) => (
              <tr key={obligacion}>
                <Td className="font-medium">{obligacion}</Td>
                <Td className="text-xs text-texto-2">{norma}</Td>
                <Td>
                  <Insignia tono="ok">No</Insignia>
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>

        <p className="mt-4 text-sm text-texto-2">
          Es el malentendido más común: se cree que sin obligación de registro no hay obligaciones.
          El registro es un trámite; el régimen de protección aplica a cualquiera que trate datos
          personales.
        </p>
      </Tarjeta>

      {r.exigible && (
        <Tarjeta
          titulo="Cómo se surte el registro"
          descripcion="Esta herramienta no radica nada ante la SIC."
        >
          <ol className="space-y-2 text-sm text-texto-2">
            {[
              'Complete la ficha de cada base en el módulo correspondiente: el RNBD pide finalidad, categorías de datos, encargados, transferencias y medidas.',
              'Exporte el inventario desde el módulo de exportación y úselo como insumo del formulario.',
              'Cree el usuario del responsable en el portal del RNBD de la Superintendencia de Industria y Comercio.',
              'Registre cada base de datos con la información del inventario.',
              'Actualice el registro cuando cambie la información sustancial y en la ventana anual de actualización que la SIC señale.',
            ].map((paso, i) => (
              <li key={paso} className="flex gap-3">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-marca font-mono text-[0.65rem] font-semibold text-marca-contraste">
                  {i + 1}
                </span>
                {paso}
              </li>
            ))}
          </ol>

          <a
            href="https://www.sic.gov.co/registro-nacional-de-bases-de-datos"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-marca hover:underline"
          >
            Portal del RNBD en la SIC <ExternalLink size={14} />
          </a>
        </Tarjeta>
      )}
    </div>
  );
}
