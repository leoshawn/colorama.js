var assert = require("assert"),
    Colorama = require("../index");

describe('Using Colorama manipulation functions', function() {
  it('should return the correct RGB values when rgb() is called', function() {
    var result = Colorama("#ff0000").rgb(),
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
});