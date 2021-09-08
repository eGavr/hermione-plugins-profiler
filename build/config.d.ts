export declare type PluginConfig = {
    enabled: boolean;
    reportPath: string;
};
export declare function parseConfig(options: PluginConfig): PluginConfig;
