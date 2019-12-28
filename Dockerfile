FROM node:12-alpine
RUN mkdir -p /home/node/media/node_modules && chown -R node:node /home/node/media
RUN mkdir -p /facile/media

WORKDIR /home/node/media
COPY package*.json ./

USER node
RUN npm install
COPY --chown=node:node . .

VOLUME /home/node/media /facile/media

EXPOSE 24042

CMD [ "npm", "start" ]