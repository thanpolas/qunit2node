/**
 * An adapter for converting QUnit tests to nodeUnit
 *
 * PREPEND this file AT THE TOP
 */

var NODE = true;

var allTests = {
  tests: {},
  module: {}
};

var currentModule = null;
var currentTest = null;

/**
 * QUnit test mock
 *
 * @param  {string} name .
 * @param  {function()} fn .
 * @return {void} .
 */
var test = function(name, fn) {
  allTests.tests[name] = {
    module: currentModule,
    fn: fn,
    tests: [],
    name: name
  };
  currentTest = name;
};

/**
 * QUnit module mock
 *
 * @param  {string} name The module name.
 * @param  {Object=} lifeCycle lifecycle object containing setup and teardown.
 * @return {void}
 */
var module = function(name, lifeCycle) {
  allTests.module[name] = lifeCycle;
  currentModule = name;
};

/**
 * Register all assertions via this function
 *
 * @param  {string} type The type of the assertion (function)
 * @param  {Array} args Arguments used in the assertion
 * @return {void}
 */
var assert = function(type, args)
{
  allTests.tests[currentTest].tests.push({
    test: type,
    args: args
  });
};

//
// Register all QUnit assertions
//
var ok = function() {assert('ok', arguments);};
var stop = function() {assert('stop', arguments);};
var start = function() {assert('start', arguments);};
var expect = function() {assert('expect', arguments);};
var equal = function() {assert('equal', arguments);};
var notEqual = function() {assert('notEqual', arguments);};
var deepEqual = function() {assert('deepEqual', arguments);};
var notDeepEqual = function() {assert('notDeepEqual', arguments);};
var strictEqual = function() {assert('strictEqual', arguments);};
var notStrictEqual = function() {assert('notStrictEqual', arguments);};
var raises = function() {assert('raises', arguments);};


