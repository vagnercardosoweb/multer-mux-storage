# multer-mux-storage

> Uploading video to MUX using Multer with Express

## Installation

`npm install multer-mux-storage`

## Usage

Using express with typescript:

```typescript
import express from 'express';
import { MuxStorage } from 'multer-mux-storage';
import multer from 'multer';

const app = express();
const multerMuxStorage = multer({
  storage: new MuxStorage({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    allowedMimeTypes: ['video/mp4'],
  }),
});

app.post('/upload', multerMuxStorage.single('archive'), (request, response) => {
  return response.json(request.file);
});

app.listen(3000, () => {
  console.log(`app running on port 3000`);
});
```

## MuxStorage constructor

Possible settings to pass to the class's constructor

```typescript
{
    tokenId: string;
    tokenSecret: string;
    allowedMimeTypes: string[];
    getUploadOptions?: (
      request: Request,
      file: Express.Multer.File,
    ) => Promise<UploadOptions>;
}
```

### Required options

- `tokenId` token provided by [mux.com](https://mux.com)
- `tokenSecret` secret key provided by [mux.com](https://mux.com)
- `allowedMimeTypes` receives an array of possible mimetypes to accept the upload

### Optional options

- `getUploadOptions` async function that receives the request is the file per parameter to return the [request parameters](https://docs.mux.com/api-reference/video#operation/create-direct-upload) to create the upload in mux.

### Data returned along with the multer in the interface `Express.Multer.File`

- `muxUploadId` id of the upload done on mux

To retrieve the id in your route, you must use `request.file.muxUploadId`

The id is for you to be able to retrieve the created assets and have all the information of your uploaded video.
