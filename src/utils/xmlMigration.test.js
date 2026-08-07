import { migrateWorkspaceXml, LEGACY_FIELD_TO_VALUE } from './xmlMigration';

const wrap = (inner) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;

describe('migrateWorkspaceXml — campos heredados → huecos de valor', () => {
  test('convierte el PIN numérico de digitalWrite en un math_number', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_digital_write"><field name="PIN">13</field><field name="VALUE">HIGH</field></block>',
    ));
    expect(out).toContain('<value name="PIN">');
    expect(out).toContain('<block type="math_number"><field name="NUM">13</field></block>');
    expect(out).toContain('<block type="arduino_digital_state"><field name="STATE">HIGH</field></block>');
    expect(out).not.toContain('<field name="PIN">13</field>');
  });

  test('LOW se convierte en el bloque de estado digital LOW', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_digital_write"><field name="VALUE">LOW</field></block>',
    ));
    expect(out).toContain('<field name="STATE">LOW</field>');
  });

  test('el valor 0 se interpreta como LOW', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_digital_write"><field name="VALUE">0</field></block>',
    ));
    expect(out).toContain('<field name="STATE">LOW</field>');
  });

  test('un pin con nombre de variable se convierte en arduino_variable_get', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_pin_mode"><field name="PIN">LED_PIN</field><field name="MODE">OUTPUT</field></block>',
    ));
    expect(out).toContain('<block type="arduino_variable_get"><field name="NAME">LED_PIN</field></block>');
    expect(out).toContain('<field name="MODE">OUTPUT</field>');
  });

  test('analogRead usa el bloque de pin analógico con prefijo A', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_analog_read"><field name="PIN">3</field></block>',
    ));
    expect(out).toContain('<block type="arduino_analog_pin"><field name="PIN">A3</field></block>');
  });

  test('analogRead con el pin ya en formato A0 lo conserva', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_analog_read"><field name="PIN">A5</field></block>',
    ));
    expect(out).toContain('<field name="PIN">A5</field>');
  });

  test('analogRead con un valor irreconocible cae en A0', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_analog_read"><field name="PIN">???</field></block>',
    ));
    expect(out).toContain('<field name="PIN">A0</field>');
  });

  test('el bucle for migra FROM, TO y STEP', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_for"><field name="VAR">i</field><field name="FROM">0</field>' +
      '<field name="TO">10</field><field name="STEP">-1</field></block>',
    ));
    expect(out).toContain('<value name="FROM">');
    expect(out).toContain('<value name="TO">');
    expect(out).toContain('<value name="STEP">');
    expect(out).toContain('<field name="NUM">-1</field>');
    expect(out).toContain('<field name="VAR">i</field>');
  });

  test('tone y noTone migran su pin', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_tone"><field name="PIN">8</field></block>' +
      '<block type="arduino_no_tone"><field name="PIN">8</field></block>',
    ));
    expect(out.match(/<value name="PIN">/g)).toHaveLength(2);
  });

  test('es idempotente: un XML ya migrado no cambia', () => {
    const migrated = migrateWorkspaceXml(wrap(
      '<block type="arduino_digital_read"><field name="PIN">2</field></block>',
    ));
    expect(migrateWorkspaceXml(migrated)).toBe(migrated);
  });

  test('si ya existe el hueco de valor, se descarta el campo duplicado', () => {
    const out = migrateWorkspaceXml(wrap(
      '<block type="arduino_digital_read"><field name="PIN">2</field>' +
      '<value name="PIN"><block type="math_number"><field name="NUM">7</field></block></value></block>',
    ));
    expect(out).toContain('<field name="NUM">7</field>');
    expect(out).not.toContain('<field name="PIN">2</field>');
  });

  test('no toca bloques que no están en la tabla de migración', () => {
    const xml = wrap('<block type="arduino_delay"><value name="MS"><block type="math_number"><field name="NUM">500</field></block></value></block>');
    expect(migrateWorkspaceXml(xml)).toBe(xml);
  });

  test('ignora campos anidados de otros bloques', () => {
    const xml = wrap(
      '<block type="arduino_delay"><value name="MS">' +
      '<block type="arduino_digital_read"><field name="PIN">4</field></block></value></block>',
    );
    const out = migrateWorkspaceXml(xml);
    expect(out).toContain('<value name="PIN">');
    expect(out).toContain('<field name="NUM">4</field>');
  });

  test('devuelve la entrada tal cual si no es un XML válido o está vacía', () => {
    expect(migrateWorkspaceXml('')).toBe('');
    expect(migrateWorkspaceXml(null)).toBeNull();
    expect(migrateWorkspaceXml(undefined)).toBeUndefined();
    expect(migrateWorkspaceXml(42)).toBe(42);
    const roto = '<xml><block type="arduino_tone"><field name="PIN">8</field>';
    expect(migrateWorkspaceXml(roto)).toBe(roto);
  });

  test('la tabla de migración cubre los bloques con pin', () => {
    expect(Object.keys(LEGACY_FIELD_TO_VALUE)).toEqual(
      expect.arrayContaining([
        'arduino_pin_mode', 'arduino_digital_write', 'arduino_digital_read',
        'arduino_analog_write', 'arduino_analog_read', 'arduino_tone',
        'arduino_no_tone', 'arduino_for',
      ]),
    );
  });
});
