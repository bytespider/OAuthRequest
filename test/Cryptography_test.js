var Utils = require("../lib/Cryptography/Utils.js");
var Cryptography = require("../lib/Cryptography.js");

exports.basics = function (test) {
    test.expect(6);

    test.ok(Cryptography.SHA1 !== undefined, 'function SHA1 exists');

    test.equals(Utils.zeropad(0).join(''), '', 'zeropad can pad to 0 bytes');
    test.equals(Utils.zeropad(10).join(''), '0000000000', 'zeropad can pad to 10 bytes');
    test.equals(Utils.zeropad(100).join(''), '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'zeropad can pad to 100 bytes');


    test.deepEqual(Utils.stringToByteArray("ü"), [195, 188], 'UTF-8 character "ü" encodes correctly in byte array');
    test.deepEqual(Utils.stringToByteArray("ß"), [195, 159], 'UTF-8 character "ß" encodes correctly in byte array');

    test.done();
};

exports.digest = function (test) {
    test.expect(4);

    test.equals(Cryptography.digest(function (string) {
        return string;
    }, ''), '', 'Output test 1');
    test.equals(Cryptography.digest(function (string) {
        return string;
    }, 'test'), '74657374', 'Output test 2');
    test.deepEqual(Cryptography.digest(function (string) {
        return string;
    }, '', true), '', 'Output test 3');
    test.deepEqual(Cryptography.digest(function (string) {
        return string;
    }, 'test', true), 'test', 'Output test 4');

    test.done();
};

exports.sha1 = function (test) {
    test.expect(9);

    test.equals(Cryptography.digest(Cryptography.SHA1, ''), 'da39a3ee5e6b4b0d3255bfef95601890afd80709', 'Output test 1');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'f'), '4a0a19218e082a343a1b17e5333409af9d98f0f5', 'Output test 2');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'fo'), '19082866d46a5a57bfeffe585d8362c149676c90', 'Output test 3');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'foo'), '0beec7b5ea3f0fdbc95d0dd47f3c5bc275da8a33', 'Output test 4');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'foob'), '2ca60ec33da4ccdf3c5b4944a2e831a70d76d7c7', 'Output test 5');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'fooba'), 'bf3f6e65daa76dde92612355478885eb52473854', 'Output test 6');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'foobar'), '8843d7f92416211de9ebb963ff4ce28125932878', 'Output test 7');

    test.equals(Cryptography.digest(Cryptography.SHA1, 'ü'), '94a759fd37735430753c7b6b80684306d80ea16e', 'Output test 8');
    test.equals(Cryptography.digest(Cryptography.SHA1, 'ß'), '00b39d61cc9b61a36437c4de643ec56b831e36d5', 'Output test 9');

    test.done();
};

exports.hmacsha1 = function (test) {
    test.expect(6);

    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, 'secret', 'foobar', false), 'e44a419029567ed59bfd015f4dae978d08baeb85', 'Output test 1');
    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, 'Jefe', 'what do ya want for nothing?', false), '156d4c35468a0339f3fa57a067bf47f814eb7a57', 'Output test 2');
    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, 'secrety secret thing', 'jsOAuth rocks!', false), '5f5b5538988df266effa0a4578b3b5a58dbb058e', 'Output test 3');
    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, (new Array(101)).join(0), (new Array(101)).join(0), false), '1c8aa692da5848547b7d599436bb9e30d4d93d07', 'Output test 4');
    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, (new Array(1001)).join(0), (new Array(1001)).join(0), false), '06b7cde817007313eab69aaae86a9f6431210a21', 'Output test 5');
    test.equals(
    Cryptography.hmac(
    Cryptography.SHA1, '', '', false), 'fbdb1d1b18aa6c08324b7d64b71fb76370690e1d', 'Output test 6');

    test.done();
};