// ── Panel de Ayuda para Modo Niño ─────────────────────────────────────────────
// Muestra cómo usar el programa y para qué sirve cada bloque, organizado por categoría.
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// ── Definición de categorías y bloques ───────────────────────────────────────
const HELP_SECTIONS = [
  {
    id: 'uso',
    emoji: '🖥️',
    title: 'Cómo usar el programa',
    color: '#1565c0',
    bg: '#e3f2fd',
    items: [
      {
        icon: '🟦',
        name: 'Tablero de bloques',
        desc: 'El área grande de la izquierda. Aquí arrastras los bloques para crear tu programa. Cada bloque es una instrucción para tu Arduino.',
        tip: 'Arrastra los bloques desde el menú de la izquierda al tablero.',
      },
      {
        icon: '📋',
        name: 'Categorías de bloques',
        desc: 'El menú de la izquierda tiene grupos de bloques por colores. Cada grupo tiene bloques que hacen cosas parecidas (luces, sonidos, esperar, etc.).',
        tip: 'Haz clic en cada categoría para ver sus bloques.',
      },
      {
        icon: '💻',
        name: 'Panel de código',
        desc: 'A la derecha puedes ver el código Arduino que generan tus bloques. Es lo que entiende la Arduino.',
        tip: 'No necesitas entender el código, ¡los bloques lo hacen solos!',
      },
      {
        icon: '🚀',
        name: 'Subir programa',
        desc: 'Cuando termines tu programa, ve al tab "🚀 Subir", conecta tu Arduino con el cable USB y presiona el botón verde.',
        tip: 'Elige el puerto COM correcto donde está conectada tu Arduino.',
      },
      {
        icon: '🗂️',
        name: 'Proyectos de ejemplo',
        desc: 'En el tab "🗂️ Proyectos" puedes cargar proyectos listos para usar. Es la mejor manera de aprender: carga uno, míralo y modifícalo.',
        tip: '¡Carga un proyecto y cambia los números para ver qué pasa!',
      },
      {
        icon: '🏆',
        name: 'Logros',
        desc: 'En el tab "🏆 Logros" puedes ver las medallas que ganas mientras usas el programa. ¡Trata de desbloquearlos todos!',
        tip: 'Cada vez que haces algo nuevo, ganas un logro.',
      },
    ],
  },
  {
    id: 'basicos',
    emoji: '⚡',
    title: 'Bloques Básicos',
    color: '#e65100',
    bg: '#fff3e0',
    items: [
      {
        icon: '🔄',
        name: 'Configurar y Repetir (Setup y Loop)',
        desc: 'Es el bloque principal de todo programa. La parte "Configurar" se ejecuta una sola vez al encender la Arduino. La parte "Repetir" se ejecuta una y otra vez para siempre.',
        tip: 'Todo tu programa va dentro de este bloque.',
        example: 'En "Configurar" preparas los pines; en "Repetir" pones lo que quieres que haga siempre.',
      },
      {
        icon: '⏱️',
        name: 'Esperar',
        desc: 'Hace que la Arduino espere un tiempo antes de continuar. El tiempo se escribe en milisegundos (1 segundo = 1000 milisegundos).',
        tip: '1000 ms = 1 segundo. 500 ms = medio segundo.',
        example: 'Enciende el LED → Espera 1000ms → Apaga el LED → Espera 1000ms = ¡parpadeo!',
      },
    ],
  },
  {
    id: 'leds',
    emoji: '💡',
    title: 'Luces y LEDs',
    color: '#f9a825',
    bg: '#fffde7',
    items: [
      {
        icon: '📌',
        name: 'Configurar pin',
        desc: 'Le dice a la Arduino si un pin va a ser SALIDA (para enviar electricidad, como encender un LED) o ENTRADA (para recibir, como un botón).',
        tip: 'Los LEDs necesitan pin como SALIDA. Los botones como ENTRADA.',
        example: 'Pin 13 → SALIDA (para un LED conectado al pin 13)',
      },
      {
        icon: '🔵',
        name: 'Encender/Apagar pin digital',
        desc: 'Envía electricidad (HIGH = encendido) o la corta (LOW = apagado) a un pin. Se usa para encender y apagar LEDs.',
        tip: 'HIGH enciende, LOW apaga.',
        example: 'Pin 13 → HIGH enciende el LED del pin 13',
      },
      {
        icon: '🌈',
        name: 'Brillo de pin (PWM)',
        desc: 'Controla el brillo de un LED entre 0 (apagado) y 255 (máximo brillo). Solo funciona en pines marcados con ~ (como 3, 5, 6, 9, 10, 11).',
        tip: 'Usa pines PWM: 3, 5, 6, 9, 10 ó 11.',
        example: 'Pin 9 → valor 128 = LED al 50% de brillo',
      },
      {
        icon: '🎨',
        name: 'LED RGB (rojo+verde+azul)',
        desc: 'Un LED RGB tiene 3 colores dentro. Mezclando el brillo de cada color (0-255) puedes hacer cualquier color.',
        tip: 'R=255, G=0, B=0 = rojo. R=0, G=0, B=255 = azul. R=255, G=255, B=0 = amarillo.',
        example: 'Pines 9(R), 10(G), 11(B) → valores 255, 0, 128 = rosa',
      },
    ],
  },
  {
    id: 'neopixel',
    emoji: '🌈',
    title: 'Luces de Colores (NeoPixel)',
    color: '#6a1b9a',
    bg: '#f3e5f5',
    items: [
      {
        icon: '🔧',
        name: 'Configurar tira NeoPixel',
        desc: 'Prepara la tira de LEDs de colores. Debes decirle en qué pin está conectada y cuántos LEDs tiene.',
        tip: 'Pon este bloque dentro de "Configurar". Solo úsalo una vez.',
        example: 'Pin 6, cantidad 8 = tira de 8 LEDs en pin 6',
      },
      {
        icon: '☀️',
        name: 'Brillo de la tira',
        desc: 'Ajusta el brillo de todos los LEDs de la tira a la vez. Va de 0 (apagado) a 255 (deslumbrante). Se recomienda no pasar de 100.',
        tip: 'Ponlo en 50 para empezar. Mucho brillo puede gastar mucha electricidad.',
        example: 'Brillo 50 = luz agradable y no demasiado intensa',
      },
      {
        icon: '🎨',
        name: 'Color de un LED',
        desc: 'Cambia el color de un LED específico de la tira. El primer LED es el número 0. Debes decirle cuánto rojo (R), verde (G) y azul (B) quieres (0-255).',
        tip: 'Los LEDs empiezan desde el número 0, no el 1.',
        example: 'LED 0, R=255, G=0, B=0 = el primer LED en rojo',
      },
      {
        icon: '✨',
        name: 'Mostrar colores',
        desc: 'Después de cambiar los colores con el bloque anterior, debes usar este bloque para que los cambios se vean en la tira.',
        tip: 'Siempre después de cambiar colores, pon "Mostrar".',
        example: 'Cambia 3 LEDs → Mostrar = aparecen los 3 colores',
      },
      {
        icon: '⬛',
        name: 'Apagar toda la tira',
        desc: 'Apaga todos los LEDs de la tira de una vez.',
        tip: 'Útil al inicio o para hacer efectos de parpadeo con toda la tira.',
        example: 'Apagar tira → Esperar → Poner colores → Mostrar = efecto flash',
      },
    ],
  },
  {
    id: 'sonido',
    emoji: '🔊',
    title: 'Sonido',
    color: '#1b5e20',
    bg: '#e8f5e9',
    items: [
      {
        icon: '🎵',
        name: 'Tocar nota',
        desc: 'Hace sonar un zumbador (buzzer) conectado a un pin con una nota musical. La frecuencia determina qué nota suena.',
        tip: 'Frecuencias comunes: Do=262, Re=294, Mi=330, Fa=349, Sol=392, La=440, Si=494.',
        example: 'Pin 8, frecuencia 262 = suena "Do"',
      },
      {
        icon: '🔇',
        name: 'Silencio',
        desc: 'Para el sonido del zumbador en ese pin.',
        tip: 'Siempre pon este bloque cuando quieras que pare la música.',
        example: 'Tocar nota → Esperar 500ms → Silencio → Esperar 100ms = nota corta con pausa',
      },
    ],
  },
  {
    id: 'sensores',
    emoji: '👁️',
    title: 'Sensores y Entradas',
    color: '#0277bd',
    bg: '#e1f5fe',
    items: [
      {
        icon: '🔘',
        name: 'Leer botón (pin digital)',
        desc: 'Lee si hay electricidad en un pin: HIGH significa que está pulsado o hay señal, LOW que no hay señal.',
        tip: 'Configura el pin como ENTRADA antes de leerlo.',
        example: 'Si pin 2 es HIGH → el botón está presionado',
      },
      {
        icon: '📊',
        name: 'Leer sensor analógico',
        desc: 'Lee un valor de 0 a 1023 de un pin analógico (A0, A1, A2...). Sirve para sensores de luz, temperatura, potenciómetros, etc.',
        tip: 'Los pines analógicos empiezan con "A": A0, A1, A2, A3, A4, A5.',
        example: 'Leer A0 → valor 512 = potenciómetro a la mitad',
      },
      {
        icon: '↔️',
        name: 'Convertir rango (map)',
        desc: 'Convierte un número de un rango a otro. Por ejemplo, convierte el valor del sensor (0-1023) al brillo de un LED (0-255).',
        tip: 'Muy útil para controlar LEDs con potenciómetros o sensores.',
        example: 'Valor 512 de rango 0-1023 → se convierte a 128 en rango 0-255',
      },
    ],
  },
  {
    id: 'control',
    emoji: '🔀',
    title: 'Control y Decisiones',
    color: '#880e4f',
    bg: '#fce4ec',
    items: [
      {
        icon: '❓',
        name: 'Si... hacer (condicional)',
        desc: 'Ejecuta unos bloques solo si se cumple una condición. Si la condición es verdadera, hace lo que está dentro; si no, lo salta.',
        tip: 'Puedes añadir un "si no" para hacer algo diferente cuando no se cumple.',
        example: 'Si botón presionado → encender LED. Si no → apagar LED.',
      },
      {
        icon: '🔁',
        name: 'Repetir veces',
        desc: 'Ejecuta los bloques de dentro un número fijo de veces.',
        tip: 'Útil para hacer parpadeos o secuencias repetidas.',
        example: 'Repetir 5 veces: encender LED 200ms, apagar 200ms = 5 parpadeos',
      },
      {
        icon: '🔃',
        name: 'Repetir mientras',
        desc: 'Repite los bloques de dentro mientras se cumpla una condición.',
        tip: 'Cuidado: si la condición nunca se vuelve falsa, se repetirá para siempre.',
        example: 'Mientras sensor < 500 → encender alarma',
      },
      {
        icon: '⚖️',
        name: 'Comparar',
        desc: 'Compara dos números. Puedes usar: igual (=), mayor que (>), menor que (<), mayor o igual (≥), menor o igual (≤).',
        tip: 'El resultado es verdadero o falso. Úsalo dentro de "Si".',
        example: 'Valor del sensor > 800 → es verdadero si el sensor detecta mucha luz',
      },
    ],
  },
  {
    id: 'serial',
    emoji: '💬',
    title: 'Mensajes (Monitor Serial)',
    color: '#37474f',
    bg: '#eceff1',
    items: [
      {
        icon: '📡',
        name: 'Iniciar comunicación serial',
        desc: 'Prepara la Arduino para enviar mensajes al computador. Siempre pon este bloque al inicio en "Configurar".',
        tip: 'Usa velocidad 9600 para empezar.',
        example: 'Iniciar serial 9600 → luego puedes enviar mensajes',
      },
      {
        icon: '📤',
        name: 'Enviar mensaje',
        desc: 'Envía un texto o número al monitor serial del computador. Puedes ver los mensajes en el programa cuando conectas la Arduino.',
        tip: 'Abre el Monitor Serial en Arduino IDE para ver los mensajes.',
        example: 'Enviar "Hola!" → aparece "Hola!" en el monitor serial',
      },
    ],
  },
  {
    id: 'conexiones',
    emoji: '🔌',
    title: 'Cómo conectar componentes',
    color: '#4e342e',
    bg: '#efebe9',
    items: [
      {
        icon: '💡',
        name: 'Conectar un LED',
        desc: 'El LED tiene dos patas: la larga (+) va a un pin de la Arduino a través de una resistencia de 220Ω. La pata corta (-) va a GND.',
        tip: 'Siempre usa una resistencia con el LED para no quemarlo.',
        example: 'Pin 13 → resistencia 220Ω → pata larga LED → pata corta → GND',
      },
      {
        icon: '🔘',
        name: 'Conectar un botón',
        desc: 'Un botón tiene 4 patas. Conecta un lado al pin de Arduino y el otro a GND. Usa una resistencia pull-up de 10kΩ entre el pin y 5V.',
        tip: 'También puedes usar INPUT_PULLUP para no necesitar la resistencia externa.',
        example: 'Pin 2 ↔ botón ↔ GND, con resistencia 10kΩ entre pin 2 y 5V',
      },
      {
        icon: '🔊',
        name: 'Conectar un buzzer',
        desc: 'El buzzer tiene dos patas: la marcada con + va al pin de Arduino, la otra a GND.',
        tip: 'Algunos buzzers activos suenan solos; para "tocar nota" necesitas un buzzer pasivo.',
        example: 'Pin 8 → pata + buzzer → pata - → GND',
      },
      {
        icon: '🌈',
        name: 'Conectar tira NeoPixel',
        desc: 'La tira tiene 3 cables: rojo (5V) → 5V de Arduino, negro/blanco (GND) → GND, verde/amarillo (DATA) → pin de datos.',
        tip: 'Añade una resistencia de 470Ω en el cable de datos para proteger los LEDs.',
        example: 'Cable DATA de la tira → resistencia 470Ω → pin 6 de Arduino',
      },
    ],
  },
];

