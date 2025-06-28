import { loadMarkdown } from './markdown-loader.js';

document.addEventListener('DOMContentLoaded', () => {
    const postListEl = document.getElementById('post-list');
    const contentEl = document.getElementById('content');

    fetch('./posts-meta.json')
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch JSON");
            return response.json();
        })
        .then(posts => {
            postListEl.style.display = 'block';
            contentEl.style.display = 'none';

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

            const links = document.querySelectorAll('.post-link');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    const path = link.getAttribute('data-path');
                    loadMarkdown(path, contentEl, postListEl);
                });
            });

            const urlParams = new URLSearchParams(window.location.search);
            const initialPath = urlParams.get('path');
            if (initialPath) {
                loadMarkdown(initialPath, contentEl, postListEl, { skipPushState: true });
            }
        })
        .catch(error => {
            postListEl.innerHTML = '<p style="color: red;">Failed to load post list.</p>';
            console.error(error);
        });

    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');

        if (path) {
            loadMarkdown(path, contentEl, postListEl, { skipPushState: true });
        } else {
            postListEl.style.display = 'block';
            contentEl.style.display = 'none';
            contentEl.innerHTML = '';
        }
    });
});
