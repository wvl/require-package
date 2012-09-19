
## Generate a requirejs config object from your package.json

*require-package* is a simple library to build a config object that can
be used with the [requirejs](http://requirejs.org/) AMD loader. It will
generate the appropriate path, shim and module information for your
specified environment, enabling the packaging information to be
specified in only one place.

For example, in your package json:

```
  "vendor": {
    "backbone": {
      "source": "node_modules/backbone.js",
      "shim": {"exports": "Backbone", "deps": ["underscore","jquery"]}
    },
    "underscore": {
      "source": "node_modules/underscore/underscore-min.js",
      "shim": {"exports": "_"}
    },
    "jquery": {
      "source": "vendor/js/jquery-1.8.1.min.js"
    }
  }
```

Then, you can build use require-package in various places to vendor and
build a config file for requirejs.

```
// in jakefile, to vendor the javascript files into your server
var requirePackage = require('require-package');
var toVendor = requirePackage.vendor('www/js/vendor');
for (var source in toVendor) {
  file(toVendor[source], [source], function() {
    jake.cpR(source,toVendor[source]);
  });
}
```

Or, in your templates, to init requirejs:

```
require.config(<% require('require-package').config({baseUrl: '/js'}) %>);
```

## API

`require-config` exports several functions to help in your build setup.

### vendor(basePath)

`vendor` will return on object with the path to the source file to be
vendored as the key, and the destination path as the value:

```
{ 'node_modules/backbone/backbone.js': 'www/js/vendor/backbone.js' }
```

### config(vendorDir, baseConfig={})

Extends the baseConfig object with the shim and path config values.

