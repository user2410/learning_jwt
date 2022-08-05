import Redis from "ioredis";
import { WHITELIST } from "../JwtManager";
import * as UserManager from '../UserManager';

export const rdb0 = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    db: 0
});

rdb0.on('connect', async function () {
    console.log('connected to redis!!!');
    await rdb0.del([UserManager.USERSLS, UserManager.MAPEMAIL2IDX, UserManager.MAPID2IDX, WHITELIST]);
});

rdb0.on('error', function (err) {
    console.log('Connect redis Error ' + err)
})
