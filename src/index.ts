import * as dotenv from 'dotenv';
import App from "./App";

if(process.env.NODE_ENV == 'dev')
    dotenv.config();

const port = parseInt(process.env.PORT||'3000');
const hostname = process.env.HOSTNAME || 'localhost';

const app = new App(port, hostname);
app.listen();