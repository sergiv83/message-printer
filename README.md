##Description
`Message-printer` microservice implemented using BCE pattern (Boundary-Controller-Entity)

Http endpoints:
GET  `/health-check` - default health check
POST `/echoAtTime` - endpoint to store messages
message example
```
{
    "message": "hello",
    "timeAt": "1587674979826" - time in ms, should be in future 
}
```

##Environment Variables:
`HTTP_PORT` - defaults to '3111',
`REDIS_PORT` - defaults to '6379'
`REDIS_HOTS` - defaults to '127.0.0.1'
`REDIS_PASSWORD` - defaults to 'DEFAULT_SECRET'
For local usage variables can be overwritten in file .env

##Testing
In order to run tests you need to have redis running locally. The easiest way is to up https://hub.docker.com/_/redis/
locally exposing 6379 port
``` 
$ docker run --name redis -p 6379:6379 -d redis:5.0.6 redis-server --requirepass DEFAULT_SECRET
```
Install dependencies:
```
npm i
```
Run tests:
```
npm t
```

##Running
To run the service after all dependencies are installed
```
npm start
```
