/**
 * Conversión del workspace entre el modo Avanzado y el modo Niño.
 *
 * Los dos modos comparten el MISMO programa: al cambiar de modo no se carga otro
 * proyecto, se traducen los bloques a su equivalente del otro modo. El invariante
 * que se respeta siempre es que **el código C++ generado no cambia**.
 *
 * Cuando un bloque no tiene equivalente exacto (por ejemplo `Serial.begin` a
 * 115200, que en modo Niño es siempre 9600, o un pin que es una expresión) el
 * bloque se deja tal cual: sigue funcionando y generando el mismo código, solo
 * que con su apariencia del otro modo.
 */

const NUM_BLOCK = 'math_number';
const VAR_GET_BLOCKS = ['arduino_variable_get', 'kids_variable_get'];

/** Tipos de dato que ofrece cada desplegable del modo Niño */
const KIDS_VAR_TYPES   = ['int', 'float', 'bool', 'String'];
const KIDS_CONST_TYPES = ['int', 'float'];
const KIDS_ARRAY_TYPES = ['int', 'float'];
const KIDS_RETURN_TYPES = ['void', 'int', 'float', 'bool', 'String'];

// ── Utilidades de DOM ─────────────────────────────────────────────────────────

const createEl = (doc, tag) => {
  const ns = doc.documentElement?.namespaceURI;
  return ns ? doc.createElementNS(ns, tag) : doc.createElement(tag);
};

const directChild = (block, tag, name) =>
  Array.from(block.children).find((c) => c.tagName === tag && c.getAttribute('name') === name) || null;

/** Bloque (o sombra) enchufado en un hueco de valor */
const plugged = (block, inputName) => {
  const value = directChild(block, 'value', inputName);
  if (!value) return null;
  return Array.from(value.children).find((c) => c.tagName === 'block' || c.tagName === 'shadow') || null;
};

const fieldText = (block, name) => {
  const field = directChild(block, 'field', name);
  return field ? field.textContent.trim() : null;
};

const setField = (doc, block, name, value) => {
  let field = directChild(block, 'field', name);
  if (!field) {
    field = createEl(doc, 'field');
    field.setAttribute('name', name);
    block.insertBefore(field, block.firstChild);
  }
  field.textContent = String(value);
};

const removeInput = (block, name) => {
  const value = directChild(block, 'value', name);
  if (value) block.removeChild(value);
};

const isNumeric = (v) => /^-?\d+(\.\d+)?$/.test(String(v ?? '').trim());

// ── Conversiones de hueco de valor ↔ campo ────────────────────────────────────

/**
 * Lee lo que hay enchufado en un hueco y devuelve el texto equivalente para un
 * campo del modo Niño, o null si no se puede representar sin perder información.
 */
function readPluggedAsText(block, inputName, { allowName = false, min = null, max = null } = {}) {
  const target = plugged(block, inputName);
  if (!target) return null;

  const tipo = target.getAttribute('type');

  if (tipo === NUM_BLOCK) {
    const n = fieldText(target, 'NUM');
    if (!isNumeric(n)) return null;
    const valor = Number(n);
    if (min !== null && valor < min) return null;
    if (max !== null && valor > max) return null;
    return String(valor);
  }

  if (allowName && VAR_GET_BLOCKS.includes(tipo)) {
    const nombre = fieldText(target, 'NAME');
    return /^[A-Za-z_][A-Za-z0-9_]*$/.test(nombre || '') ? nombre : null;
  }

  return null;
}

/** Pasa un hueco de valor a campo de texto/número */
function valueToField(doc, block, inputName, fieldName, opciones) {
  const texto = readPluggedAsText(block, inputName, opciones);
  if (texto === null) return false;
  removeInput(block, inputName);
  setField(doc, block, fieldName, texto);
  return true;
}

/** Pasa un campo a hueco de valor con el bloque indicado */
function fieldToValue(doc, block, fieldName, inputName, construir) {
  const texto = fieldText(block, fieldName);
  const hijo = construir(doc, texto ?? '');
  if (!hijo) return false;
  const field = directChild(block, 'field', fieldName);
  const value = createEl(doc, 'value');
  value.setAttribute('name', inputName);
  value.appendChild(hijo);
  if (field) block.replaceChild(value, field);
  else block.appendChild(value);
  return true;
}

