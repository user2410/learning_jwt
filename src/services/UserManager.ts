import { UserModel } from "./mongo/models/User";
import { Document, Types } from "mongoose";
import { rdb0 } from "./JwtManager";
import * as bcrypt from 'bcrypt';

export const MAPID2USR      = 'users_id2user';
export const MAPEMAIL2ID    = 'users_email2id';

async function init(){
    await rdb0.del([MAPEMAIL2ID, MAPID2USR]);
}
init();

async function cacheToRedis(user: Document<unknown, any, {
    email: string;
    password: string;
}> & {
    email: string;
    password: string;
} & {
    _id: Types.ObjectId;
}){
    const {_id, email, password} = user;
    // create index in hset (id -> user info)
    await rdb0.hset(MAPID2USR, _id.toString(), JSON.stringify({_id, email, password}));
    // add a new entry to hset (email -> user id)
    await rdb0.hset(MAPEMAIL2ID, email, `${_id}`);
}

export async function create(newEmail: string, newPassword: string) {
    // save to mongodb
    const user = await UserModel.create({ email: newEmail, password: newPassword });
    
    // save to redis
    await cacheToRedis(user);

    return user;
}

export async function signin(email: string, password: string) {
    // find by email in redis first
    let user = null;
    let userId = await rdb0.hget(MAPEMAIL2ID, email);
    if(userId == null){
        // not cached
        console.log('cache missed');
        // query mongodb
        user = await UserModel.findOne({email});
        if(user){
            await cacheToRedis(user);
            let auth = await bcrypt.compare(password, user.password);
            if(auth) return user;
            throw Error('incorrect password');
        }
        throw Error('no such email found');
    }
    
    console.log('cache hit')
    let usr = await rdb0.hget(MAPID2USR, `${userId}`);
    usr = usr as string;
    user = JSON.parse(usr);
    
    return user;
}

export async function findByID(id: string){
    let user = null;
    let usr = await rdb0.hget(MAPID2USR, id);
    if(usr == null){
        // not cached
        console.log('cache missed');
        // query mongodb
        user = await UserModel.findById(id);
        if(user){
            await cacheToRedis(user);
            return user;
        }
    }else{
        console.log('cache hit')
        user = JSON.parse(usr);
    }

    return user;
}