import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { verify } from '../services/JwtManager';
import {findByID} from '../services/UserManager';

export async function requireAuth(req: Request, res: Response, next: NextFunction){
    const token = req.cookies.jwt;

    if(token){
        try{
            let jwtPayload = await verify(token) as JwtPayload;
            if(!jwtPayload){
                return res.redirect('/login');
            }
            next();
        }catch(err){
            // console.log(err)
            res.redirect('/login');
        }
    }else{
        res.redirect('/login');
    }
}

export async function checkUser(req: Request, res: Response, next: NextFunction){
    const token = req.cookies.jwt;
    res.locals.user = null;

    if(token){
        try{
            const jwtPayload = await verify(token);
            // console.log(jwtPayload);
            if(jwtPayload){
                const {id} = jwtPayload;
                const user = await findByID(id);
                const {_id, email} = user;
                res.locals.user = {_id, email};
            }
            next();
        }catch(err){
            // console.log(err);
            next();
        }
    }else{
        next();
    }
}