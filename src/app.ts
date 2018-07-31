import express, { Application, NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

import { logger } from './utils/logger';

import HelloRouter from './routes/hello.router';
import cors = require('cors');


class App {
    // public app: express.Application;
    public app: Application;

    constructor() {
        this.app = express();
        this.config();
        this.preAuthRoutes();
        this.authMiddleWare();
        this.postAuthRoutes();
        this.errorHandlers();
    }

    public config() {
        // this.app.use(express.static(path.join(__dirname, '/../public'))); // If serving static SPA
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.all('*', (req, res, next) => {
            logger.info('Incoming request', { method: req.method, path: req.url });

            logger.debug('Incoming request verbose', {
                headers: req.headers,
                query: req.query,
                body: req.body
            });
            return next();
        });
    }

    public preAuthRoutes() {
        this.app.use('/api', HelloRouter);
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
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            logger.error('Error ', {
                error: err.message,
                status: err.status,
                token: req.headers.authorization || 'No Token Present',
                path: req.url,
                query: req.query,
                params: req.params,
                body: req.body
            });
            res.status(err.status || 500);
            res.json({
                error: {
                    message: err.message
                }
            });
        });
    }
}

export default new App().app;