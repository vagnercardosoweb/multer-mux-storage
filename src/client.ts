import https, { RequestOptions } from 'https';
import { pipeline, Readable } from 'stream';
import { promisify } from 'util';
import { debug } from 'debug';
import { MulterMuxStorage } from './types';

const logger = debug('multer-mux-storage:client');

interface Options extends RequestOptions {
  path: string;
  body?: string;
}

export class Client {
  protected $baseUrl = 'https://api.mux.com';

  constructor(protected tokenId: string, protected tokenSecret: string) {}

  public async uploadVideoWithStream(
    videoReadable: Readable,
    uploadOptions?: MulterMuxStorage.UploadOptions,
  ) {
    const { id, url } = await this.createUpload(uploadOptions);

    logger(`init upload pipeline -> ${id}`);

    await promisify(pipeline)(
      videoReadable,
      https.request(url, { method: 'PUT' }),
    );

    logger(`finish upload pipeline -> ${id}`);

    return { id, url };
  }

  public async cancelVideoUploadById(uploadId: string): Promise<void> {
    const path = `/video/v1/uploads/${uploadId}/cancel`;
    logger(`request: ${path}`);

    await this.request({ path, method: 'PUT' });
    logger(`success: ${path}`);

    const assets = await this.getAssetsByUploadId(uploadId);

    await Promise.all(
      assets?.map(async (row: any) => {
        await this.removeAssetById(row.id);
      }),
    );
  }

  private async removeAssetById(assetId: string): Promise<void> {
    const path = `/video/v1/assets/${assetId}`;
    logger(`request: ${path}`);

    await this.request({ path, method: 'DELETE' });
    logger(`success: ${path}`);
  }

  private async getAssetsByUploadId(uploadId: string): Promise<any[]> {
    const path = `/video/v1/assets?upload_id=${uploadId}`;
    logger(`request: ${path}`);

    const response = await this.request({ path, method: 'GET' });
    logger(`success: ${path}, total: ${response.body.data.length}`);

    return response.body.data;
  }

  private async createUpload(options?: MulterMuxStorage.UploadOptions) {
    const path = '/video/v1/uploads';
    logger(`request: ${path}`);

    const body = {
      cors_origin: '*',
      ...(options ?? {}),
      new_asset_settings: {
        playback_policy: ['public'],
        ...(options?.new_asset_settings ?? {}),
      },
    } as MulterMuxStorage.UploadOptions;

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

  private getHeaderAuthorization(): string {
    return `Basic ${Buffer.from(`${this.tokenId}:${this.tokenSecret}`).toString(
      'base64',
    )}`;
  }

  private async request(options: Options): Promise<any> {
    const { path, body, ...rest } = options;
    const url = `${this.$baseUrl}${path}`;

    const response = await new Promise<any>((resolve, reject) => {
      const chunks: any[] = [];

      rest.headers = {
        ...rest.headers,
        authorization: this.getHeaderAuthorization(),
      };

      const request = https.request(url, rest, res => {
        res.on('error', reject);
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () =>
          resolve({
            body: JSON.parse(Buffer.concat(chunks).toString()),
            statusCode: res.statusCode ?? 500,
          }),
        );
      });

      if (
        ['POST', 'PUT', 'PATCH'].includes(
          options.method?.toUpperCase() ?? '',
        ) &&
        body
      ) {
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
