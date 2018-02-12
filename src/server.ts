import * as express from 'express';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
// import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as cors from 'cors';


class Server {
    public app: express.Application;


    constructor() {
        this.app = express();
        this.config();
        this.preAuthRoutes();
        this.authMiddleWare();
        this.postAuthRoutes();
        this.errorHandlers();
    }

    public config() {
        this.mongoDBConnect();
        // this.app.use(express.static(path.join(__dirname, '/../public'))); // If serving static SPA
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(logger('dev'));
        this.app.use(cors());
    }

    public preAuthRoutes() {
        //
    }

    public authMiddleWare() {
        //
    }

    public postAuthRoutes() {
        //
    }

    public errorHandlers() {
        this.app.use((req, res, next) => {
            const error: any = new Error('Not Found');
            error.status = 404;
            next(error);
        });
        this.app.use((err: any, req: Request, res: Response) => {
            res.status(err.status || 500);
            res.json({
                error: {
                    message: err.message
                }
            });
        });
    }

    private mongoDBConnect() {
        const opts = {
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500
        };

        mongoose.connect('mongodb://localhost:27017/crm_002', opts, (err => {
            if ( err ) console.error('Error connecting to MongoDB. Retrying');
            else {
                console.log('Connected to MongoDB');
            }
        }));
    }
}

export default new Server().app;