"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
const router_1 = require("./router");
const mongoose = require("mongoose");
const restify_errors_1 = require("restify-errors");
class ModelRouter extends router_1.Router {
    constructor(model) {
        super();
        this.model = model;
        this.pageSize = 2;
        this.validateId = (req, res, next) => {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                next(new restify_errors_1.NotFoundError('Document not found'));
            }
            else {
                next();
            }
        };
        this.findAll = (req, res, next) => {
            let page = parseInt(req.query._page || 1);
            page = page > 0 ? page : 1;
            const skip = (page - 1) * this.pageSize;
            this.model.countDocuments({})
                .exec().then(count => this.model.find()
                .skip(skip)
                .limit(this.pageSize)
                .then(this.renderAll(res, next, {
                page,
                count,
                pageSize: this.pageSize,
                url: req.url
            })))
                .catch(next);
        };
        this.findById = (req, res, next) => {
            this.prepareOne(this.model.findById(req.params.id))
                .then(this.render(res, next))
                .catch(next);
        };
        this.save = (req, res, next) => {
            let document = new this.model(req.body);
            document.save()
                .then(this.render(res, next, false))
                .catch(next);
        };
        this.replace = (req, res, next) => {
            const options = { runValidators: true, overwrite: true };
            this.model.update({ _id: req.params.id }, req.body, options)
                .exec().then(result => {
                if (result.n) {
                    return this.model.findById(req.params.id);
                }
                throw new restify_errors_1.NotFoundError('Documento não encontrado');
            })
                .then(this.render(res, next))
                .catch(next);
        };
        this.update = (req, res, next) => {
            const options = { runValidators: true, new: true };
            this.model.findByIdAndUpdate(req.params.id, req.body, options)
                .then(this.render(res, next))
                .catch(next);
        };
        this.delete = (req, res, next) => {
            this.model.deleteOne({ _id: req.params.id }).exec().then((cmdResult) => {
                if (cmdResult.result) {
                    res.send(204);
                    return next();
                }
                throw new restify_errors_1.NotFoundError('Documento não encontrado');
            })
                .catch(next);
        };
        this.basePath = `${model.collection.name}`;
    }
    prepareOne(query) {
        return query;
    }
    envelope(document) {
        const aditional = { _links: {} };
        const documentArray = Array.isArray(document) ? document : [document];
        let resource = documentArray
            .map(({ _doc }) => {
            const newObj = Object.assign(Object.assign({}, aditional), _doc);
            newObj._links.self = `/${this.basePath}/${newObj._id}`;
            return newObj;
        });
        return resource;
    }
    envelopeAll(documents, options = {}) {
        const resource = {
            _links: {
                self: `${options.url}`,
            },
            items: documents
        };
        if (options.page && options.count && options.pageSize) {
            if (options.page > 1) {
                resource._links.previous = `/${this.basePath}?_page=${options.page - 1}`;
            }
            const remaining = options.count - (options.page * options.pageSize);
            if (remaining > 0)
                resource._links.next = `/${this.basePath}?_page=${options.page + 1}`;
        }
        return resource;
    }
}
exports.ModelRouter = ModelRouter;
