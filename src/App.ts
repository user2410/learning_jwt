import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import routes from './routes/Routes';

import * as cookieParser from 'cookie-parser';
import './services/mongo/mongo';
import './services/redis/redis';

export default class App {
  private app: express.Application;
  private hostname : string;
  private port : number;

  constructor(port:number, hostname:string) {
    this.app = express();
    this.port = port;
    this.hostname = hostname;
    this.config();
  }

  private config(): void {
    // middlewares
    this.app.use(express.static('public'));
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    });
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended:true}));
    this.app.use(cookieParser());

    // View engine
    this.app.set('view engine', 'ejs');
    
    // Error handling routes
    this.app.use((
      _err: any,
      req: Request,
      res: Response,
      next: NextFunction) => {
      return res.send(_err)
    });
    
    // Set up routes
    routes(this.app);

    // No matching route
    this.app.get('*', function (req, res) {
      return res.sendStatus(404)
    });
  }

  public listen(){
    this.app.listen(this.port, this.hostname, ()=>{
      console.log(`Listening on port ${this.port}`);
    })
  }
}