/** Constructor: número como sombra, identificador como bloque de variable */
const buildPin = (doc, texto) => {
  if (isNumeric(texto)) return buildNumber(doc, texto, 'shadow');
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(texto)) return buildBlock(doc, 'arduino_variable_get', 'NAME', texto);
  return null;
};

const buildNumber = (doc, texto, tag = 'shadow') => {
  if (!isNumeric(texto)) return null;
  return buildBlock(doc, NUM_BLOCK, 'NUM', String(Number(texto)), tag);
};

function buildBlock(doc, type, fieldName, value, tag = 'block') {
  const el = createEl(doc, tag);
  el.setAttribute('type', type);
  const field = createEl(doc, 'field');
  field.setAttribute('name', fieldName);
  field.textContent = value;
  el.appendChild(field);
  return el;
}

/** Comprueba que el valor de un desplegable existe también en el modo Niño */
const dropdownEncaja = (block, fieldName, permitidos) => {
  const valor = fieldText(block, fieldName);
  return valor === null || permitidos.includes(valor);
};

// ── Tabla de equivalencias ────────────────────────────────────────────────────

const pareja = (advanced, kids, extra = {}) => ({ advanced, kids, ...extra });

/**
 * Cada entrada define el par de tipos y, si hace falta, cómo adaptar sus campos.
 * `toKids` / `toAdvanced` devuelven false para rechazar la conversión.
 */
