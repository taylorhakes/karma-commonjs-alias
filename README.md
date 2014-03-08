# karma-commonjs-alias (karma-commonjs with module aliasing)

## This is a clone of karma-commonjs
Here is a link to the original repo [karma-commonjs](https://github.com/karma-runner/karma-commonjs) . Go there for a full list of features.

## Module aliasing
Added the ability to alias module for testing. This is useful for mocking and specifying environment. It works the same way as file aliasing in grunt-browserify.

Here is an example karma.conf configuration

```
module.exports = function (config) {
	config.set({
	   ...
	   commonjsPreprocessor: {
	      alias : {
	        './config/dev.js': 'config'
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

**Node/NPM Installation
```
npm install karma-commonjs-alias
```
