// import { Schema, model, connect } from 'mongoose';
import * as mongoose from 'mongoose'

const DATABASE_URL = process.env.DATABASE_URL

mongoose.connect(DATABASE_URL as string)
    .then((result) => { console.error('Connected to mongodb'); })
    .catch((err) => {
        console.log(err);
        throw err
    });