FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration=production

RUN npm install -g serve

EXPOSE 8080

CMD ["serve", "-s", "dist/tarifa-app", "-l", "8080"]
