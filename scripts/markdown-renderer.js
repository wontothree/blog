function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// 헤더 라인 파싱 함수
// 헤더 문법(#, ##, ###)에 맞으면 HTML 태그로 변환, 아니면 null 반환
function convertHeaderToHtml(line) {
    let match;
    if (match = line.match(/^###\s+(.*)/)) {
        return `<h3>${escapeHtml(match[1])}</h3>`;
    } else if (match = line.match(/^##\s+(.*)/)) {
        return `<h2>${escapeHtml(match[1])}</h2>`;
    } else if (match = line.match(/^#\s+(.*)/)) {
        return `<h1>${escapeHtml(match[1])}</h1>`;
    } else {
        return null;
    }
}

function convertOrderedListToHtml(lines, startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length) {
        const match = lines[i].match(/^(\d+)\.\s+(.*)/);
        if (!match) break;
        items.push(`<li>${escapeHtml(match[2])}</li>`);
        i++;
    }

    return {
        html: `<ol>\n${items.join('\n')}\n</ol>`,
        nextIndex: i
    };
}

function convertCodeBlockToHtml(lines, startIndex) {
    const codeLines = [];
    let i = startIndex + 1;

    while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
    }

    return {
        html: `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
        nextIndex: i + 1  // 다음 줄로 이동
    };
}

function convertParagraphToHtml(line) {
    if (line.trim() === '') return null;
    return `<p>${escapeHtml(line)}</p>`;
}

export function renderMarkdownToHtml(markdown) {
    const lines = markdown.split('\n');
    const html_lines = [];

    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        if (line.startsWith('```')) {
            const { html, nextIndex } = convertCodeBlockToHtml(lines, i);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        if (/^\d+\.\s+/.test(line)) {
            const { html, nextIndex } = convertOrderedListToHtml(lines, i);
            html_lines.push(html);
            i = nextIndex;
            continue;
        }

        const headerHtml = convertHeaderToHtml(lines[i]);
        if (headerHtml !== null) {
            html_lines.push(headerHtml);
            i++;
            continue;
        }

        const paragraphHtml = convertParagraphToHtml(lines[i]);
        if (paragraphHtml !== null) {
            html_lines.push(paragraphHtml);
        }

        i++;
    }

    return html_lines.join('\n');
}
