# Simulator

![Build Status](https://jenkins.aeolus.se/buildStatus/icon?job=aeolus-simulator)

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

| name                                | description                                                     | default     |
| ----------------------------------- | --------------------------------------------------------------- | ----------- |
| `MONGODB_HOST`                      | Host with a mongo instance running, may include port number     |
| `MONGODB_DATABASE`                  | Database to use                                                 |
| `MONGODB_USERNAME` _(optional)_     | Username to access database                                     | _None_      |
| `MONGODB_PASSWORD` _(optional)_     | Password to access database                                     | _None_      |
| `SERVER_PORT` _(optional)_          | Specify on which port the HTTP server will listen on.           | `8080`      |
| `MAX_WINDSPEED_CHANGE` _(optional)_ | Maximum change of windspeed in one simulation cycle.            | `0.002`     |
| `HELLMAN_EXPONENT` _(optional)_     | Hellman exponent used to estimate windspeed.                    | `0.34`      |
| `INITIAL_WINDSPEED` _(optional)_    | Windspeed when simulator starts, if last value in DB was empty. | `4.5`       |
| `MARKET_DEMAND_EFFECT` _(optional)_ | Imbalance multiplier when `demand != supply`.                   | `1`         |
| `MARKET_NAME` _(optional)_          | Name of electricity market to use in simulation.                | `"default"` |
| `POWERPLANT_NAME` _(optional)_      | Name of powerplant to use in simulation.                        | `"default"` |

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
