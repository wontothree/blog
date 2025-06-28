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

        // Horizontal Rule 처리
        const hrHtml = convertHorizontalRuleToHtml(lines[i]);
        if (hrHtml !== null) {
            html_lines.push(hrHtml);
            i++;
            continue;
        }

        // Table 시작인지 확인하는 변수 (직관적으로 변수명으로 표현)
        const isTableHeader = /^\|?(.+\|)+.*$/.test(lines[i]);
        const isTableSeparator = i + 1 < lines.length && /^\|?([:\-]+?\|)+.*$/.test(lines[i + 1]);

        if (isTableHeader && isTableSeparator) {
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
        if (line !== '') {
            const content = convertInlineMarkdownToHtml(escapeHtml(line));
            html_lines.push(`<p>${content}</p>`);
        }

        i++;
    }

    return html_lines.join('\n');
}

// --------------------------------------------------

// util functions

// Escape HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// --------------------------------------------------

// Inline Level Grammar
function convertInlineMarkdownToHtml(text) {
    if (!text) return text;

    // 이미지: ![alt_text](url)
    text = text.replace(/!\[([^\]]*?)\]\(([^)]+?)\)/g, (_, alt, url) => {
        const escapedAlt = escapeHtml(alt);
        const escapedUrl = escapeHtml(url);
        return `<img src="${escapedUrl}" alt="${escapedAlt}">`;
    });

    // 링크: [title](url)
    text = text.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, (_, title, url) => {
        const escapedTitle = escapeHtml(title);
        const escapedUrl = escapeHtml(url);
        return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${escapedTitle}</a>`;
    });

    // Bold + Italic (***) or (___)
    text = text.replace(/(\*\*\*|___)(.+?)\1/g, (_, wrapper, content) => `<strong><em>${content}</em></strong>`);
    // Bold (** or __)
    text = text.replace(/(\*\*|__)(.+?)\1/g, (_, wrapper, content) => `<strong>${content}</strong>`);
    // Italic (* or _)
    text = text.replace(/(\*|_)([^*_]+?)\1/g, (_, wrapper, content) => `<em>${content}</em>`);

    // Strikethrough
    text = text.replace(/~~(.+?)~~/g, (_, content) => `<del>${content}</del>`);

    // Inline code
    const inlineCodeStyle = `
        background-color: #1e1e1e;
        font-family: 'Fira Mono', Consolas, 'Courier New', monospace;
        font-size: 0.9em;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
    `.replace(/\s+/g, ' ').trim();

    text = text.replace(/`([^`\n]+)`/g, (_, content) => `<code style="${inlineCodeStyle}">${content}</code>`);

    return text;
}

// --------------------------------------------------

// Header
let firstHeaderProcessed = false;
function convertHeaderToHtml(line) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
        const level = match[1].length;
        const content = convertInlineMarkdownToHtml(escapeHtml(match[2]));

        if (level === 1) {
            if (!firstHeaderProcessed) {
                firstHeaderProcessed = true;
                return `<h1>${content}</h1><br><hr>`;
            } else {
                return `<br><br><br><h1>${content}</h1><hr>`;
            }
        } else if (level === 2) {
            return `<br><br><h2>${content}</h2>`;
        } else {
            return `<h${level}>${content}</h${level}>`;
        }
    }
    return null;
}

