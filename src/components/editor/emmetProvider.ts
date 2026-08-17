// Universal Emmet Abbreviation Engine & Provider for Monaco Editor (All Languages)
import * as monaco from 'monaco-editor';

interface EmmetSnippet {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}

// 1. Common HTML & JSX Emmet Snippets
const HTML_SNIPPETS: EmmetSnippet[] = [
  {
    label: '!',
    detail: 'HTML5 Boilerplate (Emmet)',
    documentation: 'Generates complete HTML5 boilerplate with viewport and meta tags.',
    insertText: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${1:Document}</title>
</head>
<body>
    \${0}
</body>
</html>`,
  },
  {
    label: 'html:5',
    detail: 'HTML5 Boilerplate',
    documentation: 'Complete HTML5 boilerplate structure.',
    insertText: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${1:Document}</title>
</head>
<body>
    \${0}
</body>
</html>`,
  },
  {
    label: 'a:link',
    detail: 'Anchor Link',
    documentation: 'Link with href',
    insertText: '<a href="${1:https://}">$2</a>',
  },
  {
    label: 'a:mail',
    detail: 'Mailto Link',
    documentation: 'Anchor tag with mailto href',
    insertText: '<a href="mailto:${1:user@example.com}">$2</a>',
  },
  {
    label: 'a:tel',
    detail: 'Tel Link',
    documentation: 'Anchor tag with tel link',
    insertText: '<a href="tel:${1:+1234567890}">$2</a>',
  },
  {
    label: 'link:css',
    detail: 'Link CSS Stylesheet',
    documentation: 'Link external CSS stylesheet',
    insertText: '<link rel="stylesheet" href="${1:style.css}">',
  },
  {
    label: 'link:favicon',
    detail: 'Favicon Link',
    documentation: 'Link icon for browser tabs',
    insertText: '<link rel="shortcut icon" href="${1:favicon.ico}" type="image/x-icon">',
  },
  {
    label: 'script:src',
    detail: 'Script tag with src',
    documentation: 'Script tag with external src',
    insertText: '<script src="${1:script.js}"></script>',
  },
  {
    label: 'script:module',
    detail: 'Script module tag',
    documentation: 'Script tag with type="module"',
    insertText: '<script type="module" src="${1:main.js}"></script>',
  },
  {
    label: 'img:src',
    detail: 'Image tag',
    documentation: 'Image tag with src and alt',
    insertText: '<img src="${1:image.png}" alt="${2:description}">',
  },
  {
    label: 'input:text',
    detail: 'Text input field',
    documentation: 'Standard text input',
    insertText: '<input type="text" name="${1:name}" id="${2:id}" placeholder="${3:Enter text}">',
  },
  {
    label: 'input:password',
    detail: 'Password input field',
    documentation: 'Password masked input',
    insertText: '<input type="password" name="${1:password}" id="${2:password}">',
  },
  {
    label: 'input:email',
    detail: 'Email input field',
    documentation: 'Email validated input',
    insertText: '<input type="email" name="${1:email}" id="${2:email}" placeholder="${3:name@example.com}">',
  },
  {
    label: 'input:number',
    detail: 'Number input field',
    documentation: 'Numeric value input',
    insertText: '<input type="number" name="${1:number}" id="${2:number}" min="${3:0}">',
  },
  {
    label: 'input:checkbox',
    detail: 'Checkbox input',
    documentation: 'Checkbox input toggle',
    insertText: '<input type="checkbox" name="${1:name}" id="${2:id}">',
  },
  {
    label: 'input:radio',
    detail: 'Radio input',
    documentation: 'Radio option input',
    insertText: '<input type="radio" name="${1:group}" id="${2:id}" value="${3:val}">',
  },
  {
    label: 'input:file',
    detail: 'File upload input',
    documentation: 'File picker input',
    insertText: '<input type="file" name="${1:file}" id="${2:file}">',
  },
  {
    label: 'input:submit',
    detail: 'Submit button input',
    documentation: 'Form submission button',
    insertText: '<input type="submit" value="${1:Submit}">',
  },
  {
    label: 'form:post',
    detail: 'Form with POST method',
    documentation: 'Form element with method="post"',
    insertText: '<form action="${1:}" method="post">\n\t${0}\n</form>',
  },
  {
    label: 'form:get',
    detail: 'Form with GET method',
    documentation: 'Form element with method="get"',
    insertText: '<form action="${1:}" method="get">\n\t${0}\n</form>',
  },
  {
    label: 'meta:vp',
    detail: 'Viewport Meta Tag',
    documentation: 'Responsive viewport meta tag',
    insertText: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  },
  {
    label: 'meta:utf',
    detail: 'UTF-8 Meta Tag',
    documentation: 'Character set meta tag',
    insertText: '<meta charset="UTF-8">',
  },
  {
    label: 'div.container',
    detail: 'Container Div',
    documentation: 'Div with container class',
    insertText: '<div class="container">\n\t${0}\n</div>',
  },
  {
    label: 'ul>li*3',
    detail: 'Unordered list 3 items',
    documentation: 'Generates <ul> with 3 <li> items',
    insertText: '<ul>\n\t<li>${1:Item 1}</li>\n\t<li>${2:Item 2}</li>\n\t<li>${3:Item 3}</li>\n</ul>',
  },
  {
    label: 'ul>li*5',
    detail: 'Unordered list 5 items',
    documentation: 'Generates <ul> with 5 <li> items',
    insertText: '<ul>\n\t<li>${1:Item 1}</li>\n\t<li>${2:Item 2}</li>\n\t<li>${3:Item 3}</li>\n\t<li>${4:Item 4}</li>\n\t<li>${5:Item 5}</li>\n</ul>',
  },
];

