import path from 'path';

import _ from 'lodash';
import * as stackTrace from 'stack-trace';
import { StackFrame } from 'stack-trace';

const UNKNOWN_PLUGIN_NAME = 'UNKNOWN_PLUGIN';

const findFrameWithPluginName = (
    frames: StackFrame[]
): StackFrame | undefined => {
    const idx = _.findLastIndex(frames, (frame) => {
        const getFileName = frame.getFileName();

        return (
            Boolean(getFileName) &&
            getFileName.includes('hermione-plugins-profiler')
        );
    });

    return frames[idx + 1];
};

export function parsePluginName(error: Error): string {
    const logWarn = () =>
        console.warn(
            `Unable to parse plugin name from stack: ${error.stack}`
        );
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
    const [pluginName] =
        path.dirname(pluginRootPath).match(/(\/@[^/]+?)?\/[^/]+/) ||
        [];

    if (!pluginName) {
        logWarn();

        return UNKNOWN_PLUGIN_NAME;
    }

    return pluginName.replace('/', '');
}
