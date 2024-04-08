import { option, root, section } from 'gemini-configparser';
import _ from 'lodash';

const booleanOption = (name: string) =>
    option<boolean>({
        parseEnv: (val: string) => Boolean(JSON.parse(val)),
        parseCli: (val: string) => Boolean(JSON.parse(val)),
        defaultValue: false,
        validate: (val: boolean) => {
            if (_.isBoolean(val)) {
                return;
            }

            throw new Error(`Option '${name}' must be a boolean`);
        },
    });

const stringOption = (name: string, defaultValue = '') =>
    option<string>({
        defaultValue,
        validate: (val: string) => {
            if (_.isString(val) || !_.isEmpty(val)) {
                return val;
            }

            throw new Error(
                `Option '${name}' must be presented and type of "string"`
            );
        },
    });

export type PluginConfig = {
    enabled: boolean;
    reportPath: string;
};

export function parseConfig(options: PluginConfig): PluginConfig {
    const { env, argv } = process;

    const parseOptions = root<PluginConfig>(
        section({
            enabled: booleanOption('enabled'),
            reportPath: stringOption(
                'reportPath',
                'testplane-profiler'
            ),
        }),
        {
            envPrefix: 'testplane_plugins_profiler_',
            cliPrefix: '--plugins-profiler-',
        }
    );

    const config = parseOptions({ options, env, argv });

    return config;
}
