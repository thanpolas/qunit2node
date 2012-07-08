# qunit2node

[QUnit](http://docs.jquery.com/QUnit) adapter for [nodeunit](https://github.com/caolan/nodeunit).

Run all your QUnit tests natively in `node.js` using nodeunit!

## Getting Started
Install the module with: `npm install qunit2node`.

Create a new file where you concat `node_modules/qunit2node/lib/qunit2node.js` on top and your QUnit file right after and you are done!

## Documentation

qunit2node provides the boolean `NODE` variable that can help you make your QUnit tests run on both environments (web and node.js). So if you are testing a library that can be reached on a certain namespace in the web, say `ss.ready`, then you'd want to do something like;

```javascript
// my QUnit test file
var NODE = NODE || false;
if (NODE) {
	var ss = {
		ready: require('../path/to/lib/ready.js');
	};
}

test('basic test', function(){
	ok(ss.ready.loaded, 'Our library is loaded');
});

```

In case testing goes haywire, a `DEBUG` variable exists which you can set to boolean `true` and view in a *very* verbose way, what is going on when your QUnit test runs on nodeunit.

### QUnit Supported functionality

qunit2node supports the majority of the QUnit API.

* `test()` function. In this version the typical `test(name, test)` is only supported.
* All assertions are supported in full.
* `module()` declarations are supported in full as well along with `setup` and `teardown` functionality.
* `expect()` and async testing: `stop()`, `start()`.

### QUnit NOT supported functionality

qunit2node does not support:

* `QUnit.init()` and `QUnit.reset()` as they have no meaningfull interpretetion to nodeunit
* `asyncTest()` cmon, grow up and use `stop()`


## Examples

A plain and straightforward example can be viewed in this repo's [test/](https://github.com/thanpolas/qunit2node/tree/master/test) folder.

There we have a typical QUnit test file ([test/qunit/a_qunit.test.js](https://github.com/thanpolas/qunit2node/tree/master/test/qunit/a_qunit.test.js)), which after concatenation becomes [test/qunit2node.test.js](https://github.com/thanpolas/qunit2node/tree/master/test/qunit2node.test.js).

This is a pretty straightforward concat operation, nothing more to say here, except maybe if you use [grunt](https://github.com/cowboy/grunt) have a quick look in the [grunt file](https://github.com/thanpolas/qunit2node/tree/master/grunt.js) i use to concat and test.


## License
Copyright (c) 2012 Thanasis Polychronakis
Licensed under the MIT license.
