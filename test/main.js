// TEST RUNNER (uses `ava`)
// -----------------------------
// https://github.com/sindresorhus/ava

// -----------------------------
// Unfortunately, while ES6 support is not yet fully released in
// production to online platforms like Heroku, this file should stay
// in ES5 until then. Sorry!
//
// It has to stay in ES5 right now because our node code isn't passed
// through the transpiler -- Babel -- in this package.json setup.
// -----------------------------

import test from 'ava'

//--- your setup code goes here (i.e. create test instances of your Constructors)
// var Person = require('../Person.js').Person;
//--- your setup code goes above here

test('Array#indexOf', t => {
    t.plan(2) // expecting 2 tests to pass
    t.is([1,2,3].indexOf(5), -1)
    t.is([1,2,3].indexOf(0), -1)
})
