# colorama.js

**Please note:** colorama.js is still in active development. Code will change and bugs will exist!

Colorama.js was created after the need for a simpler, more intuitive API for color manipulation. Colorama.js gives developers complete control over color transformations, allowing color palettes and conversions to be accessed with ease.

## Installation

Install colorama.js by either forking this repository or installing through [npm](http://npmjs.org/) (recommended).

    npm install colorama
    
You can also use colorama.js from directly within the browser. Simply include the `colorama.*.js` or `colorama.*.min.js` file from the 'dist' directory to get started!
    
## Usage

A Colorama object is required to manipulate or convert a color. Defining a new Colorama object is easy:

```javascript
Colorama('red');
Colorama('#ff0000');
Colorama('#f00');
Colorama('FF0000');
Colorama('F00');
Colorama({ r: 255, g: 0, b: 0 });
Colorama({ h: 0, s: 100, l: 50 });
Colorama({ h: 0, s: 100, v: 100 });
Colorama('rgb(255, 0, 0)');
Colorama('hsl(0, 100%, 50%)');
```

## Conversions

After defining a Colorama color, you are able to convert it to many popular color formats such as hex, rgb, hsl and hsv. This can be achieved in the following ways:

```javascript
Colorama('red').rgb(); // { r: 255, g: 0, b: 0 }
Colorama('#ff0000').hsl(); // { h: 0, s: 100, l: 50 }
Colorama({ r: 255, g: 0, b: 0 }).hex(); // 'FF0000'
```

You can also convert a Colorama color into a string format. This is particularly useful for when applying a Colorama color to a CSS style.

```javascript
Colorama('red').string('rgb'); // 'rgb(255, 0, 0)'
Colorama('ff0000').string('hsl'); // 'hsl(0, 100%, 50%)'
Colorama({ r: 255, g: 0, b: 0 }).string('hex'); // '#ff0000'
Colorama('#f00').css(); // '#ff0000' (same as above)
```
