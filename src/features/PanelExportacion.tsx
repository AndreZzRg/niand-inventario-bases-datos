/**
 * Módulo «Exportación»: el inventario como insumo del RNBD y como respaldo.
 */
import { useRef, useState } from 'react';
import { Download, FileJson, Printer, Upload } from 'lucide-react';

import { Boton, Dato, Llamado, Tabla, Tarjeta, Td, Th, Vacio } from '../brand/ui';
import { Logo } from '../brand/Logo';
import {
  DATOS,
  MEDIDAS,
  TITULARES,
  consolidar,
  datoPorId,
  evaluarExigibilidad,
  evaluarRiesgo,
} from '../domain/inventario';
import { exportarCSV, exportarJSON, imprimir, leerArchivo } from '../lib/exportar';
import { numero } from '../lib/formato';
import { useEstado } from '../store';

export function PanelExportacion() {
  const { bases, responsable, setResponsable } = useEstado();
  const archivo = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const exigibilidad = evaluarExigibilidad(responsable);
  const c = consolidar(bases);

  if (bases.length === 0) {
    return (
      <Vacio titulo="No hay inventario que exportar">
        Agregue al menos una base de datos en el módulo <strong>Inventario</strong>.
      </Vacio>
    );
  }

  const rotuloDato = (id: string) => DATOS.find((d) => d.id === id)?.rotulo ?? id;
  const rotuloMedida = (id: string) => MEDIDAS.find((m) => m.id === id)?.rotulo ?? id;

  const importar = async (f: File) => {
    setError(null);
    try {
      const datos = JSON.parse(await leerArchivo(f)) as {
        responsable?: Partial<typeof responsable>;
      };
      if (datos.responsable) setResponsable(datos.responsable);
      else throw new Error('estructura');
    } catch {
      setError('El archivo no tiene el formato de respaldo de esta aplicación.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="no-imprimir flex flex-wrap gap-2">
        <Boton
          onClick={() =>
            exportarCSV(
              [
                ['Inventario de bases de datos personales'],
                ['Responsable', responsable.nombre || 'Sin nombre', 'NIT', responsable.nit],
                ['Registro RNBD exigible', exigibilidad.exigible ? 'Sí' : 'No'],
                [],
                [
                  'Base',
                  'Área',
                  'Finalidad',
                  'Titulares',
                  'Categorías de datos',
                  'Contiene sensibles',
                  'Titulares (número)',
                  'Canal de recolección',
                  'Retención',
                  'Encargados',
                  'Transferencia internacional',
                  'Medidas',
                  'Autorización',
                  'Política publicada',
                  'Registrada RNBD',
                  'Riesgo',
                ],
                ...bases.map((b) => {
                  const e = evaluarRiesgo(b);
                  return [
                    b.nombre,
                    b.area,
                    b.finalidad,
                    b.titulares.map((t) => TITULARES[t]).join(', '),
                    b.datos.map(rotuloDato).join(', '),
                    b.datos.some((d) => datoPorId(d).sensible) ? 'Sí' : 'No',
                    b.volumen,
                    b.canalRecoleccion,
                    b.retencion,
                    b.encargados.map((x) => `${x.nombre} (${x.pais})`).join(', '),
                    b.encargados.some((x) => x.pais.toLowerCase() !== 'colombia') ? 'Sí' : 'No',
                    b.medidas.map(rotuloMedida).join(', '),
                    b.tieneAutorizacion ? 'Sí' : 'No',
                    b.tienePoliticaPublicada ? 'Sí' : 'No',
                    b.registradaEnRnbd ? 'Sí' : 'No',
                    `${e.nivel} (${e.puntaje}/100)`,
                  ];
                }),
              ],
              'inventario-bases-datos',
            )
          }
        >
          <Download size={15} /> Inventario en CSV
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => exportarJSON({ responsable, bases }, 'inventario')}
        >
          <FileJson size={15} /> Respaldo JSON
        </Boton>
        <Boton variante="secundario" onClick={() => archivo.current?.click()}>
          <Upload size={15} /> Importar respaldo
        </Boton>
        <Boton variante="fantasma" onClick={imprimir}>
          <Printer size={15} /> Imprimir
        </Boton>
        <input
          ref={archivo}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importar(f);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <Llamado tono="riesgo" className="no-imprimir">
          {error}
        </Llamado>
      )}

      <Llamado tono="info" className="no-imprimir" titulo="Para qué sirve el CSV">
        Es el insumo del formulario del RNBD: trae, por base, la finalidad, las categorías de datos,
        los encargados, las transferencias y las medidas, que es exactamente lo que pide el
        registro. <strong>Esta herramienta no radica nada ante la SIC.</strong>
      </Llamado>

      <Tarjeta className="print:border-0 print:shadow-none">
        <header className="mb-6 border-b border-borde pb-5">
          <Logo alto={28} />
          <h1 className="mt-4 font-display text-xl font-semibold">
            Inventario de bases de datos personales
          </h1>
          <p className="text-sm text-texto-2">
            {responsable.nombre || 'Responsable sin nombre'}
            {responsable.nit ? ` · NIT ${responsable.nit}` : ''}
          </p>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Dato rotulo="Bases" valor={c.bases} />
          <Dato rotulo="Titulares" valor={numero(c.titulares, 0)} />
          <Dato rotulo="Con sensibles" valor={c.conSensibles} tono="alerta" />
          <Dato
            rotulo="Registro RNBD"
            valor={exigibilidad.exigible ? 'Exigible' : 'No exigible'}
            tono={exigibilidad.exigible ? 'riesgo' : 'ok'}
          />
        </div>

        <Tabla>
          <thead>
            <tr>
              <Th>Base y finalidad</Th>
              <Th>Datos</Th>
              <Th>Encargados</Th>
              <Th>Estado</Th>
            </tr>
          </thead>
          <tbody>
            {bases.map((b) => (
              <tr key={b.id}>
                <Td>
                  <span className="font-medium">{b.nombre}</span>
                  <span className="block text-xs text-texto-3">{b.area}</span>
                  <span className="mt-1 block text-xs text-texto-2">
                    {b.finalidad || 'Sin finalidad declarada'}
                  </span>
                </Td>
                <Td className="text-xs">
                  {b.datos.map(rotuloDato).join(', ') || '—'}
                  <span className="block text-texto-3">{numero(b.volumen, 0)} titulares</span>
                </Td>
                <Td className="text-xs">
                  {b.encargados.length === 0
                    ? '—'
                    : b.encargados.map((x) => `${x.nombre} (${x.pais})`).join(', ')}
                </Td>
                <Td className="text-xs">
                  {b.tieneAutorizacion ? '✓ autorización' : '✗ sin autorización'}
                  <span className="block">
                    {b.registradaEnRnbd ? '✓ en RNBD' : '✗ sin registrar'}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </Tabla>

        <footer className="mt-6 border-t border-borde pt-4 text-xs text-texto-3">
          <p>
            <strong>Advertencia.</strong> Este inventario es orientativo y no constituye concepto
            jurídico profesional. La evaluación de exigibilidad aplica el criterio de la Circular
            Externa 005 de 2017 de la SIC; verifique la instrucción vigente antes de concluir.
            Proyecto de laboratorio de NiAnd Labs; no corresponde a un cliente real.
          </p>
        </footer>
      </Tarjeta>
    </div>
  );
}
