/*
 * OAuthRequest
 * https://github.com/bytespider/jsOAuth
 *
 * Copyright (c) 2012 Rob Griffiths
 * Licensed under the MIT license.
 */

var Url = require("./Url");
var Querystring = require("./Querystring");
var Cryptography = require("./Cryptography");
var btoa = require("./Base64").btoa;

/**
 * rfc3986 compatable encode of a string
 *
 * @param {String} string
 */

function encode(string) {
    function hex(code) {
        var hex_code = code.toString(16).toUpperCase();
        if (hex_code.length < 2) {
            hex_code = 0 + hex_code;
        }
        return '%' + hex_code;
    }

    string = string + '';
    var reserved_chars = /[ :\/?#\[\]@!$&'()*+,;=<>"{}|\\`\^%\r\n\u0080-\uffff]/;
    var str_len = string.length;
    var i;
    var string_arr = string.split('');
    var c;

    for (i = 0; i < str_len; i += 1) {
        if (c = string_arr[i].match(reserved_chars)) {
            c = c[0].charCodeAt(0);

            if (c < 128) {
                string_arr[i] = hex(c);
            } else if (c < 2048) {
                string_arr[i] = hex(192 + (c >> 6)) + hex(128 + (c & 63));
            } else if (c < 65536) {
                string_arr[i] = hex(224 + (c >> 12)) + hex(128 + ((c >> 6) & 63)) + hex(128 + (c & 63));
            } else if (c < 2097152) {
                string_arr[i] = hex(240 + (c >> 18)) + hex(128 + ((c >> 12) & 63)) + hex(128 + ((c >> 6) & 63)) + hex(128 + (c & 63));
            }
        }
    }

    return string_arr.join('');
}

/**
 * rfc3986 compatable decode of a string
 *
 * @param {String} string
 */

function decode(string) {
    return string.replace(/%[a-fA-F0-9]{2}/ig, function (match) {
        return String.fromCharCode(parseInt(match.replace('%', ''), 16));
    });
}

/**
 * Generate a timestamp for the request
 */

function getTimestamp() {
    var date = new Date();
    return parseInt(date.getTime() / 1000, 10);
}

/**
 * Generate a nonce for the request
 *
 * @param key_length {number} Optional nonce length
 */

function getNonce(key_length) {
    function rand() {
        return Math.floor(Math.random() * chars.length);
    }

    key_length = key_length || 64;

    var key_bytes = key_length / 8;
    var value = '';
    var key_iter = key_bytes / 4;
    var key_remainder = key_bytes % 4;
    var i;
    var chars = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '2A', '2B', '2C', '2D', '2E', '2F', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '3A', '3B', '3C', '3D', '3E', '3F', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '4A', '4B', '4C', '4D', '4E', '4F', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5A', '5B', '5C', '5D', '5E', '5F', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6A', '6B', '6C', '6D', '6E', '6F', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7A', '7B', '7C', '7D', '7E'];

    for (i = 0; i < key_iter; i += 1) {
        value += chars[rand()] + chars[rand()] + chars[rand()] + chars[rand()];
    }

    // handle remaing bytes
    for (i = 0; i < key_remainder; i += 1) {
        value += chars[rand()];
    }

    return value;
}

/**
 * Get a string of the parameters for the OAuth Authorization header
 *
 * @param params {object} A key value paired object of data
 *                           example: {'q':'foobar'}
 *                           for GET this will append a query string
 */

function toHeaderString(params, realm) {
    var arr = [];
    var i;

    for (i in params) {
        if (typeof params[i] !== 'object' && params[i] !== '' && params[i] !== undefined) {
            arr.push(encode(i) + '="' + encode(params[i]) + '"');
        }
    }

    arr.sort();
    if (realm) {
        arr.unshift('realm="' + encode(realm) + '"');
    }

    return arr.join(', ');
}

/**
 * Generate a signature base string for the request
 *
 * @param method {string} ['GET', 'POST', 'PUT', ...]
 * @param url {string} A valid http(s) url
 * @param header_params A key value paired object of additional headers
 * @param query_params {object} A key value paired object of data
 *                               example: {'q':'foobar'}
 *                               for GET this will append a query string
 */

function toSignatureBaseString(method, url, header_params, query_params) {
    var arr = [];
    var i;

    for (i in header_params) {
        if (header_params[i] !== undefined && header_params[i] !== '') {
            arr.push([encode(i), encode(header_params[i] + '')]);
        }
    }

    for (i in query_params) {
        if (query_params[i] !== undefined && query_params[i] !== '') {
            arr.push([encode(i), encode(query_params[i] + '')]);
        }
    }

    arr = arr.sort(function lexicalSort(a, b) {
        if (a[0] < b[0]) {
            return -1;
        } else if (a[0] > b[0]) {
            return 1;
        } else {
            if (a[1] < b[1]) {
                return -1;
            } else if (a[1] > b[1]) {
                return 1;
            } else {
                return 0;
            }
        }
    }).map(function (el) {
        return el.join("=");
    });

    return [method, encode(url), encode(arr.join('&'))].join('&');
}

function OAuthRequest() {
    if (this.transport.toLowerCase() == 'default') {
        this.transport = Object.keys(OAuthRequest.transports)[0];
    }

    if (!(this.transport in OAuthRequest.transports)) {
        throw 'Transport ' + this.transport + ' not registered';
    }

    if (!OAuthRequest.transports[this.transport].test()) {
        throw 'Transport ' + this.transport + ' is not supported in this environment';
    }

    this.request = OAuthRequest.transports[this.transport].factory();
    this.request.headers = {};
}

OAuthRequest.UNSENT = 0;
OAuthRequest.OPENED = 1;
OAuthRequest.HEADERS_RECEIVED = 2;
OAuthRequest.LOADING = 3;
OAuthRequest.DONE = 4;

OAuthRequest.prototype = {
    constructor: OAuthRequest,
    set onreadystatechange(handler) {
        this.request.onreadystatechange = handler;
    },
    get onreadystatechange() {
        return this.request.onreadystatechange;
    },
    set onerror(handler) {
        this.request.onerror = handler;
    },
    get onerror() {
        return this.request.onerror;
    },
    get readyState() {
        return this.request.readyState;
    },

    // request
    open: function (method, url, async, user, password) {
        var xhr = this.request;

        xhr.method = method.toUpperCase();
        xhr.url = Url.parse(url, true);
        xhr.async = async;
        xhr.user = password;

        xhr.open(xhr.method, xhr.url, xhr.async, xhr.user, xhr.password);
    },

    setRequestHeader: function (header, value) {
        this.request.headers[header] = value;
        this.request.setRequestHeader(header, value);
    },

    send: function (data) {
        var xhr = this.request;
        var header_params = {
            'oauth_callback': this.callbackUrl,
            'oauth_consumer_key': this.applicationKey,
            'oauth_token': this.accessTokenKey,
            'oauth_signature_method': this.signatureMethod,
            'oauth_timestamp': getTimestamp(),
            'oauth_nonce': getNonce(),
            'oauth_verifier': this.verifier,
            'oauth_version': '1.0'
        };
        var signature_data = {};

        var content_type = xhr.headers['Content-Type'] || 'application/x-www-form-urlencoded';
        if (content_type === 'application/x-www-form-urlencoded') {
            var query = xhr.url.query;
            for (var i in query) {
                if (query.hasOwnProperty(i)) {
                    signature_data[i] = query[i];
                }
            }

            if (data) {
                data = Querystring.parse(data);
                for (i in data) {
                    if (query.hasOwnProperty(i)) {
                        signature_data[i] = data[i];
                    }
                }
            }
        }

        var url = xhr.url.protocol + '//' + xhr.url.host + xhr.url.path;
        var signature_string = toSignatureBaseString(xhr.method, url, header_params, signature_data);
        var signature = OAuthRequest.signatureMethod[this.signatureMethod](this.applicationSecret, this.accessTokenSecret, signature_string);
        header_params['oauth_signature'] = signature;

        xhr.setRequestHeader('Authorization', 'OAuth ' + toHeaderString(header_params, this.realm));

        xhr.send(data);
    },

    abort: function () {
        this.request.abort();
    },

    // response
    get status() {
        return this.request.status;
    },

    get statusText() {
        return this.request.statusText;
    },

    getResponseHeader: function (header) {
        this.request.getResponseHeader(header);
    },

    getAllResponseHeaders: function () {
        return this.request.getAllResponseHeaders();
    },

    get responseText() {
        return this.request.responseText;
    },

    get responseXML() {
        return this.request.responseXML;
    },

    UNSENT:                 OAuthRequest.UNSENT,
    OPENED:                 OAuthRequest.OPENED,
    HEADERS_RECEIVED:       OAuthRequest.HEADERS_RECEIVED,
    LOADING:                OAuthRequest.LOADING,
    DONE:                   OAuthRequest.DONE,

    // Events
    /**
     * Adds an event listener
     */
    addEventListener: function (type, handler, useCapture) {
        this.request.addEventListener(type, handler, useCapture);
    },

    /**
     * Removes an event listener
     */
    removeEventListener: function (type, handler, useCapture) {
        this.request.removeEventListener(type, handler, useCapture);
    },

    /**
     * Dispatches an event
     */
    dispatchEvent: function (event) {
        this.request.dispatchEvent(event);
    },

    // OAuthRequest specifics
    applicationKey: '',
    applicationSecret: '',
    accessTokenKey: '',
    accessTokenSecret: '',
    realm: '',
    callbackUrl: '',
    signatureMethod: 'HMAC-SHA1',
    transport: 'Default'
};

OAuthRequest.transports = {
    'CommonJS': require("./Transport/CommonJS")
};

OAuthRequest.signatureMethod = {
    /**
     * Sign the request
     *
     * @param consumer_secret {string} the consumer secret
     * @param token_secret {string}  the token secret
     * @param signature_base {string}  the signature base string
     */
    'HMAC-SHA1': function (application_secret, token_secret, signature_base) {
        var passphrase;
        var signature;

        application_secret = encode(application_secret);
        token_secret = encode(token_secret || '');

        passphrase = application_secret + '&' + token_secret;
        signature = Cryptography.hmac(Cryptography.SHA1, passphrase, signature_base);

        return btoa(signature);
    }
};

module.exports = OAuthRequest;