FROM node:20-alpine

WORKDIR /app

# copy package ก่อน เพื่อให้ docker cache layer ของ npm install
COPY package*.json ./
RUN npm install --omit=dev

# copy โค้ดที่เหลือ
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
