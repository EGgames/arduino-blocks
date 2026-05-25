import { BOARDS } from './boards';
import { ARDUINO_LIBRARIES, LIBRARY_CATEGORIES } from './arduinoLibraries';

// ─── BOARDS ───────────────────────────────────────────────────────────────────

describe('BOARDS', () => {
  test('es un array no vacío', () => {
    expect(Array.isArray(BOARDS)).toBe(true);
    expect(BOARDS.length).toBeGreaterThan(0);
  });

  test('incluye al menos 10 placas', () => {
    expect(BOARDS.length).toBeGreaterThanOrEqual(10);
  });

  test('cada placa tiene label y fqbn', () => {
    BOARDS.forEach((board) => {
      expect(board).toHaveProperty('label');
      expect(board).toHaveProperty('fqbn');
      expect(typeof board.label).toBe('string');
      expect(typeof board.fqbn).toBe('string');
      expect(board.label.length).toBeGreaterThan(0);
      expect(board.fqbn.length).toBeGreaterThan(0);
    });
  });

  test('todos los fqbn tienen el formato plataforma:arquitectura:placa', () => {
    const fqbnPattern = /^[a-z0-9_]+:[a-z0-9_]+:[a-z0-9_]+$/;
    BOARDS.forEach((board) => {
      expect(board.fqbn).toMatch(fqbnPattern);
    });
  });

  test('contiene Arduino Uno con fqbn correcto', () => {
    const uno = BOARDS.find((b) => b.fqbn === 'arduino:avr:uno');
    expect(uno).toBeDefined();
    expect(uno.label).toContain('Uno');
  });

  test('contiene Arduino Mega', () => {
    const mega = BOARDS.find((b) => b.fqbn.includes('mega'));
    expect(mega).toBeDefined();
  });

  test('contiene ESP32', () => {
    const esp32 = BOARDS.find((b) => b.fqbn.includes('esp32'));
    expect(esp32).toBeDefined();
  });

  test('contiene ESP8266', () => {
    const esp8266 = BOARDS.find((b) => b.fqbn.includes('esp8266'));
    expect(esp8266).toBeDefined();
  });

  test('no hay fqbn duplicados', () => {
    const fqbns = BOARDS.map((b) => b.fqbn);
    const unique = new Set(fqbns);
    expect(unique.size).toBe(fqbns.length);
  });

  test('no hay labels duplicados', () => {
    const labels = BOARDS.map((b) => b.label);
    const unique = new Set(labels);
    expect(unique.size).toBe(labels.length);
  });
});

// ─── ARDUINO_LIBRARIES ────────────────────────────────────────────────────────

describe('ARDUINO_LIBRARIES', () => {
  test('es un array no vacío', () => {
    expect(Array.isArray(ARDUINO_LIBRARIES)).toBe(true);
    expect(ARDUINO_LIBRARIES.length).toBeGreaterThan(0);
  });

  test('incluye al menos 55 librerías', () => {
    expect(ARDUINO_LIBRARIES.length).toBeGreaterThanOrEqual(55);
  });

  test('cada librería tiene name, description y category', () => {
    ARDUINO_LIBRARIES.forEach((lib) => {
      expect(lib).toHaveProperty('name');
      expect(lib).toHaveProperty('description');
      expect(lib).toHaveProperty('category');
      expect(typeof lib.name).toBe('string');
      expect(typeof lib.description).toBe('string');
      expect(typeof lib.category).toBe('string');
      expect(lib.name.length).toBeGreaterThan(0);
      expect(lib.description.length).toBeGreaterThan(0);
      expect(lib.category.length).toBeGreaterThan(0);
    });
  });

  test('los nombres de librerías no contienen espacios', () => {
    ARDUINO_LIBRARIES.forEach((lib) => {
      expect(lib.name).not.toMatch(/\s/);
    });
  });

  test('no hay nombres duplicados', () => {
    const names = ARDUINO_LIBRARIES.map((l) => l.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  test('contiene librerías esenciales de Arduino', () => {
    const names = ARDUINO_LIBRARIES.map((l) => l.name);
    expect(names).toContain('Wire');
    expect(names).toContain('SPI');
    expect(names).toContain('Servo');
    expect(names).toContain('EEPROM');
    expect(names).toContain('SD');
  });

  test('contiene librerías de sensores comunes', () => {
    const names = ARDUINO_LIBRARIES.map((l) => l.name);
    expect(names).toContain('DHT');
    expect(names).toContain('NewPing');
  });

  test('contiene librerías de display', () => {
    const names = ARDUINO_LIBRARIES.map((l) => l.name);
    expect(names).toContain('LiquidCrystal');
    expect(names).toContain('Adafruit_SSD1306');
  });

  test('todas las categorías son strings no vacíos', () => {
    ARDUINO_LIBRARIES.forEach((lib) => {
      expect(lib.category.trim().length).toBeGreaterThan(0);
    });
  });
});

// ─── LIBRARY_CATEGORIES ───────────────────────────────────────────────────────

describe('LIBRARY_CATEGORIES', () => {
  test('es un array no vacío', () => {
    expect(Array.isArray(LIBRARY_CATEGORIES)).toBe(true);
    expect(LIBRARY_CATEGORIES.length).toBeGreaterThan(0);
  });

  test('cada categoría es un string no vacío', () => {
    LIBRARY_CATEGORIES.forEach((cat) => {
      expect(typeof cat).toBe('string');
      expect(cat.length).toBeGreaterThan(0);
    });
  });

  test('no hay categorías duplicadas', () => {
    const unique = new Set(LIBRARY_CATEGORIES);
    expect(unique.size).toBe(LIBRARY_CATEGORIES.length);
  });

  test('incluye categorías esperadas', () => {
    expect(LIBRARY_CATEGORIES).toContain('Comunicación');
    expect(LIBRARY_CATEGORIES).toContain('Sensores');
    expect(LIBRARY_CATEGORIES).toContain('Displays');
    expect(LIBRARY_CATEGORIES).toContain('Motores');
  });

  test('todas las categorías de las librerías están en LIBRARY_CATEGORIES (o "Todas" como comodín)', () => {
    const catSet = new Set(LIBRARY_CATEGORIES);
    ARDUINO_LIBRARIES.forEach((lib) => {
      expect(catSet.has(lib.category)).toBe(true);
    });
  });

  test('las categorías reales (sin "Todas") tienen al menos una librería', () => {
    // "Todas" es un comodín para filtrar, no una categoría real de librería
    const realCats = LIBRARY_CATEGORIES.filter((c) => c !== 'Todas');
    realCats.forEach((cat) => {
      const count = ARDUINO_LIBRARIES.filter((l) => l.category === cat).length;
      expect(count).toBeGreaterThan(0);
    });
  });
});
