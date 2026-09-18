/**
 * Estado del inventario de bases de datos.
 *
 * Esta herramienta describe bases de datos; no las contiene. Aquí no hay un
 * solo dato personal de un titular real: hay metadatos sobre qué trata la
 * empresa, con qué finalidad y bajo qué medidas.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { almacenZustand } from './lib/almacen';
import { MEDIDAS, type BaseDatos, type PerfilResponsable } from './domain/inventario';

interface Estado {
  responsable: PerfilResponsable & { nombre: string; nit: string };
  bases: BaseDatos[];
  seleccionada: string | null;
  setResponsable: (p: Partial<Estado['responsable']>) => void;
  crear: (nombre: string, area: string) => void;
  actualizar: (id: string, cambios: Partial<BaseDatos>) => void;
  eliminar: (id: string) => void;
  seleccionar: (id: string | null) => void;
  alternarMedida: (id: string, medida: string) => void;
  cargarEjemplo: () => void;
}

/** Inventario de arranque: las bases que toda empresa con nómina tiene. */
function ejemplo(): BaseDatos[] {
  const comunes = {
    encargados: [],
    medidas: ['politica', 'aviso', 'responsable', 'procedimiento-reclamos'],
    tieneAutorizacion: false,
    tienePoliticaPublicada: false,
    registradaEnRnbd: false,
  };
  return [
    {
      ...comunes,
      id: crypto.randomUUID(),
      nombre: 'Nómina y contratación',
      area: 'Talento humano',
      finalidad:
        'Administrar la relación laboral, liquidar nómina y prestaciones, y cumplir las obligaciones de seguridad social.',
      titulares: ['trabajadores'],
      datos: ['identificacion', 'contacto', 'laboral', 'financiero', 'salud'],
      volumen: 25,
      canalRecoleccion: 'Formato de vinculación y expediente laboral',
      retencion: '10 años desde la terminación del contrato',
    },
    {
      ...comunes,
      id: crypto.randomUUID(),
      nombre: 'Selección de personal',
      area: 'Talento humano',
      finalidad: 'Evaluar y seleccionar candidatos para las vacantes abiertas de la empresa.',
      titulares: ['candidatos'],
      datos: ['identificacion', 'contacto', 'academico', 'laboral'],
      volumen: 300,
      canalRecoleccion: 'Formulario web y correo electrónico',
      retencion: '',
    },
    {
      ...comunes,
      id: crypto.randomUUID(),
      nombre: 'Clientes y facturación',
      area: 'Comercial',
      finalidad:
        'Gestionar la relación comercial, facturar y atender las obligaciones tributarias y de garantía.',
      titulares: ['clientes'],
      datos: ['identificacion', 'contacto', 'financiero'],
      volumen: 1200,
      canalRecoleccion: 'Contratos y sistema de facturación',
      retencion: '5 años conforme al Estatuto Tributario',
    },
    {
      ...comunes,
      id: crypto.randomUUID(),
      nombre: 'Control de acceso biométrico',
      area: 'Administración',
      finalidad: 'Controlar el ingreso a las instalaciones y registrar la asistencia.',
      titulares: ['trabajadores', 'visitantes'],
      datos: ['identificacion', 'biometrico', 'ubicacion'],
      volumen: 80,
      canalRecoleccion: 'Lector biométrico de la portería',
      retencion: '',
    },
  ];
}

const INICIAL = {
  responsable: {
    nombre: '',
    nit: '',
    naturaleza: 'sociedad' as const,
    activos: 2_000_000_000,
    uvt: 49_799,
  },
  bases: [] as BaseDatos[],
  seleccionada: null as string | null,
};

export const useEstado = create<Estado>()(
  persist(
    (set) => ({
      ...structuredClone(INICIAL),

      setResponsable: (p) => set((s) => ({ responsable: { ...s.responsable, ...p } })),

      crear: (nombre, area) =>
        set((s) => {
          const nueva: BaseDatos = {
            id: crypto.randomUUID(),
            nombre,
            area,
            finalidad: '',
            titulares: [],
            datos: [],
            volumen: 0,
            canalRecoleccion: '',
            retencion: '',
            encargados: [],
            medidas: [],
            tieneAutorizacion: false,
            tienePoliticaPublicada: false,
            registradaEnRnbd: false,
          };
          return { bases: [nueva, ...s.bases], seleccionada: nueva.id };
        }),

      actualizar: (id, cambios) =>
        set((s) => ({ bases: s.bases.map((b) => (b.id === id ? { ...b, ...cambios } : b)) })),

      eliminar: (id) =>
        set((s) => ({
          bases: s.bases.filter((b) => b.id !== id),
          seleccionada: s.seleccionada === id ? null : s.seleccionada,
        })),

      seleccionar: (seleccionada) => set({ seleccionada }),

      alternarMedida: (id, medida) =>
        set((s) => ({
          bases: s.bases.map((b) =>
            b.id === id
              ? {
                  ...b,
                  medidas: b.medidas.includes(medida)
                    ? b.medidas.filter((m) => m !== medida)
                    : [...b.medidas, medida],
                }
              : b,
          ),
        })),

      cargarEjemplo: () => set({ bases: ejemplo(), seleccionada: null }),
    }),
    {
      name: 'estado',
      version: 1,
      storage: createJSONStorage(() => almacenZustand),
      partialize: (s) => ({
        responsable: s.responsable,
        bases: s.bases,
        seleccionada: s.seleccionada,
      }),
    },
  ),
);

export function useBase(): BaseDatos | null {
  return useEstado((s) => s.bases.find((b) => b.id === s.seleccionada) ?? null);
}

export const TODAS_LAS_MEDIDAS = MEDIDAS.map((m) => m.id);
