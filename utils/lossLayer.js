const Canvas = require('canvas');
const request = require('request');
const d3 = require('d3');

const Image = Canvas.Image;

function doRequest(requestConfig) {
  return new Promise((resolve, reject) => {
    request(requestConfig, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

async function getTile(z, x, y) {
  const TILE_URL = `https://storage.googleapis.com/wri-public/Hansen15/tiles/hansen_world/v1/tc30/${z}/${x}/${y}.png`;
  const response = await doRequest({
    uri: TILE_URL,
    method: 'GET',
    encoding: null
  });
  return response;
}


class LossLayer {
  static filterImgData(data, w, h, z) {
    const components = 4;
    const exp = z < 11 ? 0.3 + ((z - 3) / 20) : 1;
    const yearStart = 2001;
    const yearEnd = 2016;
    const imgData = data;

    const myscale = d3.scale.pow()
      .exponent(exp)
      .domain([0, 256])
      .range([0, 256]);

    for (let i = 0; i < w; ++i) {
      for (let j = 0; j < h; ++j) {
        const pixelPos = (j * (w + i)) * components;
        const intensity = imgData[pixelPos];
        const yearLoss = 2000 + (imgData[pixelPos + 2]);

        console.log(yearLoss);

        if (yearLoss >= yearStart && yearLoss < yearEnd) {
          imgData[pixelPos] = 220;
          imgData[pixelPos + 1] = (72 - z) + 102 - (3 * myscale(intensity) / z);
          imgData[pixelPos + 2] = (33 - z) + 153 - ((intensity) / z);
          imgData[pixelPos + 3] = z < 13 ? myscale(intensity) : intensity;
        } else {
          imgData[pixelPos + 3] = 0;
        }
      }
    }

    return imgData;
  }

  constructor(z, x, y) {
    this.opts = { z, x, y };
  }

  async getCanvasTile(callback) {
    const { z, x, y } = this.opts;
    const canvas = new Canvas(256, 256);
    const ctx = canvas.getContext('2d');
    const zsteps = z - 12;
    const tile = await getTile(z, x, y);
    const image = new Image();
    image.src = tile;

    // this will allow us to sum up the dots when the timeline is running
    ctx.clearRect(0, 0, 256, 256);

    if (zsteps < 0) {
      ctx.drawImage(image, 0, 0);
    } else {
      // over the maxzoom, we'll need to scale up each tile
      ctx.imageSmoothingEnabled = false;
      // disable pic enhancement
      ctx.mozImageSmoothingEnabled = false;

      // tile scaling
      const srcX = (256 / Math.pow(2, zsteps) * (canvasData.x % Math.pow(2, zsteps))) | 0;
      const srcY = (256 / Math.pow(2, zsteps) * (canvasData.y % Math.pow(2, zsteps))) | 0;
      const srcW = (256 / Math.pow(2, zsteps)) | 0;
      const srcH = (256 / Math.pow(2, zsteps)) | 0;

      ctx.drawImage(image, 0, 0, image.width, image.height);
    }

    const I = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(I.data, canvas.width, canvas.height);
    // LossLayer.filterImgData(I.data, canvas.width, canvas.height, z);
    // ctx.putImageData(I, 0, 0);

    if (callback && typeof callback === 'function') callback(canvas);

    return canvas;
  }

  async getImageTile(format = 'image/png', callback) {
    const canvasTile = await this.getCanvasTile();
    const imageString = canvasTile.toDataURL(format);
    const imageResult = new Buffer(imageString.split(',')[1], 'base64');
    if (callback && typeof callback === 'function') callback(imageResult);
    return imageResult;
  }
}

module.exports = LossLayer;
