import * as jwt from 'jsonwebtoken';
import { rdb0 } from './redis/redis';

export const MAX_AGE = parseInt(process.env.MAX_AGE ||'10800');
export const WHITELIST = 'jwt_whitelist';
const SECRET_KEY = process.env.SECRET_JWT || 'my@secretkey';

export async function createToken(id: string): Promise<string>{
    const newToken =  jwt.sign({id}, SECRET_KEY, {
        expiresIn: MAX_AGE
    });
    // Add new token to white list
    await rdb0.sadd(WHITELIST, newToken);
    console.log('created new token: ' + newToken);
    return newToken;
}

export async function verify(token: string) : Promise<string | jwt.JwtPayload>{
    const isValidToken = await rdb0.sismember(WHITELIST, token);
    let jwtPayload = null as any;

    console.log('isValidToken: ' + isValidToken);
    if(isValidToken){
        jwtPayload = jwt.verify(token, SECRET_KEY);
        if(new Date().getTime() > jwtPayload.exp*1000){
            // expired jwt
            // remove from whitelist
            await rdb0.srem(WHITELIST, token);
            return null as any;
        }
    }

    return jwtPayload;
}

export async function revoke(token: string){
    await rdb0.srem(WHITELIST, token);
    console.log('revoked token: ' + token);
}