"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _strategies = require("./strategies");

Object.keys(_strategies).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _strategies[key];
    }
  });
});
//# sourceMappingURL=index.js.map