// ── Colores por sección ──────────────────────────────────────────────────────
function BlockCard({ icon, name, desc, tip, example }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 1.5,
        mb: 1,
        bgcolor: '#fff',
        '&:hover': { borderColor: '#90caf9', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
        transition: 'all 0.15s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Typography sx={{ fontSize: '1.4rem', lineHeight: 1.2, flexShrink: 0, mt: 0.1 }}>{icon}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#212121', mb: 0.3 }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.45, mb: 0.5 }}>
            {desc}
          </Typography>
          {example && (
            <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1, px: 1, py: 0.4, mb: 0.4 }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#444', fontFamily: 'monospace' }}>
                Ej: {example}
              </Typography>
            </Box>
          )}
          {tip && (
            <Chip
              label={`💡 ${tip}`}
              size="small"
              sx={{
                fontSize: '0.62rem',
                height: 'auto',
                py: 0.3,
                bgcolor: '#fff9c4',
                color: '#5d4037',
                border: '1px solid #f9a825',
                fontWeight: 600,
                '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.35 },
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function KidsHelpPanel() {
  const [expanded, setExpanded] = useState('uso');

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, color: '#1b5e20', mb: 0.5, fontSize: '0.95rem' }}
      >
        ❓ Ayuda y Guía de Bloques
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#666', mb: 1.5, lineHeight: 1.4 }}>
        Aquí encontrarás cómo usar el programa y para qué sirve cada bloque.
      </Typography>

      {HELP_SECTIONS.map((section) => (
        <Accordion
          key={section.id}
          expanded={expanded === section.id}
          onChange={(_, isOpen) => setExpanded(isOpen ? section.id : false)}
          disableGutters
          elevation={0}
          sx={{
            mb: 0.8,
            border: `1px solid ${section.color}44`,
            borderRadius: '8px !important',
            overflow: 'hidden',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { border: `2px solid ${section.color}88` },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: section.color, fontSize: '1.1rem' }} />}
            sx={{
              bgcolor: section.bg,
              minHeight: 44,
              '& .MuiAccordionSummary-content': { my: 0.5 },
              px: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{section.emoji}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: section.color }}>
                {section.title}
              </Typography>
              <Chip
                label={section.items.length}
                size="small"
                sx={{
                  fontSize: '0.6rem',
                  height: 16,
                  bgcolor: section.color + '22',
                  color: section.color,
                  fontWeight: 700,
                }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 1.5, bgcolor: '#fafafa' }}>
            {section.items.map((item, i) => (
              <BlockCard key={i} {...item} />
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ bgcolor: '#e8f5e9', borderRadius: 2, p: 1, border: '1px solid #a5d6a7' }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#2e7d32', fontWeight: 700, mb: 0.3 }}>
          🎓 ¿Necesitas más ayuda?
        </Typography>
        <Typography sx={{ fontSize: '0.68rem', color: '#388e3c', lineHeight: 1.4 }}>
          Ve al tab "🎓 Tutorial" para aprender paso a paso.
          Carga un proyecto de ejemplo del tab "🗂️ Proyectos" y modifícalo para experimentar.
          ¡La mejor manera de aprender es jugando!
        </Typography>
      </Box>
    </Box>
  );
}
