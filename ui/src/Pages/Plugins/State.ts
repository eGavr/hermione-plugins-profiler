import { createState, useHookstate } from "@hookstate/core";
import { Untracked } from "@hookstate/untracked";
import _ from "lodash";
import { uniq } from "lodash";

import { loadFile } from "./api";

interface PluginStatsItem {
  name: string;
  worker: boolean;
  pid: number;
  pluginName: string;
  listenerName: string;
  event: string;
  duration: number;
  start: number;
  end: number;
}

enum LoadState {
  empty = "empty",
  loading = "loading",
  loaded = "loaded",
  error = "error",
}

type Source = {
  filePath: string;
  items: PluginStatsItem[];
  loadState: LoadState;
  fetchError: string | null;
};

const files = uniq([
  "http://localhost:3000/data/plugins1.json",
  "http://localhost:3000/data/plugins2.json",
  "http://localhost:3000/data/plugins3.json",
  "http://localhost:3000/data/plugins4.json",
  "http://localhost:3000/data/plugins5.json",
  "http://localhost:3000/data/plugins6.json",
  "http://localhost:3000/data/plugins7.json",
  "http://localhost:3000/data/plugins8.json",
]);

const sources: Source[] = files.map((sourcePath) => ({
  items: [],
  filePath: sourcePath,
  loadState: LoadState.empty,
  fetchError: null,
}));

const pluginsState = createState({
  sources,
  loadState: LoadState.empty,
});

export const usePluginsState = () => {
  let onSourceUpdates = _.noop;
  let onAllLoaded = _.noop;
  const state = useHookstate(pluginsState);

  state.attach(Untracked);

  return {
    onSourceUpdates(fn: (sources: Source[]) => void) {
      onSourceUpdates = fn;
    },
    fetch() {
      state.loadState.set(LoadState.loading);

      state.sources.forEach((source) => {
        source.loadState.set(LoadState.loading);

        const loader = loadFile(source.filePath.get());

        loader
          .on("chunk", (receivedItems: PluginStatsItem[]) => {
            Untracked(source.items).merge(receivedItems);

            onSourceUpdates(state.sources.get());
          })
          .on("start", () => {
            Untracked(source.loadState).set(LoadState.loading);

            onSourceUpdates(state.sources.get());
          })
          .on("error", (msg: string) => {
            Untracked(source.loadState).set(LoadState.error);
            Untracked(source.fetchError).set(msg);

            onSourceUpdates(state.sources.get());
          })
          .on("complete", () => {
            Untracked(source.loadState).set(LoadState.loaded);

            onSourceUpdates(state.sources.get());

            const allLoaded = state.sources
              .get()
              .every((source) =>
                [LoadState.error, LoadState.loaded].includes(source.loadState)
              );

            if (allLoaded) {
              onAllLoaded();
            }
          });
      });
    },
    onAllLoaded(fn: () => void) {
      onAllLoaded = fn;
    },
    markAsLoaded() {
      state.loadState.set(LoadState.loaded);
    },
    state() {
      return state;
    },
    shouldFetch() {
      return state.loadState.get() === LoadState.empty;
    },
    isLoaded() {
      return [LoadState.error, LoadState.loaded].includes(
        state.loadState.get()
      );
    },
    isLoading() {
      return state.loadState.get() === LoadState.loading;
    },
  };
};
