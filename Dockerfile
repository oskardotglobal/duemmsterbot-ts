FROM node:16
RUN mkdir -p /home/container
WORKDIR /home/container

COPY package.json /home/container
RUN npm install

COPY . /home/container
RUN npm build

CMD ["npm", "start"]
