import * as jwt from 'jsonwebtoken';
import Redis from "ioredis";

export const rdb0 = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT as string),
    db: 0
});

rdb0.on('connect', function () {
    console.log('connected to redis!!!');
});

rdb0.on('error', function (err) {
    console.log('Connect redis Error ' + err)
})

export const JWT_ACCESSTK_MAXAGE = parseInt(process.env.JWT_ACCESSTK_MAXAGE as string);
export const BLACKLIST = process.env.JWT_BLACKLIST as string;
const SECRETE_KEY = process.env.JWT_SECRETE as string;

export async function createToken(id: string): Promise<string>{
    const newToken =  jwt.sign({id}, SECRETE_KEY, {
        expiresIn: JWT_ACCESSTK_MAXAGE
    });
    // console.log('created new token: ' + newToken);
    return newToken;
}

export async function verify(token: string) : Promise<jwt.JwtPayload>{
    const tokenSignature = token.split(".")[2]
    const isInvalidToken = await rdb0.sismember(BLACKLIST, tokenSignature);
    let jwtPayload = null as any;

    // console.log('isInvalidToken: ' + isInvalidToken);
    if(!isInvalidToken){
        jwtPayload = jwt.verify(token, SECRETE_KEY);
        if(new Date().getTime() > jwtPayload.exp*1000){
            // expired jwt
            // add its signature to blacklist
            await rdb0.sadd(BLACKLIST, tokenSignature)
            throw Error("expired token");
        }
    }

    return jwtPayload;
}

export async function revoke(token: string){
    // add the token to blacklist
    const tokenSignature = token.split(".")[2]
    await rdb0.sadd(BLACKLIST, tokenSignature);
    console.log('revoked token: ' + token);
}