export const MODE_BLOCK_PAIRS = [
  // Estructura
  pareja('arduino_setup_loop', 'kids_setup_loop'),
  pareja('arduino_comment', 'kids_comment'),
  pareja('arduino_define', 'kids_define'),
  pareja('arduino_include', 'kids_include'),

  // Pines
  pareja('arduino_pin_mode', 'kids_pin_mode', {
    toKids: (doc, b) => valueToField(doc, b, 'PIN', 'PIN', { allowName: true, min: 0, max: 53 }),
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', buildPin),
  }),
  pareja('arduino_digital_write', 'kids_digital_write', {
    toKids: (doc, b) => {
      const estado = plugged(b, 'VALUE');
      const nivel = estado && estado.getAttribute('type') === 'arduino_digital_state'
        ? fieldText(estado, 'STATE') : null;
      if (nivel !== 'HIGH' && nivel !== 'LOW') return false;
      if (!valueToField(doc, b, 'PIN', 'PIN', { allowName: true, min: 0, max: 53 })) return false;
      removeInput(b, 'VALUE');
      setField(doc, b, 'VALUE', nivel);
      return true;
    },
    toAdvanced: (doc, b) => {
      // Se comprueba antes de tocar nada para que la conversión sea atómica
      if (!buildPin(doc, fieldText(b, 'PIN') ?? '')) return false;
      const nivel = fieldText(b, 'VALUE') === 'LOW' ? 'LOW' : 'HIGH';
      fieldToValue(doc, b, 'PIN', 'PIN', buildPin);
      const field = directChild(b, 'field', 'VALUE');
      if (field) b.removeChild(field);
      const value = createEl(doc, 'value');
      value.setAttribute('name', 'VALUE');
      value.appendChild(buildBlock(doc, 'arduino_digital_state', 'STATE', nivel, 'shadow'));
      b.appendChild(value);
      return true;
    },
  }),
  pareja('arduino_digital_read', 'kids_digital_read', {
    toKids: (doc, b) => valueToField(doc, b, 'PIN', 'PIN', { min: 0, max: 53 }),
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', (d, t) => buildNumber(d, t)),
  }),
  pareja('arduino_analog_write', 'kids_analog_write', {
    toKids: (doc, b) => valueToField(doc, b, 'PIN', 'PIN', { allowName: true, min: 0, max: 53 }),
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', buildPin),
  }),
  pareja('arduino_analog_read', 'kids_analog_read', {
    toKids: (doc, b) => {
      const pin = plugged(b, 'PIN');
      if (!pin || pin.getAttribute('type') !== 'arduino_analog_pin') return false;
      const nombre = fieldText(pin, 'PIN') || '';
      const n = Number(nombre.replace(/^A/, ''));
      if (!Number.isInteger(n) || n < 0 || n > 5) return false;
      removeInput(b, 'PIN');
      setField(doc, b, 'PIN', n);
      return true;
    },
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', (d, t) =>
      isNumeric(t) ? buildBlock(d, 'arduino_analog_pin', 'PIN', `A${Number(t)}`, 'shadow') : null),
  }),

  // Tiempo
  pareja('arduino_delay', 'kids_delay'),
  pareja('arduino_delay_microseconds', 'kids_delay_micros'),
  pareja('arduino_millis', 'kids_millis'),
  pareja('arduino_micros', 'kids_micros'),

  // Serial
  pareja('arduino_serial_begin', 'kids_serial_begin', {
    // El bloque del modo Niño es siempre 9600: solo se convierte si coincide
    toKids: (doc, b) => {
      if ((fieldText(b, 'BAUD') || '9600') !== '9600') return false;
      const field = directChild(b, 'field', 'BAUD');
      if (field) b.removeChild(field);
      return true;
    },
    toAdvanced: (doc, b) => { setField(doc, b, 'BAUD', '9600'); return true; },
  }),
  pareja('arduino_serial_println', 'kids_serial_println'),
  pareja('arduino_serial_print', 'kids_serial_print'),
  pareja('arduino_serial_available', 'kids_serial_available'),
  pareja('arduino_serial_read', 'kids_serial_read'),

  // Control
  pareja('arduino_if_simple', 'kids_if_simple'),
  pareja('arduino_if', 'kids_if'),
  pareja('arduino_while', 'kids_while'),
  pareja('arduino_do_while', 'kids_do_while'),
  pareja('arduino_switch_case', 'kids_switch'),
  pareja('arduino_break', 'kids_break'),
  pareja('arduino_continue', 'kids_continue'),
  pareja('arduino_for', 'kids_for', {
    // Los tres límites se leen primero: o se convierten todos o no se convierte
    // ninguno, para no dejar el bloque a medias.
    toKids: (doc, b) => {
      const limites = ['FROM', 'TO', 'STEP'].map((n) => readPluggedAsText(b, n, {}));
      if (limites.some((v) => v === null)) return false;
      ['FROM', 'TO', 'STEP'].forEach((n, i) => {
        removeInput(b, n);
        setField(doc, b, n, limites[i]);
      });
      return true;
    },
    toAdvanced: (doc, b) => {
      const defectos = { FROM: '0', TO: '10', STEP: '1' };
      for (const [nombre, defecto] of Object.entries(defectos)) {
        fieldToValue(doc, b, nombre, nombre, (d, t) => buildNumber(d, t || defecto));
      }
      return true;
    },
  }),

  // Variables
  pareja('arduino_variable_declare', 'kids_variable_declare', {
    puedeIrAKids: (b) => dropdownEncaja(b, 'TYPE', KIDS_VAR_TYPES),
  }),
  pareja('arduino_variable_get', 'kids_variable_get'),
  pareja('arduino_variable_set', 'kids_variable_set'),
  pareja('arduino_global_variable_declare', 'kids_global_var', {
    // El modo Niño no tiene modificador static/volatile
    puedeIrAKids: (b) => dropdownEncaja(b, 'TYPE', KIDS_VAR_TYPES) && !fieldText(b, 'STORAGE'),
    toKids: (doc, b) => {
      const field = directChild(b, 'field', 'STORAGE');
      if (field) b.removeChild(field);
      return true;
    },
  }),
  pareja('arduino_const_define', 'kids_const', {
    puedeIrAKids: (b) => dropdownEncaja(b, 'TYPE', KIDS_CONST_TYPES),
  }),
  pareja('arduino_array_declare', 'kids_array_declare', {
    puedeIrAKids: (b) => dropdownEncaja(b, 'TYPE', KIDS_ARRAY_TYPES),
  }),
  pareja('arduino_array_get', 'kids_array_get'),
  pareja('arduino_array_set', 'kids_array_set'),

  // Matemáticas y lógica
  pareja('arduino_map', 'kids_map'),
  pareja('arduino_constrain', 'kids_constrain'),
  pareja('arduino_compare', 'kids_compare'),
  pareja('arduino_logic', 'kids_logic'),
  pareja('arduino_not', 'kids_not'),

  // Audio
  pareja('arduino_tone', 'kids_tone', {
    toKids: (doc, b) => valueToField(doc, b, 'PIN', 'PIN', { min: 0, max: 13 }),
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', (d, t) => buildNumber(d, t || '8')),
  }),
  pareja('arduino_no_tone', 'kids_no_tone', {
    toKids: (doc, b) => valueToField(doc, b, 'PIN', 'PIN', { min: 0, max: 13 }),
    toAdvanced: (doc, b) => fieldToValue(doc, b, 'PIN', 'PIN', (d, t) => buildNumber(d, t || '8')),
  }),

  // Funciones propias
  pareja('arduino_function_define', 'kids_function_define', {
    puedeIrAKids: (b) => dropdownEncaja(b, 'RETURN_TYPE', KIDS_RETURN_TYPES),
  }),
  pareja('arduino_function_call', 'kids_function_call'),
  pareja('arduino_function_call_expr', 'kids_function_call_expr'),
  pareja('arduino_return', 'kids_return'),
  pareja('arduino_return_void', 'kids_return_void'),
];

