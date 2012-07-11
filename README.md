# OAuthRequest

[![Build Status](https://secure.travis-ci.org/bytespider/OAuthRequest.png?branch=master)](http://travis-ci.org/bytespider/OAuthRequest)

OAuthRequest is a W3C compatable XMLHttpRequest object for signing OAuth requests. Designed for use with jsOAuth 2.

## Getting Started
Install the module with: `npm install OAuthRequest`

```javascript
var OAuthRequest = require('OAuthRequest');
var xhr = new OAuthRequest();

xhr.open("GET", "http://www.google.co.uk", true);

xhr.addEventListener("readystatechange", function (event) {
    if (this.readyState === this.DONE && this.status >= 200) {
        doStuff(this.responseText);
    }
});

xhr.send(null);
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rob Griffiths  
Licensed under the MIT license.
