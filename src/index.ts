import { createServer } from 'http';
import App from './app';
import { checkPortStatus } from './utils/helpers';
import { connect } from 'mongoose';
import { logger } from './utils/logger';

const port = process.env.APP_PORT || 3000;

const MONGO_IP = '127.0.0.1';
const MONGO_URI = 'mongodb://localhost';
const MONGO_PORT = 27017;
const DB_NAME = 'tes'; //'priceList_v01';
const MONGO_RETRY_INTERVAL = 3;
const MONGO_OPTS = {
    reconnectTries: 2147483647,
    reconnectInterval: 500,
    useNewUrlParser: true
};

logger.debug(port.toString());

App.set('port', port);
mongoConnect();
const server = createServer(App);

server.on('error', onError);
server.on('listening', onListening);

function onError(error: NodeJS.ErrnoException): void {
    if ( error.syscall !== 'listen' ) {
        throw error;
    }
    const bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch ( error.code ) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
    logger.debug(error.message);
}

function onListening(): void {
    const addr = server.address();
    const bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    logger.info(`Listening on ${bind}`);
}

function mongoConnect(): void {
    let connCheck = true;

    checkPortStatus(MONGO_PORT, MONGO_IP, 400, (err: any, status: string) => {
        if ( !err && status === 'open' ) {
            // debug('#mongoConnect: Settings connCheck to false');
            connCheck = false;
            try {
                connect(`${MONGO_URI}:${MONGO_PORT}/${DB_NAME}`, MONGO_OPTS)
                    .then((mongo: any) => {
                        logger.info(`MongoDB connected on ${mongo.connection.db.databaseName}`);
                    });
            } catch ( e ) {
                logger.info(`Error connecting to MongoDB: ${e}`);
            }
        } else {
            logger.info(`MongoDB is not up. Retrying in ${MONGO_RETRY_INTERVAL} seconds...`);
            const recheck = setInterval(() => {
                checkPortStatus(MONGO_PORT, MONGO_IP, 400, (errInterval: any, statusInterval: string) => {
                    if ( !errInterval && statusInterval === 'open' ) {
                        try {
                            connect(`${MONGO_URI}:${MONGO_PORT}/${DB_NAME}`, MONGO_OPTS)
                                .then((mongo: any) => {
                                    logger.info(`MongoDB connected on ${mongo.connection.db.databaseName}`);
                                    clearInterval(recheck);
                                });
                        } catch ( e ) {
                            logger.info(`Error connecting to MongoDB: ${e}`);
                        }
                    } else {
                        logger.info(`MongoDB is not up. Retrying in ${MONGO_RETRY_INTERVAL} seconds...`);
                    }
                });
            }, MONGO_RETRY_INTERVAL * 1000);
        }
    });
}

server.listen(port);
