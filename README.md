# Simple Blog

No dependencies (no framework, no library), just varnila javascript, html, and css.

    wontothree.github.io/blog
    ├── posts                                  # articles
    │   ├── realistic-goal-in-the-military
    │   │   └── 2025-06-10-ko.md
    │   └── sewon-kim-and-anthony-garcia
    │       └── 2025-06-10-ko.md
    │
    ├── scripts
    │   ├── main.js
    │   ├── postLoader.js
    │   └── renderMarkdownToHtml.js
    │
    ├── styles
    │   └── index.css
    │
    ├── index.html                             # single page application
    └── posts-meta.json                        # post meta data (title, date, url, etc)

# Getting Started

## Posting

1. `posts/` 경로에 게시물 제목을 폴더명으로 폴더를 생성한다. 이때 폴더명은 영어로 하며 띄워쓰기는 hyphen으로 대체한다. 그러면 이 폴더명을 url로 갖는 게시물 링크가 blog에 자동으로 생성된다. e.g. `sewon-kim-and-anthony-garcia`
2. 게시물 폴더에 `2025-07-09-ko.md` 와 같이 블로그 작성 날짜와 블로그 작성 언어를 조합하여 markdown 파일을 생성한다. 이때 날짜는 `YYYY-MM-DD` 양식의 국제 규격 `ISO 8601`을 따른다.
3. Root 경로에 있는 `post-meta.json` 파일 가장 상단에 데이터를 다음과 같이 작성한다. `post-meta.json` 에서 상위에 있을수록 blog post list에서 상위에 노출된다.

```json
[
  {
    "folder": "sewon-kim-and-anthony-garcia",
    "filename": "2025-06-10-en.md",
    "title": "김세원과 Anthony Garcia",
    "date": "2025-06-10",
    "language": "en"
  }
]
```

## Local server: [http://localhost:8000](http://localhost:8000)

```bash
python -m http.server 8000
```

# To do

* [ ] engine parsing markdown to html
* [ ] 특정 폴더에 markdown file만 생성하면 자동으로 새 글이 게시되도록 하기