// List
function convertListToHtml(lines, startIndex, ordered) {
    const items = [];
    let i = startIndex;
    const regex = ordered ? /^(\d+)\.\s+(.*)/ : /^[-*+]\s+(.*)/;
    let isTaskList = true;

    while (i < lines.length) {
        const match = lines[i].match(regex);
        if (!match) break;

        const content = ordered ? match[2] : match[1];
        const taskMatch = content.match(/^\[([ xX])\]\s+(.*)/);
        let htmlContent;

        if (taskMatch) {
            const checked = taskMatch[1].toLowerCase() === 'x';
            const taskText = convertInlineMarkdownToHtml(escapeHtml(taskMatch[2]));

            // 기본 checkbox 숨기고, 체크 표시를 span으로 직접 넣기
            htmlContent = `
                <label class="task-item" style="display:flex; align-items:center; gap:0.5em; cursor:default;">
                    <span style="
                        display:inline-block; 
                        width:1.2em; 
                        height:1.2em; 
                        border:2px; 
                        border-radius:4px; 
                        background-color:white;
                        text-align:center;
                        line-height:1.1em;
                        font-weight:bold;
                        color: ${checked ? '#4CAF50' : 'transparent'};
                        user-select:none;
                    ">${checked ? '✓' : ''}</span>
                    <span>${taskText}</span>
                </label>
            `.trim();
        } else {
            isTaskList = false;
            htmlContent = convertInlineMarkdownToHtml(escapeHtml(content));
        }

        items.push(`<li>${htmlContent}</li>`);
        i++;
    }

    const tag = ordered ? 'ol' : 'ul';
    // ul, ol에 직접 인라인 스타일로 list-style:none 지정해서 기호 없앰
    const styleAttr = (!ordered && isTaskList) ? ' style="list-style:none; padding-left:0; margin:1em 0;"' : '';

    return {
        html: `<${tag}${styleAttr}>\n${items.join('\n')}\n</${tag}>`,
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
        const content = convertInlineMarkdownToHtml(escapeHtml(match[1]));
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
        background-color: #1e1e1e;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        border-radius: 8px;
    `.replace(/\s+/g, ' ').trim();

    const codeStyle = `
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 0.95rem;
        line-height: 1.5;
        color: #d4d4d4;
        white-space: pre-wrap;
        tab-size: 2;
    `.replace(/\s+/g, ' ').trim();

    return {
        html: `<pre style="${preStyle}"><code class="${languageClass.trim()}" style="${codeStyle}">${codeContent}</code></pre>`,
        nextIndex: closed ? i + 1 : i
    };
}

// Horizontal Rule
function convertHorizontalRuleToHtml(line) {
    // 수평선 조건: -, *, _이 최소 3번 이상 연속되고, 다른 문자가 없어야 함
    if (/^ {0,3}(([-*_])\s?){3,}$/.test(line)) {
        return '<hr>';
    }
    return null;
}

// Table
function convertTableToHtml(lines, startIndex) {
    const rows = [];
    let i = startIndex;

    while (i < lines.length && /^\|?(.+\|)+.*$/.test(lines[i])) {
        rows.push(lines[i]);
        i++;
    }

    const splitTableRow = (line) => {
        return line.trim().replace(/^(\|)/, '').replace(/(\|)$/, '').split('|');
    };

    const parseAlignments = (line) => {
        return splitTableRow(line).map(cell => {
            const trimmed = cell.trim();
            if (/^:-+:$/.test(trimmed)) return 'center';
            if (/^-+:$/.test(trimmed)) return 'right';
            if (/^:-+$/.test(trimmed)) return 'left';
            return 'left';
        });
    };

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
        font-weight: bold;
        padding: 8px;
        border: 1px solid #ccc;
    `.replace(/\s+/g, ' ').trim();

    const tdBaseStyle = `
        padding: 8px;
        border: 1px solid #ccc;
    `.replace(/\s+/g, ' ').trim();

    const headerHtml = headerCells.map(cell => {
        const style = `${thBaseStyle} text-align: center;`;
        const content = convertInlineMarkdownToHtml(escapeHtml(cell.trim()));
        return `<th style="${style}">${content}</th>`;
    }).join('');

    const bodyRows = rows.slice(2).map(row => {
        const cells = splitTableRow(row);
        return `<tr>${cells.map((cell, j) => {
            const align = j === 0 ? 'center' : (alignments[j] || 'left');
            const style = `${tdBaseStyle} text-align: ${align};`;
            const content = convertInlineMarkdownToHtml(escapeHtml(cell.trim()));
            return `<td style="${style}">${content}</td>`;
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
