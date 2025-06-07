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
