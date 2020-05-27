"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "BearerCredentialsStrategy", {
  enumerable: true,
  get: function () {
    return _bearerCredentials.default;
  }
});
Object.defineProperty(exports, "BearerTokenStrategy", {
  enumerable: true,
  get: function () {
    return _bearerToken.default;
  }
});
Object.defineProperty(exports, "BasicStrategy", {
  enumerable: true,
  get: function () {
    return _basic.default;
  }
});

var _bearerCredentials = _interopRequireDefault(require("./bearer-credentials"));

var _bearerToken = _interopRequireDefault(require("./bearer-token"));

var _basic = _interopRequireDefault(require("./basic"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map