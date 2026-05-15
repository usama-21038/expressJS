import dotenv from 'dotenv';
import { connect } from 'http2';
import path from 'path';
// Load environment variables from .env file  (config() er maddome path join kora)
dotenv.config({
    path:path.join(process.cwd(),'.env'),
});



const config = {
    connectionString: process.env.CONNECTIONSTRING as string,
};

export default config;

