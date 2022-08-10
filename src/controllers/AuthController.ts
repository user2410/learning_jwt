import { Request, Response } from 'express';

import * as JwtManager from '../services/JwtManager';
import * as UserManager from '../services/UserManager';

export default class AuthController {

    public signup_get(req: Request, res: Response){
        res.render('signup');
    }

    public async signup_post(req: Request, res: Response){
        const {email, password} = req.body;
        try{
            console.log(email, password);
            const user = await UserManager.create(email, password);
            const token = await JwtManager.createToken(user._id.toString());
            res.cookie('jwt', token, {httpOnly: true, maxAge: JwtManager.MAX_AGE*1000});
            res.status(201).json({user: user._id});
        }catch(err){
            console.log(err);
            res.status(400).json({ err });
        }
    }
    
    public login_get(req: Request, res: Response){
        res.render('login');
    }

    public async login_post(req: Request, res: Response){
        const {email, password} = req.body;
        try{
            const user = await UserManager.signin(email, password);
            const token = await JwtManager.createToken(user._id.toString());
            res.cookie('jwt', token, {httpOnly: true, maxAge: JwtManager.MAX_AGE*1000});
            res.status(201).json({user: user._id});
        }catch(err){
            console.log(err);
            res.status(400).json({ err });
        }
    }
    
    public async logout_get(req: Request, res: Response){
        await JwtManager.revoke(req.cookies.jwt);
        res.cookie('jwt', '', {maxAge: 1});
        res.redirect('/');
    }
}