use-strict-cli
==============
This command line tool can be used to add or remove `'use strict';`
from all JavaScript files within a directory. This tool is helpful
if you find yourself wanting to adopt new ES6 language features that
are only available if "use strict" statement is added to file.

For example, if you're trying to use `let` statements in Node.js 4
then you'll see this error if JavaScript file does not have "use strict":

`SyntaxError: Block-scoped declarations (let, const, function, class) not yet supported outside strict mode`

## Installation

```bash
npm install use-strict-cli -g
```

## Usage

```bash
use-strict [dir1] [dir2] [dirX] [--remove] [--prefer statement]
```

All `*.js` files found within given directories and
their sub-directories will be scanned.

Before running this command line tool it is recommended
that you commit your current changes to source control
or create a backup in case there are any undesirable
changes.

**Commands**

* `add` - add strict mode to files
* `remove` - remove strict mode from files

**Options:**
```
  --version   Show version number                      [boolean]
  --files     file and dir names                       [array] [required]
  --prefer    Preferred "use strict" statement (e.g. '"use strict";')
                                                       [string] [default: false]
  --match     path must match this regexp              [string] [default: false]
  -h, --help  Show help                                [boolean]
```

You will be prompted to confirm operation before changes will be saved.

**Example**
```bash
use-strict add --files . --match "*/tests/*"
```
