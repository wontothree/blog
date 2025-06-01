# Development Log

*04/23/2025*

add header and footer

*04/29/2025*

move uos folder from route path to posts folder

Concept of this page is for showing Sewon Kim as Engineer.

*05/16/2025*

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
