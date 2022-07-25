const axios = require("axios");
const express = require("express");
const Redis = require('ioredis');
const redisClient = new Redis({
    host: 'localhost',
    port: parseInt(process.env.REDIS_PORT | 6379),
});

const app = express();

const MOCK_API = "https://jsonplaceholder.typicode.com/users/";

app.get("/users", (req, res) => {
    const email = req.query.email;

    try {
        axios.get(`${MOCK_API}?email=${email}`).then(function (response) {
            const users = response.data;

            console.log("User successfully retrieved from the API");

            res.status(200).send(users);
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/cached-users", (req, res) => {
    const email = req.query.email;

    try {
        redisClient.get(email, (err, data) => {
            if (err) {
                console.error(err);
                throw err;
            }

            if (data) {
                console.log('Cache hit');
                console.log("User successfully retrieved from Redis");
                res.status(200).send(JSON.parse(data));
            } else {
                console.log('Cache miss');
                axios.get(`${MOCK_API}?email=${email}`).then(async (response) => {
                    const users = response.data;
                    await redisClient.set(email, JSON.stringify(users), 'EX', 300);

                    console.log("User successfully retrieved from the API");

                    res.status(200).send(users);
                });
            }
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server started at port: ${PORT}`);});


/*
const Redis = require('ioredis');
const redisClient = new Redis({
    host: 'localhost',
    port: parseInt(process.env.REDIS_PORT | 6379),
});

redisClient.set('age', toString(22), 'EX', 20)
    .then((reply)=>{
        console.log(reply);
    }).catch((err)=>{
        console.error(err);
    });
*/