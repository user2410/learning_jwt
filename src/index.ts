import * as dotenv from 'dotenv';
import App from "./App";

if(process.env.NODE_ENV == 'dev')
    dotenv.config();

const app = new App(3000);
app.listen();