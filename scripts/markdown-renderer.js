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

// --------------------------------------------------

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// font 변환: 볼드, 이탤릭, 취소선 등
function convertFontToHtml(text) {
    if (!text) return text;

    // 1) Bold + Italic: ***text*** or ___text___
    text = text.replace(/(\*\*\*|___)(.+?)\1/g, (_, wrapper, content) => {
        return `<strong><em>${content}</em></strong>`;
    });

    // 2) Bold: **text** or __text__
    text = text.replace(/(\*\*|__)(.+?)\1/g, (_, wrapper, content) => {
        return `<strong>${content}</strong>`;
    });

    // 3) Italic: *text* or _text_
    text = text.replace(/(\*|_)([^*_]+?)\1/g, (_, wrapper, content) => {
        return `<em>${content}</em>`;
    });

    // 4) Strikethrough: ~~text~~
    text = text.replace(/~~(.+?)~~/g, (_, content) => {
        return `<del>${content}</del>`;
    });

    // 5) 밑줄: <u>text</u>는 마크다운 문법이 아님, HTML 태그 그대로 유지

    return text;
}

// header 처리
function convertHeaderToHtml(line) {
    const match = line.match(/^(#{1,6})\s+(.*)/);
    if (match) {
        const level = match[1].length;
        // escapeHtml 먼저 적용 후 convertFontToHtml 적용
        const content = convertFontToHtml(escapeHtml(match[2]));
        return `<h${level}>${content}</h${level}>`;
    }
    return null;
}

// 리스트 처리 (ordered: true -> <ol>, false -> <ul>)
function convertListToHtml(lines, startIndex, ordered) {
    const items = [];
    let i = startIndex;
    const regex = ordered ? /^(\d+)\.\s+(.*)/ : /^[-*+]\s+(.*)/;

    while (i < lines.length) {
        const match = lines[i].match(regex);
        if (!match) break;

        // ordered 리스트는 두 번째 그룹이 내용, unordered는 첫 번째 그룹이 내용
        const content = ordered ? match[2] : match[1];

        // escapeHtml 후 font 변환
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

// 코드 블록 처리
function convertCodeBlockToHtml(lines, startIndex) {
    const codeLines = [];
    let i = startIndex + 1;

    while (i < lines.length && !/^```/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
    }

    return {
        html: `<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`,
        nextIndex: i + 1
    };
}

// 단락 처리
function convertParagraphToHtml(line) {
    if (line.trim() === '') return null;

    // escapeHtml 먼저, 그다음 convertFontToHtml 적용
    const content = convertFontToHtml(escapeHtml(line));
    return `<p>${content}</p>`;
}
