/**
 * qunit2node
 *
 * An adapter for converting QUnit tests to nodeUnit
 *
 * Append this file IN THE END
 *
 * https://github.com/thanpolas/qunit2node
 *
 *
 * Copyright (c) 2012 Thanasis Polychronakis
 * Licensed under the MIT license.
 */


/**
 * The closure we'll run the QUnit tests in
 *
 * @param  {Object} testObj A single test Object containing all the tests
 * @return {function(Object)}
 */
function _exportTest(testObj)
{
  var hasStop = false;

  /**
   * Return the test to execute
   *
   * @param  {Object}   test The test object as passed from nodeunit.
   */
  return function(test)
  {
    // run the test to populate assertions
    testObj.fn();

    // execute the QUnit tests now
    for (var i = 0, l = testObj.tests.length ; i < l ; i++) {
      var assertType = testObj.tests[i].test;
      switch (assertType) {
        case 'stop':
          hasStop = true;
        break;
        case 'start':
          test.done();
        break;
        case 'expect':
          test.expect(testObj.tests[i].args[0]);
        break;
        default:
          test[assertType].apply(this, testObj.tests[i].args);
        break;
      }

    }
    // if no stop was invoked, run done
    if (!hasStop) {
      test.done();
    }

  };
}

/**
 * Initialize a new module object
 *
 * @param  {string} moduleName    The module name.
 * @param  {Object=} opt_lifeCycle Lifecycle object containing setup,
 *                                 teardown functions.
 * @return {Object} A module object to add tests on.
 */
function _newModule(moduleName, opt_lifeCycle)
{
  var moduleObject = {};

  var lifeCycle = opt_lifeCycle || false;

  if (!lifeCycle) {
    return moduleObject;
  }

  if (lifeCycle.setup) {
    moduleObject.setUp = function(cb) {
      lifeCycle.setup();
      cb();
    };
  }
  if (lifeCycle.teardown) {
    moduleObject.tearDown = function(cb) {
      lifeCycle.teardown();
      cb();
    };
  }
  return moduleObject;
}

// loop through all collected tests
var currentModuleName = null;
for (var t in allTests.tests) {
  var moduleName = allTests.tests[t].module;
  // check if we have a module declaration
  if (null === moduleName) {

    // no module (group) defined
    exports[t] = _exportTest(allTests.tests[t]);

  } else {
    // we have a module, check if we see this module for the first time
    // and construct the test object
    if (null === currentModuleName) {
      // new module!
      var testModuleObject = _newModule(moduleName, allTests.module[moduleName]);
      currentModuleName = moduleName;
    }

    // check if the module has changed
    if (currentModuleName != moduleName) {
      // new module! export the old one
      exports[currentModuleName] = testModuleObject;
      // ... and start a new one
      var testModuleObject = _newModule(moduleName, allTests.module[moduleName]);
      currentModuleName = moduleName;
    }

    // clear to assign the test to the module
    testModuleObject[t] = _exportTest(allTests.tests[t]);

  }
}

// check if we had a module and export it
if (null !== currentModuleName) {
  exports[currentModuleName] = testModuleObject;
}
