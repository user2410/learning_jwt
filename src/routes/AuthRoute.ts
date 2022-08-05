import { Router } from "express";
import AuthController from '../controllers/AuthController';

export default class authRoute{
    public path: string;
    public router: Router;
    
    private controller : AuthController;

    constructor(path: string){
        this.path = path;
        this.router = Router();
        this.controller = new AuthController();
        this.registerRoutes();
    }

    protected registerRoutes() : void {
        this.router.get('/signup', this.controller.signup_get);
        this.router.post('/signup', this.controller.signup_post);
        this.router.get('/login', this.controller.login_get);
        this.router.post('/login', this.controller.login_post);
        this.router.get('/logout', this.controller.logout_get);
    }
}