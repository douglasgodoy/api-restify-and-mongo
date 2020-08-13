"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
exports.handleError = (req, res, err, done) => {
    err.toJSON = () => ({ message: err.message });
    done();
};
