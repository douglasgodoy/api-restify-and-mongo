import * as restify from 'restify';
import { EventEmitter } from 'events';
import { NotFoundError } from 'restify-errors';

export abstract class Router extends EventEmitter {
    abstract applyRoutes(application: restify.Server);

    envelope(document: any): any {
        return document;
    }

    envelopeAll(documents: any[], options: any = {}): any {
        return documents;
    }

    render(response: restify.Response, next: restify.Next, returnArray = true) {
        return document => {
            if (document) {
                this.emit('beforeRender', document);
                if (returnArray) {
                    return response.json(this.envelope(document));

                }
                return response.json(document);
            }
            throw new NotFoundError('Documento não encontrado');
        }
    }

    renderAll(response: restify.Response, next: restify.Next, options: any = {}) {
        return (documents: any[]) => {
            if (documents) {
                documents.forEach((document, i, array) => {
                    this.emit('beforeRender', document);
                    // array[i] = this.envelope(document);
                });

                return response.json(this.envelopeAll(documents, options));
            }
            response.json(this.envelopeAll([], options));
            return next();
        }
    }
}