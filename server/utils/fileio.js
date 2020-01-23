import {promises} from 'fs';
import {join} from 'path';
import fetch from 'node-fetch';
import aws from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const dataDomain = `http://api:24041`;
const s3 = new aws.S3({
  accessKeyId: process.env.S3_ID,
  secretAccessKey: process.env.S3_SECRET
});

export const writeFile = async ({buf, tags, name, filename, meta, master}) => {
  const body = JSON.stringify({tags, name, filename, meta, master});
  // await promises.writeFile(join(`/facile/media`, filename), buf);
  await fetch(`${dataDomain}/media`, {
    headers: {'Content-Type': 'application/json'},
    method: 'POST',
    body
  });

  await s3.upload(
    {
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      Body: buf
    },
    (err, data) => {
      console.log(err, data);
      if (err) throw err;
      console.log(`File uploaded successfully. ${data.Location}`);
    }
  );
};

export const readFile = async ({filename}) => {
  // TODO: add last access for reporting.
  const ps = await Promise.all([fetch(`${process.env.S3_PATH}/${filename}`), fetch(`${dataDomain}/media/${filename}`)]);
  const res = await ps[1].json();
  const rawBuffer = await ps[0].buffer();
  const media = Buffer.from(rawBuffer, 'base64');
  return {media, type: res[0].meta.type};
};

export const deleteFile = async ({filename, deleteData}) => {
  try {
    await promises.unlink(join(`/facile/media`, `${filename}`));
  } catch (err) {
    console.error(err);
    return `Failed to delete ${filename}`;
  }

  if (deleteData) {
    await fetch(`${dataDomain}/media`, {
      headers: {'Content-Type': 'application/json'},
      method: 'DELETE',
      body: JSON.stringify({filename})
    });
  }
  return `deleted ${filename}`;
};
