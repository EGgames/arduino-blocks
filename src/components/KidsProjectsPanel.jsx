// ── Panel de Proyectos para Modo Niño ──────────────────────────────────────
// Muestra tarjetas de proyectos de ejemplo que el niño puede cargar con un clic.
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';

// ── XMLs de proyectos (Blockly workspace XML) ─────────────────────────────────
const PROJECTS = [
  {
    id: 'semaforo',
    emoji: '🚦',
    title: 'Semáforo',
    description: 'Enciende LEDs rojo, amarillo y verde como un semáforo de verdad.',
    difficulty: '⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">13</field>
        <field name="MODE">OUTPUT</field>
        <next>
          <block type="kids_pin_mode">
            <field name="PIN">12</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="kids_pin_mode">
                <field name="PIN">11</field>
                <field name="MODE">OUTPUT</field>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_digital_write">
        <field name="PIN">13</field>
        <field name="VALUE">HIGH</field>
        <next>
          <block type="kids_digital_write">
            <field name="PIN">12</field>
            <field name="VALUE">LOW</field>
            <next>
              <block type="kids_digital_write">
                <field name="PIN">11</field>
                <field name="VALUE">LOW</field>
                <next>
                  <block type="kids_delay">
                    <value name="MS">
                      <block type="math_number"><field name="NUM">3000</field></block>
                    </value>
                    <next>
                      <block type="kids_digital_write">
                        <field name="PIN">13</field>
                        <field name="VALUE">LOW</field>
                        <next>
                          <block type="kids_digital_write">
                            <field name="PIN">12</field>
                            <field name="VALUE">HIGH</field>
                            <next>
                              <block type="kids_delay">
                                <value name="MS">
                                  <block type="math_number"><field name="NUM">1000</field></block>
                                </value>
                                <next>
                                  <block type="kids_digital_write">
                                    <field name="PIN">12</field>
                                    <field name="VALUE">LOW</field>
                                    <next>
                                      <block type="kids_digital_write">
                                        <field name="PIN">11</field>
                                        <field name="VALUE">HIGH</field>
                                        <next>
                                          <block type="kids_delay">
                                            <value name="MS">
                                              <block type="math_number"><field name="NUM">2000</field></block>
                                            </value>
                                            <next>
                                              <block type="kids_digital_write">
                                                <field name="PIN">11</field>
                                                <field name="VALUE">LOW</field>
                                              </block>
                                            </next>
                                          </block>
                                        </next>
                                      </block>
                                    </next>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'parpadeo',
    emoji: '💡',
    title: 'LED Parpadeante',
    description: 'Hace que el LED del pin 13 parpadee una y otra vez.',
    difficulty: '⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">13</field>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_digital_write">
        <field name="PIN">13</field>
        <field name="VALUE">HIGH</field>
        <next>
          <block type="kids_delay">
            <value name="MS">
              <block type="math_number"><field name="NUM">500</field></block>
            </value>
            <next>
              <block type="kids_digital_write">
                <field name="PIN">13</field>
                <field name="VALUE">LOW</field>
                <next>
                  <block type="kids_delay">
                    <value name="MS">
                      <block type="math_number"><field name="NUM">500</field></block>
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
</xml>`,
  },
  {
    id: 'musica',
    emoji: '🎵',
    title: 'Melodía',
    description: 'Toca Do-Re-Mi con un zumbador piezoeléctrico en el pin 8.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
    </statement>
    <statement name="LOOP">
      <block type="kids_tone">
        <field name="PIN">8</field>
        <value name="FREQ">
          <block type="math_number"><field name="NUM">262</field></block>
        </value>
        <next>
          <block type="kids_delay">
            <value name="MS"><block type="math_number"><field name="NUM">400</field></block></value>
            <next>
              <block type="kids_tone">
                <field name="PIN">8</field>
                <value name="FREQ"><block type="math_number"><field name="NUM">294</field></block></value>
                <next>
                  <block type="kids_delay">
                    <value name="MS"><block type="math_number"><field name="NUM">400</field></block></value>
                    <next>
                      <block type="kids_tone">
                        <field name="PIN">8</field>
                        <value name="FREQ"><block type="math_number"><field name="NUM">330</field></block></value>
                        <next>
                          <block type="kids_delay">
                            <value name="MS"><block type="math_number"><field name="NUM">400</field></block></value>
                            <next>
                              <block type="kids_no_tone">
                                <field name="PIN">8</field>
                                <next>
                                  <block type="kids_delay">
                                    <value name="MS"><block type="math_number"><field name="NUM">800</field></block></value>
                                  </block>
                                </next>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'sensor_luz',
    emoji: '☀️',
    title: 'Sensor de Luz',
    description: 'Enciende el LED cuando hay poca luz (usa fotoresistencia en A0).',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">13</field>
        <field name="MODE">OUTPUT</field>
        <next>
          <block type="kids_serial_begin"></block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_variable_declare">
        <field name="TYPE">int</field>
        <field name="NAME">luz</field>
        <value name="VALUE">
          <block type="kids_analog_read"><field name="PIN">0</field></block>
        </value>
        <next>
          <block type="kids_serial_println">
            <value name="TEXT">
              <block type="kids_variable_get"><field name="NAME">luz</field></block>
            </value>
            <next>
              <block type="kids_if">
                <value name="COND">
                  <block type="kids_compare">
                    <field name="OP">LT</field>
                    <value name="A"><block type="kids_variable_get"><field name="NAME">luz</field></block></value>
                    <value name="B"><block type="math_number"><field name="NUM">300</field></block></value>
                  </block>
                </value>
                <statement name="IF_BODY">
                  <block type="kids_digital_write">
                    <field name="PIN">13</field>
                    <field name="VALUE">HIGH</field>
                  </block>
                </statement>
                <statement name="ELSE_BODY">
                  <block type="kids_digital_write">
                    <field name="PIN">13</field>
                    <field name="VALUE">LOW</field>
                  </block>
                </statement>
                <next>
                  <block type="kids_delay">
                    <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'contador',
    emoji: '🔢',
    title: 'Contador',
    description: 'Cuenta del 1 al 10 y lo muestra en el Monitor Serial.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_serial_begin"></block>
    </statement>
    <statement name="LOOP">
      <block type="kids_for">
        <field name="VAR">i</field>
        <value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value>
        <value name="TO"><block type="math_number"><field name="NUM">10</field></block></value>
        <value name="STEP"><block type="math_number"><field name="NUM">1</field></block></value>
        <statement name="DO">
          <block type="kids_serial_println">
            <value name="TEXT">
              <block type="kids_variable_get"><field name="NAME">i</field></block>
            </value>
          </block>
        </statement>
        <next>
          <block type="kids_delay">
            <value name="MS"><block type="math_number"><field name="NUM">2000</field></block></value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'dado',
    emoji: '🎲',
    title: 'Dado Electrónico',
    description: 'Muestra un número del 1 al 6 por el monitor serial al presionar un botón.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_serial_begin">
        <field name="BAUD">9600</field>
        <next>
          <block type="kids_pin_mode">
            <field name="PIN">2</field>
            <field name="MODE">INPUT</field>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_if">
        <value name="COND">
          <block type="kids_digital_read">
            <field name="PIN">2</field>
          </block>
        </value>
        <statement name="DO">
          <block type="kids_serial_print">
            <value name="VALUE">
              <block type="math_random_int">
                <value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value>
                <value name="TO"><block type="math_number"><field name="NUM">6</field></block></value>
              </block>
            </value>
            <next>
              <block type="kids_delay">
                <value name="MS"><block type="math_number"><field name="NUM">500</field></block></value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'brillo',
    emoji: '🔆',
    title: 'Control de Brillo',
    description: 'Controla el brillo de un LED con un potenciómetro en el pin A0.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">9</field>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_analog_write">
        <field name="PIN">9</field>
        <value name="VALUE">
          <block type="kids_map">
            <value name="VALUE">
              <block type="kids_analog_read">
                <field name="PIN">A0</field>
              </block>
            </value>
            <value name="FROM_LOW"><block type="math_number"><field name="NUM">0</field></block></value>
            <value name="FROM_HIGH"><block type="math_number"><field name="NUM">1023</field></block></value>
            <value name="TO_LOW"><block type="math_number"><field name="NUM">0</field></block></value>
            <value name="TO_HIGH"><block type="math_number"><field name="NUM">255</field></block></value>
          </block>
        </value>
        <next>
          <block type="kids_delay">
            <value name="MS"><block type="math_number"><field name="NUM">10</field></block></value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'alarma',
    emoji: '🚨',
    title: 'Alarma con Sensor',
    description: 'Suena una alarma cuando detecta luz con un fotoresistor en A0.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_serial_begin">
        <field name="BAUD">9600</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_if">
        <value name="COND">
          <block type="kids_compare">
            <field name="OP">GT</field>
            <value name="A">
              <block type="kids_analog_read">
                <field name="PIN">A0</field>
              </block>
            </value>
            <value name="B">
              <block type="math_number"><field name="NUM">800</field></block>
            </value>
          </block>
        </value>
        <statement name="DO">
          <block type="kids_tone">
            <field name="PIN">8</field>
            <value name="FREQ"><block type="math_number"><field name="NUM">1000</field></block></value>
            <next>
              <block type="kids_delay">
                <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
                <next>
                  <block type="kids_no_tone">
                    <field name="PIN">8</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
      <next>
        <block type="kids_delay">
          <value name="MS"><block type="math_number"><field name="NUM">100</field></block></value>
        </block>
      </next>
    </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'contador',
    emoji: '🔢',
    title: 'Contador',
    description: 'Cuenta cuántas veces presionas el botón y lo muestra por serial.',
    difficulty: '⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_serial_begin">
        <field name="BAUD">9600</field>
        <next>
          <block type="kids_pin_mode">
            <field name="PIN">2</field>
            <field name="MODE">INPUT</field>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_if">
        <value name="COND">
          <block type="kids_digital_read">
            <field name="PIN">2</field>
          </block>
        </value>
        <statement name="DO">
          <block type="kids_serial_print">
            <value name="VALUE">
              <block type="text"><field name="TEXT">¡Presionado!</field></block>
            </value>
            <next>
              <block type="kids_delay">
                <value name="MS"><block type="math_number"><field name="NUM">300</field></block></value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'temperaturaLED',
    emoji: '🌡️',
    title: 'LED Termómetro',
    description: 'Enciende LED verde, amarillo o rojo según la temperatura del sensor.',
    difficulty: '⭐⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">11</field>
        <field name="MODE">OUTPUT</field>
        <next>
          <block type="kids_pin_mode">
            <field name="PIN">12</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="kids_pin_mode">
                <field name="PIN">13</field>
                <field name="MODE">OUTPUT</field>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_if">
        <value name="COND">
          <block type="kids_compare">
            <field name="OP">GT</field>
            <value name="A">
              <block type="kids_analog_read"><field name="PIN">A0</field></block>
            </value>
            <value name="B"><block type="math_number"><field name="NUM">600</field></block></value>
          </block>
        </value>
        <statement name="DO">
          <block type="kids_digital_write">
            <field name="PIN">13</field><field name="VALUE">HIGH</field>
            <next><block type="kids_digital_write">
              <field name="PIN">12</field><field name="VALUE">LOW</field>
              <next><block type="kids_digital_write">
                <field name="PIN">11</field><field name="VALUE">LOW</field>
              </block></next>
            </block></next>
          </block>
        </statement>
        <else>
          <block type="kids_digital_write">
            <field name="PIN">13</field><field name="VALUE">LOW</field>
            <next><block type="kids_digital_write">
              <field name="PIN">12</field><field name="VALUE">LOW</field>
              <next><block type="kids_digital_write">
                <field name="PIN">11</field><field name="VALUE">HIGH</field>
              </block></next>
            </block></next>
          </block>
        </else>
      </block>
      <next>
        <block type="kids_delay">
          <value name="MS"><block type="math_number"><field name="NUM">500</field></block></value>
        </block>
      </next>
    </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'morse',
    emoji: '📡',
    title: 'Código Morse',
    description: 'Envía "SOS" en código Morse con el LED del pin 13.',
    difficulty: '⭐⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">13</field>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_digital_write">
        <field name="PIN">13</field><field name="VALUE">HIGH</field>
        <next><block type="kids_delay">
          <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
          <next><block type="kids_digital_write">
            <field name="PIN">13</field><field name="VALUE">LOW</field>
            <next><block type="kids_delay">
              <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
              <next><block type="kids_digital_write">
                <field name="PIN">13</field><field name="VALUE">HIGH</field>
                <next><block type="kids_delay">
                  <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
                  <next><block type="kids_digital_write">
                    <field name="PIN">13</field><field name="VALUE">LOW</field>
                    <next><block type="kids_delay">
                      <value name="MS"><block type="math_number"><field name="NUM">200</field></block></value>
                      <next><block type="kids_digital_write">
                        <field name="PIN">13</field><field name="VALUE">HIGH</field>
                        <next><block type="kids_delay">
                          <value name="MS"><block type="math_number"><field name="NUM">600</field></block></value>
                          <next><block type="kids_digital_write">
                            <field name="PIN">13</field><field name="VALUE">LOW</field>
                            <next><block type="kids_delay">
                              <value name="MS"><block type="math_number"><field name="NUM">1000</field></block></value>
                            </block></next>
                          </block></next>
                        </block></next>
                      </block></next>
                    </block></next>
                  </block></next>
                </block></next>
              </block></next>
            </block></next>
          </block></next>
        </block></next>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'piano',
    emoji: '🎹',
    title: 'Piano de Botones',
    description: 'Conecta 4 botones y toca 4 notas distintas como un piano.',
    difficulty: '⭐⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_pin_mode">
        <field name="PIN">2</field><field name="MODE">INPUT</field>
        <next><block type="kids_pin_mode">
          <field name="PIN">3</field><field name="MODE">INPUT</field>
          <next><block type="kids_pin_mode">
            <field name="PIN">4</field><field name="MODE">INPUT</field>
            <next><block type="kids_pin_mode">
              <field name="PIN">5</field><field name="MODE">INPUT</field>
            </block></next>
          </block></next>
        </block></next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_if">
        <value name="COND"><block type="kids_digital_read"><field name="PIN">2</field></block></value>
        <statement name="DO">
          <block type="kids_tone">
            <field name="PIN">8</field>
            <value name="FREQ"><block type="math_number"><field name="NUM">262</field></block></value>
          </block>
        </statement>
        <else>
          <block type="kids_if">
            <value name="COND"><block type="kids_digital_read"><field name="PIN">3</field></block></value>
            <statement name="DO">
              <block type="kids_tone">
                <field name="PIN">8</field>
                <value name="FREQ"><block type="math_number"><field name="NUM">330</field></block></value>
              </block>
            </statement>
            <else>
              <block type="kids_if">
                <value name="COND"><block type="kids_digital_read"><field name="PIN">4</field></block></value>
                <statement name="DO">
                  <block type="kids_tone">
                    <field name="PIN">8</field>
                    <value name="FREQ"><block type="math_number"><field name="NUM">392</field></block></value>
                  </block>
                </statement>
                <else>
                  <block type="kids_if">
                    <value name="COND"><block type="kids_digital_read"><field name="PIN">5</field></block></value>
                    <statement name="DO">
                      <block type="kids_tone">
                        <field name="PIN">8</field>
                        <value name="FREQ"><block type="math_number"><field name="NUM">523</field></block></value>
                      </block>
                    </statement>
                    <else>
                      <block type="kids_no_tone"><field name="PIN">8</field></block>
                    </else>
                  </block>
                </else>
              </block>
            </else>
          </block>
        </else>
      </block>
    </statement>
  </block>
</xml>`,
  },
  {
    id: 'luces_arcoiris',
    emoji: '🌈',
    title: 'Arcoíris de Luces',
    description: 'Enciende LEDs NeoPixel en rojo, verde y azul uno a uno. Necesitas la librería Adafruit NeoPixel.',
    difficulty: '⭐⭐⭐',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="kids_setup_loop" x="20" y="20">
    <statement name="SETUP">
      <block type="kids_neopixel_setup">
        <field name="PIN">6</field>
        <field name="NUM">3</field>
        <next>
          <block type="kids_neopixel_brightness">
            <field name="BRIGHTNESS">50</field>
          </block>
        </next>
      </block>
    </statement>
    <statement name="LOOP">
      <block type="kids_neopixel_color">
        <field name="PIXEL">0</field><field name="R">255</field><field name="G">0</field><field name="B">0</field>
        <next>
          <block type="kids_neopixel_color">
            <field name="PIXEL">1</field><field name="R">0</field><field name="G">255</field><field name="B">0</field>
            <next>
              <block type="kids_neopixel_color">
                <field name="PIXEL">2</field><field name="R">0</field><field name="G">0</field><field name="B">255</field>
                <next>
                  <block type="kids_neopixel_show"></block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`,
  },
];

// ── Colores por dificultad ────────────────────────────────────────────────────
const DIFF_COLOR = { '⭐': '#43a047', '⭐⭐': '#fb8c00', '⭐⭐⭐': '#e53935' };

// ── Componente ────────────────────────────────────────────────────────────────
export default function KidsProjectsPanel({ onLoadProject }) {
  const [snack, setSnack] = useState(false);

  const handleLoad = (project) => {
    if (typeof onLoadProject === 'function') {
      onLoadProject(project.xml, project.title);
      setSnack(true);
    }
  };

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: '#1b5e20', mb: 1.5, fontSize: '0.95rem' }}
      >
        🚀 Proyectos de ejemplo
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
        }}
      >
        {PROJECTS.map((proj) => (
          <Tooltip key={proj.id} title={`Cargar: ${proj.title}`} placement="top" arrow>
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                border: '2px solid #c8e6c9',
                '&:hover': { borderColor: '#43a047', boxShadow: '0 4px 12px rgba(67,160,71,0.3)' },
                transition: 'all 0.2s ease',
              }}
            >
              <CardActionArea onClick={() => handleLoad(proj)} sx={{ p: 0.5 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography sx={{ fontSize: '1.6rem', lineHeight: 1, mb: 0.5, textAlign: 'center' }}>
                    {proj.emoji}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#1b5e20',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      mb: 0.5,
                    }}
                  >
                    {proj.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.65rem',
                      color: '#555',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      mb: 0.5,
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    {proj.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      label={proj.difficulty}
                      size="small"
                      sx={{
                        fontSize: '0.6rem',
                        height: 18,
                        bgcolor: DIFF_COLOR[proj.difficulty] + '22',
                        color: DIFF_COLOR[proj.difficulty],
                        fontWeight: 700,
                        border: `1px solid ${DIFF_COLOR[proj.difficulty]}55`,
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Tooltip>
        ))}
      </Box>

      <Snackbar
        open={snack}
        autoHideDuration={2500}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnack(false)} sx={{ fontWeight: 700 }}>
          ¡Proyecto cargado! 🎉
        </Alert>
      </Snackbar>
    </Box>
  );
}
