import { renderMarkdownToHtml } from './markdown-renderer.js';

export function loadMarkdown(path, contentEl, postListEl, options = {}) {
    const { skipPushState = false, profileBoxSelector = '#profile' } = options;

    postListEl.style.display = 'none';
    contentEl.style.display = 'block';
    contentEl.innerHTML = '<p>Loading...</p>';

    // profile 숨기기
    const profileBox = document.querySelector(profileBoxSelector);
    if (profileBox) profileBox.style.display = 'none';

    // 주소창 갱신
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
            const html = renderMarkdownToHtml(md);
            contentEl.innerHTML = html;
        })
        .catch(err => {
            contentEl.innerHTML = '<p style="color: red;">Markdown file not found.</p>';
            console.error(err);
        });
}
