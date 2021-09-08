"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWithHooks = void 0;
const is_promise_1 = __importDefault(require("is-promise"));
function executeWithHooks({ fn, before, after }) {
    let isResPromise = false;
    before();
    try {
        const res = fn();
        if ((0, is_promise_1.default)(res)) {
            isResPromise = true;
            return Promise.resolve(res).finally(() => after());
        }
        return res;
    }
    finally {
        if (!isResPromise) {
            after();
        }
    }
}
exports.executeWithHooks = executeWithHooks;
