// Copyright (c) 2013 Titanium I.T. LLC. Licensed under the MIT license.
(function() {
    "use strict";

	var cachedModules = {};
    var handlbarsExt = {
        hbs: true,
        handlebars: true,
        handlebar: true
    };

// load all modules
for (var modulePath in window.__cjs_module__) {
    require(modulePath, modulePath);
}

function require(requiringFile, dependency) {

    if (window.__cjs_module__ === undefined) {
        throw new Error("Could not find any modules. Did you remember to set 'preprocessors' in your Karma config?");
    }

    if (!window.__cjs_module__[dependency]) {
        dependency = normalizePath(requiringFile, dependency);
    }

    // find module
    var moduleFn = window.__cjs_module__[dependency];
    if (moduleFn === undefined) {
        throw new Error("Could not find module '" + dependency + "' from '" +
            requiringFile + "'");
    }

    // run the module (if necessary)
    var module = cachedModules[dependency];
    if (module === undefined) {
        module = { exports: {} };
        cachedModules[dependency] = module;
        moduleFn(requireFn(dependency), module, module.exports);
    }
    return module.exports;
};

function requireFn(basepath) {
    return function(dependency) {
        return require(basepath, dependency);
    };
}

function normalizePath(basePath, relativePath) {
    if (isFullPath(relativePath)) return relativePath;
    if(!isFullPath(basePath)) basePath = window.__cjs_path__ && window.__cjs_path__[basePath];
    if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

    var baseComponents = basePath.split("/");
    var relativeComponents = relativePath.split("/");
    var nextComponent;

    baseComponents.pop();
    while (relativeComponents.length > 0) {
        nextComponent = relativeComponents.shift();

        if (nextComponent === ".") {
            continue;
        }
        else if (nextComponent === "..") {
            baseComponents.pop();
        }
        else {
            baseComponents.push(nextComponent);
        }
    }

    var normalizedPath = baseComponents.join("/");
    if (!~normalizedPath.indexOf('.')) {
        normalizedPath += ".js";
    }

    return normalizedPath;

    function isFullPath(path) {
        var unixFullPath = (path.charAt(0) === "/");
        var windowsFullPath = (path.indexOf(":") !== -1);

        return unixFullPath || windowsFullPath;
    }
}
})(window);
