// import { Schema, model, connect } from 'mongoose';
import * as mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/jwt-learning?useNewUrlParser=true&useUnifiedTopology=true')
    .then((result) => { console.error('Connected to mongodb'); })
    .catch((err) => {
        console.log(err);
        throw err
    });