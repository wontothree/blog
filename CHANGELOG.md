# Development Log

## *04/23/2025*

add header and footer

## *04/29/2025*

move uos folder from route path to posts folder

Concept of this page is for showing Sewon Kim as Engineer.

## *05/16/2025*

Before

```html
<a href="https://github.com/wontothree">
    <div>Github</div>
</a>
```

After

```html
<a href="https://github.com/wontothree" aria-label="Github of Anthony Garcia" target="_blank" rel="noopener noreferrer">Github</a>
```

- aria-label="Github of Anthony Garcia" : there's no difference from before, but it's for screen reader.
- target="_blank" : open the link in new tab.
- rel="noopener noreferrer" : for scurity.

## *06/07/2025*

1. add folder "techblog"
2. markdown to html parser

assets/parser.js를 작성한다.

client가 index.html에서 fetch로 .md 읽어 JS로 변환 후 렌더링한다.

목표: folder posts에는 제목에 해당하는 폴더와 그 안에 md 파일만이 있다. 이를 미리 html 파일로 생성하지 않고 알아서 html로 변환한다.

techblog의 root 경로에 있는 index.html 하나로 모든 글을 rendering하자.

## *06/08/2025*

>Problem: 개발한 web을 직접 확인하고 싶을 때마다 push를 해서 배포해봐야만 한다.

HTML을 다음과 같이 작성한다.

```html
<a href="?path=making-personal-blog">
    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <span>Markdown, LaTeX, and HTML</span>
        <span style="font-weight: normal;">2025-06-08</span>
    </div>
</a>
```

이때 다음과 같은 js 코드로 fetching을 할 수 있다.

```js
if (path) {
    const contentEl = document.getElementById('content');
    const postListEl = document.getElementById('post-list');

    contentEl.style.display = 'block';
    postListEl.style.display = 'none';
    contentEl.innerHTML = '<p>Loading...</p>';

    fetch(`./posts/${path}/index.md`)
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
```

다음과 같은 코드를 작성하려고 하면 문제가 생긴다.

```js
document.addEventListener('DOMContentLoaded', () => {

    // 게시글 목록 보여주기
    fetch('./posts-meta.json')
    .then(response => {
        if (!response.ok) throw new Error("Failed to fetch JSON");

        // json 객체로 parsing
        return response.json();
    })
    .then(posts => {
        const postListEl = document.getElementById('post-list');
        const contentEl = document.getElementById('content');

        postListEl.style.display = 'block';
        contentEl.style.display = 'none';

        postListEl.innerHTML = posts.map(post => {
            const title = post.title;
            const date = post.date;
            const folder = post.folder;
            const lang = post.language;

            // const url = "./posts/making-personal-blog/2025-06-08-ko.md";
            const url = `?path=${folder}/${date}-${lang}.md`;
            // const url = `./posts/${folder}/${date}-${lang}.md`;
            // const url = "?path=posts/making-personal-blog/2025-06-08-ko.md";

            return `
                <a href="${url}">
                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                        <span>${title}</span>
                        <span style="font-weight: normal;">${date}</span>
                    </div>
                </a>
            `;
        }).join('\n');
    })
    .catch(err => {
        const postListEl = document.getElementById('post-list');
        postListEl.innerHTML = '<p style="color: red;">Failed to load post list.</p>';
        console.error(err);
    });


    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path');

    if (path) {
        const contentEl = document.getElementById('content');
        const postListEl = document.getElementById('post-list');

        contentEl.style.display = 'block';
        postListEl.style.display = 'none';
        contentEl.innerHTML = '<p>Loading...</p>';

        fetch(`${path}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load Markdown");
            return response.text();
        })
        .then(md => {
            // parseMarkdownToHtml 함수는 직접 구현하거나 외부 라이브러리 사용
            const html = parseMarkdownToHtml(md);
            contentEl.innerHTML = html;
        })
        .catch(err => {
            contentEl.innerHTML = '<p style="color: red;">Markdown file not found.</p>';
            console.error(err);
        });
    }
});
```
