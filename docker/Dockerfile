FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY packages/core/package.json packages/core/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/dashboard/package.json packages/dashboard/package.json

RUN npm install

COPY . .

EXPOSE 3000 3001

CMD ["npm", "run", "start:server"]

