import joi from '@hapi/joi';

export default server => {
  server.route([
    {
      method: `GET`,
      path: `/{param*}`,
      handler: {
        directory: {
          path: 'client'
        }
      }
    },
    {
      method: `POST`,
      path: `/{filename}`,
      options: {
        description: `Updates templates`,
        notes: `Update a template ready to be used.`,
        tags: [`api`, `content`, `template`],
        validate: {
          payload: {
            meta: joi.object({
              type: joi.string().required(),
              icon: joi.string().required(),
              tags: joi.array().items(joi.string())
            }),
            values: joi.array().items(
              joi
                .object({
                  name: joi
                    .string()
                    .regex(/[a-zA-Z _-]/)
                    .required(),
                  type: joi
                    .string()
                    .valid(`string`, `text`, `text_block`, `number`, `boolean`, `object`, `region`, `set`, `list`)
                    .required()
                })
                .when(joi.object({type: `region`}).unknown(), {
                  then: joi.object({
                    region: joi
                      .string()
                      .valid(`fluid`, `fixed`, `single`, `static`)
                      .required(),
                    components: joi.array().items(joi.string())
                  })
                })
            )
          }
        }
      },
      handler: async (req, h) => {
        try {
        } catch (err) {
          console.error(``, err);
          return `fourOFour()`;
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
