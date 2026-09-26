import { useState, type JSX } from 'react';

import { Portada } from './brand/Portada';
import { APP, MODULOS, Shell, type ModuloId, type Vista } from './brand/Shell';
import { PanelExigibilidad } from './features/PanelExigibilidad';
import { PanelExportacion } from './features/PanelExportacion';
import { PanelFicha } from './features/PanelFicha';
import { PanelInventario } from './features/PanelInventario';
import { PanelRiesgo } from './features/PanelRiesgo';

const PANELES: Record<ModuloId, () => JSX.Element> = {
  inventario: PanelInventario,
  'ficha-de-base-de-datos': PanelFicha,
  'exigibilidad-rnbd': PanelExigibilidad,
  'mapa-de-riesgo': PanelRiesgo,
  exportacion: PanelExportacion,
};

export default function App() {
  // Se abre en la portada: quien llega ve primero de qué se compone la
  // herramienta, en vez de caer dentro del primer módulo sin contexto.
  const [vista, setVista] = useState<Vista>('portada');
  const Panel = vista === 'portada' ? null : PANELES[vista];

  return (
    <Shell vista={vista} onVista={setVista}>
      {Panel ? (
        <Panel />
      ) : (
        <Portada
          titulo={APP.nombre}
          descripcion={APP.resumen}
          modulos={MODULOS}
          onAbrir={(id) => setVista(id as ModuloId)}
        />
      )}
    </Shell>
  );
}
