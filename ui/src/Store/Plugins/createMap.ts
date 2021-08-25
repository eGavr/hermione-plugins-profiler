import { groupBy, keys, map, mapValues, maxBy, sumBy } from "lodash";

import { PluginStatsItem } from "./types";

export default function createMap(items: Array<PluginStatsItem>) {
  return buildListenerLevel(items);
}

const buildListenerLevel: any = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, "listenerName");
  const eventLevels = mapValues(grouped, buildEventsLevel);

  return {
    list: keys(grouped),
    map: eventLevels,
  };
};

const buildEventsLevel: any = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, "event");
  const procLevel = mapValues(grouped, buildProcLevel);
  const currentLevel = map(
    procLevel,
    (data: { list: [{ sum: number }] }, event) => ({
      event,
      max: maxBy(data.list, "sum")?.sum,
      numberOfProcesses: data.list.length,
    })
  );

  return {
    list: currentLevel,
    map: procLevel,
  };
};

const buildProcLevel: any = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, ({ filePath, pid }) => `${filePath}:${pid}`);
  const pluginLevels = mapValues(grouped, buildPluginLevel);
  const currentLevel = map(
    pluginLevels,
    (data: { sum: number; pid: number; filePath: string }) => ({
      sum: data.sum,
      pid: data.pid,
      filePath: data.filePath,
    })
  );

  return {
    list: currentLevel,
    map: pluginLevels,
  };
};

const buildPluginLevel = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, "pluginName");
  const itemsLevels = mapValues(grouped, buildItemsLevel);
  const currentLevel = map(
    itemsLevels,
    (data: { sum: number; items: [] }, pluginName) => ({
      pluginName,
      sum: data.sum,
      calls: data.items.length,
    })
  );
  const [first] = items;

  return {
    list: currentLevel,
    map: itemsLevels,
    sum: sumBy(items, "duration"),
    pid: first.pid,
    filePath: first.filePath,
  };
};

const buildItemsLevel: any = (items: Array<PluginStatsItem>) => {
  return {
    items: items,
    sum: sumBy(items, "duration"),
  };
};