// 2. Comprehensive CSS Emmet Snippets
const CSS_SNIPPETS: EmmetSnippet[] = [
  { label: 'df', detail: 'display: flex', documentation: 'Sets display to flex', insertText: 'display: flex;' },
  { label: 'dg', detail: 'display: grid', documentation: 'Sets display to grid', insertText: 'display: grid;' },
  { label: 'db', detail: 'display: block', documentation: 'Sets display to block', insertText: 'display: block;' },
  { label: 'dn', detail: 'display: none', documentation: 'Sets display to none', insertText: 'display: none;' },
  { label: 'dib', detail: 'display: inline-block', documentation: 'Sets display to inline-block', insertText: 'display: inline-block;' },
  { label: 'dif', detail: 'display: inline-flex', documentation: 'Sets display to inline-flex', insertText: 'display: inline-flex;' },
  { label: 'jcc', detail: 'justify-content: center', documentation: 'Centers flex items along main axis', insertText: 'justify-content: center;' },
  { label: 'jcsb', detail: 'justify-content: space-between', documentation: 'Space between flex items', insertText: 'justify-content: space-between;' },
  { label: 'jcsa', detail: 'justify-content: space-around', documentation: 'Space around flex items', insertText: 'justify-content: space-around;' },
  { label: 'jcse', detail: 'justify-content: space-evenly', documentation: 'Space evenly flex items', insertText: 'justify-content: space-evenly;' },
  { label: 'aic', detail: 'align-items: center', documentation: 'Centers flex items along cross axis', insertText: 'align-items: center;' },
  { label: 'aifs', detail: 'align-items: flex-start', documentation: 'Aligns flex items to top/start', insertText: 'align-items: flex-start;' },
  { label: 'aife', detail: 'align-items: flex-end', documentation: 'Aligns flex items to bottom/end', insertText: 'align-items: flex-end;' },
  { label: 'fdc', detail: 'flex-direction: column', documentation: 'Vertical flex column', insertText: 'flex-direction: column;' },
  { label: 'fdr', detail: 'flex-direction: row', documentation: 'Horizontal flex row', insertText: 'flex-direction: row;' },
  { label: 'fww', detail: 'flex-wrap: wrap', documentation: 'Allows items to wrap', insertText: 'flex-wrap: wrap;' },
  { label: 'fl1', detail: 'flex: 1', documentation: 'Flex grow fill remaining space', insertText: 'flex: 1;' },
  { label: 'pos:a', detail: 'position: absolute', documentation: 'Absolute positioning', insertText: 'position: absolute;' },
  { label: 'pos:r', detail: 'position: relative', documentation: 'Relative positioning', insertText: 'position: relative;' },
  { label: 'pos:f', detail: 'position: fixed', documentation: 'Fixed positioning', insertText: 'position: fixed;' },
  { label: 'pos:s', detail: 'position: sticky', documentation: 'Sticky positioning', insertText: 'position: sticky;\ntop: ${1:0};' },
  { label: 'm0a', detail: 'margin: 0 auto', documentation: 'Horizontal auto centering', insertText: 'margin: 0 auto;' },
  { label: 'm10', detail: 'margin: 10px', documentation: 'Margin 10px', insertText: 'margin: 10px;' },
  { label: 'p10', detail: 'padding: 10px', documentation: 'Padding 10px', insertText: 'padding: 10px;' },
  { label: 'p20', detail: 'padding: 20px', documentation: 'Padding 20px', insertText: 'padding: 20px;' },
  { label: 'w100p', detail: 'width: 100%', documentation: 'Full width', insertText: 'width: 100%;' },
  { label: 'h100p', detail: 'height: 100%', documentation: 'Full height', insertText: 'height: 100%;' },
  { label: 'w100vw', detail: 'width: 100vw', documentation: 'Full viewport width', insertText: 'width: 100vw;' },
  { label: 'h100vh', detail: 'height: 100vh', documentation: 'Full viewport height', insertText: 'height: 100vh;' },
  { label: 'bgc', detail: 'background-color: #fff', documentation: 'Background color', insertText: 'background-color: \${1:#ffffff};' },
  { label: 'bdrs', detail: 'border-radius: 8px', documentation: 'Rounded border radius', insertText: 'border-radius: \${1:8px};' },
  { label: 'bdf', detail: 'backdrop-filter: blur(12px)', documentation: 'Glassmorphism blur filter', insertText: 'backdrop-filter: blur(\${1:12px});' },
  { label: 'bs', detail: 'box-shadow: 0 4px 12px rgba(0,0,0,0.1)', documentation: 'Drop shadow', insertText: 'box-shadow: 0 \${1:4px} \${2:12px} rgba(0, 0, 0, \${3:0.15});' },
  { label: 'cur:p', detail: 'cursor: pointer', documentation: 'Pointer cursor', insertText: 'cursor: pointer;' },
  { label: 'tac', detail: 'text-align: center', documentation: 'Centered text', insertText: 'text-align: center;' },
  { label: 'tar', detail: 'text-align: right', documentation: 'Right-aligned text', insertText: 'text-align: right;' },
  { label: 'tal', detail: 'text-align: left', documentation: 'Left-aligned text', insertText: 'text-align: left;' },
  { label: 'fz14', detail: 'font-size: 14px', documentation: 'Font size 14px', insertText: 'font-size: 14px;' },
  { label: 'fz16', detail: 'font-size: 16px', documentation: 'Font size 16px', insertText: 'font-size: 16px;' },
  { label: 'fw700', detail: 'font-weight: 700', documentation: 'Bold font weight', insertText: 'font-weight: 700;' },
  { label: 'fw600', detail: 'font-weight: 600', documentation: 'Semi-bold font weight', insertText: 'font-weight: 600;' },
  { label: 'lh1.5', detail: 'line-height: 1.5', documentation: 'Line height 1.5', insertText: 'line-height: 1.5;' },
  { label: 'ovh', detail: 'overflow: hidden', documentation: 'Overflow hidden', insertText: 'overflow: hidden;' },
  { label: 'ova', detail: 'overflow: auto', documentation: 'Overflow auto scroll', insertText: 'overflow: auto;' },
  { label: 'flex-center', detail: 'Flexbox Center Template', documentation: 'display: flex, justify-content: center, align-items: center', insertText: `display: flex;\njustify-content: center;\nalign-items: center;` },
  { label: 'grid-center', detail: 'Grid Center Template', documentation: 'display: grid, place-items: center', insertText: `display: grid;\nplace-items: center;` },
  { label: 'glassmorphism', detail: 'Glassmorphism Style Template', documentation: 'Translucent glass background with backdrop blur', insertText: `background: rgba(255, 255, 255, 0.08);\nbackdrop-filter: blur(16px);\nborder: 1px solid rgba(255, 255, 255, 0.15);\nborder-radius: 16px;` },
];

