'use strict';

module.exports = {
  hexToRgb: function(color) {
    if (color === undefined) {
      return;
    }
    color = color.replace('#', '');
    if (color.length < 6) {
      color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    var r = parseInt(color.substring(0, 2), 16),
        g = parseInt(color.substring(2, 4), 16),
        b = parseInt(color.substring(4, 6), 16);
    return { r: r, g: g, b: b };
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