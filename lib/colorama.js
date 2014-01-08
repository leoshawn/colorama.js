var Colorama = function(color) {
  this._init(color);
};

Colorama.prototype = {

  _init: function(color) {
    this.values = {
      rgb: [0, 0, 0],
      hsl: [0, 0, 0],
      hsv: [0, 0, 0],
      cmyk: [0, 0, 0, 0]
    }

    switch (typeof color) {
      case 'string':
        if (values = this.getRgb(color)) {
          this.set('rgb', values);
        } else if (values = this.getHsl(color)) {
          this.set('hsl', values);
        }
        break;
    }
  },

  get: function(key) {
    var values = {};

    for (var i = 0; i < key.length; i++) {
      values[key[i]] = this.values[key][i];
    }
    return values;
  },

  set: function(key, value) {
    var keys = {
      'rgb': ['red', 'green', 'blue'],
      'hsl': ['hue', 'saturation', 'lightness'],
      'hsv': ['hue', 'saturation', 'value'],
      'cmyk': ['cyan', 'magenta', 'yellow', 'black']
    };

    var max = {
      'rgb': [255, 255, 255],
      'hsl': [360, 100, 100],
      'hsv': [360, 100, 100],
      'cmyk': [100, 100, 100, 100]
    };

    if (value.length) { // Array
      this.values[key] = value.slice(0, key.length);
    } else if (value[key[0]] !== undefined) { // Object, e.g. { r: 255, g: 255, b: 255 }.
      for (var i = 0; i < key.length; i++) {
        this.values[key][i] = value[key[i]];
      }
    } else if (value[keys[key][0]] != undefined) { // Object, e.g. { red: 255, green: 255, blue: 255 }.
      var channels = keys[key];
      for (var i = 0; i < key.length; i++) {
        this.values[key][i] = value[channels[i]];
      }
    }

    /* for (var keyName in keys) {
      if (keyName != value)
        this.values[keyName] = convert[key][keyName](this.values[key]);

      // Ensure values don't exceed upper limit.
      for (var i = 0; i < keyName.length; i++) {
        var limited = this.scale(this.values[keyName][i], 0, max[keyName][i]);
        this.values[keyName][i] = Math.round(limited);
      }
    } */

    return true;
  },

  getRgb: function(string) {
    if (!string) {
      return;
    }

    var rgb = [0, 0, 0];

    if (match = string.match(/^#([a-fA-F0-9]{3})$/)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match[i] + match[i], 16);
      }
    } else if (match = string.match(/^#([a-fA-F0-9]{6})$/)) {
      match = match[1];
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match.slice(i * 2, i * 2 + 2), 16);
      }
    } else if (match = string.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/)) {
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = parseInt(match[i + 1]);
      }
    } else if (match = string.match(/^rgba?\(\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*,\s*([\d\.]+)\%\s*(?:,\s*([\d\.]+)\s*)?\)$/)) {
      for (var i = 0; i < rgb.length; i++) {
        rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
      }
    } else {
      rgb = null;
    }

    for (var i = 0; i < rgb.length; i++) {
      rgb[i] = this.scale(rgb[i], 0, 255);
    }

    return rgb;
  },

  scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  },

  convertions: {

    rgb2hsl: function(rgb) {
      var r = rgb[0] / 255,
          g = rgb[1] / 255,
          b = rgb[2] / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s, l;

      if (max == min) {
        h = 0;
      } else if (r == max) {
        h = (g - b) / delta; 
      } else if (g == max) {
        h = 2 + (b - r) / delta; 
      } else if (b == max) {
        h = 4 + (r - g)/ delta;
      }

      h = Math.min(h * 60, 360);

      if (h < 0) {
        h += 360;
      }

      l = (min + max) / 2;

      if (max == min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }

      return [h, s * 100, l * 100];
    },

    rgb2hsv: function(rgb) {
      var r = rgb[0],
          g = rgb[1],
          b = rgb[2],
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          delta = max - min,
          h, s, v;

      if (max == 0) {
        s = 0;
      } else {
        s = (delta/max * 1000)/10;
      }

      if (max == min) {
        h = 0;
      } else if (r == max) {
        h = (g - b) / delta; 
      } else if (g == max) {
        h = 2 + (b - r) / delta; 
      } else if (b == max) {
        h = 4 + (r - g) / delta;
      }

      h = Math.min(h * 60, 360);

      if (h < 0) {
        h += 360;
      }

      v = ((max / 255) * 1000) / 10;

      return [h, s, v];
    },

    rgb2cmyk: function(rgb) {
      var r = rgb[0] / 255,
          g = rgb[1] / 255,
          b = rgb[2] / 255,
          c, m, y, k;
          
      k = Math.min(1 - r, 1 - g, 1 - b);
      c = (1 - r - k) / (1 - k);
      m = (1 - g - k) / (1 - k);
      y = (1 - b - k) / (1 - k);

      return [c * 100, m * 100, y * 100, k * 100];
    },

    hsl2rgb: function(hsl) {
      var h = hsl[0] / 360,
          s = hsl[1] / 100,
          l = hsl[2] / 100,
          t1, t2, t3, rgb, val;

      if (s == 0) {
        val = l * 255;
        return [val, val, val];
      }

      if (l < 0.5) {
        t2 = l * (1 + s);
      } else {
        t2 = l + s - l * s;
      }

      t1 = 2 * l - t2;
      rgb = [0, 0, 0];

      for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * - (i - 1);
        t3 < 0 && t3++;
        t3 > 1 && t3--;

        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }

        rgb[i] = val * 255;
      }
      
      return rgb;
    },

    hsl2hsv: function(hsl) {
      var h = hsl[0],
          s = hsl[1] / 100,
          l = hsl[2] / 100,
          sv, v;

      l *= 2;
      s *= (l <= 1) ? l : 2 - l;
      v = (l + s) / 2;
      sv = (2 * s) / (l + s);

      return [h, sv * 100, v * 100];
    },

    hsl2cmyk: function(args) {
      return rgb2cmyk(hsl2rgb(args));
    },

    hsv2rgb: function(hsv) {
      var h = hsv[0] / 60,
          s = hsv[1] / 100,
          v = hsv[2] / 100,
          hi = Math.floor(h) % 6;

      var f = h - Math.floor(h),
          p = 255 * v * (1 - s),
          q = 255 * v * (1 - (s * f)),
          t = 255 * v * (1 - (s * (1 - f))),
          v = 255 * v;

      switch(hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    },

    hsv2hsl: function(hsv) {
      var h = hsv[0],
          s = hsv[1] / 100,
          v = hsv[2] / 100,
          sl, l;

      l = (2 - s) * v;  
      sl = s * v;
      sl /= (l <= 1) ? l : 2 - l;
      l /= 2;

      return [h, sl * 100, l * 100];
    }

    hsv2cmyk: function(args) {
      return rgb2cmyk(hsv2rgb(args));
    },

    cmyk2rgb: function(cmyk) {
      var c = cmyk[0] / 100,
          m = cmyk[1] / 100,
          y = cmyk[2] / 100,
          k = cmyk[3] / 100,
          r, g, b;

      r = 1 - Math.min(1, c * (1 - k) + k);
      g = 1 - Math.min(1, m * (1 - k) + k);
      b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    },

    cmyk2hsl: function(args) {
      return rgb2hsl(cmyk2rgb(args));
    },
    
    cmyk2hsv: function(args) {
      return rgb2hsv(cmyk2rgb(args));
    }

  }

}

module.exports = function(color) {
  return new Colorama(color);
};