
import * as dotenv from 'dotenv';

dotenv.config();

import App from "./App";

const port = parseInt(process.env.PORT as string);
const hostname = process.env.HOSTNAME as string;

const app = new App(port, hostname);
app.listen();