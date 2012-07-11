exports.test = function () {
    return !!require('w3c-xmlhttprequest').XMLHttpRequest;
};
exports.factory = function () {
    var XMLHttpRequest = require('w3c-xmlhttprequest').XMLHttpRequest;
    return new XMLHttpRequest();
};