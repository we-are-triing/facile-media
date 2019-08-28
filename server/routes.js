import joi from '@hapi/joi';
import {promises} from 'fs';
import {join} from 'path';
import fetch from 'node-fetch';
import boom from '@hapi/boom';
import random from './utils/random.js';

const nameValidation = joi
  .string()
  .regex(/[a-zA-Z0-9 _.-]/)
  .required();

const mediaValidation = joi.object({
  tags: joi.array().items(joi.string()),
  name: nameValidation,
  meta: joi.object({
    name: joi.string(),
    lastModified: joi.number(),
    size: joi.number(),
    type: joi.string()
  }),
  media: joi.binary()
});

const filenameValidation = {
  filename: nameValidation
};

const dataDomain = `http://api:8001`;

const getExt = type => {
  switch (type) {
    case `image/jpeg`:
      return `jpg`;
      break;
    case `image/png`:
      return `png`;
      break;
    case `image/gif`:
      return `gif`;
      break;
    case `image/webp`:
      return `webp`;
      break;
    case `image/svg+xml`:
      return `xml`;
      break;
    case `video/mp4`:
      return `mp4`;
      break;
    default:
      return `unknown`;
  }
};

export default server => {
  server.route([
    {
      method: `GET`,
      path: `/{param*}`,
      handler: {
        directory: {
          path: './media'
        }
      }
    },
    {
      method: `POST`,
      path: `/media`,
      options: {
        description: `Updates templates`,
        notes: `Update a template ready to be used.`,
        tags: [`api`, `media`],
        payload: {
          maxBytes: 1000 * 1000 * 10
        },
        validate: {
          payload: mediaValidation
        }
      },
      handler: async (req, h) => {
        try {
          // TODO: random generation
          const {tags, name, media, meta} = req.payload;
          const filename = `${random(15)}.${getExt(meta.type)}`;
          const master = 'self';
          const media64 = media.toString('utf-8');
          const sm = media64.split(',')[1];
          const buf = Buffer.from(sm, 'base64');

          await promises.writeFile(join(`./media`, `${filename}`), buf);
          const body = JSON.stringify({tags, name, filename, meta, master});

          const raw = await fetch(`${dataDomain}/media`, {
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body
          });

          // TODO: do a better media base URL system.
          return {
            path: `http://localhost:8002/${filename}`
          };
        } catch (err) {
          console.error(``, err);
          return boom.badImplementation(`something done broke`);
        }
      }
    }
  ]);
};

/*
- save media
  - the image or video
  - tags
  - name (special tag)
  - filename (generate random name for actual file. DB will store the tags)
  - extract data from asset
  - master ("self" or filename)
- get media
  - don't need a handler, it is static
- modify media
  - core image saved, image is manipulated on delivery, and cached.
  - modifications
    - crop (image)
      - at aspect ratio
      - at size 
      - at subject
    - resize
- get random image
  - can specify tag
  - generate image
*/
