import path from "path";

import { Bar } from "@ant-design/charts";
import {
  CheckCircleTwoTone,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Col, Divider, notification, Row, Spin, Table } from "antd";
import P from "bluebird";
import {
  filter,
  first,
  flatten,
  flattenDeep,
  groupBy,
  keys,
  map,
  mapValues,
  maxBy,
  minBy,
  sortBy,
  sumBy,
  uniq,
  values,
} from "lodash";
import { useEffect } from "react";

import styles from "./Overall.module.scss";
import { usePluginsState } from "./State";

const OverallMaster: React.FC = () => {
  const state = usePluginsState();

  if (!state.isLoaded()) {
    return (
      <div className={styles.spinContainer}>
        <Spin size="large" />
      </div>
    );
  }

  const src = state.state().sources[0];

  const getItemsFromSource = (source: typeof src) => {
    const masterRecords = src.items
      .get()
      .filter((src) => src.event === "init" && src.worker === false);

    const dt1 = groupBy(masterRecords, "pluginName");

    return mapValues(dt1, (items, pluginName) => {
      const max = maxBy(items, "duration");

      return {
        label: pluginName,
        start: max?.start,
        end: max?.end,
        duration: max?.duration,
        durations: map(items, "duration"),
        source: source.filePath.get(),
        calls: items.length,
      };
    });
  };

  const all = state.state().sources.map((source) => getItemsFromSource(source));
  // const all = [getItemsFromSource(state.state().sources[0])];

  const allItems = flatten(all.map((src) => values(src)));
  const startPoint = minBy(allItems, "start")?.start || 0;

  console.log("min", startPoint);

  const allPluginaNames = uniq(flatten(all.map((src) => keys(src))));

  const res = allPluginaNames.map((pluginName) => {
    const items = all.map((itm) => itm[pluginName]);
    const max = maxBy(items, "duration");
    const start = (max?.start || 0) - startPoint;

    return {
      items,
      value: [start, start + (max?.duration || 0)],
      label: pluginName,
      calls: max?.calls,
      duration: max?.duration,
    };
  });

  const config = {
    data: sortBy(res, "duration").reverse(),
    height: res.length * 60,
    autoFit: false,
    // data: sortBy(flatten(values(dt2)), "value").reverse(),
    // isStack: true,
    isRange: true,
    xField: "value",
    yField: "label",
    // seriesField: "type",
    tooltip: {
      customContent: (title: any, items: any): any => {
        const [point] = items;

        if (!point) {
          return;
        }

        const sourceList = sortBy(point.data.items, "value").reverse();

        const columns = [
          {
            title: "source",
            dataIndex: "source",
            key: "source",
          },
          {
            title: "calls",
            dataIndex: "calls",
            key: "calls",
            render: (calls: number) => {
              const color = calls > 1 ? "red" : "green";
              return <span style={{ color: color }}>{calls}</span>;
            },
          },
          {
            title: "delay (ms)",
            dataIndex: "delay",
            key: "delay",
          },
          {
            title: "duration (ms)",
            dataIndex: "duration",
            key: "duration",
          },
        ];

        const data = sourceList.map((item: any) => ({
          source: item.source,
          calls: item.calls,
          duration: item.durations.toString(),
          delay: item.start - startPoint,
        }));

        return (
          <Table
            className={styles.tooltip}
            pagination={{ position: [] }}
            size="small"
            columns={columns}
            dataSource={data}
          />
        );
      },
    },
    label: {
      content: function content(item: any) {
        return `${item.duration} ms`;
      },
      layout: [
        { type: "interval-adjust-position" },
        { type: "interval-hide-overlap" },
        { type: "adjust-color" },
      ],
    },
  };

  return (
    <>
      <Divider>Details of master-process for init stage</Divider>
      <Bar {...config} />
    </>
  );
};

export default OverallMaster;
