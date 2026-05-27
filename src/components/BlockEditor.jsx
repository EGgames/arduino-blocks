import React, { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import * as Blockly from 'blockly';
import { BLOCK_DESCRIPTIONS, KIDS_BLOCK_DESCRIPTIONS } from '../blocks/blockDescriptions';
import BlockInfoPanel from './BlockInfoPanel';
import { blocks } from 'blockly/blocks';
import { defineArduinoBlocks } from '../blocks/arduinoBlocks';
import { arduinoGenerator, registerArduinoGenerators } from '../blocks/arduinoGenerator';
import { defineKidsBlocks, registerKidsGenerators, getKidsTheme, getArduinoDarkTheme } from '../blocks/kidsBlocks';
import { toolboxConfig, kidsToolboxConfig } from '../blocks/toolbox';
import { registerLibraryBlocks, buildLibraryToolboxCategory, buildFallbackLibraryToolboxCategory } from '../blocks/libraryBlocks';
import { INITIAL_XML, KIDS_INITIAL_XML } from '../config/initialWorkspace';

const LS_KEY_ADVANCED = 'arduino-blocks-workspace';
const LS_KEY_KIDS     = 'arduino-blocks-workspace-kids';
const getLSKey = (mode) => mode === 'kids' ? LS_KEY_KIDS : LS_KEY_ADVANCED;
const getInitialXML = (mode) => mode === 'kids' ? KIDS_INITIAL_XML : INITIAL_XML;

// Registrar bloques built-in de Blockly (math, logic, text...)
Blockly.common.defineBlocks(blocks);

// Inicializar una sola vez
let initialized = false;
function initBlockly() {
  if (!initialized) {
    defineArduinoBlocks();
    registerArduinoGenerators(arduinoGenerator);
    defineKidsBlocks();
    registerKidsGenerators(arduinoGenerator);
    initialized = true;
  }
}

export default forwardRef(function BlockEditor({ onCodeChange, mode = 'advanced', isMobile = false, isDark = false }, ref) {
  const blocklyDiv   = useRef(null);
  const workspaceRef = useRef(null);
  const skipEmit     = useRef(false);   // true mientras cargamos XML externamente
  const modeRef      = useRef(mode);    // ref para acceder al modo actual dentro de callbacks
  const [selectedInfo, setSelectedInfo] = useState(null);

  // Ref para acceder al valor actualizado de isMobile dentro de closures estables
  const isMobileRef  = useRef(isMobile);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  // Ref para acceder al isDark actual en el callback de inyección (solo corre una vez)
  const isDarkRef = useRef(isDark);
  useEffect(() => { isDarkRef.current = isDark; }, [isDark]);

  // Refs de estado del toolbox (libs activas y bloques custom)
  const activeLibsRef = useRef([]);
  const customDefsRef = useRef([]);
  const _rebuildRef   = useRef(null);

  // En mobile: usar solo el emoji como nombre de categoría → toolbox ~50px vs ~200px
  const toMobileToolbox = useCallback((config) => {
    if (!isMobileRef.current) return config;
    return {
      ...config,
      contents: config.contents.map(item =>
        item.kind === 'category' && item.name && item.name.charCodeAt(0) > 127
          ? { ...item, name: [...item.name][0] }   // primer carácter = emoji
          : item
      ),
    };
  }, []);

  // Reconstruye el toolbox completo (libs + custom blocks).
  // Se reasigna en cada render para capturar toMobileToolbox actualizado.
  _rebuildRef.current = () => {
    const ws = workspaceRef.current;
    if (!ws) return;
    const uniqueLibs = activeLibsRef.current;
    const customDefs = customDefsRef.current;
    const libCategories = uniqueLibs
      .map(lib => buildLibraryToolboxCategory(lib) ?? buildFallbackLibraryToolboxCategory(lib, arduinoGenerator))
      .filter(Boolean);
    const customCategory = customDefs.length > 0
      ? [{ kind: 'category', name: '\uD83E\uDDE9 Mis bloques', colour: '45',
           contents: customDefs.map(def => ({ kind: 'block', type: `custom_${def.id}` })) }]
      : [];
    const baseConfig = modeRef.current === 'kids' ? kidsToolboxConfig : toolboxConfig;
    const extra = [...libCategories, ...customCategory];
    const newContents = extra.length > 0
      ? [...baseConfig.contents, { kind: 'sep' }, ...extra]
      : [...baseConfig.contents];
    try {
      ws.updateToolbox(toMobileToolbox({ ...baseConfig, contents: newContents }));
    } catch (e) {
      console.warn('[BlockEditor] Error actualizando toolbox:', e);
    }
  };

  // Sincronizar modeRef: guardar workspace actual, cargar el nuevo y cambiar tema
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws) return;

    // Guardar workspace del modo anterior antes de cambiar
    try {
      const oldKey = getLSKey(modeRef.current);
      const xmlDom = Blockly.Xml.workspaceToDom(ws);
      localStorage.setItem(oldKey, Blockly.Xml.domToPrettyText(xmlDom));
    } catch (_) {}

    modeRef.current = mode;

    // Cargar workspace del nuevo modo
    const savedXML = localStorage.getItem(getLSKey(mode));
    const xmlToLoad = savedXML || getInitialXML(mode);
    try {
      skipEmit.current = true;
      ws.clear();
      const dom = Blockly.utils.xml.textToDom(xmlToLoad);
      Blockly.Xml.domToWorkspace(dom, ws);
      setTimeout(() => {
        ws.zoomToFit();
        skipEmit.current = false;
      }, 100);
    } catch (e) {
      console.warn('[BlockEditor] Error cargando workspace para modo:', mode, e);
      skipEmit.current = false;
    }

    // Cambiar tema visual y zoom según modo
    try {
      ws.setTheme(mode === 'kids' ? getKidsTheme() : Blockly.Themes.Zelos);
      ws.setScale(mode === 'kids' ? 1.0 : 0.85);
    } catch (_) {}

    // Actualizar toolbox
    _rebuildRef.current?.();
  }, [mode]);

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
      const uniqueLibs = [...new Set(libs)];
      // Registrar bloques Blockly para librerías que tengan definición
      for (const lib of uniqueLibs) {
        registerLibraryBlocks(lib, arduinoGenerator);
      }
      activeLibsRef.current = uniqueLibs;
      _rebuildRef.current?.();
    },

    /**
     * Actualiza el toolbox con la lista actual de bloques personalizados.
     * @param {Array} defs - lista de definiciones de bloques custom
     */
    updateCustomBlocksInToolbox(defs) {
      customDefsRef.current = defs || [];
      _rebuildRef.current?.();
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

    /** Deshace la última acción en el workspace Blockly (UX-05) */
    undo() { workspaceRef.current?.undo(false); },

    /** Rehace la última acción deshecha en el workspace Blockly (UX-05) */
    redo() { workspaceRef.current?.undo(true); },

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

    const isKids = modeRef.current === 'kids';
    // Escala inicial: mayor en mobile para que los bloques sean más táctiles
    const startScale = isMobile
      ? (isKids ? 1.3 : 1.05)
      : (isKids ? 1.0 : 0.85);

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: toMobileToolbox(isKids ? kidsToolboxConfig : toolboxConfig),
      grid: { spacing: isKids ? 30 : 20, length: 3, colour: isKids ? '#b3d9ff' : (isDarkRef.current ? '#2a3a4e' : '#ccc'), snap: true },
      zoom: { controls: true, wheel: true, pinch: true, startScale, maxScale: 4, minScale: 0.3 },
      move: { scrollbars: true, drag: true, wheel: true },
      trashcan: true,
      theme: isKids ? getKidsTheme() : (isDarkRef.current ? getArduinoDarkTheme() : Blockly.Themes.Zelos),
    });

    workspaceRef.current = workspace;

    // Cargar workspace guardado en localStorage, o el ejemplo inicial del modo actual
    const savedXML = localStorage.getItem(getLSKey(modeRef.current));
    const xmlToLoad = savedXML || getInitialXML(modeRef.current);
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
        // Persistir workspace en localStorage (clave según modo actual)
        try {
          const xmlDom = Blockly.Xml.workspaceToDom(workspace);
          localStorage.setItem(getLSKey(modeRef.current), Blockly.Xml.domToPrettyText(xmlDom));
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
            const dict = modeRef.current === 'kids' ? KIDS_BLOCK_DESCRIPTIONS : BLOCK_DESCRIPTIONS;
            setSelectedInfo(dict[block.type] ?? BLOCK_DESCRIPTIONS[block.type] ?? null);
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

  // Cambiar tema oscuro/claro dinámicamente (HU-23)
  useEffect(() => {
    const ws = workspaceRef.current;
    if (!ws || modeRef.current === 'kids') return;
    try {
      ws.setTheme(isDark ? getArduinoDarkTheme() : Blockly.Themes.Zelos);
    } catch (_) {}
  }, [isDark]);

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
      {/* UX-04: cabecera identificativa del panel de bloques (solo desktop) */}
      {!isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '3px 12px',
          background: mode === 'kids' ? '#1b5e20' : (isDark ? '#2d2d2d' : '#e8edf3'),
          borderBottom: mode === 'kids' ? '2px solid #43a047' : (isDark ? '1px solid #3c3c3c' : '1px solid #c8d0db'),
          flexShrink: 0,
          zIndex: 1,
        }}>
          <span style={{
            color: mode === 'kids' ? '#c8e6c9' : (isDark ? '#cccccc' : '#555'),
            fontFamily: 'monospace',
            fontSize: 12,
          }}>
            {mode === 'kids' ? '🧩 bloques' : 'editor.blocks'}
          </span>
        </div>
      )}
      <div
        ref={blocklyDiv}
        style={{ flex: 1, minHeight: 0 }}
      />
      {selectedInfo && <BlockInfoPanel info={selectedInfo} mode={mode} isMobile={isMobile} />}
    </div>
  );
});
