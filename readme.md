# Usage
First, install all dependencies
```sh
npm install
```
then you will be able to proceed with one of the actions below.

## Build
Then you will be able to build the project with:
```sh
npm run build
```

## Build and run
Then you will be able to build the project and then running it with:
```sh
npm run build && npm start
```

## Run unit tests
To run all unit tests defined in `/test/`, use:
```sh
npm test
```

# Build and run with `docker`
Build docker image.
```sh
docker build . -t aeolus/simulator
```

Run a docker container with the newly built image and link the external port 49160 to container port 8080.
```sh
docker run -d aeolus/simulator
```
To automatically start the container when docker is started unless the container was manually stopped add `--restart unless-stopped`.
```sh
docker run -d --restart unless-stopped aeolus/simulator
```
