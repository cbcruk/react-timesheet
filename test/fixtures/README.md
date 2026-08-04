# Vendored upstream source

`timesheet.js` is a byte-faithful copy of
[`source/javascripts/timesheet.js`](https://github.com/sbstjn/timesheet.js/blob/master/source/javascripts/timesheet.js)
from sbstjn/timesheet.js, MIT licensed, © Sebastian Müller.

It is here so `test/parity.test.ts` can run the original implementation and this
port against the same inputs, rather than comparing against a description of the
original. Do not edit or reformat it — it is excluded from Prettier for that
reason. `expected` values in the parity test's first block are copied from
upstream's own [`test/timesheet.js`](https://github.com/sbstjn/timesheet.js/blob/master/test/timesheet.js).
