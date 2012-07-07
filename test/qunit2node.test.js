/**
 * qunit2node
 *
 * An adapter for converting QUnit tests to nodeUnit
 *
 * PREPEND this file AT THE TOP
 *
 * https://github.com/thanpolas/qunit2node
 *
 * Copyright (c) 2012 Thanasis Polychronakis
 * Licensed under the MIT license.
 */

/** @const {boolean} define we are on node.js env */
var NODE = true;
/** @const {boolean} define debug mode */
var DEBUG = false;

/**
 * The adaptor lives in this namespace
 * @type {Object}
 */
var adaptor = {};

/**
 * A silly debug log function
 * @param  {string} what
 * @return {void}
 */
function __debug(what)
{
  if (!DEBUG) return;

  console.log(what);
}



/**
 * QUnit module mock
 *
 * @param  {string} name The module name.
 * @param  {Object=} lifeCycle lifecycle object containing setup and teardown.
 * @return {void}
 */
var module = function(name, lifeCycle) {
  var moduleObj = {
    moduleName: name,
    lifeCycle: lifeCycle
  };

  __debug('New Module:' + name);

  var module = new adaptor.Module(moduleObj);
  // declare the current module
  adaptor.currentModule = module;
};


/**
 * QUnit test mock
 *
 * @param  {string} name .
 * @param  {function()} fn .
 * @return {void} .
 */
var test = function(name, fn) {
  var testObj = {
    module: adaptor.currentModule,
    fn: fn,
    testName: name
  };

  var moduleName = (adaptor.currentModule && adaptor.currentModule.moduleName ? adaptor.currentModule.moduleName : null);
  __debug('New Test:"' + name + '"');
  __debug('New Test\'s Module:"' + moduleName + '"');

  var test = new adaptor.Test(testObj);

  if (adaptor.hasTest) {
    __debug('Test got queued');
    // queue it up
    adaptor.testQueue.push(test);
    return;
  }

  // run it
  test.start();
};

//
// Register and convert all QUnit assertions
//
var ok = function() {adaptor.currentTest.pushAssert('ok', arguments);};
var expect = function() {adaptor.currentTest.pushAssert('expect', arguments);};
var equal = function() {adaptor.currentTest.pushAssert('equal', arguments);};
var notEqual = function() {adaptor.currentTest.pushAssert('notEqual', arguments);};
var deepEqual = function() {adaptor.currentTest.pushAssert('deepEqual', arguments);};
var notDeepEqual = function() {adaptor.currentTest.pushAssert('notDeepEqual', arguments);};
var strictEqual = function() {adaptor.currentTest.pushAssert('strictEqual', arguments);};
var notStrictEqual = function() {adaptor.currentTest.pushAssert('notStrictEqual', arguments);};
var raises = function() {adaptor.currentTest.pushAssert('throws', arguments);};
// Async testing funcs
var stop = function() {
  __debug('stop() was invoked for test:' + adaptor.currentTest.name);
  adaptor.currentTest.hasStop = true;
};
var start = function() {
  // check if we saw a stop() first
  if (!adaptor.currentTest.hasStop) {
    throw new Error('QUnit\'s start() was executed but no stop() was detected');
  }

  __debug('start() was invoked for test:' + adaptor.currentTest.name);

  var curTest = adaptor.currentTest.nodeunit;

  // pass control to the next test
  adaptor.nextTest();

  // and with that, the test concludes
  curTest.done();

};

// -----------------------------------------------
//
// End of QUnit mocking
//

// Declare adaptor required vars
//
//
/** @type {adaptor.Module?} The current module instance */
adaptor.currentModule = null;
/** @type {adaptor.Test?} The current test instance */
adaptor.currentTest = null;
/** @type {boolean} If we are on a test state */
adaptor.hasTest = false;
/** @type {Array} Tests queue up here */
adaptor.testQueue = [];

/**
 * When a test finishes this function is executed.
 *
 * We check if there is another test in the queue and start it
 * or if we reached the end, clean up
 *
 * @return {void}
 */
adaptor.nextTest = function()
{
  __debug('nextTest executes...');
  if (0 < adaptor.testQueue.length) {
    __debug('Have tests in the queue, starting next...');
    // mode tests down the pipe
    adaptor.testQueue.shift().start();
  } else {
    // finished
    __debug('Adaptor :: All tests finished');
  }
};

