import * as express from 'express';
import authRoute from './AuthRoute';
import { requireAuth, checkUser } from '../middleware/AuthMiddleware';

import { revoke } from '../services/JwtManager';
// if you want to add another router like news or something else
// you could add one 'server.use(...)' below the 'server.use('/user',...)

const routes = (server:express.Application): void => {
    server.get('*', checkUser);
    server.get('/', (req, res)=>res.render('home'));
    server.get('/smoothies', requireAuth, (req, res)=>res.render('smoothies'));
    server.get('/forbidden', async (req, res)=>{
        if(req.cookies.jwt) await revoke(req.cookies.jwt);
        res.cookie('jwt', '', {maxAge: 1});
        res.redirect('/');
    })
    server.use('/', new authRoute('/').router);
};

export default routes;