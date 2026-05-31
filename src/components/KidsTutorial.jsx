// ── Tutoriales Paso a Paso para Modo Niño ─────────────────────────────────────
// Lista de tutoriales independientes. Al seleccionar uno se navega por sus pasos.
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  MobileStepper,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TUTORIALS = [
  {
    id: 'primeros_pasos',
    emoji: '🟢',
    title: 'Primeros pasos',
    desc: 'Aprende que es Arduino y como funciona el programa.',
    color: '#2e7d32',
    bg: '#e8f5e9',
    steps: [
      { emoji: '👋', title: '¡Bienvenido a Arduino Blocks!', body: 'Aqui puedes programar tu Arduino arrastrando bloques de colores, como si fuera un puzle. ¡No necesitas saber escribir codigo!', hint: '→ Mira el panel de la izquierda, ahi estan todos los bloques.' },
      { emoji: '🧩', title: '¿Que es Arduino?', body: 'Arduino es una pequeña computadora que puedes programar para controlar luces, motores, sensores y mucho mas. Es como darle instrucciones a un robot.', hint: '→ Necesitas un cable USB para conectarla al computador.' },
      { emoji: '🖱️', title: 'Como usar el tablero', body: 'Arrastra bloques desde el menu izquierdo al tablero. Encajan entre si como piezas de Lego. Para eliminar un bloque, arrastraralo de vuelta al menu o presiona la tecla Suprimir.', hint: '→ Puedes hacer zoom con la rueda del mouse o los botones + y - del tablero.' },
      { emoji: '⚙️', title: 'El bloque principal: Setup/Loop', body: 'Busca la categoria "⚙️ Inicio" y arrastra el bloque "Preparar y Repetir" al tablero. La parte "Preparar" corre una sola vez al encender, y "Repetir" se repite para siempre.', hint: '→ Todo tu programa debe ir dentro de este bloque.' },
      { emoji: '💾', title: 'Tu programa se guarda solo', body: 'No necesitas guardar manualmente. Arduino Blocks guarda tu trabajo automaticamente cada vez que cambias algo. Al abrir la app, tu ultimo trabajo estara ahi.', hint: '→ Hay un espacio de guardado para modo Niño y otro para modo Avanzado.' },
    ],
  },
  {
    id: 'leds',
    emoji: '💡',
    title: 'Luces y LEDs',
    desc: 'Aprende a encender, apagar y controlar LEDs.',
    color: '#e65100',
    bg: '#fff8e1',
    steps: [
      { emoji: '📌', title: 'Configura el pin como SALIDA', body: 'Antes de encender un LED, debes decirle a la Arduino que ese pin va a enviar electricidad. En "Preparar", coloca el bloque "Modo del pin" y elige el pin 13 y modo SALIDA.', hint: '→ El pin 13 ya tiene un LED integrado en la placa Arduino.' },
      { emoji: '💡', title: 'Enciende el LED', body: 'En "Repetir", coloca el bloque "Encender/Apagar pin", elige el pin 13 y el estado HIGH (encendido). ¡El LED del pin 13 se encendera!', hint: '→ HIGH = encendido, LOW = apagado.' },
      { emoji: '⏱️', title: 'Haz parpadear el LED', body: 'En "Repetir" coloca: pin 13 HIGH → Esperar 500 ms → pin 13 LOW → Esperar 500 ms. El LED parpadeara una y otra vez.', hint: '→ 1000 ms = 1 segundo. Cambia los numeros para hacerlo mas rapido o lento.' },
      { emoji: '🔅', title: 'Controla el brillo (PWM)', body: 'Usa el bloque "Brillo de pin" con pines marcados con ~ (como 9, 10 u 11). El valor va de 0 (apagado) a 255 (maximo). Prueba con 128 para la mitad del brillo.', hint: '→ Solo pines PWM soportan esto: 3, 5, 6, 9, 10, 11.' },
      { emoji: '🚦', title: 'Mini proyecto: Semaforo', body: 'Conecta 3 LEDs a los pines 13 (rojo), 12 (amarillo), 11 (verde). Enciendelos y apagalos en orden: rojo 3s → amarillo 1s → verde 2s.', hint: '→ Carga el proyecto "Semaforo" en 🗂️ Proyectos para ver el ejemplo completo.' },
    ],
  },
  {
    id: 'sonido',
    emoji: '🔊',
    title: 'Sonido y Musica',
    desc: 'Conecta un buzzer y toca notas musicales.',
    color: '#6a1b9a',
    bg: '#f3e5f5',
    steps: [
      { emoji: '🔌', title: 'Conecta el buzzer', body: 'Un buzzer piezoelectrico PASIVO tiene dos patas. La pata marcada con + va al pin 8, y la otra pata va a GND. No necesitas resistencia.', hint: '→ Debe ser un buzzer PASIVO. El buzzer activo no funciona para melodias.' },
      { emoji: '🎵', title: 'Toca una nota', body: 'En la categoria "🔊 Sonido" usa el bloque "Tocar nota". Elige pin 8 y una frecuencia: Do=262, Re=294, Mi=330, Fa=349, Sol=392, La=440, Si=494.', hint: '→ Despues de la nota siempre pon "Esperar" y luego "Silencio".' },
      { emoji: '🎶', title: 'Crea una melodia', body: 'Encadena bloques "Tocar nota" con "Esperar" entre cada uno. Prueba Do→Re→Mi: frecuencias 262, 294, 330, cada una con 400 ms de espera. Al final pon "Silencio".', hint: '→ Cuanto mas corto el Esperar, mas rapida la melodia.' },
      { emoji: '🎹', title: 'Mini proyecto: Piano', body: 'Conecta 4 botones a los pines 2, 3, 4 y 5. Con bloques "Si", detecta que boton se presiono y toca una nota diferente: 262, 330, 392, 523 Hz.', hint: '→ Carga el proyecto "Piano de Botones" en 🗂️ Proyectos para ver el ejemplo.' },
    ],
  },
  {
    id: 'sensores',
    emoji: '👁️',
    title: 'Sensores',
    desc: 'Lee botones, potenciometros y sensores de luz.',
    color: '#0277bd',
    bg: '#e1f5fe',
    steps: [
      { emoji: '🔘', title: 'Lee un boton', body: 'Conecta un boton entre el pin 2 y GND. Pon una resistencia de 10k entre el pin 2 y 5V (pull-up). Configura el pin 2 como ENTRADA y usa "Leer pin digital".', hint: '→ Sin la resistencia pull-up, el pin puede dar lecturas erraticas.' },
      { emoji: '📊', title: 'Lee un potenciometro', body: 'Conecta el potenciometro: pata izquierda a 5V, pata derecha a GND, pata central al pin A0. Usa el bloque "Leer sensor analogico" → A0. Obtendras valores de 0 a 1023.', hint: '→ Envia el valor por serial para ver que numero da mientras lo giras.' },
      { emoji: '☀️', title: 'Detecta la luz (LDR)', body: 'Un fotoresistor (LDR) detecta la luz. Conecta un lado a 5V, el otro a una resistencia de 10k hacia GND. El punto medio va al pin A0. Lee con "Leer sensor analogico".', hint: '→ Valor alto = mucha luz. Valor bajo = oscuridad.' },
      { emoji: '↔️', title: 'Convierte rangos con Map', body: 'El bloque "Convertir rango" transforma un numero de un rango a otro. Ejemplo: el sensor da 0-1023 pero el LED necesita 0-255. Map hace esa conversion automaticamente.', hint: '→ Leer A0 → Map(0,1023,0,255) → Brillo del pin 9.' },
      { emoji: '🚨', title: 'Mini proyecto: Alarma de luz', body: 'Lee el LDR en A0. Si el valor supera 800 (mucha luz), activa el buzzer del pin 8 por 200 ms como alarma.', hint: '→ Carga el proyecto "Alarma con Sensor" en 🗂️ Proyectos para ver el ejemplo.' },
    ],
  },
  {
    id: 'control',
    emoji: '🔀',
    title: 'Control y Decisiones',
    desc: 'Usa condiciones, repeticiones y comparaciones.',
    color: '#880e4f',
    bg: '#fce4ec',
    steps: [
      { emoji: '❓', title: 'El bloque "Si... hacer"', body: 'Ejecuta bloques solo cuando se cumple una condicion. Si es verdadero, hace lo que esta dentro; si no, lo salta. Puedes anadir "Si no" para el caso contrario.', hint: '→ Ejemplo: Si boton presionado → encender LED. Si no → apagar LED.' },
      { emoji: '⚖️', title: 'Compara valores', body: 'El bloque "Comparar" pregunta si un numero es mayor (>), menor (<) o igual (=) a otro. El resultado es verdadero o falso. Conectalo dentro del "Si".', hint: '→ Si (lectura A0 > 500) → encender alarma.' },
      { emoji: '🔁', title: 'Repite un numero fijo de veces', body: 'El bloque "Repetir X veces" ejecuta los bloques de dentro un numero exacto de veces. Ejemplo: repetir 5 veces → encender LED 200 ms → apagar 200 ms = 5 parpadeos.', hint: '→ Usalo cuando sabes exactamente cuantas veces quieres que algo ocurra.' },
      { emoji: '🔃', title: 'Repite mientras sea cierto', body: 'El bloque "Repetir mientras" sigue ejecutando los bloques de dentro mientras la condicion sea verdadera. Cuando se vuelve falsa, para.', hint: '→ Cuidado: si la condicion nunca cambia, se repetira para siempre.' },
    ],
  },
  {
    id: 'neopixel',
    emoji: '🌈',
    title: 'Luces de Colores NeoPixel',
    desc: 'Controla tiras de LEDs RGB de colores.',
    color: '#4a148c',
    bg: '#ede7f6',
    steps: [
      { emoji: '🔌', title: 'Conecta la tira NeoPixel', body: 'La tira tiene 3 cables: rojo (5V) → pin 5V de Arduino, negro (GND) → GND, verde/amarillo (DATA) → pin 6. Anadir una resistencia de 470 ohmios en el cable DATA protege los LEDs.', hint: '→ Conecta tambien un condensador de 100uF entre 5V y GND para proteger la tira.' },
      { emoji: '🔧', title: 'Configura la tira en el programa', body: 'En "Preparar", coloca el bloque "Configurar tira NeoPixel" con pin 6 y la cantidad de LEDs. Luego aniade "Brillo de la tira" con valor 50.', hint: '→ Empieza con brillo 50. ¡No pases de 100 o la Arduino puede quedarse sin energia!' },
      { emoji: '🎨', title: 'Cambia el color de un LED', body: 'Usa el bloque "Color de un LED". El primer LED es el numero 0. Los colores son R (rojo), G (verde), B (azul), cada uno de 0 a 255. Despues pon siempre "Mostrar colores".', hint: '→ R=255,G=0,B=0 = rojo. R=0,G=255,B=0 = verde. R=0,G=0,B=255 = azul. R=255,G=255,B=0 = amarillo.' },
      { emoji: '✨', title: 'Pon varios colores a la vez', body: 'Encadena varios bloques "Color de un LED", uno para cada posicion (0, 1, 2...), cada uno con un color diferente. Al final pon "Mostrar colores" para que se vean todos.', hint: '→ Sin "Mostrar colores" al final, los cambios no se veran en la tira.' },
      { emoji: '🌈', title: 'Mini proyecto: Arcoiris', body: 'Pon 3 LEDs con colores: LED 0 = rojo, LED 1 = verde, LED 2 = azul. Anade "Mostrar colores". Luego mezcla: rojo+verde = amarillo, rojo+azul = magenta.', hint: '→ Carga el proyecto "Arcoiris de Luces" en 🗂️ Proyectos para ver el ejemplo.' },
    ],
  },
  {
    id: 'serial',
    emoji: '💬',
    title: 'Mensajes al Computador',
    desc: 'Envia mensajes y datos al monitor serial.',
    color: '#37474f',
    bg: '#eceff1',
    steps: [
      { emoji: '📡', title: 'Inicia la comunicacion serial', body: 'En "Preparar", coloca el bloque "Iniciar comunicacion serial" con velocidad 9600. Este bloque prepara el canal de comunicacion entre la Arduino y el computador.', hint: '→ Ponlo siempre al inicio en "Preparar". Solo se necesita una vez.' },
      { emoji: '📤', title: 'Envia un mensaje de texto', body: 'En "Repetir", usa el bloque "Enviar mensaje" y conectale un bloque de texto con lo que quieres decir. Ejemplo: "¡Hola!" aparecera en el monitor serial.', hint: '→ Abre el Monitor Serial en Arduino IDE (Tools → Serial Monitor) con velocidad 9600.' },
      { emoji: '📊', title: 'Envia el valor de un sensor', body: 'Conecta el bloque "Leer sensor analogico" directamente al "Enviar mensaje". Asi veras en tiempo real los valores que lee el sensor mientras lo mueves.', hint: '→ Aniade "Esperar 200ms" al final para no saturar el monitor serial.' },
      { emoji: '🐛', title: 'Usalo para detectar errores', body: 'Cuando algo no funciona como esperas, aniade bloques "Enviar mensaje" para ver que esta pasando. Por ejemplo: envia "Boton presionado" dentro del "Si" para confirmarlo.', hint: '→ Esto se llama "depurar" (debugging) y es lo que hacen todos los programadores.' },
    ],
  },
  {
    id: 'subir',
    emoji: '🚀',
    title: 'Subir el Programa',
    desc: 'Conecta tu Arduino y sube tu codigo.',
    color: '#1565c0',
    bg: '#e3f2fd',
    steps: [
      { emoji: '🔌', title: 'Conecta la Arduino al computador', body: 'Usa el cable USB para conectar la placa Arduino al computador. Espera unos segundos a que se instalen los controladores automaticamente.', hint: '→ En Windows veras que aparece un nuevo dispositivo COM en el Administrador de dispositivos.' },
      { emoji: '⚙️', title: 'Selecciona la placa', body: 'En el panel "🚀 Subir", elige el tipo de placa en el menu. La mas comun es "Arduino Uno". Si tienes otra placa (Mega, Nano...), elige la que corresponda.', hint: '→ Si no sabes que placa tienes, mirala: suele estar escrito en la placa misma.' },
      { emoji: '🔎', title: 'Selecciona el puerto', body: 'En el mismo panel, selecciona el puerto COM donde esta conectada la Arduino. Haz clic en el boton de actualizar puertos si no aparece. En Windows suele ser COM3, COM4, etc.', hint: '→ Si hay varios puertos, desconecta la Arduino y ve cual desaparece para identificarla.' },
      { emoji: '🚀', title: '¡Presiona Subir!', body: 'Presiona el boton verde "Subir Programa". Veras una barra de progreso. Cuando termine, la Arduino ejecutara tu programa automaticamente. ¡No hace falta reiniciarla!', hint: '→ ¿Error de compilacion? Revisa que todos tus bloques esten bien conectados.' },
      { emoji: '🏆', title: '¡Eres programador!', body: '¡Felicitaciones! Subiste tu primer programa. Ahora prueba modificar los numeros, cambiar los tiempos, o cargar un proyecto de ejemplo para seguir aprendiendo.', hint: '→ Cada programa que subes te hace mejor programador. ¡Sigue explorando!' },
    ],
  },
];

