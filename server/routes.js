import joi from '@hapi/joi';
import {promises} from 'fs';
import {join} from 'path';
import fetch from 'node-fetch';
import boom from '@hapi/boom';
import random from './utils/random.js';
import {writeFile, readFile} from './utils/fileio.js';

const nameReg = /[a-zA-Z0-9 _\-]+/;

const nameValidation = joi
  .string()
  .regex(nameReg)
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

const getExt = type => {
  switch (type) {
    case `image/jpeg`:
      return `jpg`;
    case `image/png`:
      return `png`;
    case `image/gif`:
      return `gif`;
    case `image/webp`:
      return `webp`;
    case `image/svg+xml`:
      return `xml`;
    case `video/mp4`:
      return `mp4`;
    default:
      return `unknown`;
  }
};

export default server => {
  server.route([
    {
      method: `GET`,
      path: `/{filename}`,
      // options: {
      //   validate: {
      //     payload: nameValidation
      //   }
      // },
      handler: async (req, h) => {
        try {
          const {filename} = req.params;
          const {media, type} = await readFile({filename});
          return h.response(media).type(type);
        } catch (err) {
          console.error(``, err);
          return boom.badImplementation(`something done broke`);
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
          const {tags, name, media, meta} = req.payload;
          const filename = `${random(15)}.${getExt(meta.type)}`;
          const master = 'self';
          const media64 = media.toString('utf-8');
          const sm = media64.split(',')[1];
          const buf = Buffer.from(sm, 'base64');

          await writeFile({buf, tags, name, filename, meta, master});

          return {
            // TODO: this needs to be pointed to the dynamic URL.
            path: `/proxy/static/media/${filename}`,
            filename
          };
        } catch (err) {
          console.error(``, err);
          return boom.badImplementation(`something done broke`);
        }
      }
    },
    {
      method: `DELETE`,
      path: `/media`,
      options: {
        description: `Deletes media`,
        notes: `This will delete the media item, and send the request to delete the data from the store. It has an optional param to delete the data also, default is true`,
        tags: [`api`, `media`],
        validate: {
          payload: filenameValidation
        }
      },
      handler: async (req, h) => {
        try {
          const {filename, deleteData = true} = req.payload;
          try {
            await promises.unlink(join(`/facile/media`, `${filename}`));
          } catch (err) {
            console.error(err);
          }

          if (deleteData) {
            await fetch(`${dataDomain}/media`, {
              headers: {'Content-Type': 'application/json'},
              method: 'DELETE',
              body: JSON.stringify({filename})
            });
          }

          return {
            message: `deleted ${filename}`
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
