var path = require('path');
var os = require('os');
var fs = require('fs');
var Handlebars = require('handlebars');

var BRIDGE_FILE_PATH = path.normalize(__dirname + '/../client/commonjs_bridge.js');

var initCommonJS = function(/*config.files*/ files, config) {
  var commonJsFiles = [];

  files.forEach(function(file) {
    var basePath = config.basePath + '/';
    var originalPath = file.pattern.replace(basePath, '');
    if(!originalPath.match(/\./)) {
      file.pattern = originalPath;
      file.served = true;
      file.included = true;
      commonJsFiles.push(file);
    }
  });

  if(commonJsFiles.length) {
    var tmpDir = path.join(os.tmpdir ? os.tmpdir() : os.tmpDir());
    commonJsFiles.forEach(function(file) {
      var filePath = path.join(tmpDir, file.pattern.replace('/', '-'));
      var fullPath = require.resolve(file.pattern);
      fs.writeFileSync(filePath,
        getWrappedContent(fs.readFileSync(fullPath), file.pattern, fullPath));
      file.pattern = filePath;
    });
  }

  // Include the file that resolves all the dependencies on the client.
  files.push({
    pattern: BRIDGE_FILE_PATH,
    included: true,
    served: true,
    watched: false
  });
};

var createPreprocesor = function(logger, config, basePath) {
  var log = logger.create('preprocessor.commonjs');
  var modulesRootPath = path.resolve(config && config.modulesRoot ? config.modulesRoot : path.join(basePath, 'node_modules'));
  //normalize root path on Windows
  if (process.platform === 'win32') {
    modulesRootPath = modulesRootPath.replace(/\\/g, '/');
  }
  var handlbarsExt = {
    hbs: true,
    handlebars: true,
    handlebar: true
  };

  var resolvedMap = {};
  if (config && config.alias) {
    var file;
    for (file in config.alias) {
      if (config.alias.hasOwnProperty(file)) {
        resolvedMap[path.resolve(file)] = config.alias[file];
      }
    }
  }

  log.debug('Configured root path for modules "%s".', modulesRootPath);

  return function(content, file, done) {
    if (file.originalPath === BRIDGE_FILE_PATH) {
      return done(content);
    }

    log.debug('Processing "%s".', file.originalPath);

    var output = "";
    var path = file.originalPath;
    log.debug('Processing "%s".', file.originalPath);
    if (resolvedMap[path]) {
      path = resolvedMap[path];
    }

    if(handlbarsExt[file.originalPath.split('.').pop()]) {
        content = getWrappedHandlebars(content);
    }

    output += getWrappedContent(content, path);


    done(output);
  };
};

function getWrappedContent(content, path, fullPath) {
  var start = 'window.__cjs_module__ = window.__cjs_module__ || {};' +
    'window.__cjs_module__["' + path + '"] = function(require, module, exports) {' +
    content + os.EOL +
  '};';
  if(fullPath) {
      start += 'window.__cjs_path__ = window.__cjs_path__ || {};' +
          'window.__cjs_path__["' + path + '"] = "'+ fullPath + '";';
  }
  return start;
}

function getWrappedHandlebars(content) {
    var js = Handlebars.precompile(content);
    var compiled = "var Handlebars = require('handlebars/runtime')['default'];\n";
    compiled += "module.exports = Handlebars.template(" + js.toString() + ");\n";

    return compiled;
}

createPreprocesor.$inject = ['logger', 'config.commonjsPreprocessor', 'config.basePath'];

// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
