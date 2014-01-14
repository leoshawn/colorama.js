var assert = require("assert"),
    Colorama = require("../index");

describe('Defining a Colorama object', function() {
  it('should add the correct RGB values into the base variable when a CSS color name is passed through', function() {
    var result = Colorama("red").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a six-digit hex color is passed through', function() {
    var result = Colorama("#ff0000").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a three-digit hex color is passed through', function() {
    var result = Colorama("#f00").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a six-digit hex color (without a hash) is passed through', function() {
    var result = Colorama("FF0000").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a three-digit hex color (without a hash) is passed through', function() {
    var result = Colorama("F00").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when an RGB object is passed through', function() {
    var result = Colorama({ r: 255, g: 0, b: 0 }).base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a HSL object is passed through', function() {
    var result = Colorama({ h: 0, s: 100, l: 50 }).base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a HSV object is passed through', function() {
    var result = Colorama({ h: 0, s: 100, v: 100 }).base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when an RGB string is passed through', function() {
    var result = Colorama("rgb(255, 0, 0)").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
  it('should add the correct RGB values into the base variable when a HSL string is passed through', function() {
    var result = Colorama("hsl(0, 100%, 50%)").base,
        expected = { r: 255, g: 0, b: 0 };
    assert.equal(expected.r, result.r);
    assert.equal(expected.g, result.g);
    assert.equal(expected.b, result.b);
  });
});