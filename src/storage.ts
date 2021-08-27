import { Request } from 'express';
import { StorageEngine } from 'multer';

import { Client } from './client';
import { MulterMuxStorage } from './types';

export class MuxStorage implements StorageEngine {
  protected client: Client;

  constructor(protected options: MulterMuxStorage.Constructor) {
    this.client = new Client(options.tokenId, options.tokenSecret);
  }

  async _handleFile(
    request: Request,
    file: Express.Multer.File,
    cb: MulterMuxStorage.HandleCb,
  ) {
    try {
      this.validateMimeTypes(request, file);

      const { id } = await this.client.uploadVideoWithStream(
        file.stream,
        await this.getUploadOptions(request, file),
      );

      cb(null, { muxUploadId: id });
    } catch (e) {
      cb(e);
    }
  }

  async _removeFile(
    _: Request,
    file: MulterMuxStorage.OutputFile,
    cb: MulterMuxStorage.RemoveCb,
  ) {
    try {
      if (file.muxUploadId) {
        await this.client.cancelVideoUploadById(file.muxUploadId);
      }

      cb(null);
    } catch (e) {
      cb(e);
    }
  }

  private async getUploadOptions(request: Request, file: Express.Multer.File) {
    let uploadOptions = {};

    if (this.options?.getUploadOptions) {
      uploadOptions = await this.options.getUploadOptions(request, file);
    }

    return uploadOptions;
  }

  private validateMimeTypes(_: Request, file: Express.Multer.File) {
    const { allowedMimeTypes } = this.options;

    if (allowedMimeTypes.length === 0) {
      throw new Error('MimeTypes not configuration, contact support.');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Only (${allowedMimeTypes.join(',')}) it's allowed.`);
    }
  }
}
