'use strict';

module.exports = function(color) {
  return new Colorama(color);
};

function Colorama(color) {
  this.rgb = {
    r: 0,
    g: 0,
    b: 0
  };
  this.formats = ['hex', 'rgb', 'hsl', 'hsv'];
  switch (typeof color) {
  case 'string':
    if (this._parseHexString(color)) {
      this._set('hex', this._parseHexString(color));
    } else if (this._parseRgbString(color)) {
      this._set('rgb', this._parseRgbString(color));
    } else if (this._parseHslString(color)) {
      this._set('hsl', this._parseHslString(color));
    } else {
      return false;
    }
    return this;
  case 'object':
    if (color.r || color.red) {
      this._set('rgb', color);
    } else if (color.l || color.lightness) {
      this._set('hsl', color);
    } else if (color.v || color.value) {
      this._set('hsv', color);
    } else {
      return false;
    }
    return this;
  }
}

Colorama.prototype = {
  _get: function(key) {
    if (this.formats.indexOf(key) !== -1) {
      if (typeof conversions[key + 'ToRgb'] === 'function') {
        return conversions['rgbTo' + key]();
      }
    }
    throw new Error('Invalid color format specified.');
  },

  // Accepts either string (hex) or object
  _set: function(key, value) {
    if (this.formats.indexOf(key) !== -1) {
      if (value === undefined) {
        return this._get(key);
      }
      if (key === 'rgb') {
        this.rgb = value;
        return this.rgb;
      } else {
        if (typeof conversions[key + 'ToRgb'] === 'function') {
          this.rgb = conversions[key + 'ToRgb'](value);
          return this.rgb;
        }
      }
      return false;
    }
    throw new Error('Invalid color format specified.');
  },

  _parseHexString: function(color) {
    if (!color) {
      return;
    }
    var match = color.match(/^#?(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/);
    if (match) {
      return match[1];
    }
    return false;
  },
  _parseRgbString: function(color) {
    if (!color) {
      return;
    }
    var rgb = {},
        match = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d\.]+)\s*)?\)$/);
    if (match) {
      rgb.r = this._scale(parseInt(match[1], 10), 0, 255);
      rgb.g = this._scale(parseInt(match[2], 10), 0, 255);
      rgb.b = this._scale(parseInt(match[3], 10), 0, 255);
      return rgb;
    }
    return false;
  },
  _parseHslString: function(color) {
    if (!color) {
      return;
    }
    console.log('hsl');
    var hsl = {},
        match = color.match(/^hsla?\(\s*(\d+)\s*,\s*([\d\.]+)%\s*,\s*([\d\.]+)%\s*(?:,\s*([\d\.]+)\s*)?\)/);
    if (match) {
      hsl.h = this._scale(parseInt(match[1], 10), 0, 360),
      hsl.s = this._scale(parseFloat(match[2]), 0, 100),
      hsl.l = this._scale(parseFloat(match[3]), 0, 100);
      return hsl;
    }
    return false;
  },
  _parseHsvString: function(color) {
    return color;
  },

  _scale: function(num, min, max) {
    return Math.min(Math.max(min, num), max);
  },

  string: function() {
    return this.rgb;
  }
};

var conversions = {
  hexToRgb: function(color) {
    if (color === undefined) {
      return;
    }
    if (typeof color === 'string') {
      color = color.replace('#', '');
      if (color.length < 6) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
      }
      var r = parseInt(color.substring(0, 2), 16),
          g = parseInt(color.substring(2, 4), 16),
          b = parseInt(color.substring(4, 6), 16);
      return { r: r, g: g, b: b };
    }
    throw new Error('Invalid hex color specified.');
  },
  hslToRgb: function(color) {
    var rgb = {},
        array = [],
        h = color.h / 360,
        s = color.s / 100,
        l = color.l / 100,
        t1, t2, t3, val, i;
    if (s === 0) {
      val = l * 255;
      rgb.r = val;
      rgb.g = val;
      rgb.b = val;
      return rgb;
    }
    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }
    t1 = 2 * l - t2;
    for (i = 0; i < 3; i++) {
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
      array[i] = val * 255;
    }
    rgb.r = array[0];
    rgb.g = array[1];
    rgb.b = array[2];
    return rgb;
  },
  hsvToRgb: function(color) {
    var h = color.h / 60,
        s = color.s / 100,
        v = color.v / 100,
        hi = Math.floor(h) % 6,
        f = h - Math.floor(h),
        p = 255 * v * (1 - s),
        q = 255 * v * (1 - (s * f)),
        t = 255 * v * (1 - (s * (1 - f)));
    v = 255 * v;
    switch(hi) {
    case 0:
      return { r: v, g: t, b: p };
    case 1:
      return { r: q, g: v, b: p };
    case 2:
      return { r: p, g: v, b: t };
    case 3:
      return { r: p, g: q, b: v };
    case 4:
      return { r: t, g: p, b: v };
    case 5:
      return { r: v, g: p, b: q };
    }
  }
};