const SELF_CLOSING_TAGS = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr']);

// 3. Universal Emmet Expression Tokenizer & Parser
function parseUniversalEmmet(abbr: string, isJsx = false): string | null {
  if (!abbr || abbr.length < 2) return null;
  const classProp = isJsx ? 'className' : 'class';

  // Sibling pattern: tag1+tag2+tag3
  if (abbr.includes('+')) {
    const parts = abbr.split('+');
    const expanded = parts.map((p) => parseSingleEmmetToken(p.trim(), classProp, isJsx)).filter(Boolean);
    if (expanded.length > 0) return expanded.join('\n');
  }

  // Nested hierarchy: parent>child
  if (abbr.includes('>')) {
    const levels = abbr.split('>');
    return buildNestedEmmet(levels, classProp, isJsx);
  }

  return parseSingleEmmetToken(abbr, classProp, isJsx);
}

function parseSingleEmmetToken(token: string, classProp: string, isJsx: boolean): string | null {
  if (!token) return null;

  // Multiplier pattern: e.g. li*4 or div.item*3
  const multMatch = token.match(/^([a-zA-Z0-9_.:#\[\]="'-]+)\*(\d+)$/);
  if (multMatch) {
    const base = multMatch[1];
    const count = parseInt(multMatch[2], 10);
    if (count > 0 && count <= 25) {
      const items: string[] = [];
      for (let i = 1; i <= count; i++) {
        const itemAbbr = base.replace(/\$/g, `${i}`);
        const parsed = parseSingleEmmetToken(itemAbbr, classProp, isJsx);
        if (parsed) items.push(parsed);
      }
      return items.join('\n');
    }
  }

  // Text content pattern: tag{Text Content}
  let textContent: string | null = null;
  const textMatch = token.match(/\{([^}]+)\}/);
  if (textMatch) {
    textContent = textMatch[1];
    token = token.replace(/\{[^}]+\}/, '');
  }

  // Attribute pattern: tag[attr1="val1" attr2="val2"]
  const customAttrs: string[] = [];
  const attrMatch = token.match(/\[([^\]]+)\]/);
  if (attrMatch) {
    const rawAttrs = attrMatch[1];
    token = token.replace(/\[[^\]]+\]/, '');
    customAttrs.push(rawAttrs);
  }

  // Base tag with id and classes: tag#id.class1.class2
  const match = token.match(/^([a-zA-Z][a-zA-Z0-9_-]*)(?:#([a-zA-Z0-9_-]+))?((?:\.[a-zA-Z0-9_-]+)*)$/);
  if (!match) return null;

  const [, rawTag, id, rawClasses] = match;
  const tag = rawTag || 'div';
  const idAttr = id ? ` id="${id}"` : '';
  const classList = rawClasses ? rawClasses.split('.').filter(Boolean).join(' ') : '';
  const classAttr = classList ? ` ${classProp}="${classList}"` : '';
  const otherAttrs = customAttrs.length > 0 ? ` ${customAttrs.join(' ')}` : '';
  const allAttrs = `${idAttr}${classAttr}${otherAttrs}`;

  if (SELF_CLOSING_TAGS.has(tag.toLowerCase())) {
    return isJsx ? `<${tag}${allAttrs} />` : `<${tag}${allAttrs}>`;
  }

  const inner = textContent !== null ? textContent : '\${0}';
  return `<${tag}${allAttrs}>${inner}</${tag}>`;
}

function buildNestedEmmet(levels: string[], classProp: string, isJsx: boolean): string | null {
  if (levels.length === 0) return null;

  let current = levels[levels.length - 1];
  let innerHtml = parseSingleEmmetToken(current.trim(), classProp, isJsx) || '';

  for (let i = levels.length - 2; i >= 0; i--) {
    const parentToken = levels[i].trim();
    const parentParsed = parseSingleEmmetToken(parentToken, classProp, isJsx);
    if (!parentParsed) continue;

    // Insert inner HTML into parent
    const indentedInner = innerHtml.split('\n').map(l => `\t${l}`).join('\n');
    innerHtml = parentParsed.replace(/\$\{0\}/g, `\n${indentedInner}\n`);
  }

  return innerHtml;
}

let isRegistered = false;

export function registerEmmetProviders(m: typeof monaco) {
  if (isRegistered) return;
  isRegistered = true;

  // 1. Web Markup Languages (HTML, Vue, Svelte, PHP, XML, SVG, Handlebars, Twig, Razor, Markdown)
  const markupLanguages = [
    'html',
    'handlebars',
    'php',
    'vue',
    'svelte',
    'xml',
    'svg',
    'markdown',
    'twig',
    'blade',
    'razor',
  ];

  markupLanguages.forEach((lang) => {
    m.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['!', '>', '+', '*', '.', '#', ':', '[', '{'],
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = lineContent.substring(0, position.column - 1);
        const match = textUntilPosition.match(/([a-zA-Z0-9_.:#*+>\[\]"'{}\$-]+)$/);
        const currentWord = match ? match[1] : wordInfo.word;

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: match ? position.column - match[1].length : wordInfo.startColumn,
          endColumn: position.column,
        };

        const suggestions: monaco.languages.CompletionItem[] = [];

        // Static snippets
        HTML_SNIPPETS.forEach((s) => {
          if (!currentWord || s.label.startsWith(currentWord) || s.label === currentWord) {
            suggestions.push({
              label: s.label,
              kind: m.languages.CompletionItemKind.Snippet,
              detail: `⚡ Emmet: ${s.detail}`,
              documentation: { value: `\`\`\`html\n${s.insertText.replace(/\$\{\d+:?([^}]*)\}/g, '$1')}\n\`\`\`\n\n${s.documentation}` },
              insertText: s.insertText,
              insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              sortText: '00_' + s.label,
            });
          }
        });

        // Dynamic universal expansion
        if (currentWord) {
          const dynamicExpanded = parseUniversalEmmet(currentWord, false);
          if (dynamicExpanded) {
            suggestions.unshift({
              label: currentWord,
              kind: m.languages.CompletionItemKind.Snippet,
              detail: `⚡ Emmet: <${currentWord}>`,
              documentation: { value: `\`\`\`html\n${dynamicExpanded.replace(/\$\{\d+:?([^}]*)\}/g, '$1')}\n\`\`\`` },
              insertText: dynamicExpanded,
              insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              sortText: '000_' + currentWord,
            });
          }
        }

        return { suggestions };
      },
    });
  });

  // 2. JavaScript / TypeScript / React JSX & TSX Languages (Auto-uses className)
  const scriptLanguages = [
    'javascript',
    'typescript',
    'javascriptreact',
    'typescriptreact',
  ];

  scriptLanguages.forEach((lang) => {
    m.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['>', '+', '*', '.', '#', '[', '{'],
      provideCompletionItems: (model, position) => {
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = lineContent.substring(0, position.column - 1);
        const match = textUntilPosition.match(/([a-zA-Z0-9_.:#*+>\[\]"'{}\$-]+)$/);
        if (!match) return { suggestions: [] };

        const currentWord = match[1];
        // Only trigger if it contains Emmet operators or known tag prefix
        const isEmmetExpression =
          currentWord.includes('>') ||
          currentWord.includes('+') ||
          currentWord.includes('*') ||
          currentWord.includes('.') ||
          currentWord.includes('#') ||
          currentWord.includes('[') ||
          currentWord.includes('{');

        if (!isEmmetExpression) return { suggestions: [] };

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: position.column - currentWord.length,
          endColumn: position.column,
        };

        const dynamicExpanded = parseUniversalEmmet(currentWord, true);
        if (!dynamicExpanded) return { suggestions: [] };

        return {
          suggestions: [
            {
              label: currentWord,
              kind: m.languages.CompletionItemKind.Snippet,
              detail: `⚡ JSX Emmet: <${currentWord}>`,
              documentation: { value: `\`\`\`tsx\n${dynamicExpanded.replace(/\$\{\d+:?([^}]*)\}/g, '$1')}\n\`\`\`` },
              insertText: dynamicExpanded,
              insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              sortText: '000_' + currentWord,
            },
          ],
        };
      },
    });
  });

  // 3. CSS / SCSS / LESS / Stylus / PostCSS Languages
  const styleLanguages = ['css', 'scss', 'less', 'stylus', 'postcss'];
  styleLanguages.forEach((lang) => {
    m.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: [':', '-', 'f', 'd', 'p', 'm', 'w', 'h', 'b', 'j', 'a', 'g', 'c'],
      provideCompletionItems: (model, position) => {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = CSS_SNIPPETS.map((s) => ({
          label: s.label,
          kind: m.languages.CompletionItemKind.Snippet,
          detail: `⚡ CSS Emmet: ${s.detail}`,
          documentation: { value: `\`\`\`css\n${s.insertText}\n\`\`\`\n\n${s.documentation}` },
          insertText: s.insertText,
          insertTextRules: m.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          sortText: '00_' + s.label,
        }));

        return { suggestions };
      },
    });
  });
}
