var OAuthRequest = require("../lib/Request.js");

// Fake XHR for mocking Ajax Requests & Responses
function FakeXMLHttpRequest() {
    this.requestHeaders = {};

    this.open = function() {
        this.method = arguments[0];
        this.url = arguments[1];
        this.readyState = 1;
    };

    this.setRequestHeader = function(header, value) {
        this.requestHeaders[header] = value;
    };

    this.abort = function() {
        this.readyState = 0;
    };

    this.readyState = 0;

    this.onreadystatechange = function(isTimeout) {
    };

    this.status = null;

    this.send = function(data) {
        this.params = data;
        this.readyState = 2;
    };

    this.getResponseHeader = function(name) {
        return this.responseHeaders[name];
    };

    this.getAllResponseHeaders = function() {
        var responseHeaders = [];
        for (var i in this.responseHeaders) {
            if (this.responseHeaders.hasOwnProperty(i)) {
                responseHeaders.push(i + ': ' + this.responseHeaders[i]);
            }
        }
        return responseHeaders.join('\r\n');
    };

    this.responseText = null;

    this.response = function(response) {
        this.status = response.status;
        this.responseText = response.responseText || "";
        this.readyState = 4;
        this.responseHeaders = response.responseHeaders || {"Content-type": response.contentType || "application/json" };

        this.onreadystatechange();
    };

    this.responseTimeout = function() {
        this.readyState = 4;
        this.onreadystatechange('timeout');
    };

    this.addEventListener = function (event, listener) {
        this.onreadystatechange = listener;
    };

    return this;
}

var fakexhr = new FakeXMLHttpRequest();

function isInstanceOf(value, expected) {
    return value instanceof expected;
}

function isDefined(value) {
    return value !== undefined;
}

exports.basic = function (test) {
    test.expect(2);
    test.ok(isDefined(OAuthRequest), "OAuthRequest is defined");

    var xhr = new OAuthRequest();
    test.ok(isInstanceOf(xhr, OAuthRequest), "xhr is an instance of OAuthRequest");

    test.done();
};

exports.request = function (test) {
    test.expect(1);

    var xhr = new OAuthRequest();
    xhr.request = fakexhr;
    xhr.request.headers = {};

    xhr.open("GET", "http://www.google.co.uk", true);

    xhr.addEventListener("readystatechange", function (event) {
        if (xhr.readyState === xhr.DONE && xhr.status == 200) {
            test.ok(true, "Request completed");
            test.done();
        }
    });

    xhr.send(null);
    xhr.request.response({
        status: 200
    });
};

exports.signedRequest = function (test) {
    test.expect(1);

    var xhr = new OAuthRequest();
    xhr.request = fakexhr;
    xhr.request.headers = {};

    xhr.applicationKey = "";
    xhr.applicationSecret = "";
    xhr.accessTokenKey = "";
    xhr.accessTokenSecret = "";

    xhr.open("GET", "http://api.twitter.com/1/statuses/home_timeline.json", true);

    xhr.addEventListener("readystatechange", function (event) {
        if (xhr.readyState === xhr.DONE && xhr.status == 200) {
            test.ok(true, "Request completed");
            test.done();
        }
    });


    xhr.send(null);
    xhr.request.response({
        status: 200
    });
};

/*
describe("OAuth2.0 XMLHttpRequest", function () {
    it("Should exist", function () {
        var OAuthRequest = window.OAuthRequest;

        expect(OAuthRequest).toBeDefined();

        var xhr = new OAuthRequest;
        expect(xhr).toBeInstanceOf(OAuthRequest);
    });

    var xhr = new OAuthRequest(),
            done = true;

        jQuery.ajaxSettings.xhr =  function () {
            var xhr =  new OAuthRequest;
            xhr.applicationKey = applicationKey;
            xhr.applicationSecret = applicationSecret;
            xhr.accessTokenKey = accessTokenKey;
            xhr.accessTokenSecret = accessTokenSecret;

            return xhr;
        };

        waitsFor(function () {
            return done;
        }, "Request never completed", 10000);

        $.ajax("https://graph.facebook.com/oauth/access_token?client_id=" + applicationKey + "&client_secret=" + applicationSecret + "&grant_type=client_credentials", {success: function (data, textStatus, jqXHR) {
            done = true;
        }});
});
*/