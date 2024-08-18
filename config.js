import dotenv from 'dotenv';
dotenv.config();

export default {
    bot_token: process.env.BOT_TOKEN,
    origin: process.env.WEB_ORIGIN || "*",
    mongo_uri: process.env.MONGO_URI,
    port: process.env.PORT || 5000
}