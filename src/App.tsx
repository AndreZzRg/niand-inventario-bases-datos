import { useState, type JSX } from 'react';

import { Shell, type ModuloId } from './brand/Shell';
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
  const [modulo, setModulo] = useState<ModuloId>('inventario');
  const Panel = PANELES[modulo];

  return (
    <Shell moduloActivo={modulo} onModulo={setModulo}>
      <Panel />
    </Shell>
  );
}
