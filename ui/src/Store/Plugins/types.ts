export type ProfilerStatsItem = {
  name: string;
  worker: boolean;
  pid: number;
  pluginName: string;
  listenerName: string;
  event: string;
  duration: number;
  start: number;
  end: number;
};

export type PluginStatsItem = ProfilerStatsItem & {
  filePath: string;
};

export type Source = {
  filePath: string;
  rowsCount: number;
  loadState: LoadState;
  error: string | null;
};

export enum LoadState {
  empty = "empty",
  loading = "loading",
  loaded = "loaded",
  error = "error",
}
