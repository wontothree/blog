function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function parseMarkdownToHtml(markdown) {
    const lines = markdown.split('\n');
    const html_lines = [];

    let inOrderedList = false;
    let inCodeBlock = false;
    let codeBlockLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 코드블록 시작/종료 체크 (``` 또는 ```뒤에 언어명 포함 가능)
        if (/^```/.test(line.trim())) {
            if (!inCodeBlock) {
                // 코드블록 시작
                inCodeBlock = true;
                codeBlockLines = [];
            } else {
                // 코드블록 종료
                inCodeBlock = false;
                html_lines.push('<pre><code>' + escapeHtml(codeBlockLines.join('\n')) + '</code></pre>');
            }
            continue;  // 코드블록 구분선 자체는 출력하지 않음
        }

        if (inCodeBlock) {
            // 코드블록 내부는 그대로 저장만, 파싱 안함
            codeBlockLines.push(line);
            continue;
        }

        // 번호 리스트 처리
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

        // 제목 처리
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

    // 닫히지 않은 리스트 닫기
    if (inOrderedList) {
        html_lines.push('</ol>');
    }

    // 닫히지 않은 코드블록 처리 (안 닫혔으면 강제로 닫기)
    if (inCodeBlock) {
        html_lines.push('<pre><code>' + escapeHtml(codeBlockLines.join('\n')) + '</code></pre>');
    }

    return html_lines.join('\n');
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
            postListEl.innerHTML = posts.map(post => {
                const title = post.title;
                const date = post.date;
                const folder = post.folder;
                const lang = post.language;
                const filePath = `posts/${folder}/${date}-${lang}.md`;

                return `
                    <div class="post-link" data-path="${filePath}" style="cursor: pointer; display: flex; justify-content: space-between; white-space: nowrap; margin: 5px 0;">
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
                loadMarkdown(initialPath, false);
            }
        })
        .catch(error => {
            postListEl.innerHTML = '<p style="color: red;">Failed to load post list.</p>';
            console.error(error);
        });

    // 뒤로 가기(또는 앞으로 가기) 했을 때 페이지 전환 처리
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');

        if (path) {
            loadMarkdown(path, true); // popstate에선 history 추가 X
        } else {
            // 목록 화면으로 전환
            postListEl.style.display = 'block';
            contentEl.style.display = 'none';
            contentEl.innerHTML = '';
        }
    });
        


    // 마크다운 로딩 함수
    function loadMarkdown(path, skipPushState = false) {
        postListEl.style.display = 'none';
        contentEl.style.display = 'block';
        contentEl.innerHTML = '<p>Loading...</p>';

        // 주소창 갱신: popstate일 때는 pushState 하지 말 것!
        if (!skipPushState) {
            const newUrl = `${window.location.pathname}?path=${encodeURIComponent(path)}`;
            window.history.pushState({}, '', newUrl);
        }

        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error("Failed to load Markdown");
                return response.text();
            })
            .then(md => {
                const html = parseMarkdownToHtml(md);
                contentEl.innerHTML = html;
            })
            .catch(err => {
                contentEl.innerHTML = '<p style="color: red;">Markdown file not found.</p>';
                console.error(err);
            });
    }

});


// // export module
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = { parseMarkdownToHtml };
// }