// ── Vista de pasos de un tutorial ────────────────────────────────────────────
function StepView({ tutorial, onBack }) {
  const [step, setStep] = useState(0);
  const maxSteps = tutorial.steps.length;
  const current = tutorial.steps[step];

  return (
    <Box sx={{ p: 1.5 }}>
      {/* Breadcrumb / volver */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: '0.85rem' }} />}
          onClick={onBack}
          sx={{ color: tutorial.color, fontSize: '0.7rem', minWidth: 0, px: 0.5, textTransform: 'none' }}
        >
          Tutoriales
        </Button>
        <Typography sx={{ fontSize: '0.7rem', color: '#bbb' }}>›</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#555', fontWeight: 600 }} noWrap>
          {tutorial.emoji} {tutorial.title}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 1.5, borderRadius: 3, border: `2px solid ${tutorial.color}44`, bgcolor: tutorial.bg }}
      >
        {/* Barra de progreso */}
        <LinearProgress
          variant="determinate"
          value={((step + 1) / maxSteps) * 100}
          sx={{
            borderRadius: 4, mb: 1, height: 6,
            bgcolor: `${tutorial.color}22`,
            '& .MuiLinearProgress-bar': { bgcolor: tutorial.color },
          }}
        />

        <Typography sx={{ fontSize: '0.65rem', color: '#888', textAlign: 'right', mb: 0.5 }}>
          Paso {step + 1} de {maxSteps}
        </Typography>

        <Typography sx={{ fontSize: '2.5rem', textAlign: 'center', lineHeight: 1, mb: 0.75 }}>
          {current.emoji}
        </Typography>

        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tutorial.color, textAlign: 'center', mb: 0.75 }}>
          {current.title}
        </Typography>

        <Typography sx={{ fontSize: '0.78rem', color: '#333', lineHeight: 1.55, mb: 1 }}>
          {current.body}
        </Typography>

        <Box sx={{ bgcolor: '#fff', borderLeft: `3px solid ${tutorial.color}`, pl: 1, py: 0.5, borderRadius: '0 6px 6px 0', mb: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', color: tutorial.color, fontStyle: 'italic' }}>
            {current.hint}
          </Typography>
        </Box>

        <MobileStepper
          variant="dots"
          steps={maxSteps}
          position="static"
          activeStep={step}
          sx={{
            bgcolor: 'transparent', p: 0,
            '& .MuiMobileStepper-dot': { bgcolor: `${tutorial.color}44` },
            '& .MuiMobileStepper-dotActive': { bgcolor: tutorial.color },
          }}
          nextButton={
            <Button
              size="small"
              onClick={() => setStep((s) => Math.min(s + 1, maxSteps - 1))}
              disabled={step === maxSteps - 1}
              sx={{ color: tutorial.color, fontSize: '0.7rem' }}
            >
              Siguiente <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
              sx={{ color: tutorial.color, fontSize: '0.7rem' }}
            >
              <KeyboardArrowLeft /> Atras
            </Button>
          }
        />

        {step === maxSteps - 1 && (
          <Button
            fullWidth variant="contained" size="small" onClick={onBack}
            sx={{ mt: 1, bgcolor: tutorial.color, '&:hover': { bgcolor: tutorial.color + 'cc' }, borderRadius: 2, fontSize: '0.75rem' }}
          >
            ✅ ¡Tutorial completado! Volver
          </Button>
        )}
      </Paper>
    </Box>
  );
}

