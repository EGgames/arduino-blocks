/**
 * Arduino C++ → AST Parser
 * Tokenizador + analizador descendente recursivo
 * Soporta todos los patrones comunes de Arduino
 */

// ─── TOKENIZADOR ────────────────────────────────────────────────────────────

const TYPE_KW = new Set([
  'void','int','float','long','byte','bool','boolean','char','String',
  'double','short','unsigned','const','static','uint8_t','uint16_t',
  'uint32_t','int8_t','int16_t','int32_t',
]);

function tokenize(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    // Espacio en blanco
    if (/\s/.test(code[i])) { i++; continue; }

    // Comentario de línea → conservar como token
    if (code[i] === '/' && code[i + 1] === '/') {
      let text = '';
      i += 2;
      while (i < code.length && code[i] !== '\n') text += code[i++];
      tokens.push({ type: 'COMMENT', value: text.trim() });
      continue;
    }

    // Comentario de bloque → descartar
    if (code[i] === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // Directiva preprocesador → capturar #include, descartar el resto
    if (code[i] === '#') {
      let directive = '';
      i++; // saltar #
      while (i < code.length && code[i] !== '\n') directive += code[i++];
      directive = directive.trim();
      // Capturar: #include <lib.h> o #include "lib.h"
      const m = directive.match(/^include\s+[<"]([^>"]+)[>"]$/);
      if (m) {
        // Extraer nombre sin extensión .h
        const libFull = m[1];
        const libName = libFull.endsWith('.h') ? libFull.slice(0, -2) : libFull;
        tokens.push({ type: 'INCLUDE', value: libName });
      }
      continue;
    }

    // Literal de cadena
    if (code[i] === '"') {
      let str = '';
      i++;
      while (i < code.length && code[i] !== '"') {
        if (code[i] === '\\') { str += code[i++]; }
        str += code[i++];
      }
      i++; // cierra "
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Número
    if (/[0-9]/.test(code[i])) {
      let num = '';
      // Hex: 0x...
      if (code[i] === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        num = '0x';
        i += 2;
        while (i < code.length && /[0-9a-fA-F]/.test(code[i])) num += code[i++];
      } else {
        while (i < code.length && /[0-9.]/.test(code[i])) num += code[i++];
      }
      // Sufijos L/U/F
      while (i < code.length && /[lLuUfF]/.test(code[i])) i++;
      tokens.push({ type: 'NUMBER', value: parseFloat(num) || 0 });
      continue;
    }

    // Identificador
    if (/[a-zA-Z_]/.test(code[i])) {
      let id = '';
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) id += code[i++];
      tokens.push({ type: 'IDENT', value: id });
      continue;
    }

    // Operadores de dos caracteres
    const two = code.slice(i, i + 2);
    if (['==','!=','<=','>=','&&','||','++','--','+=','-=','*=','/=','%=','<<','>>'].includes(two)) {
      tokens.push({ type: 'OP', value: two });
      i += 2;
      continue;
    }

    // Tokens de un solo carácter
    const ch = code[i++];
    if (ch === '(') { tokens.push({ type: 'LPAREN',   value: ch }); continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN',   value: ch }); continue; }
    if (ch === '{') { tokens.push({ type: 'LBRACE',   value: ch }); continue; }
    if (ch === '}') { tokens.push({ type: 'RBRACE',   value: ch }); continue; }
    if (ch === '[') { tokens.push({ type: 'LBRACKET', value: ch }); continue; }
    if (ch === ']') { tokens.push({ type: 'RBRACKET', value: ch }); continue; }
    if (ch === ';') { tokens.push({ type: 'SEMI',     value: ch }); continue; }
    if (ch === ',') { tokens.push({ type: 'COMMA',    value: ch }); continue; }
    if (ch === '.') { tokens.push({ type: 'DOT',      value: ch }); continue; }
    if ('+-*/%<>=!~^&|'.includes(ch)) { tokens.push({ type: 'OP', value: ch }); continue; }
    // Carácter desconocido: ignorar
  }

  tokens.push({ type: 'EOF', value: null });
  return tokens;
}

// ─── PARSER ─────────────────────────────────────────────────────────────────

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek(offset = 0) {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }
  consume() { return this.tokens[this.pos++]; }

  match(type, value) {
    const t = this.peek();
    return t.type === type && (value === undefined || t.value === value);
  }

  eat(type, value) {
    if (this.match(type, value)) return this.consume();
    return null;
  }

  // Avanzar hasta el final de la sentencia actual
  skipStatement() {
    let depth = 0;
    while (!this.match('EOF')) {
      if (this.match('LBRACE')) depth++;
      else if (this.match('RBRACE')) { if (depth === 0) break; depth--; }
      else if (this.match('SEMI') && depth === 0) { this.consume(); return; }
      this.consume();
    }
  }

  // ── Nivel superior ──────────────────────────────────────────────────────

  parseProgram() {
    const includes  = [];
    const globals   = [];
    const functions = [];
    let setup = [];
    let loop  = [];

    while (!this.match('EOF')) {
      // Directiva #include
      if (this.match('INCLUDE')) {
        includes.push(this.consume().value);
        continue;
      }
      if (this.match('COMMENT')) {
        globals.push({ type: 'comment', text: this.consume().value });
        continue;
      }
      if (this.match('IDENT') && TYPE_KW.has(this.peek().value)) {
        const result = this.parseTopLevel();
        if (!result) continue;
        if (result.type === 'function') {
          if (result.name === 'setup') setup = result.body;
          else if (result.name === 'loop') loop = result.body;
          else functions.push(result); // funciones personalizadas
        } else {
          globals.push(result);
        }
        continue;
      }
      this.consume(); // token desconocido: saltar
    }

    return { type: 'program', includes, globals, setup, loop, functions };
  }

  parseTopLevel() {
    // Consumir el tipo (int, void, unsigned int, etc.)
    let retType = this.consume().value;
    while (
      this.match('IDENT') &&
      (TYPE_KW.has(this.peek().value) || retType === 'unsigned' || retType === 'const' || retType === 'static')
    ) {
      retType += ' ' + this.consume().value;
    }

    if (!this.match('IDENT')) { this.skipStatement(); return null; }
    const name = this.consume().value;

    // Array: saltar
    if (this.match('LBRACKET')) { this.skipStatement(); return null; }

    // Función: TYPE name ( params ) { body }
    if (this.match('LPAREN')) {
      this.consume(); // (
      // Recolectar parámetros como string
      const paramTokens = [];
      let depth = 1;
      while (!this.match('EOF') && depth > 0) {
        if (this.match('LPAREN')) depth++;
        else if (this.match('RPAREN')) depth--;
        if (depth > 0) paramTokens.push(this.peek().value);
        this.consume();
      }
      const params = paramTokens.join(' ').replace(/ ([,\[\]])/g, '$1').trim();
      if (this.match('LBRACE')) {
        this.consume(); // {
        const body = this.parseBlock();
        this.eat('RBRACE');
        return { type: 'function', name, retType, params, body };
      }
      return null;
    }

    // Variable global: TYPE name [= expr];
    let value = null;
    if (this.eat('OP', '=')) value = this.parseExpr();
    this.eat('SEMI');
    return { type: 'vardecl', varType: retType, name, value };
  }

  // ── Bloque de sentencias ─────────────────────────────────────────────────

  parseBlock() {
    const stmts = [];
    while (!this.match('EOF') && !this.match('RBRACE')) {
      const s = this.parseStatement();
      if (s) stmts.push(s);
    }
    return stmts;
  }

  parseStatement() {
    if (this.match('COMMENT'))      return { type: 'comment', text: this.consume().value };
    if (this.eat('SEMI'))           return null;
    if (this.match('IDENT', 'if'))  return this.parseIf();
    if (this.match('IDENT', 'for')) return this.parseFor();
    if (this.match('IDENT', 'while')) return this.parseWhile();
    if (this.match('IDENT', 'do'))  return this.parseDo();

    // return — parsear el valor si lo hay
    if (this.match('IDENT', 'return')) {
      this.consume();
      if (this.match('SEMI')) { this.eat('SEMI'); return { type: 'return', value: null }; }
      const value = this.parseExpr();
      this.eat('SEMI');
      return { type: 'return', value };
    }

    // break / continue / switch: saltar
    if (['break','continue','switch','case','default'].includes(this.peek().value) && this.match('IDENT')) {
      this.skipStatement();
      return null;
    }

    // Declaración de variable
    if (this.match('IDENT') && TYPE_KW.has(this.peek().value)) {
      return this.parseVarDecl();
    }

    // Sentencia de expresión (asignación, llamada, etc.)
    if (this.match('IDENT') || this.match('NUMBER') || this.match('LPAREN')) {
      return this.parseExprStatement();
    }

    // Desconocido: saltar un token
    this.consume();
    return null;
  }

  parseIf() {
    this.consume(); // 'if'
    this.eat('LPAREN');
    const cond = this.parseExpr();
    this.eat('RPAREN');
    const thenBranch = this.parseBranchBlock();
    let elseBranch = [];
    if (this.match('IDENT', 'else')) {
      this.consume();
      elseBranch = this.match('IDENT', 'if') ? [this.parseIf()] : this.parseBranchBlock();
    }
    return { type: 'if', cond, then: thenBranch, else: elseBranch };
  }

  parseFor() {
    this.consume(); // 'for'
    this.eat('LPAREN');

    let init = null;
    if (!this.match('SEMI')) {
      if (this.match('IDENT') && TYPE_KW.has(this.peek().value)) {
        init = this.parseVarDeclInner();
        this.eat('SEMI');
      } else {
        init = this.parseExpr();
        this.eat('SEMI');
      }
    } else this.eat('SEMI');

    let cond = null;
    if (!this.match('SEMI')) cond = this.parseExpr();
    this.eat('SEMI');

    let update = null;
    if (!this.match('RPAREN')) update = this.parseExpr();
    this.eat('RPAREN');

    const body = this.parseBranchBlock();
    return { type: 'for', init, cond, update, body };
  }

  parseWhile() {
    this.consume(); // 'while'
    this.eat('LPAREN');
    const cond = this.parseExpr();
    this.eat('RPAREN');
    const body = this.parseBranchBlock();
    return { type: 'while', cond, body };
  }

  parseDo() {
    this.consume(); // 'do'
    const body = this.parseBranchBlock();
    if (this.match('IDENT', 'while')) this.consume();
    this.eat('LPAREN');
    const cond = this.parseExpr();
    this.eat('RPAREN');
    this.eat('SEMI');
    return { type: 'dowhile', cond, body };
  }

  parseBranchBlock() {
    if (this.match('LBRACE')) {
      this.consume();
      const b = this.parseBlock();
      this.eat('RBRACE');
      return b;
    }
    const s = this.parseStatement();
    return s ? [s] : [];
  }

  parseVarDecl() {
    const node = this.parseVarDeclInner();
    this.eat('SEMI');
    return node;
  }

  parseVarDeclInner() {
    let varType = this.consume().value;
    while (
      this.match('IDENT') &&
      (TYPE_KW.has(this.peek().value) || varType === 'unsigned' || varType === 'const')
    ) {
      varType += ' ' + this.consume().value;
    }
    if (!this.match('IDENT')) return null;
    const name = this.consume().value;
    if (this.match('LBRACKET')) { this.skipStatement(); return null; }
    let value = null;
    if (this.eat('OP', '=')) value = this.parseExpr();
    return { type: 'vardecl', varType, name, value };
  }

  parseExprStatement() {
    const expr = this.parseExpr();
    this.eat('SEMI');
    return expr ? { type: 'exprStmt', expr } : null;
  }

  // ── Expresiones (por precedencia) ───────────────────────────────────────

  parseExpr()   { return this.parseAssign(); }

  parseAssign() {
    const left = this.parseOr();
    const assignOps = ['=', '+=', '-=', '*=', '/=', '%='];
    if (this.match('OP') && assignOps.includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseAssign();
      return { type: 'assign', op, target: left, value: right };
    }
    return left;
  }

  parseOr() {
    let left = this.parseAnd();
    while (this.eat('OP', '||')) left = { type: 'binop', op: '||', left, right: this.parseAnd() };
    return left;
  }

  parseAnd() {
    let left = this.parseEq();
    while (this.eat('OP', '&&')) left = { type: 'binop', op: '&&', left, right: this.parseEq() };
    return left;
  }

  parseEq() {
    let left = this.parseCmp();
    while (this.match('OP') && (this.peek().value === '==' || this.peek().value === '!=')) {
      const op = this.consume().value;
      left = { type: 'binop', op, left, right: this.parseCmp() };
    }
    return left;
  }

  parseCmp() {
    let left = this.parseAdd();
    while (this.match('OP') && ['<', '>', '<=', '>='].includes(this.peek().value)) {
      const op = this.consume().value;
      left = { type: 'binop', op, left, right: this.parseAdd() };
    }
    return left;
  }

  parseAdd() {
    let left = this.parseMul();
    while (this.match('OP') && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      left = { type: 'binop', op, left, right: this.parseMul() };
    }
    return left;
  }

  parseMul() {
    let left = this.parseUnary();
    while (this.match('OP') && ['*', '/', '%'].includes(this.peek().value)) {
      const op = this.consume().value;
      left = { type: 'binop', op, left, right: this.parseUnary() };
    }
    return left;
  }

  parseUnary() {
    if (this.eat('OP', '!'))  return { type: 'unop', op: '!',    operand: this.parseUnary() };
    if (this.eat('OP', '-'))  return { type: 'unop', op: 'neg',  operand: this.parseUnary() };
    if (this.eat('OP', '++')) return { type: 'unop', op: '++pre',operand: this.parsePrimary() };
    if (this.eat('OP', '--')) return { type: 'unop', op: '--pre',operand: this.parsePrimary() };
    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();
    if (this.eat('OP', '++')) return { type: 'unop', op: '++post', operand: expr };
    if (this.eat('OP', '--')) return { type: 'unop', op: '--post', operand: expr };
    return expr;
  }

  parsePrimary() {
    // Número
    if (this.match('NUMBER')) return { type: 'num', value: this.consume().value };

    // Cadena
    if (this.match('STRING')) return { type: 'str', value: this.consume().value };

    // Paréntesis
    if (this.eat('LPAREN')) {
      const e = this.parseExpr();
      this.eat('RPAREN');
      return e;
    }

    // Identificador, acceso a miembro, llamada
    if (this.match('IDENT')) {
      let name = this.consume().value;

      // Literales booleanos
      if (name === 'true')  return { type: 'bool', value: true };
      if (name === 'false') return { type: 'bool', value: false };

      // Acceso a miembro: Serial.begin, etc.
      while (this.eat('DOT')) {
        const member = this.match('IDENT') ? this.consume().value : '';
        name = name + '.' + member;
      }

      // Llamada a función
      if (this.eat('LPAREN')) {
        const args = [];
        if (!this.match('RPAREN')) {
          args.push(this.parseExpr());
          while (this.eat('COMMA')) args.push(this.parseExpr());
        }
        this.eat('RPAREN');
        return { type: 'call', name, args };
      }

      // Acceso a array: ignorar el índice
      if (this.eat('LBRACKET')) {
        this.parseExpr();
        this.eat('RBRACKET');
      }

      return { type: 'ident', name };
    }

    return { type: 'num', value: 0 }; // fallback
  }
}

// ─── API PÚBLICA ─────────────────────────────────────────────────────────────

export function parseArduinoCode(code) {
  try {
    const tokens = tokenize(code);
    const parser = new Parser(tokens);
    return { ...parser.parseProgram(), error: null };
  } catch (err) {
    console.warn('[codeParser] Error:', err);
    return { type: 'program', globals: [], setup: [], loop: [], error: err.message };
  }
}
