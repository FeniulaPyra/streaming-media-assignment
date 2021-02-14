const fs = require('fs');
const path = require('path');

const getMedia = (request, response, filePath, fileType) => {
  const file = path.resolve(__dirname, filePath);

  // gets the file
  fs.stat(file, (err, stats) => {
    // if the file can't be loaded, return an erro response
    if (err) {
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }
      return response.end(err);
    }

    // gets the requested byte range (length) of the media
    let { range } = request.headers;
    if (!range) {
      range = 'bytes=0-';
    }

    // gets the requested position in the media
    const position = range.replace(/bytes=/, '').split('-');

    // gets the start position
    let start = parseInt(position[0], 10);

    // gets the end position
    const total = stats.size;
    const end = position[1] ? parseInt(position[1], 10) : total - 1;

    // makes sure start isn't past the end
    if (start > end) {
      start = end - 1;
    }

    console.log({ start }, { end });

    // gets range of position
    const chunksize = (end - start) + 1;

    // writes the response headers
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': fileType,
    });

    // reads the file
    const stream = fs.createReadStream(file, { start, end });

    // streams the file into the response
    stream.on('open', () => {
      stream.pipe(response);
    });

    // stops streaming when there is an error or we run out of bytes
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return 0;
  });
};

const getParty = (request, response) => {
  getMedia(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  getMedia(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  getMedia(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports = {
  getParty,
  getBling,
  getBird,
};