// ── Componente principal: lista de tutoriales ─────────────────────────────────
export default function KidsTutorial() {
  const [selected, setSelected] = useState(null);

  if (selected !== null) {
    const tutorial = TUTORIALS.find((t) => t.id === selected);
    return <StepView tutorial={tutorial} onBack={() => setSelected(null)} />;
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography sx={{ fontWeight: 800, color: '#1b5e20', fontSize: '0.95rem', mb: 0.5 }}>
        🎓 Tutoriales
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#666', mb: 1.5, lineHeight: 1.4 }}>
        Elige un tema para aprender paso a paso.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {TUTORIALS.map((tut) => (
          <Card
            key={tut.id}
            elevation={0}
            sx={{
              border: `1px solid ${tut.color}44`,
              borderRadius: 2.5,
              transition: 'all 0.15s',
              '&:hover': { borderColor: tut.color, boxShadow: `0 2px 8px ${tut.color}33` },
            }}
          >
            <CardActionArea onClick={() => setSelected(tut.id)} sx={{ p: 0 }}>
              <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                      bgcolor: tut.bg, border: `1px solid ${tut.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    }}
                  >
                    {tut.emoji}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tut.color, lineHeight: 1.2 }}>
                      {tut.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.67rem', color: '#666', lineHeight: 1.35, mt: 0.2 }}>
                      {tut.desc}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${tut.steps.length} pasos`}
                    size="small"
                    sx={{
                      fontSize: '0.58rem', height: 18, flexShrink: 0,
                      bgcolor: tut.bg, color: tut.color,
                      border: `1px solid ${tut.color}55`, fontWeight: 700,
                    }}
                  />
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
