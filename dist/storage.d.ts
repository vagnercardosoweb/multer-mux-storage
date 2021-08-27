import { Request } from 'express';
import { StorageEngine } from 'multer';
import { Client } from './client';
import { MulterMuxStorage } from './types';
export declare class MuxStorage implements StorageEngine {
    protected options: MulterMuxStorage.Constructor;
    protected client: Client;
    constructor(options: MulterMuxStorage.Constructor);
    _handleFile(request: Request, file: Express.Multer.File, cb: MulterMuxStorage.HandleCb): Promise<void>;
    _removeFile(_: Request, file: MulterMuxStorage.OutputFile, cb: MulterMuxStorage.RemoveCb): Promise<void>;
    private getUploadOptions;
    private validateMimeTypes;
}
