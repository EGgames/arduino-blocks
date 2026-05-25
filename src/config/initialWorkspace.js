// ──────────────────────────────────────────────
// XML inicial del workspace (ejemplo Blink)
// ──────────────────────────────────────────────

export const INITIAL_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="arduino_setup_loop" x="50" y="50">
    <statement name="SETUP">
      <block type="arduino_serial_begin">
        <field name="BAUD">9600</field>
        <next>
          <block type="arduino_pin_mode">
            <field name="PIN">13</field>
            <field name="MODE">OUTPUT</field>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="arduino_digital_write">
        <field name="PIN">13</field>
        <field name="VALUE">HIGH</field>
        <next>
          <block type="arduino_delay">
            <value name="MS">
              <block type="math_number"><field name="NUM">1000</field></block>
            </value>
            <next>
              <block type="arduino_digital_write">
                <field name="PIN">13</field>
                <field name="VALUE">LOW</field>
                <next>
                  <block type="arduino_delay">
                    <value name="MS">
                      <block type="math_number"><field name="NUM">1000</field></block>
                    </value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;
