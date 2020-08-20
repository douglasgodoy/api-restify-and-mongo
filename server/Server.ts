import * as restify from 'restify';
import { environment } from '../common/environment';
import { Router } from '../common/router';
import * as mongoose from 'mongoose';
import {mergePatchBodyParser} from './merge-patch-parser';
import {handleError} from './error.handler';

export class Server {

    application: restify.Server;

    initializeDb(){
        (<any>mongoose).Promise = global.Promise;
        return mongoose.connect(environment.db.url, {
            useNewUrlParser: true,
            useUnifiedTopology:true,
            useCreateIndex: true,
        });
    }

    initRoutes(routers: Router[]): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this.application = restify.createServer({
                    name: 'meat-api',
                    version: '1.0.0',
                });

                this.application.use(restify.plugins.queryParser())
                this.application.use(restify.plugins.bodyParser())
                this.application.use(mergePatchBodyParser);
                
                //routes
                for (let router of routers) {
                    router.applyRoutes(this.application);

                }


                this.application.listen(environment.server.port, () => {
                    resolve(this.application);
                });

                this.application.on('restifyError', handleError);

                this.application.get('/info', [(req, res, next) => {
                    if (
                        req.userAgent() &&
                        req.userAgent().includes('MSIE 7.0')
                    ) {
                        let error: any = new Error();
                        error.statusCode = 400;
                        error.message = 'Please, update your browser.';
                        return next(error);
                    }
                    return next();
                }, (req, res, next) => {
                    res.json({
                        browser: req.userAgent(),
                        method: req.method,
                        url: req.url,
                        path: req.path(),
                        query: req.query
                    });
                    return next();
                }]);

            } catch (error) {
                reject(error);
            }
        });
    }
    
    async bootstrap(routers: Router[] = []): Promise<Server> {
        return this.initializeDb().then(() =>
            this.initRoutes(routers).then(() => this));
    }

    async shutdown(){
        return mongoose.disconnect().then(()=> this.application.close())
    }
}