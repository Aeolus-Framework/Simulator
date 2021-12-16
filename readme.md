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

## Develop
To rebuild and start the application when a file in the project is saved, use:
```sh
npm run dev
```

# Enviroment variables avaliable
| name                            | description                                                 |
|---------------------------------|-------------------------------------------------------------|
| `MONGODB_HOST`                  | Host with a mongo instance running, may include port number |
| `MONGODB_DATABASE`              | Database to use                                             |
| `MONGODB_USERNAME` *(optional)* | Username to access database                                 |
| `MONGODB_PASSWORD` *(optional)* | Password to access database                                 |

# Build and run with docker
Build the docker image.
```sh
docker build . -t aeolus/simulator
```

Run a docker container with the newly built image.
```sh
docker run -d aeolus/simulator
```
To add enviroment variables, add `--env VARIABLE=VALUE` for each enviroment variable to use.
