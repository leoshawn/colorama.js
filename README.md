# colorama.js

Colorama.js was created after a real need for a simpler API greater control over the colors you define and a need for greater functionality such as color palettes and conversions.

## Defining a color

Defining a new color is as easy as:

```javascript
var red = colorama('#ff0000');
```

You also have several options when you define a color, such as:

```javascript
colorama("red");
colorama("#ff0000");
colorama("#f00");
colorama("FF0000");
colorama({r: 255, g: 0, b: 0});
colorama({h: 0, s: 100, l: 50});
colorama("rgb(255, 0, 0)");
colorama("rgb(100%, 0%, 0%)");
colorama("hsl(0, 100%, 50%)");
```
