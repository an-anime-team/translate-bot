FROM node:16-alpine
WORKDIR /translatebot

COPY . ./
RUN apk add --no-cache python3 make g++
RUN npm i
RUN npm run build

CMD ["sh", "run.sh"]
