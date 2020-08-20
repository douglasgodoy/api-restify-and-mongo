"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const model_router_1 = require("../common/model-router");
const reviews_model_1 = require("./reviews.model");
class ReviewsRouter extends model_router_1.ModelRouter {
    constructor() {
        super(reviews_model_1.Review);
    }
    envelope(document) {
        let resource = super.envelope(document);
        console.log(document);
        resource.forEach(reso => {
            const restId = reso.restaurant ? reso.restaurant : reso;
            reso._links.restaurant = `restaurants/${restId}`;
        });
        return resource;
    }
    prepareOne(query) {
        return query
            .populate('user', 'name')
            .populate('restaurant', 'name');
    }
    applyRoutes(application) {
        application.get(`/${this.basePath}`, this.findAll);
        application.get(`/${this.basePath}/:id`, [this.validateId, this.findById]);
        application.post(`/${this.basePath}`, this.save);
    }
}
exports.reviewsRouter = new ReviewsRouter();
