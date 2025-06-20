export function renderMarkdownToHtml(markdown) {
    const lines = markdown.split('\n');
    const html_lines = [];

    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        // 코드 블록 처리
        if (line.startsWith('```')) {
            const { html, nextIndex } = convertCodeBlockToHtml(lines, i);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        // Table 처리
        if (i + 1 < lines.length && isTableStart(lines, i)) {
            const { html, nextIndex } = convertTableToHtml(lines, i);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        // Ordered list 처리 (1. 2. 3. ...)
        if (/^\d+\.\s+/.test(line)) {
            const { html, nextIndex } = convertListToHtml(lines, i, true);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        // Unordered list 처리 (- , * , +)
        if (/^[-*+]\s+/.test(line)) {
            const { html, nextIndex } = convertListToHtml(lines, i, false);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        // Blockquote
        if (/^>\s?.*/.test(line)) {
            const { html, nextIndex } = convertBlockquoteToHtml(lines, i);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        // 헤더 처리
        const headerHtml = convertHeaderToHtml(lines[i]);
        if (headerHtml !== null) {
            html_lines.push(headerHtml);
            i++;
            continue;
        }

        // 단락 처리
        const paragraphHtml = convertParagraphToHtml(lines[i]);
        if (paragraphHtml !== null) {
            html_lines.push(paragraphHtml);
        }

        i++;
    }

    return html_lines.join('\n');
}

// Escape HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Font 변환 (bold, italic, code 등 포함)
function convertFontToHtml(text) {
    if (!text) return text;

    // Bold + Italic
    text = text.replace(/(\*\*\*|___)(.+?)\1/g, (_, wrapper, content) => `<strong><em>${content}</em></strong>`);
    // Bold
    text = text.replace(/(\*\*|__)(.+?)\1/g, (_, wrapper, content) => `<strong>${content}</strong>`);
    // Italic
    text = text.replace(/(\*|_)([^*_]+?)\1/g, (_, wrapper, content) => `<em>${content}</em>`);
    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, (_, content) => `<del>${content}</del>`);

    // Inline code
    const inlineCodeStyle = `
        background-color: #f0f0f0;
        color: #d14;
        font-family: 'Fira Mono', Consolas, 'Courier New', monospace;
        font-size: 0.9em;
        padding: 2px 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
        white-space: nowrap;
    `.replace(/\s+/g, ' ').trim();

    text = text.replace(/`([^`\n]+)`/g, (_, content) => `<code style="${inlineCodeStyle}">${content}</code>`);

    return text;
}

// Header
function convertHeaderToHtml(line) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
        const level = match[1].length;
        const content = convertFontToHtml(escapeHtml(match[2]));
        return `<h${level}>${content}</h${level}>`;
    }
    return null;
}

// List
function convertListToHtml(lines, startIndex, ordered) {
    const items = [];
    let i = startIndex;
    const regex = ordered ? /^(\d+)\.\s+(.*)/ : /^[-*+]\s+(.*)/;

    while (i < lines.length) {
        const match = lines[i].match(regex);
        if (!match) break;
        const content = ordered ? match[2] : match[1];
        const htmlContent = convertFontToHtml(escapeHtml(content));
        items.push(`<li>${htmlContent}</li>`);
        i++;
    }

    const tag = ordered ? 'ol' : 'ul';
    return {
        html: `<${tag}>\n${items.join('\n')}\n</${tag}>`,
        nextIndex: i
    };
}

// Blockquote
function convertBlockquoteToHtml(lines, startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
        const match = lines[i].match(/^>\s?(.*)/);
        if (!match) break;
        const content = convertFontToHtml(escapeHtml(match[1]));
        items.push(content);
        i++;
    }

    const html = `<blockquote>${items.join('<br>\n')}</blockquote>`;
    return { html, nextIndex: i };
}

// Code Block
function convertCodeBlockToHtml(lines, startIndex) {
    const openingLine = lines[startIndex].trim();
    const languageMatch = openingLine.match(/^```(\w+)?/);
    const languageClass = languageMatch?.[1] ? ` language-${languageMatch[1]}` : '';

    const codeLines = [];
    let i = startIndex + 1;
    let closed = false;

    while (i < lines.length) {
        if (/^```/.test(lines[i].trim())) {
            closed = true;
            break;
        }
        codeLines.push(escapeHtml(lines[i]));
        i++;
    }

    const codeContent = codeLines.join('\n');

    const preStyle = `
        background-color: #f5f5f5;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        border-radius: 8px;
    `.replace(/\s+/g, ' ').trim();

    const codeStyle = `
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 0.95rem;
        line-height: 1.5;
        color: #333;
        white-space: pre-wrap;
        tab-size: 2;
    `.replace(/\s+/g, ' ').trim();

    return {
        html: `<pre style="${preStyle}"><code class="${languageClass.trim()}" style="${codeStyle}">${codeContent}</code></pre>`,
        nextIndex: closed ? i + 1 : i
    };
}

// Paragraph
function convertParagraphToHtml(line) {
    if (line.trim() === '') return null;
    const content = convertFontToHtml(escapeHtml(line));
    return `<p>${content}</p>`;
}

// Table 관련 함수들
function isTableStart(lines, index) {
    const header = lines[index];
    const separator = lines[index + 1];
    return (
        /^\|?(.+\|)+.*$/.test(header) &&
        /^\|?([:\-]+?\|)+.*$/.test(separator)
    );
}

function convertTableToHtml(lines, startIndex) {
    const rows = [];
    let i = startIndex;

    while (i < lines.length && /^\|?(.+\|)+.*$/.test(lines[i])) {
        rows.push(lines[i]);
        i++;
    }

    const headerCells = splitTableRow(rows[0]);
    const alignments = parseAlignments(rows[1]);

    const tableStyle = `
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
        font-size: 0.95rem;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `.replace(/\s+/g, ' ').trim();

    const thBaseStyle = `
        background-color: #f2f2f2;
        font-weight: bold;
        padding: 8px;
        border: 1px solid #ccc;
    `.replace(/\s+/g, ' ').trim();

    const tdBaseStyle = `
        padding: 8px;
        border: 1px solid #ccc;
    `.replace(/\s+/g, ' ').trim();

    // 헤더 (첫 번째 행 전체 무조건 가운데 정렬)
    const headerHtml = headerCells.map(cell => {
        const style = `${thBaseStyle} text-align: center;`;
        return `<th style="${style}">${escapeHtml(cell.trim())}</th>`;
    }).join('');

    // 본문 (첫 번째 열은 무조건 가운데 정렬)
    const bodyRows = rows.slice(2).map(row => {
        const cells = splitTableRow(row);
        return `<tr>${cells.map((cell, j) => {
            const align = j === 0 ? 'center' : (alignments[j] || 'left');
            const style = `${tdBaseStyle} text-align: ${align};`;
            return `<td style="${style}">${escapeHtml(cell.trim())}</td>`;
        }).join('')}</tr>`;
    }).join('\n');

    const html = `
        <table style="${tableStyle}">
            <thead><tr>${headerHtml}</tr></thead>
            <tbody>${bodyRows}</tbody>
        </table>
    `.trim();

    return { html, nextIndex: i };
}


function splitTableRow(line) {
    return line.trim().replace(/^(\|)/, '').replace(/(\|)$/, '').split('|');
}

function parseAlignments(line) {
    return splitTableRow(line).map(cell => {
        const trimmed = cell.trim();
        if (/^:-+:$/.test(trimmed)) return 'center';
        if (/^-+:$/.test(trimmed)) return 'right';
        if (/^:-+$/.test(trimmed)) return 'left';
        return 'left';
    });
}
