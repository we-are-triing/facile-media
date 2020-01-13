import {promises} from 'fs';
import {join} from 'path';
import fetch from 'node-fetch';

const dataDomain = `http://api:24041`;

export const writeFile = async ({buf, tags, name, filename, meta, master}) => {
  const body = JSON.stringify({tags, name, filename, meta, master});
  await promises.writeFile(join(`/facile/media`, filename), buf);
  await fetch(`${dataDomain}/media`, {
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body
  });
};

export const readFile = async ({filename}) => {
  const ps = await Promise.all([promises.readFile(join(`/facile/media`, filename)), fetch(`${dataDomain}/media/${filename}`)]);
  const res = await ps[1].json();
  const media = Buffer.from(ps[0], 'base64');
  return {media, type: res[0].meta.type};
};
