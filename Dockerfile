FROM node:latest
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . ./
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force
EXPOSE 3000
CMD ["npm", "start"]
