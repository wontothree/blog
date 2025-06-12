# Simple Pages

Garcia's hub pages and career pages using no dependencies (no framework, no library), just varnila javascript, html, and css.

It include parsing engine from Markdown and LaTex to HTML.

    wontothree.github.io
    ├── blog
    │   ├── roka
    │   │   ├── imgs
    │   │   ├── index.css
    |   │   └── index.html
    |   │
    │   └── index.js.map
    │
    ├── career
    │   │   ├── imgs
    │   │   ├── posts
    |   │   │   └── uos
    |   |   │       ├── index.css
    |   |   |       └── index.html
    |   │   │
    │   │   ├── index.css
    |   │   └── index.html
    |
    ├── imgs
    ├── index.css
    └── index.html

# Getting Started

## Posting

1. `posts/` 경로에 게시물 제목으로 폴더를 생성한다. 이때 띄어쓰기는 hyphen으로 대체한다. 그러면 이 제목으로 blog에 자동으로 게시뮬 링크가 생성된다. e.g. `making-personal-blog`
2. `posts/making-personal-blog`에 `2025-07-09-en.md`와 같은 양식으로 markdown file을 만든다. 이때 날짜와 시간을 표기하는 국제 규격 ISO 8601 `YYYY-MM-DD`를 따른다.

## 2. JSON

`posts-meta.json`에서 다음의 내용을 작성한다.

```json
[
  {
    "folder": "making-personal-blog",
    "filename": "2025-06-08-ko.md",

    "title": "블로그를 A부터 Z까지 만드는 방법",
    "date": "2025-06-08",
    "language": "ko"
  }
]
```

## Local server

```bash
python -m http.server 8000
```

[http://localhost:8000](http://localhost:8000)

# To do

* [ ] engine parsing markdown to html
* [ ] 특정 폴더에 markdown file만 생성하면 자동으로 새 글이 게시되도록 하기

