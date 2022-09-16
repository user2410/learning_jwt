import Redis from "ioredis";

export const rdb0 = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT as string),
    db: 0
});

rdb0.on('connect', async function () {
    console.log('connected to redis!!!');
});

rdb0.on('error', function (err) {
    console.log('Connect redis Error ' + err)
})
