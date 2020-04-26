## Description
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
###Note:
The code was initially forked from https://github.com/AlexSlusarenko/message-printer.
The algorithm however is different from the original one. This service behaves in the following way:
1. Service receives a message to the http endpoint.
2. It saves the message to Redis using its timestamp as a key. The value is list. So, its possible that many messages can 
be scheduled for processing at the same time.
3. The service also notifies all other instances about the new message timestamp via pub/sub channel.
4. All instances receive the timestamp from the channel and schedule processing with setTimeout().
5. When the time comes, all instances trying to obtain the lock over the list from point 2, process the messages and 
remove the corresponding key in Redis. The instance which got the lock does the job. All others will fail their attempt
cause there will be no key in Redis.

It doesn't matter when new instances of the service appear. At startup they read all unprocessed keys (timestamps) and 
schedule their processing. They are also subscribe to the channel to be notified about the new messages. 
## Environment Variables:
`HTTP_PORT` - defaults to '3111',
`REDIS_PORT` - defaults to '6379'
`REDIS_HOTS` - defaults to '127.0.0.1'
`REDIS_PASSWORD` - defaults to 'DEFAULT_SECRET'
For local usage variables can be overwritten in file .env

## Testing
### Local 
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
### In Containers
The tests can also be run inside docker containers. Just for the case if you don't want to install anything including
Redis and right version of Node.
```
docker-compose up --build --abort-on-container-exit
```
And if you want to clean everything up after the test run use the following:
```
docker-compose down --rmi all
```
## Running
To run the service after all dependencies are installed
```
npm start
```
Node 12 or higher