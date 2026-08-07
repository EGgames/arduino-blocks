/**
 * Migración de workspaces XML guardados con versiones anteriores.
 *
 * En la v1.3 varios campos (`<field name="PIN">`) pasaron a ser huecos de valor
 * (`<value name="PIN">`) para poder enchufar bloques de variable en ellos.
 * Los workspaces guardados en localStorage o en archivos antiguos siguen teniendo
 * el formato viejo, así que se convierten al vuelo al cargarlos.
 */

/**
 * Bloques afectados: tipo → { campo: tipo de bloque destino }
 * @type {Record<string, Record<string, 'math_number'|'arduino_digital_state'|'arduino_analog_pin'>>}
 */
export const LEGACY_FIELD_TO_VALUE = {
  arduino_pin_mode:      { PIN: 'math_number' },
  arduino_digital_write: { PIN: 'math_number', VALUE: 'arduino_digital_state' },
  arduino_digital_read:  { PIN: 'math_number' },
  arduino_analog_write:  { PIN: 'math_number' },
  arduino_analog_read:   { PIN: 'arduino_analog_pin' },
  arduino_tone:          { PIN: 'math_number' },
  arduino_no_tone:       { PIN: 'math_number' },
  arduino_for:           { FROM: 'math_number', TO: 'math_number', STEP: 'math_number' },
};

const isNumeric = (v) => /^-?\d+(\.\d+)?$/.test(String(v).trim());

/**
 * Construye el bloque de reemplazo para un campo migrado.
 * @param {Document} doc
 * @param {string} targetType
 * @param {string} rawValue
 * @returns {Element}
 */
function buildValueBlock(doc, targetType, rawValue) {
  const value = String(rawValue ?? '').trim();

  // Valores no numéricos (nombres de constante o variable) → bloque de variable,
  // salvo HIGH/LOW que tienen su propio bloque de estado digital.
  if (targetType === 'arduino_digital_state') {
    const state = value === 'LOW' || value === '0' ? 'LOW' : 'HIGH';
    return makeBlock(doc, 'arduino_digital_state', 'STATE', state);
  }

  if (targetType === 'arduino_analog_pin') {
    const pin = isNumeric(value) ? `A${Number(value)}` : (/^A\d+$/.test(value) ? value : 'A0');
    return makeBlock(doc, 'arduino_analog_pin', 'PIN', pin);
  }

  if (isNumeric(value)) return makeBlock(doc, 'math_number', 'NUM', value);
  return makeBlock(doc, 'arduino_variable_get', 'NAME', value || 'miVariable');
}

/** Crea un elemento en el mismo espacio de nombres que la raíz del documento */
function createEl(doc, tag) {
  const ns = doc.documentElement?.namespaceURI;
  return ns ? doc.createElementNS(ns, tag) : doc.createElement(tag);
}

function makeBlock(doc, type, fieldName, fieldValue) {
  const block = createEl(doc, 'block');
  block.setAttribute('type', type);
  const field = createEl(doc, 'field');
  field.setAttribute('name', fieldName);
  field.textContent = String(fieldValue);
  block.appendChild(field);
  return block;
}

/**
 * Convierte los campos heredados en huecos de valor.
 * Es idempotente: un XML ya migrado se devuelve intacto.
 * @param {string} xmlString
 * @returns {string} XML migrado (o el original si no se puede parsear)
 */
export function migrateWorkspaceXml(xmlString) {
  if (typeof xmlString !== 'string' || !xmlString.trim()) return xmlString;
  if (typeof DOMParser === 'undefined') return xmlString;

  let doc;
  try {
    doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  } catch {
    return xmlString;
  }
  if (!doc || doc.getElementsByTagName('parsererror').length > 0) return xmlString;

  let changed = false;

  for (const block of Array.from(doc.getElementsByTagName('block'))) {
    const map = LEGACY_FIELD_TO_VALUE[block.getAttribute('type')];
    if (!map) continue;

    for (const [fieldName, targetType] of Object.entries(map)) {
      // Solo hijos directos: un <field> dentro de un bloque anidado no es nuestro
      const field = Array.from(block.children).find(
        (c) => c.tagName === 'field' && c.getAttribute('name') === fieldName,
      );
      if (!field) continue;

      const alreadyMigrated = Array.from(block.children).some(
        (c) => c.tagName === 'value' && c.getAttribute('name') === fieldName,
      );
      if (alreadyMigrated) {
        block.removeChild(field);
        changed = true;
        continue;
      }

      const value = createEl(doc, 'value');
      value.setAttribute('name', fieldName);
      value.appendChild(buildValueBlock(doc, targetType, field.textContent));
      block.replaceChild(value, field);
      changed = true;
    }
  }

  if (!changed) return xmlString;
  return new XMLSerializer().serializeToString(doc);
}
