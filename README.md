# Simple Blog

No dependencies (no framework, no library), just varnila javascript, html, and css.

    wontothree.github.io/blog
    ├── posts                                  # articles
    │   └── sewon-kim-and-anthony-garcia
    │       └── 2025-06-10-en.md
    │
    ├── scripts
    │   ├── main.js
    │   └── markdown-renderer.js
    │
    ├── styles
    │   └── index.css
    │
    ├── index.html                             # single page application
    └── posts-meta.json                        # post meta data (title, date, url, etc)

# Getting Started

## Local server: [http://localhost:8000](http://localhost:8000)

```bash
python -m http.server 8000
```

# To do

* [ ] engine parsing markdown to html
* [ ] 특정 폴더에 markdown file만 생성하면 자동으로 새 글이 게시되도록 하기
