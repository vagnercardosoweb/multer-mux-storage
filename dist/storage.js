"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuxStorage = void 0;
const client_1 = require("./client");
class MuxStorage {
    constructor(options) {
        this.options = options;
        this.client = new client_1.Client(options.tokenId, options.tokenSecret);
    }
    async _handleFile(request, file, cb) {
        try {
            this.validateMimeTypes(request, file);
            const { id } = await this.client.uploadVideoWithStream(file.stream, await this.getUploadOptions(request, file));
            cb(null, { muxUploadId: id });
        }
        catch (e) {
            cb(e);
        }
    }
    async _removeFile(_, file, cb) {
        try {
            if (file.muxUploadId) {
                await this.client.cancelVideoUploadById(file.muxUploadId);
            }
            cb(null);
        }
        catch (e) {
            cb(e);
        }
    }
    async getUploadOptions(request, file) {
        var _a;
        let uploadOptions = {};
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.getUploadOptions) {
            uploadOptions = await this.options.getUploadOptions(request, file);
        }
        return uploadOptions;
    }
    validateMimeTypes(_, file) {
        const { allowedMimeTypes } = this.options;
        if (allowedMimeTypes.length === 0) {
            throw new Error('MimeTypes not configuration, contact support.');
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`Only (${allowedMimeTypes.join(',')}) it's allowed.`);
        }
    }
}
exports.MuxStorage = MuxStorage;
//# sourceMappingURL=storage.js.map