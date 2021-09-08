"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePluginName = void 0;
const path_1 = __importDefault(require("path"));
const lodash_1 = __importDefault(require("lodash"));
const stackTrace = __importStar(require("stack-trace"));
const UNKNOWN_PLUGIN_NAME = 'UNKNOWN_PLUGIN';
const findFrameWithPluginName = (frames) => {
    const idx = lodash_1.default.findLastIndex(frames, (frame) => {
        const getFileName = frame.getFileName();
        return (Boolean(getFileName) &&
            getFileName.includes('hermione-plugins-profiler'));
    });
    return frames[idx + 1];
};
function parsePluginName(error) {
    const logWarn = () => console.warn(`Unable to parse plugin name from stack: ${error.stack}`);
    const traceFrames = stackTrace.parse(error);
    const pluginPathLine = findFrameWithPluginName(traceFrames);
    if (!pluginPathLine) {
        logWarn();
        return UNKNOWN_PLUGIN_NAME;
    }
    const pluginIndexPath = pluginPathLine.getFileName();
    if (!pluginIndexPath) {
        logWarn();
        return UNKNOWN_PLUGIN_NAME;
    }
    const [, pluginRootPath] = pluginIndexPath.split('node_modules');
    if (!pluginRootPath) {
        logWarn();
        return UNKNOWN_PLUGIN_NAME;
    }
    const [pluginName] = path_1.default.dirname(pluginRootPath).match(/(\/@[^/]+?)?\/[^/]+/) || [];
    if (!pluginName) {
        logWarn();
        return UNKNOWN_PLUGIN_NAME;
    }
    return pluginName.replace('/', '');
}
exports.parsePluginName = parsePluginName;
