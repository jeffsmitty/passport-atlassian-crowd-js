"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _httpStatus = _interopRequireDefault(require("http-status"));

var _error = _interopRequireDefault(require("./error"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default({
  url,
  appName,
  appPassword,
  fetchGroupMembership
}) {
  const authorizationHeader = `Basic ${Buffer.from(`${appName}:${appPassword}`).toString('base64')}`;
  return {
    validateCredentials,
    fetchSessionInfo,
    fetchUserInfo
  };

  async function validateCredentials({
    username,
    password,
    remoteAddress
  }) {
    const response = await (0, _nodeFetch.default)(`${url}/usermanagement/1/session`, {
      method: 'POST',
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        'validation-factors': {
          validationFactors: [{
            name: 'remote_address',
            value: remoteAddress || '127.0.0.1'
          }]
        }
      })
    });

    if (response.status === _httpStatus.default.CREATED) {
      return response.json();
    }

    if (_httpStatus.default.BAD_REQUEST === response.status) {
      throw new _error.default();
    }

    throw new Error(`${response.status}: ${await response.text()}`);
  }

  async function fetchSessionInfo({
    token,
    remoteAddress
  }) {
    const response = await (0, _nodeFetch.default)(`${url}/usermanagement/1/session/${token}`, {
      method: 'POST',
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        validationFactors: [{
          name: 'remote_address',
          value: remoteAddress || '127.0.0.1'
        }]
      })
    });

    if ([_httpStatus.default.CREATED, _httpStatus.default.OK].includes(response.status)) {
      return response.json();
    }

    if (_httpStatus.default.NOT_FOUND === response.status) {
      throw new _error.default();
    }

    throw new Error(`${response.status}: ${await response.text()}`);
  }

  async function fetchUserInfo(username) {
    const response = await (0, _nodeFetch.default)(`${url}/usermanagement/1/user?username=${username}`, {
      headers: {
        Authorization: authorizationHeader,
        Accept: 'application/json'
      }
    });

    if (response.status === _httpStatus.default.OK) {
      const userInfo = parseUserInfo((await response.json()));

      if (fetchGroupMembership) {
        return _objectSpread({}, userInfo, {
          groups: await fetchGroups()
        });
      }

      return userInfo;
    }

    throw new Error(`${response.status}: ${await response.text()}`);
    /* Returns contact schema compliant profile: https://tools.ietf.org/html/draft-smarr-vcarddav-portable-contacts-00 */

    function parseUserInfo(payload) {
      return {
        id: payload.name,
        name: {
          givenName: payload['first-name'],
          familyName: payload['last-name']
        },
        displayName: payload['display-name'],
        emails: [{
          value: payload.email,
          type: 'work'
        }],
        organization: []
      };
    }

    async function fetchGroups() {
      const directGroups = await getGroups('direct');
      const nestedGroups = await getGroups('nested');
      return directGroups.concat(nestedGroups).reduce((acc, group) => {
        return acc.includes(group) ? acc : acc.concat(group);
      }, []);

      async function getGroups(context) {
        const response = await (0, _nodeFetch.default)(`${url}/usermanagement/1/user/group/${context}?username=${username}`, {
          headers: {
            Authorization: authorizationHeader,
            Accept: 'application/json'
          }
        });

        if (response.status === _httpStatus.default.OK) {
          const payload = await response.json();
          return payload.groups.map(g => g.name);
        }

        throw new Error(`${response.status}: ${await response.text()}`);
      }
    }
  }
}
//# sourceMappingURL=crowd.js.map