import { UserModel } from "./mongo/models/User";
import { Document, Types } from "mongoose";
import { rdb0 } from "./redis/redis";
import * as bcrypt from 'bcrypt';

async function cacheFromMongoDB(user: Document<unknown, any, {
    email: string;
    password: string;
}> & {
    email: string;
    password: string;
} & {
    _id: Types.ObjectId;
}){
    // save new user to redis list -> new index
    const {_id, email, password} = user;
    let idx = await rdb0.rpush('users', JSON.stringify({_id, email, password}));
    // create index in zset (id - new index)
    await rdb0.hset('users_id2idx', _id.toString(), `${idx-1}`);
    // add a new entry to hset (email - new index)
    await rdb0.hset('users_email2idx', email, `${idx-1}`);
}

export async function create(newEmail: string, newPassword: string) {
    // save to mongodb
    const user = await UserModel.create({ newEmail, newPassword });
    
    // save to redis
    await cacheFromMongoDB(user);

    return user;
}

export async function signin(email: string, password: string) {
    // find by email in redis first
    let user = null;
    let userIdx = await rdb0.hget('users_email2idx', email);
    if(userIdx == null){
        // not cached
        console.log('cache missed');
        // query mongodb
        user = await UserModel.findOne({email});
        if(user){
            await cacheFromMongoDB(user);
            let auth = await bcrypt.compare(password, user.password);
            if(auth) return user;
            throw Error('incorrect password');
        }
        throw Error('incorrect email');
    }else{
        console.log('cache hit')
        let users = await rdb0.lrange('users', userIdx, userIdx);
        user = JSON.parse(users[0]);
    }
    
    return user;
}

export async function findByID(id: string){
    let user = null;
    let userIdx = await rdb0.hget('users_id2idx', id);
    if(userIdx == null){
        // not cached
        console.log('cache missed');
        // query mongodb
        user = await UserModel.findById(id);
        if(user){
            await cacheFromMongoDB(user);
            return user;
        }
    }else{
        console.log('cache hit')
        let users = await rdb0.lrange('users', userIdx, userIdx);
        user = JSON.parse(users[0]);
    }

    return user;
}