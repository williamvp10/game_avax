FROM node:21

COPY ["./","/usr/src/"]

WORKDIR /usr/src/

RUN npm install

EXPOSE 3800

CMD ["node", "index.js"]