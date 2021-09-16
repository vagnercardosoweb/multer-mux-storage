"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const https_1 = __importDefault(require("https"));
const stream_1 = require("stream");
const util_1 = require("util");
const debug_1 = require("debug");
const logger = debug_1.debug('multer-mux-storage:client');
class Client {
    constructor(tokenId, tokenSecret) {
        this.tokenId = tokenId;
        this.tokenSecret = tokenSecret;
        this.$baseUrl = 'https://api.mux.com';
    }
    async uploadVideoWithStream(videoReadable, uploadOptions) {
        const { id, url } = await this.createUpload(uploadOptions);
        logger(`init upload pipeline -> ${id}`);
        await util_1.promisify(stream_1.pipeline)(videoReadable, https_1.default.request(url, { method: 'PUT' }));
        logger(`finish upload pipeline -> ${id}`);
        return { id, url };
    }
    async cancelVideoUploadById(uploadId) {
        const path = `/video/v1/uploads/${uploadId}/cancel`;
        logger(`request: ${path}`);
        await this.request({ path, method: 'PUT' });
        logger(`success: ${path}`);
        const assets = await this.getAssetsByUploadId(uploadId);
        await Promise.all(assets === null || assets === void 0 ? void 0 : assets.map(async (row) => {
            await this.removeAssetById(row.id);
        }));
    }
    async removeAssetById(assetId) {
        const path = `/video/v1/assets/${assetId}`;
        logger(`request: ${path}`);
        await this.request({ path, method: 'DELETE' });
        logger(`success: ${path}`);
    }
    async getAssetsByUploadId(uploadId) {
        const path = `/video/v1/assets?upload_id=${uploadId}`;
        logger(`request: ${path}`);
        const response = await this.request({ path, method: 'GET' });
        logger(`success: ${path}, total: ${response.body.data.length}`);
        return response.body.data;
    }
    async createUpload(options) {
        var _a;
        const path = '/video/v1/uploads';
        logger(`request: ${path}`);
        const body = Object.assign(Object.assign({ cors_origin: '*' }, (options !== null && options !== void 0 ? options : {})), { new_asset_settings: Object.assign({ playback_policy: ['public'] }, ((_a = options === null || options === void 0 ? void 0 : options.new_asset_settings) !== null && _a !== void 0 ? _a : {})) });
        const response = await this.request({
            path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const { id, url } = response.body.data;
        logger(`success: ${path} -> ${id}`);
        return { id, url };
    }
    getHeaderAuthorization() {
        return `Basic ${Buffer.from(`${this.tokenId}:${this.tokenSecret}`).toString('base64')}`;
    }
    async request(options) {
        const { path, body } = options, rest = __rest(options, ["path", "body"]);
        const url = `${this.$baseUrl}${path}`;
        const response = await new Promise((resolve, reject) => {
            var _a, _b;
            const chunks = [];
            rest.headers = Object.assign(Object.assign({}, rest.headers), { authorization: this.getHeaderAuthorization() });
            const request = https_1.default.request(url, rest, res => {
                res.on('error', reject);
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => {
                    var _a;
                    return resolve({
                        body: JSON.parse(Buffer.concat(chunks).toString()),
                        statusCode: (_a = res.statusCode) !== null && _a !== void 0 ? _a : 500,
                    });
                });
            });
            request.on('error', reject);
            if (['POST', 'PUT', 'PATCH'].includes((_b = (_a = options.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '') &&
                body) {
                request.write(body);
            }
            request.end();
        });
        if (response.statusCode >= 400) {
            throw new Error('Unable to make request to mux.');
        }
        return response;
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map