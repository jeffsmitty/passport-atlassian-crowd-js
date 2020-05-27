"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _passportStrategy = _interopRequireDefault(require("passport-strategy"));

var _error = _interopRequireDefault(require("../error"));

var _crowd = _interopRequireDefault(require("../crowd"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* Copyright 2019 University Of Helsinki (The National Library Of Finland)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
class _default extends _passportStrategy.default {
  constructor({
    url,
    appName,
    appPassword,
    fetchGroupMembership,
    useCache = false
  }) {
    super();
    this.name = 'atlassian-crowd-bearer-token';
    this._crowdClient = (0, _crowd.default)({
      url,
      appName,
      appPassword,
      fetchGroupMembership
    });
    this._useCache = useCache;
    this._cache = {};
  }

  async authenticate(req) {
    const self = this;

    try {
      const token = getToken();
      const userInfo = await getUserInfo(token);
      this.success(userInfo);
    } catch (err) {
      if (err instanceof _error.default) {
        this.fail();
      } else {
        this.error(err);
      }
    }

    async function getUserInfo(token) {
      if (self._useCache) {
        if (isValid()) {
          return self._cache[token].userInfo;
        }

        const sessionInfo = await self._crowdClient.fetchSessionInfo({
          token,
          remoteAddress: (0, _utils.getRemoteAddress)(req)
        });
        const userInfo = await self._crowdClient.fetchUserInfo(sessionInfo.user.name);
        self._cache[token] = {
          userInfo,
          expirationTime: (0, _moment.default)(sessionInfo['expiry-date'])
        };
        return self._cache[token].userInfo;
      }

      const sessionInfo = await self._crowdClient.fetchSessionInfo({
        token,
        remoteAddress: (0, _utils.getRemoteAddress)(req)
      });
      const userInfo = await self._crowdClient.fetchUserInfo(sessionInfo.user.name);
      return userInfo;

      function isValid() {
        clearExpired();
        return token in self._cache;

        function clearExpired() {
          Object.entries(self._cache).forEach(([k, v]) => {
            if ((0, _moment.default)().isAfter(v.expirationTime)) {
              delete self._cache[k];
            }
          });
        }
      }
    }

    function getToken() {
      if (req.headers.authorization) {
        return req.headers.authorization.replace(/^Bearer /, '');
      }

      throw new _error.default();
    }
  }

}

exports.default = _default;
//# sourceMappingURL=bearer-token.js.map