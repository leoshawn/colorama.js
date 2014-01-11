'use strict';

module.exports = {
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
  }
};