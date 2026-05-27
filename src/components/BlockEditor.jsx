import React, { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly';
import { BLOCK_DESCRIPTIONS } from '../blocks/blockDescriptions';
import BlockInfoPanel from './BlockInfoPanel';
import { blocks } from 'blockly/blocks';
import { defineArduinoBlocks } from '../blocks/arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from '../blocks/arduinoGenerator';
import { toolboxConfig } from '../blocks/toolbox';
import { registerLibraryBlocks, buildLibraryToolboxCategory, buildFallbackLibraryToolboxCategory } from '../blocks/libraryBlocks';
import { INITIAL_XML } from '../config/initialWorkspace';

const LS_KEY = 'arduino-blocks-workspace';

// Registrar bloques built-in de Blockly (math, logic, text...)
Blockly.common.defineBlocks(blocks);

// Inicializar una sola vez
let initialized = false;
function initBlockly() {
  if (!initialized) {
    defineArduinoBlocks();
    registerArduinoGenerators(arduinoGenerator);
    initialized = true;
  }
}

export default forwardRef(function BlockEditor({ onCodeChange }, ref) {
  const blocklyDiv   = useRef(null);
  const workspaceRef = useRef(null);
  const skipEmit     = useRef(false);   // true mientras cargamos XML externamente
  const [selectedInfo, setSelectedInfo] = useState(null);

  // ── API pública expuesta al padre via ref ──────────────────────────────────

  useImperativeHandle(ref, () => ({
    /**
     * Carga un XML de Blockly en el workspace.
     * No dispara onCodeChange para evitar ciclos infinitos.
     */
    loadXML(xmlString) {
      if (!workspaceRef.current || !xmlString) return;
      try {
        skipEmit.current = true;
        workspaceRef.current.clear();
        const dom = Blockly.utils.xml.textToDom(xmlString);
        Blockly.Xml.domToWorkspace(dom, workspaceRef.current);
        // Ajustar vista a los bloques cargados
        setTimeout(() => {
          workspaceRef.current?.zoomToFit();
          skipEmit.current = false;
        }, 80);
      } catch (e) {
        console.warn('[BlockEditor] Error cargando XML:', e);
        skipEmit.current = false;
      }
    },

    /** Retorna el XML actual del workspace */
    getXML() {
      if (!workspaceRef.current) return '';
      try {
        const dom = Blockly.Xml.workspaceToDom(workspaceRef.current);
        return Blockly.Xml.domToPrettyText(dom);
      } catch {
        return '';
      }
    },

    /** Retorna el código Arduino generado actualmente */
    getCode() {
      if (!workspaceRef.current) return '';
      try { return arduinoGenerator.workspaceToCode(workspaceRef.current); } catch { return ''; }
    },

    /**
     * Actualiza el toolbox añadiendo/quitando categorías de librerías según las
     * que estén activas en el workspace (#include presentes).
     * @param {string[]} libs - nombres de librerías actualmente incluidas
     */
    updateToolboxForLibraries(libs) {
      const ws = workspaceRef.current;
      if (!ws) return;

      const uniqueLibs = [...new Set(libs)];

      // Registrar bloques Blockly para librerías que tengan definición
      for (const lib of uniqueLibs) {
        registerLibraryBlocks(lib, arduinoGenerator);
      }

      // Construir categorías de librería (predefinidas o fallback genérico)
      const libCategories = uniqueLibs
        .map((lib) => buildLibraryToolboxCategory(lib) ?? buildFallbackLibraryToolboxCategory(lib, arduinoGenerator))
        .filter(Boolean);

      const newContents = libCategories.length > 0
        ? [...toolboxConfig.contents, { kind: 'sep' }, ...libCategories]
        : [...toolboxConfig.contents];

      try {
        ws.updateToolbox({ ...toolboxConfig, contents: newContents });
      } catch (e) {
        console.warn('[BlockEditor] Error actualizando toolbox:', e);
      }
    },

    /**
     * Inserta en el workspace un bloque personalizado previamente registrado.
     * @param {string} id - id del bloque personalizado (sin prefijo "custom_")
     * @returns {boolean} true si se insertó
     */
    addCustomBlock(id) {
      const ws = workspaceRef.current;
      if (!ws) return false;
      const type = `custom_${id}`;
      if (!Blockly.Blocks[type]) {
        console.warn('[BlockEditor] Tipo de bloque no registrado:', type);
        return false;
      }
      try {
        const block = ws.newBlock(type);
        block.initSvg();
        block.render();
        // Posicionar en el centro de la vista actual
        const metrics = ws.getMetrics?.();
        const cx = metrics
          ? (metrics.viewLeft + metrics.viewWidth  / 2) / ws.scale
          : 120;
        const cy = metrics
          ? (metrics.viewTop  + metrics.viewHeight / 2) / ws.scale
          : 300;
        block.moveBy(cx - 60, cy - 20);
        return true;
      } catch (e) {
        console.warn('[BlockEditor] Error insertando bloque personalizado:', e);
        return false;
      }
    },

    /**
     * Agrega un bloque arduino_include flotante al workspace.
     * No hace nada si ya existe un bloque con esa librería.
     * @param {string} libName - nombre de la librería (sin .h)
     * @returns {boolean} true si se agregó, false si ya existía
     */
    addIncludeBlock(libName) {
      const ws = workspaceRef.current;
      if (!ws) return false;
      // Verificar que no exista ya
      const existing = ws.getBlocksByType('arduino_include');
      for (const b of existing) {
        if (b.getFieldValue('LIB') === libName) return false;
      }
      const count = existing.length; // capturar antes de crear
      try {
        const block = ws.newBlock('arduino_include');
        block.getField('LIB').setValue(libName);
        block.initSvg();
        block.render();
        // Apilar en columna a la izquierda del bloque principal
        block.moveBy(-230, 20 + count * 55);
        return true;
      } catch (e) {
        console.warn('[BlockEditor] Error creando bloque include:', e);
        return false;
      }
    },
  }), []);

  // ── Setup de Blockly ───────────────────────────────────────────────────────

  useEffect(() => {
    initBlockly();

    if (workspaceRef.current) return; // ya inicializado

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toolboxConfig,
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 3, minScale: 0.3 },
      trashcan: true,
      scrollbars: true,
      theme: Blockly.Themes.Zelos,
    });

    workspaceRef.current = workspace;

    // Cargar workspace guardado en localStorage, o el ejemplo inicial
    const savedXML = localStorage.getItem(LS_KEY);
    const xmlToLoad = savedXML || INITIAL_XML;
    try {
      const dom = Blockly.utils.xml.textToDom(xmlToLoad);
      Blockly.Xml.domToWorkspace(dom, workspace);
    } catch (e) {
      console.warn('[BlockEditor] Error cargando XML guardado, usando inicial:', e);
      const dom = Blockly.utils.xml.textToDom(INITIAL_XML);
      Blockly.Xml.domToWorkspace(dom, workspace);
    }

    // Emitir código inicial
    emitCode(workspace);

    // ResizeObserver: avisar a Blockly cuando el contenedor cambie de tamaño
    const ro = new ResizeObserver(() => {
      Blockly.svgResize(workspace);
    });
    ro.observe(blocklyDiv.current);

    // Listener de cambios
    workspace.addChangeListener((event) => {
      if (skipEmit.current) return; // evitar ciclo bloques→código→bloques
      if (
        event.type === Blockly.Events.BLOCK_CHANGE ||
        event.type === Blockly.Events.BLOCK_CREATE ||
        event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_MOVE ||
        event.type === Blockly.Events.FINISHED_LOADING
      ) {
        // Persistir workspace en localStorage
        try {
          const xmlDom = Blockly.Xml.workspaceToDom(workspace);
          localStorage.setItem(LS_KEY, Blockly.Xml.domToPrettyText(xmlDom));
        } catch (_) {}
        emitCode(workspace);
      }
    });

    // Listener de selección de bloques → muestra panel informativo
    workspace.addChangeListener((event) => {
      if (event.type === Blockly.Events.SELECTED) {
        if (event.newElementId) {
          const block = workspace.getBlockById(event.newElementId);
          if (block) {
            setSelectedInfo(BLOCK_DESCRIPTIONS[block.type] ?? null);
          }
        } else {
          setSelectedInfo(null);
        }
      }
    });

    return () => {
      ro.disconnect();
      workspace.dispose();
      workspaceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitCode = useCallback((ws) => {
    try {
      const code = arduinoGenerator.workspaceToCode(ws);
      onCodeChange?.(code);
    } catch (e) {
      console.error('Error generando código:', e);
    }
  }, [onCodeChange]);

  // Exponer workspace en window para debugging
  useEffect(() => {
    window.__blocklyWorkspace = workspaceRef.current;
  });

  return (
    // Wrapper position:absolute para ocupar todo el panel izquierdo (igual que antes).
    // Flex-column para que el div de Blockly se redimensione via flex y las
    // coordenadas de clic del toolbox sean siempre correctas.
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
      <div
        ref={blocklyDiv}
        style={{ flex: 1, minHeight: 0 }}
      />
      {selectedInfo && <BlockInfoPanel info={selectedInfo} />}
    </div>
  );
});
