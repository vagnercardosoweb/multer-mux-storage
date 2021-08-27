/// <reference types="node" />
import { Readable } from 'stream';
import { MulterMuxStorage } from './types';
export declare class Client {
    protected tokenId: string;
    protected tokenSecret: string;
    protected $baseUrl: string;
    constructor(tokenId: string, tokenSecret: string);
    uploadVideoWithStream(videoReadable: Readable, uploadOptions?: MulterMuxStorage.UploadOptions): Promise<{
        id: any;
        url: any;
    }>;
    cancelVideoUploadById(uploadId: string): Promise<void>;
    private removeAssetById;
    private getAssetsByUploadId;
    private createUpload;
    private getHeaderAuthorization;
    private request;
}
