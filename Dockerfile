#########################
# STAGE Build
FROM node:16 AS build
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
RUN npm install

# Build app from source
COPY . .
RUN npm run build

#########################
# STAGE Run
FROM node:16
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install

# Copy app built from build stage
COPY --from=build /usr/src/app/dist dist

EXPOSE 8080
CMD [ "npm", "start" ]