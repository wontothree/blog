export function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function renderMarkdownToHtml(markdown) {
    const lines = markdown.split('\n');
    const html_lines = [];

    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBlockLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^```/.test(line.trim())) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeBlockLines = [];
            } else {
                inCodeBlock = false;
                html_lines.push('<pre><code>' + escapeHtml(codeBlockLines.join('\n')) + '</code></pre>');
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockLines.push(line);
            continue;
        }

        const olMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (olMatch) {
            if (!inOrderedList) {
                inOrderedList = true;
                html_lines.push('<ol>');
            }
            html_lines.push(`<li>${escapeHtml(olMatch[2])}</li>`);
            continue;
        } else {
            if (inOrderedList) {
                html_lines.push('</ol>');
                inOrderedList = false;
            }
        }

        if (/^###\s+(.*)/.test(line)) {
            const match = line.match(/^###\s+(.*)/);
            html_lines.push(`<h3>${escapeHtml(match[1])}</h3>`);
        } else if (/^##\s+(.*)/.test(line)) {
            const match = line.match(/^##\s+(.*)/);
            html_lines.push(`<h2>${escapeHtml(match[1])}</h2>`);
        } else if (/^#\s+(.*)/.test(line)) {
            const match = line.match(/^#\s+(.*)/);
            html_lines.push(`<h1>${escapeHtml(match[1])}</h1>`);
        } else {
            if (line.trim() !== '') {
                html_lines.push(`<p>${escapeHtml(line)}</p>`);
            }
        }
    }

    if (inOrderedList) {
        html_lines.push('</ol>');
    }

    if (inCodeBlock) {
        html_lines.push('<pre><code>' + escapeHtml(codeBlockLines.join('\n')) + '</code></pre>');
    }

    return html_lines.join('\n');
}
