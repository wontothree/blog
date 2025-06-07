/**
 * 간단한 마크다운 문자열을 HTML로 변환하는 함수
 * - #, ##, ### 헤더 지원
 * - 그 외는 <p> 문단으로 변환
 * @param {string} markdown - 마크다운 문자열
 * @returns {string} HTML 문자열
 */
function parse_markdown_to_html(markdown) {
    // md file에서 줄 단위로 입력받는다.
    const lines = markdown.split('\n');
    const html_lines = lines.map(line => {

    // 제목
    if (/^###\s+(.*)/.test(line)) {
        const match = line.match(/^###\s+(.*)/);
        return `<h3>${match[1]}</h3>`;
    } else if (/^##\s+(.*)/.test(line)) {
        const match = line.match(/^##\s+(.*)/);
        return `<h2>${match[1]}</h2>`;
    } else if (/^#\s+(.*)/.test(line)) {
        const match = line.match(/^#\s+(.*)/);
        return `<h1>${match[1]}</h1>`;
    } else {
        return `<p>${line}</p>`;
    }

    });

    // 빈 문자열 제거 후 합치기
    return html_lines.filter(Boolean).join('\n');
}

// export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parse_markdown_to_html };
}