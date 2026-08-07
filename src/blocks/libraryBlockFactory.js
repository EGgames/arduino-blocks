import * as Blockly from 'blockly';

// ──────────────────────────────────────────────────────────────────────────────
// Fábrica declarativa de bloques de librería
//
// Permite describir un bloque con datos en lugar de código:
//
//   {
//     type: 'lib_spi_transfer',
//     kind: 'value',                       // 'global' | 'statement' | 'value'
//     label: 'SPI.transfer',
//     code: 'SPI.transfer({DATA})',        // {NOMBRE} se sustituye por campo/hueco
//     inputs: [{ name: 'DATA', label: 'byte', default: '0' }],
//     fields: [{ name: 'MODE', kind: 'dropdown', options: [['A','a']] }],
//     tooltip: '…',
//   }
//
// `kind`:
//   global    → bloque flotante que produce una declaración antes de setup()
//   statement → sentencia encadenable (se le añade «;» y salto de línea)
//   value     → expresión enchufable en cualquier hueco de valor
// ──────────────────────────────────────────────────────────────────────────────

/** Sustituye los marcadores {NOMBRE} de una plantilla */
export function fillTemplate(template, values) {
  return String(template).replace(/\{([A-Z0-9_]+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : match,
  );
}

/** Crea el campo Blockly correspondiente a una descripción de campo */
export function makeField(field) {
  switch (field.kind) {
    case 'num':
      return new Blockly.FieldNumber(
        field.default ?? 0,
        field.min ?? -Infinity,
        field.max ?? Infinity,
      );
    case 'dropdown':
      return new Blockly.FieldDropdown(field.options);
    case 'text':
    default:
      return new Blockly.FieldTextInput(String(field.default ?? ''));
  }
}

/**
 * Convierte una especificación declarativa en una entrada de LIBRARY_BLOCKS
 * (misma forma que los bloques escritos a mano).
 * @param {object} spec
 * @param {number} colour tono Blockly de la categoría
 * @returns {{type: string, isGlobal: boolean, toolbox: object, definition: Function, generator: Function}}
 */
export function makeLibraryBlock(spec, colour) {
  const fields = spec.fields || [];
  const inputs = spec.inputs || [];
  const kind   = spec.kind || 'statement';

  const toolbox = {};
  if (fields.length) {
    toolbox.fields = Object.fromEntries(fields.map((f) => [f.name, f.default ?? '']));
  }
  if (inputs.some((i) => i.default !== undefined)) {
    toolbox.inputs = Object.fromEntries(
      inputs
        .filter((i) => i.default !== undefined)
        .map((i) => [
          i.name,
          i.shadowText
            ? { shadow: { type: 'text', fields: { TEXT: String(i.default).replace(/^"|"$/g, '') } } }
            : { shadow: { type: 'math_number', fields: { NUM: Number(i.default) || 0 } } },
        ]),
    );
  }

  return {
    type: spec.type,
    isGlobal: kind === 'global',
    toolbox,

    definition(block) {
      const dummy = block.appendDummyInput();
      dummy.appendField(spec.label);
      for (const f of fields) {
        if (f.label) dummy.appendField(f.label);
        dummy.appendField(makeField(f), f.name);
      }
      for (const i of inputs) {
        const input = block.appendValueInput(i.name).setCheck(i.check ?? null);
        if (i.label) input.appendField(i.label);
      }
      if (inputs.length) block.setInputsInline(inputs.length <= 3);

      if (kind === 'value') {
        block.setOutput(true, spec.output ?? null);
      } else if (kind === 'statement') {
        block.setPreviousStatement(true, null);
        block.setNextStatement(true, null);
      }
      block.setColour(colour);
      block.setTooltip(spec.tooltip || spec.label);
    },

    generator(block, gen) {
      const values = {};
      for (const f of fields) values[f.name] = block.getFieldValue(f.name);
      for (const i of inputs) {
        values[i.name] =
          gen.valueToCode(block, i.name, gen.ORDER_NONE) || (i.default ?? '0');
      }
      const code = fillTemplate(spec.code, values);

      if (kind === 'value') return [code, 0];
      if (kind === 'global') return code.endsWith(';') ? code : code + ';';
      return (code.endsWith(';') || code.endsWith('}') ? code : code + ';') + '\n';
    },
  };
}

/**
 * Convierte un catálogo de especificaciones en entradas de LIBRARY_BLOCKS.
 * @param {Record<string, {colour: number, emoji: string, blocks: object[]}>} specs
 * @returns {Record<string, {colour: number, emoji: string, blocks: object[]}>}
 */
export function buildLibraryBlocksFromSpecs(specs) {
  const out = {};
  for (const [libName, def] of Object.entries(specs)) {
    out[libName] = {
      colour: def.colour,
      emoji: def.emoji,
      blocks: def.blocks.map((spec) => makeLibraryBlock(spec, def.colour)),
    };
  }
  return out;
}