/**
 * Bind a scope on a func
 * @param  {function()} fn      The function to bind scope on
 * @param  {Object}   selfObj The object
 * @return {function()}
 */
adaptor.bind = function(fn, selfObj)
{
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};

/**
 * The test constructor
 *
 * @param {Object} testObj (fn, module, testName)
 * @constructor
 */
adaptor.Test = function(testObj)
{
  /** @type {Object} The test object (fn, module, testName) */
  this.testObj = testObj;
  this.name = testObj.testName;
  /** @type {Array} assertions queue up here */
  this.assertQueue = [];
  /** @type {boolean} If a stop() has been executed - async testing */
  this.hasStop = false;
  /** @type {Object} the nodeunit test object */
  this.nodeunit = null;
  /** @type {boolean} switch that indicates if we are running */
  this.unitRuns = false;

  __debug('Test constructor:' + this.name);

  // check if we have a module declaration
  if (null === testObj.module) {
    // no module (group) defined, export directly
    exports[this.name] = adaptor.bind(this.runAsserts, this);
  } else {
    // This test belongs to a module, assign it
    testObj.module.pushTest(this);
  }

};

/**
 * Register all QUnit assertions via this method
 *
 * Depending on unitRun state We'll run them as they come
 * or queue them up
 *
 * @param  {string} type The type of the assertion (function)
 * @param  {Array} args Arguments used in the assertion
 * @return {void}
 */
adaptor.Test.prototype.pushAssert = function(type, args)
{
  __debug('pushAssert called for:' + type + ' unitRuns:' + this.unitRuns);

  if (this.unitRuns) {
    this.nodeunit[ type ].apply(this, args);
  } else {
    this.assertQueue.push({
      type: type,
      args: args
    });
  }
};

/**
 * Declare this test is first in the queue to run...
 *
 * @return {void}
 */
adaptor.Test.prototype.start = function()
{
  __debug('Starting test:' + this.name);
  // declare we have a test in progress
  adaptor.hasTest = true;

   // declare we have the lead
  adaptor.currentTest = this;
};

/**
 * The closure we'll run the QUnit tests in.
 *
 * This method is directly exported and executed by nodeunit
 *
 * @param {Object} test nodeunit's object
 * @return {void|function()} export the test or return the test
 *        to be exported.
 */
adaptor.Test.prototype.runAsserts = function(test)
{

  __debug('nodeunit runs test:' + this.name);

  this.nodeunit = test;
  this.unitRuns = true;

  // run the test to populate assertions
  this.testObj.fn();

  __debug('Assertions ended. hasStop:' + this.hasStop);

  // if no stop was invoked, run done
  if (!this.hasStop) {
    // pass control to the next test
    adaptor.nextTest();

    test.done();
  }


};


/**
 * Initialize a new module object
 *
 * @param  {Object.<string, Object>} moduleObj containing two keys:
 *          moduleName    The module name.
 *          lifeCycle Lifecycle object containing setup and/or teardown functions.
 * @constructor
 */
adaptor.Module = function(moduleObj)
{
  /** @type {Object} The object to export when this module is ready for to be exported to nodeunit */
  this.moduleObject = {};
  /** @type {string} the module name */
  this.moduleName = moduleObj.moduleName;
  /** @type {Array} Contains all tests of this module */
  this.tests = [];

  var lifeCycle = moduleObj.lifeCycle || false;

  // no lifeCycle no more execution...
  if (lifeCycle) {
    if (lifeCycle.setup) {
      this.moduleObject.setUp = function(cb) {
        lifeCycle.setup();
        cb();
      };
    }
    if (lifeCycle.teardown) {
      this.moduleObject.tearDown = function(cb) {
        lifeCycle.teardown();
        cb();
      };
    }
  }

  // export the module
  this.doExport();
};

/**
 * Push all tests this module contains down the test module's queue
 *
 * @param  {adaptor.Test} testInst The test instance
 * @return {void}
 */
adaptor.Module.prototype.pushTest = function(testInst)
{
  this.moduleObject[testInst.name] = adaptor.bind(testInst.runAsserts, testInst);
};

/**
 * Exports the module for execution by QUnit
 *
 * @return {boolean} true
 */
adaptor.Module.prototype.doExport = function()
{
  exports[this.moduleName] = this.moduleObject;
};

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
