const express = require('express');
const multer = require('multer');
const { MuxStorage } = require('@vagnercardoso/multer-mux-storage');

const app = express();
const multerMuxStorage = multer({
  storage: new MuxStorage({
    tokenId: String(process.env.MUX_TOKEN_ID),
    tokenSecret: String(process.env.MUX_TOKEN_SECRET),
    allowedMimeTypes: ['video/mp4'],
  }),
});

app.post('/upload', multerMuxStorage.single('file'), (request, response) => {
  return response.json(request.file);
});

app.listen(3333, () => {
  // eslint-disable-next-line no-console
  console.log(`app running on port 3000`);
});
