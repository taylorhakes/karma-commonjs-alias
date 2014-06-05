# karma-commonjs-alias

## This is a clone of karma-commonjs with additional features
Here is a link to the original repo [karma-commonjs](https://github.com/karma-runner/karma-commonjs) . Go there for a full list of features.

## Module aliasing
Added the ability to alias modules for testing. This is useful for mocking and specifying environment. It works the same way as file aliasing in grunt-browserify. Also can alias directories, below is an example.

Here is an example karma.conf configuration

```
module.exports = function (config) {
	config.set({
	   ...
	   commonjsPreprocessor: {
	      alias : {
	        './config/dev.js': 'config',
	        
	        // Core folder alias, can be used as 'core/util/dom' instead of './js/core/util/dom'
	        './js/core': 'core'
	      }
	   }
	   ...
  });
}
```

In another file, you can specify the following and it will be resolve to `./config/dev.js`
```
require('config');
```

## NPM Module Support
Just add NPM modules to the files array and they will be available in the tests

```
module.exports = function (config) {
	config.set({
	   ...
	   files: [
	      '**/*.js'
	      'promise-polyfill', // NPM module used in JS files
	      'observable-lite' // Another NPM module
	   ]
	   ...
  });
}
```

## Transform Support
You can create transforms for other file types, for instance handlebars.
```
module.exports = function (config) {
	config.set({
	   ...
	   commonjsPreprocessor: {
	      ...
	      transform: {
	         // Send .hbs extension to karma-commonjs-handlebars node module
	         'hbs': 'karma-commonjs-handlebars'
	      }
	   }
	   ...
  });
}
```
Here is an example of a transform plugin [karma-commonjs-handlebars](https://github.com/taylorhakes/karma-commonjs-handlebars/blob/master/index.js)

## Node/NPM Installation
```
npm install karma-commonjs-alias
```
