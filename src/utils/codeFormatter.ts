/**
 * CodeStudio Unified Code Formatter
 * Robust multi-language formatting engine supporting JS/TS/JSX/TSX, HTML/XML/SVG,
 * CSS/SCSS, JSON, Markdown, and Python.
 */

export interface FormatResult {
  formatted: string;
  error?: string;
}

/**
 * Format JSON with custom indentation
 */
function formatJson(code: string, tabSize: number): FormatResult {
  try {
    const parsed = JSON.parse(code);
    return { formatted: JSON.stringify(parsed, null, tabSize) };
  } catch (err: any) {
    return { formatted: code, error: `Invalid JSON: ${err.message}` };
  }
}

/**
 * Format HTML / XML / SVG with hierarchical tag indentation
 */
function formatHtml(html: string, tabSize: number): FormatResult {
  try {
    const indent = ' '.repeat(tabSize);
    let formatted = '';
    let indentLevel = 0;
    
    // Normalize and tokenize tags
    const tokens = html
      .replace(/>\s*</g, '><')
      .replace(/</g, '~::~<')
      .split('~::~')
      .filter((t) => t.trim().length > 0);

    const voidTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
    ]);

    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;

      const isClosing = /^<\//i.test(token);
      const isOpening = /^<[a-z0-9!]/i.test(token);
      const isSelfClosing = /\/>$/.test(token);
      const tagNameMatch = token.match(/^<\/?([a-z0-9!]+)/i);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isVoid = voidTags.has(tagName) || isSelfClosing;

      if (isClosing) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      formatted += indent.repeat(indentLevel) + token + '\n';

      if (isOpening && !isClosing && !isVoid) {
        indentLevel++;
      }
    }

    return { formatted: formatted.trimEnd() };
  } catch (err: any) {
    return { formatted: html, error: err.message };
  }
}

/**
 * Format CSS / SCSS
 */
function formatCss(css: string, tabSize: number): FormatResult {
  try {
    const indent = ' '.repeat(tabSize);
    let formatted = '';
    let indentLevel = 0;
    
    // Clean up extra whitespace
    const clean = css
      .replace(/\s+/g, ' ')
      .replace(/\{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\}\s*/g, '\n}\n');

    const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
      if (line.endsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      formatted += indent.repeat(indentLevel) + line + '\n';
      if (line.endsWith('{')) {
        indentLevel++;
      }
    }

    return { formatted: formatted.trimEnd() };
  } catch (err: any) {
    return { formatted: css, error: err.message };
  }
}

/**
 * Format JavaScript / TypeScript / React JSX / TSX
 */
function formatJavaScript(code: string, tabSize: number): FormatResult {
  try {
    const indent = ' '.repeat(tabSize);
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        formattedLines.push('');
        continue;
      }

      // Check if line starts with closing bracket
      const startsWithClose = /^[\}\]\)]/.test(line);
      if (startsWithClose) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Format line with current indent
      formattedLines.push(indent.repeat(indentLevel) + line);

      // Count opened vs closed brackets (excluding strings/comments approximate)
      const openCount = (line.match(/[\{\[\(]/g) || []).length;
      const closeCount = (line.match(/[\}\]\)]/g) || []).length;
      
      const diff = openCount - closeCount;
      if (diff > 0 && !startsWithClose) {
        indentLevel += diff;
      } else if (diff < 0 && !startsWithClose) {
        indentLevel = Math.max(0, indentLevel + diff);
      }
    }

    return { formatted: formattedLines.join('\n') };
  } catch (err: any) {
    return { formatted: code, error: err.message };
  }
}

/**
 * Format Markdown files
 */
function formatMarkdown(md: string): FormatResult {
  // Normalize header spacing and list item spacing
  const formatted = md
    .split('\n')
    .map((line) => {
      // Ensure space after header hashes
      if (/^#{1,6}[^\s#]/.test(line)) {
        return line.replace(/^(#{1,6})([^\s#])/, '$1 $2');
      }
      return line;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return { formatted: formatted.trimEnd() };
}

/**
 * Format Python files (clean up trailing whitespace, normalize line endings)
 */
function formatPython(code: string): FormatResult {
  const formatted = code
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  return { formatted: formatted.trimEnd() };
}

/**
 * Universal format function based on language / extension
 */
export function formatCode(code: string, languageOrExt: string, tabSize: number = 2): FormatResult {
  const ext = languageOrExt.toLowerCase().replace(/^\./, '');

  switch (ext) {
    case 'json':
    case 'jsonc':
      return formatJson(code, tabSize);

    case 'html':
    case 'xml':
    case 'svg':
    case 'htm':
      return formatHtml(code, tabSize);

    case 'css':
    case 'scss':
    case 'less':
      return formatCss(code, tabSize);

    case 'js':
    case 'javascript':
    case 'jsx':
    case 'mjs':
    case 'cjs':
    case 'ts':
    case 'typescript':
    case 'tsx':
    case 'mts':
    case 'cts':
      return formatJavaScript(code, tabSize);

    case 'md':
    case 'markdown':
      return formatMarkdown(code);

    case 'py':
    case 'python':
      return formatPython(code);

    default:
      // Basic whitespace cleanup
      return {
        formatted: code
          .split('\n')
          .map((l) => l.trimEnd())
          .join('\n'),
      };
  }
}
