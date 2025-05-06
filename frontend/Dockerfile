FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN rm -rf node_modules package-lock.json

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"] 