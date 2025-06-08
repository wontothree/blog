/**
 * 간단한 마크다운 문자열을 HTML로 변환하는 함수
 * - #, ##, ### 헤더 지원
 * - 그 외는 <p> 문단으로 변환
 * @param {string} markdown - 마크다운 문자열
 * @returns {string} HTML 문자열
 */
function parseMarkdownToHtml(markdown) {
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
    module.exports = { parseMarkdownToHtml };
}

// --------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const postListEl = document.getElementById('post-list');
    const contentEl = document.getElementById('content');

    // 게시글 목록 불러오기
    fetch('./posts-meta.json')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch JSON");
            return response.json();
        })
        .then(posts => {
            postListEl.style.display = 'block';
            contentEl.style.display = 'none';

            // 목록 생성
            postListEl.innerHTML = posts.map((post, index) => {
                const title = post.title;
                const date = post.date;
                const folder = post.folder;
                const lang = post.language;
                const filePath = `posts/${folder}/${date}-${lang}.md`;

                return `
                    <div class="post-link" data-path="${filePath}" style="cursor: pointer; display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>${title}</span>
                        <span style="font-weight: normal;">${date}</span>
                    </div>
                `;
            }).join('\n');

            // 각 게시글 클릭 이벤트 추가
            const links = document.querySelectorAll('.post-link');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    const path = link.getAttribute('data-path');
                    loadMarkdown(path);
                });
            });

            // 주소에 path 파라미터가 있다면 자동 로딩
            const urlParams = new URLSearchParams(window.location.search);
            const initialPath = urlParams.get('path');
            if (initialPath) {
                loadMarkdown(initialPath);
            }
        })
        .catch(err => {
            postListEl.innerHTML = '<p style="color: red;">Failed to load post list.</p>';
            console.error(err);
        });

    // 마크다운 로딩 함수
    function loadMarkdown(path) {
        postListEl.style.display = 'none';
        contentEl.style.display = 'block';
        contentEl.innerHTML = '<p>Loading...</p>';

        // 주소창 path 갱신 (리로드 없이)
        const newUrl = `${window.location.pathname}?path=${encodeURIComponent(path)}`;
        window.history.pushState({}, '', newUrl);

        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error("Failed to load Markdown");
                return response.text();
            })
            .then(md => {
                const html = parseMarkdownToHtml(md); // 마크다운 파싱 함수 필요
                contentEl.innerHTML = html;
            })
            .catch(err => {
                contentEl.innerHTML = '<p style="color: red;">Markdown file not found.</p>';
                console.error(err);
            });
    }
});
