"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const events_1 = require("events");
const restify_errors_1 = require("restify-errors");
class Router extends events_1.EventEmitter {
    envelope(document) {
        return document;
    }
    envelopeAll(documents, options = {}) {
        return documents;
    }
    render(response, next, returnArray = true) {
        return document => {
            if (document) {
                this.emit('beforeRender', document);
                if (returnArray) {
                    return response.json(this.envelope(document));
                }
                return response.json(document);
            }
            throw new restify_errors_1.NotFoundError('Documento não encontrado');
        };
    }
    renderAll(response, next, options = {}) {
        return (documents) => {
            if (documents) {
                documents.forEach((document, i, array) => {
                    this.emit('beforeRender', document);
                    // array[i] = this.envelope(document);
                });
                return response.json(this.envelopeAll(documents, options));
            }
            response.json(this.envelopeAll([], options));
            return next();
        };
    }
}
exports.Router = Router;