const PARES_POR_TIPO = new Map();
for (const p of MODE_BLOCK_PAIRS) {
  PARES_POR_TIPO.set(p.advanced, p);
  PARES_POR_TIPO.set(p.kids, p);
}

/** Tipo equivalente en el otro modo, o null si el bloque no tiene pareja */
export function counterpartType(type, mode) {
  const par = PARES_POR_TIPO.get(type);
  if (!par) return null;
  return mode === 'kids' ? par.kids : par.advanced;
}

// ── Conversión completa del workspace ─────────────────────────────────────────

/**
 * Traduce los bloques de un workspace XML al modo indicado.
 * Los bloques sin equivalente (o cuya conversión perdería información) se dejan
 * intactos, de modo que el programa —y el código generado— no cambian nunca.
 *
 * @param {string} xmlString XML del workspace de Blockly
 * @param {'kids'|'advanced'} mode modo de destino
 * @returns {string} XML convertido (o el original si no se puede parsear)
 */
export function convertWorkspaceXmlToMode(xmlString, mode) {
  if (typeof xmlString !== 'string' || !xmlString.trim()) return xmlString;
  if (typeof DOMParser === 'undefined') return xmlString;

  const aKids = mode === 'kids';

  let doc;
  try {
    doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  } catch {
    return xmlString;
  }
  if (!doc || doc.getElementsByTagName('parsererror').length > 0) return xmlString;

  let cambiado = false;

  // Orden del documento: los padres se procesan antes que sus hijos, para que
  // un pin que pasa a campo se lea antes de convertir el bloque que contiene.
  const bloques = [
    ...Array.from(doc.getElementsByTagName('block')),
    ...Array.from(doc.getElementsByTagName('shadow')),
  ];

  for (const bloque of bloques) {
    const tipo = bloque.getAttribute('type');
    const par = PARES_POR_TIPO.get(tipo);
    if (!par) continue;

    const destino = aKids ? par.kids : par.advanced;
    if (tipo === destino) continue; // ya está en el modo pedido

    if (aKids && par.puedeIrAKids && !par.puedeIrAKids(bloque)) continue;

    const adaptar = aKids ? par.toKids : par.toAdvanced;
    if (adaptar && !adaptar(doc, bloque)) continue; // conversión con pérdida: se deja igual

    bloque.setAttribute('type', destino);
    cambiado = true;
  }

  if (!cambiado) return xmlString;
  return new XMLSerializer().serializeToString(doc);
}
