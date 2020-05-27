"use strict";

var _chai = _interopRequireWildcard(require("chai"));

var _chaiPassportStrategy = _interopRequireDefault(require("chai-passport-strategy"));

var _nock = _interopRequireDefault(require("nock"));

var _fixura = _interopRequireDefault(require("@natlibfi/fixura"));

var _bearerCredentials = _interopRequireDefault(require("./bearer-credentials"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
_chai.default.use(_chaiPassportStrategy.default);

describe('strategies/bearer-credentials', () => {
  const {
    getFixture
  } = (0, _fixura.default)({
    root: [__dirname, '..', '..', 'test-fixtures', 'strategies', 'bearer-credentials']
  });
  afterEach(() => {
    _nock.default.cleanAll();
  });
  it('Should call fail() because of invalid credentials', async () => {
    (0, _nock.default)('https://crowd/usermanagement/1/session').post(/.*/).reply(400);
    const strategy = new _bearerCredentials.default({
      url: 'https://crowd',
      appName: 'foo',
      appPassword: 'bar'
    });
    return new Promise((resolve, reject) => {
      _chai.default.passport.use(strategy).success(() => reject(new Error('Should not call success()'))).error(err => reject(new Error(`Should not call error(): ${err.stack}`))).fail(resolve).authenticate();
    });
  });
  it('Should succeed because of valid credentials', (index = '1') => {
    const createSessionResponse = getFixture([index, 'createSessionResponse.json']);
    const fetchUserResponse = getFixture([index, 'fetchUserResponse.json']);
    const token = getFixture([index, 'token.txt']);
    (0, _nock.default)('https://crowd').post('/usermanagement/1/session').reply(201, createSessionResponse).get('/usermanagement/1/user?username=foobar').reply(200, fetchUserResponse);
    const strategy = new _bearerCredentials.default({
      url: 'https://crowd',
      appName: 'foo',
      appPassword: 'bar',
      ssoCookie: 'foo'
    });
    return new Promise((resolve, reject) => {
      _chai.default.passport.use(strategy).fail(() => reject(new Error('Should not call fail()'))).error(err => reject(new Error(`Should not call error(): ${err.stack}`))).success(user => {
        try {
          (0, _chai.expect)(user).to.equal(token);
          resolve();
        } catch (err) {
          reject(err);
        }
      }).req(req => {
        req.headers.authorization = `Basic ${Buffer.from('foobar:barfoo').toString('base64')}`;
      }).authenticate();
    });
  });
  it('Should call error() because of unexpected error', async () => {
    (0, _nock.default)('https://crowd/usermanagement/1/session').post(/.*/).reply(500);
    const strategy = new _bearerCredentials.default({
      url: 'https://crowd',
      appName: 'foo',
      appPassword: 'bar'
    });
    return new Promise((resolve, reject) => {
      _chai.default.passport.use(strategy).success(() => reject(new Error('Should not call success()'))).fail(() => reject(new Error('Should not call fail()'))).error(resolve).req(req => {
        req.headers.authorization = `Basic ${Buffer.from('foobar:barfoo').toString('base64')}`;
      }).authenticate();
    });
  });
});
//# sourceMappingURL=bearer-credentials.spec.js.map