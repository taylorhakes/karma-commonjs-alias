var path = require('path');
var os = require('os');
var fs = require('fs');


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

  var resolvedMap = [];
  if (config && config.alias) {
    var file;
    for (file in config.alias) {
      if (config.alias.hasOwnProperty(file)) {
        resolvedMap.push({
    			path: path.resolve(file),
    			alias: config.alias[file]
		    });
      }
    }
	resolvedMap.sort(function(a, b) {
		if(a.length === b.length) {
			return 0;
		}
		return a.length > b.length ? 1 : -1;
	});
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
  	var additionalPath;
  	for(var i = 0, len = resolvedMap.length; i < len; i++) {
  		var mapIndex = path.indexOf(resolvedMap[i].path);
  		if(mapIndex === 0) {
  			additionalPath = resolvedMap[i].alias + path.substr(resolvedMap[i].path.length);
  			// remove .js
  			if(additionalPath.indexOf('.js') === additionalPath.length - 3) {
  				additionalPath = additionalPath.substr(0, additionalPath.length - 3);
  			}
  			break;
  		}
  	}

    var extension = file.originalPath.split('.').pop(),
        extensionMatch = config.extensions && ~config.extensions.indexOf(extension);

    if(additionalPath) {
    	output += getWrappedContent(content, additionalPath, path);
    } else {
    	output += getWrappedContent(content, path);
    }

    if(extensionMatch) {
        output += getWrappedTransform(extension)
    }

    done(output);
  };
};

function getWrappedTransform(extension) {
    return 'window.__cjs_ext__ = window.__cjs_ext__ || {};' +
        'window.__cjs_ext__["' + extension + '"] = true;';
}

function getWrappedContent(content, path, fullPath) {
  var start = 'window.__cjs_module__ = window.__cjs_module__ || {};';
	if(fullPath) {
		start += 'window.__cjs_module__["' + fullPath + '"] = ';
	}
  start += 'window.__cjs_module__["' + path + '"] = function(require, module, exports) {' +
  content + os.EOL +
  '};';
  if(fullPath) {
      start += 'window.__cjs_path__ = window.__cjs_path__ || {};' +
          'window.__cjs_path__["' + path + '"] = "'+ fullPath + '";';
  }
  return start;
}

createPreprocesor.$inject = ['logger', 'config.commonjsPreprocessor', 'config.basePath'];

// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
