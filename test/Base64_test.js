var base64 = require('../lib/Base64.js');

exports.testBase64Basics = function (test) {
    test.expect(1);
    test.ok(base64.btoa !== undefined, 'function btoa exists');
    //test.ok(base64.atob !== undefined, 'function atob exists');
    test.done();
};

exports.testBase64Encode = function (test) {
    test.expect(7);
    test.equals(base64.btoa(''), '', 'Output test 1');
    test.equals(base64.btoa('f'), 'Zg==', 'Output test 2');
    test.equals(base64.btoa('fo'), 'Zm8=', 'Output test 3');
    test.equals(base64.btoa('foo'), 'Zm9v', 'Output test 4');
    test.equals(base64.btoa('foob'), 'Zm9vYg==', 'Output test 5');
    test.equals(base64.btoa('fooba'), 'Zm9vYmE=', 'Output test 6');
    test.equals(base64.btoa('foobar'), 'Zm9vYmFy', 'Output test 7');
    test.done();
};

// Not required by jsOAuth
/*
exports.testBase64Decode = function (test) {
    test.expect(7);
    test.equals(base64.atob(''),         '',         'Output test 1');
    test.equals(base64.atob('Zg=='),     'f',        'Output test 2');
    test.equals(base64.atob('Zm8='),     'fo',       'Output test 3');
    test.equals(base64.atob('Zm9v'),     'foo',      'Output test 4');
    test.equals(base64.atob('Zm9vYg=='), 'foob',     'Output test 5');
    test.equals(base64.atob('Zm9vYmE='), 'fooba',    'Output test 6');
    test.equals(base64.atob('Zm9vYmFy'), 'foobar',   'Output test 7');
    test.done();
};
*/