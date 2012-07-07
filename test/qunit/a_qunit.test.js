/**
 * To properly test if qunit2node works properly, we'll write an extensive
 * QUnit test.
 */


test('a test that doesn\'t belong to any module', function()
{
  expect( 8 );
  ok(true, 'ok assert');
  equal(true, true, 'equal assert');
  notEqual(true, false, 'notEqual assert');
  deepEqual({a:{b:2}}, {a:{b:2}}, 'deepEqual assert');
  notDeepEqual({a:{b:2}}, {a:{b:3}}, 'notDeepEqual assert');
  strictEqual(null, null, 'strictEqual assert');
  notStrictEqual(undefined, null, 'notStrictEqual assert');
  raises(function() {throw new Error('an error');}, 'raises assert');
});

test('Check async test exec', function(){
  expect( 2 );
  stop();

  ok(true, 'ok assert');

  setTimeout(function(){
    ok(true, 'async ok assert');
    start();
  }, 300);
});

// set a var to play with
var num = 1;

// now start a module with a setup and teardown
module('module One', {
  setup: function() {
    num = num * 2;
  },
  teardown: function() {
    num--;
  }
});

test('module One Test One', function(){
  ok(true, 'ok assert module one');
  equal(2, num, 'num should be 2');
  num++; // 3
  num++; // 4
});

test('module One Test Two', function(){
  // teardown made num 3, new setup made it 3 * 2 = 6
  expect( 1 );
  equal(6, num, 'num should be 6');
});

// create a new test module
module('module Two', {
  setup: function() {
    num = num * 3;
  },
  teardown: function() {
    num = num - 2;
  }
});

test('module Two Test One - ASYNC', function() {
  expect( 2 );
  stop();
  // module One teardown made num 5, module Two setup made num 5 * 3 = 15
  equal(15, num, 'num should be 15');
  num++; // 16
  setTimeout(function(){
    equal(16, num, 'async assert num 16');
    start();
  }, 300);
});

test('module Two Test Two', function(){
  // and do the full monty again
  expect( 8 );
  ok(true, 'ok assert');
  // check num val, num is 14 * 3 = 42
  equal(42, num, 'num should be 42');
  notEqual(true, false, 'notEqual assert');
  deepEqual({a:{b:2}}, {a:{b:2}}, 'deepEqual assert');
  notDeepEqual({a:{b:2}}, {a:{b:3}}, 'notDeepEqual assert');
  strictEqual(null, null, 'strictEqual assert');
  notStrictEqual(undefined, null, 'notStrictEqual assert');
  raises(function() {throw new Error('an error');}, 'raises assert');
});
