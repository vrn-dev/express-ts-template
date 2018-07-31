import { NextFunction, Request, Response, Router } from 'express';

class HelloRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    public routes() {
        this.router.get('/', this.hello);
    }


    private hello(req: Request, res: Response, next: NextFunction) {
        res.send('Hello');
    }
}

export default new HelloRouter().router;