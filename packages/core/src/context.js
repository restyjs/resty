"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
class Context {
    constructor(req, res, next) {
        this.req = req;
        this.res = res;
        this.next = next;
    }
}
exports.Context = Context;
