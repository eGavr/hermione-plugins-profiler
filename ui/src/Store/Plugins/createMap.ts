import {
  flatten,
  get,
  groupBy,
  keys,
  mapValues,
  maxBy,
  minBy,
  orderBy,
  sumBy,
  values,
} from "lodash";

import { PluginStatsItem } from "./types";
import { calcDuration, isEventWaitable } from "./utils";

export default function createMap(items: Array<PluginStatsItem>) {
  return buildListenerLevel(items);
}

const buildListenerLevel = (items: Array<PluginStatsItem>) => {
  const listenersMap = buildListenersMap(items);
  const list = keys(listenersMap);

  return {
    list,
    map: listenersMap,
  };
};

const buildListenersMap = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, "listenerName");

  return mapValues(grouped, buildEventsLevel);
};

const buildEventsLevel = (items: Array<PluginStatsItem>) => {
  const eventsMap = buildEventsMap(items);
  const list = values(eventsMap).map(({ list }) => {
    const [first] = list;
    const max = maxBy(list, "duration");

    return {
      duration: max?.duration || 0,
      numberOfProcesses: list.length,
      event: first.event,
      listenerName: first.listenerName,
      pid: first.pid,
      filePath: first.filePath,
      calls: get(max, "calls", 0),
      worker: first.worker,
      waitable: first.waitable,
    };
  });

  return {
    list,
    map: eventsMap,
  };
};

const buildEventsMap = (items: Array<PluginStatsItem>) => {
  const grouped = groupBy(items, "event");

  return mapValues(grouped, buildProcsLevel);
};

const buildProcsLevel = (items: Array<PluginStatsItem>) => {
  const procMap = buildProcMap(items);
  const list = values(procMap).map(({ list, map }) => {
    const [first] = list;
    const duration = first.waitable
      ? calcDuration(first.waitable, values(map))
      : sumBy(list, "duration");

    return {
      // duration: sumBy(list, "duration"),
      duration,
      pid: first.pid,
      event: first.event,
      filePath: first.filePath,
      listenerName: first.listenerName,
      worker: first.worker,
      calls: sumBy(list, "calls"),
      waitable: first.waitable,
    };
  });

  return {
    list,
    map: procMap,
  };
};

const buildProcMap = (items: Array<PluginStatsItem>) => {
  const group = groupBy(items, ({ filePath, pid }) => `${filePath}:${pid}`);

  return mapValues(group, buildPluginsLevel);
};

const buildPluginsLevel = (items: Array<PluginStatsItem>) => {
  return {
    list: buildCallsList(items),
    map: buildCallsMap(items),
  };
};

const buildCallsList = (items: Array<PluginStatsItem>) => {
  const group = groupBy(items, "pluginName");
  const reduced = mapValues(group, (items) => {
    const [first] = items;
    const waitable = isEventWaitable(first.event);

    return {
      duration: calcDuration(waitable, items),
      calls: items.length,
      pluginName: first.pluginName,
      pid: first.pid,
      filePath: first.filePath,
      listenerName: first.listenerName,
      event: first.event,
      worker: first.worker,
      waitable,
    };
  });

  return values(reduced);
};

const buildCallsMap = (items: Array<PluginStatsItem>) => {
  const pluginsGroup = groupBy(items, "pluginName");
  const min = minBy(items, "start")?.start || 0;
  const pluginsGroupWithRanges = mapValues(pluginsGroup, (items) => {
    return orderBy(items, "start").map((item, idx) => ({
      ...item,
      title: `${item.pluginName} (${idx + 1})`,
      range: [item.start - min, item.end - min],
    }));
  });
  const callsGroup = groupBy(flatten(values(pluginsGroupWithRanges)), "title");

  return mapValues(callsGroup, ([item]) => item || {});
};
