FROM node:12-alpine
RUN mkdir -p /home/node/media/node_modules && chown -R node:node /home/node/media
WORKDIR /home/node/media
COPY package*.json ./

USER node
RUN npm install
COPY --chown=node:node . .

VOLUME .:/home/node/media
VOLUME ./media:/home/node/media/media

EXPOSE 24042

CMD [ "npm", "start" ]