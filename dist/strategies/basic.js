"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
    ssoCookie = 'crowd.token_key'
  }) {
    super();
    this.name = 'atlassian-crowd-basic';
    this._crowdClient = (0, _crowd.default)({
      url,
      appName,
      appPassword,
      fetchGroupMembership
    });
    this._ssoCookie = ssoCookie;
  }

  async authenticate(req) {
    const self = this;

    try {
      const token = getToken();

      if (token) {
        const sessionInfo = await self._crowdClient.fetchSessionInfo({
          token,
          remoteAddress: (0, _utils.getRemoteAddress)(req)
        });
        const userInfo = await self._crowdClient.fetchUserInfo(sessionInfo.user.name);
        this.success(userInfo);
      } else {
        const {
          username,
          password
        } = (0, _utils.getCredentials)(req);
        const sessionInfo = await self._crowdClient.validateCredentials({
          username,
          password,
          remoteAddress: (0, _utils.getRemoteAddress)(req)
        });
        const userInfo = await self._crowdClient.fetchUserInfo(sessionInfo.user.name);
        this.success(userInfo);
      }
    } catch (err) {
      if (err instanceof _error.default) {
        this.fail();
      } else {
        this.error(err);
      }
    }

    function getToken() {
      if (req.headers.cookie) {
        var cookieArr = req.headers.cookie.split(';');

        for (var i = 0; i < cookieArr.length; i++) {
          var cookiePair = cookieArr[i].split('=');

          if (self._ssoCookie === cookiePair[0].trim()) {
            return cookiePair[1];
          }
        }

        return null;
      }
    }
  }

}

exports.default = _default;
//# sourceMappingURL=basic.js.map