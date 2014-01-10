# colorama.js

Colorama.js was created after a real need for a simpler API greater control over the colors you define and a need for greater functionality such as color palettes and conversions.

# Installation

Install colorama.js by either forking this repository or installing through [npm](http://npmjs.org/) (recommended).

    npm install colorama
    
You can also use colorama.js from directly within the browser. Simply include the `colorama.*.js` or `colorama.*.min.js` file and get coding!
    
# Usage

A colorama object is required to manipulate or convert a color. Defining a new colorama object is easy, and you can do it in a number of ways:

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

