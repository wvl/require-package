var path = require('path');
var fs = require('fs');
var _ = require('underscore');

function invalid(msg) {
  return {
    vendor: function() { console.error(msg); process.exit(1); },
    config: function() { console.error(msg); process.exit(1); },
    from: from
  }
};

// Return an api with the specified config values
// dir:     directory to find the package.json file in, defaults to
//          parent project
// package: package.json file to use: default `package.json`
// key:     key inside package.json to use, default: `vendor`
function from(config) {
  config = _.extend({
    dir: path.join(__dirname,'..','..','..'),
    package: 'package',
    key: 'vendor',
    packageKey: 'packages'
  }, (config || {}));


  var packageFilename = path.join(config.dir, config.package);
  try {
    var package = require(packageFilename);
  } catch (e) {
    if (e.code=='MODULE_NOT_FOUND') {
      return invalid('Invalid path for package.json: '+packageFilename);
    } else {
      throw e;
    }
  }

  var vendor = package[config.key] || {};
  var packages = package[config.packageKey] || [];

  return {
    from: from,

    // Return an object with {sourceFile: destinationFile}
    vendor: function(vendorDir) {
      return _.reduce(vendor, function(memo,info,name) {
        if (info.source) {
          memo[info.source] = path.join(vendorDir || '',name+'.js');
        }
        return memo;
      }, {})
    },

    // Return an object with `paths` and `shim` keys
    // filled out from the information pulled from package.json
    config: function(vendorDir, base) {
      var conf = _.clone(base || {});
      conf.paths = _.reduce(vendor, function(memo,info,key) {
        memo[key] = path.join(vendorDir,(info.file || key));
        return memo;
      }, (conf.paths || {}));
      conf.shim = _.reduce(vendor, function(memo,info,key) {
        if (info.shim) memo[key] = info.shim;
        return memo;
      }, (conf.shim || {}));
      if (packages) {
        conf.packages = (conf.packages || []).concat(_.map(packages, function(p) {
          if (_.isString(p)) {
            return {name: p, location: './'+p, main: 'index'};
          } else {
            return _.extend({main: 'index'}, p);
          }
        }));
      };
      return conf;
    },

    // Modify config to optimize for package
    optimize: function(name, config) {
      _.each(config.paths || {}, function(path, key) {
        config.paths[key] = 'empty:';
      });
      _.each(config.packages || [], function(pkg) {
        if (pkg.name !== name) config.paths[pkg.name] = 'empty:';
      });
      return config;
    }
  };
}

// Provide a default exports that uses the `vendor` key from 
// `package.json` in the parent project's directory.
module.exports = from();
