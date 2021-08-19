import path from "path";

import { Bar, Bullet } from "@ant-design/charts";
import {
  CheckCircleTwoTone,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Col, Divider, notification, Progress, Row, Spin, Table } from "antd";
import P from "bluebird";
import dayjs from "dayjs";
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
  sortBy,
  sumBy,
  uniq,
  values,
} from "lodash";
import { PureComponent, useEffect } from "react";

import styles from "./Overall.module.scss";
import { usePluginsState } from "./State";

const Loader = () => (
  <div className={styles.spinContainer}>
    <Spin size="large" />
  </div>
);

const PluginsTable = (props: any) => {
  const columns = [
    {
      title: "Plugin name",
      dataIndex: "plugin",
      key: "plugin",
    },
    {
      width: "50%",
      title: "duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => {
        return (
          <Progress
            percent={duration}
            strokeWidth={25}
            strokeLinecap="square"
            format={(val) => `${val} ms`}
          />
        );
      },
    },
  ];

  const data = props.data.map((item: any) => ({
    key: item.pluginName,
    plugin: item.pluginName,
    duration: item.duration,
  }));

  return (
    <div className={styles.overallWorker}>
      <Divider>Details by workers for init stage</Divider>
      <Table
        bordered
        pagination={{ position: [] }}
        size="small"
        columns={columns}
        dataSource={sortBy(data, "duration").reverse()}
        expandable={{
          expandedRowRender: props.drawTableWithFiles,
        }}
      />
    </div>
  );
};

const FilesTable = (props: any) => {
  const nestedCols = [
    {
      title: "Source file",
      dataIndex: "file",
      key: "file",
    },
    {
      width: "50%",
      title: "duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => {
        return (
          <Progress
            percent={duration}
            strokeWidth={25}
            strokeLinecap="square"
            format={(val) => `${val} ms`}
          />
        );
      },
    },
  ];

  const nestData = props.data.map((item: any) => ({
    key: item.path,
    file: item.path,
    duration: item.duration,
    plugin: item.pluginName,
  }));

  return (
    <Table
      bordered
      pagination={{ position: [] }}
      size="small"
      columns={nestedCols}
      dataSource={nestData}
      expandable={{
        expandedRowRender: props.drawTableWithWorkers,
      }}
    />
  );
};

const WorkersTable = (props: any) => {
  const ndCols = [
    {
      title: "Worker PID",
      dataIndex: "pid",
      key: "pid",
    },
    {
      title: "Start time",
      dataIndex: "start",
      key: "start",
      render(timestamp: number) {
        return dayjs(timestamp).format("HH:mm:ss:SSS");
      },
    },
    {
      title: "Calls",
      dataIndex: "calls",
      key: "calls",
      render: (calls: number) => {
        const color = calls > 1 ? "red" : "green";
        return <span style={{ color: color }}>{calls}</span>;
      },
    },
    {
      width: "50%",
      title: "duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => {
        return (
          <Progress
            percent={duration}
            strokeWidth={25}
            strokeLinecap="square"
            format={(val) => `${val} ms`}
          />
        );
      },
    },
  ];

  const ndData = props.data.map((item: any) => ({
    key: item.pid,
    pid: item.pid,
    calls: item.calls,
    duration: item.duration,
    start: item.start,
  }));

  return (
    <Table
      bordered
      pagination={{ position: [] }}
      size="small"
      columns={ndCols}
      dataSource={ndData}
    />
  );
};

const OverallWorkers: React.FC = () => {
  const state = usePluginsState();

  if (!state.isLoaded()) {
    return <Loader />;
  }

  const itemsMap = state.state().sources.flatMap((src) =>
    src.items
      .filter(
        (item) => item.event.get() === "init" && item.worker.get() === true
      )
      .map((item) => ({
        path: src.filePath.get(),
        duration: item.duration.get(),
        pid: item.pid.get(),
        start: item.start.get(),
        pluginName: item.pluginName.get(),
      }))
  );
  const rootMap = mapValues(groupBy(itemsMap, "pluginName"), (items) => {
    return {
      items: mapValues(groupBy(items, "path"), (items) => {
        return {
          max: maxBy(items, "duration"),
          items: mapValues(groupBy(items, "pid"), (items) => {
            const max = maxBy(items, "duration");

            return {
              calls: items.length,
              pid: max?.pid,
              duration: max?.duration,
              start: max?.start,
            };
          }),
        };
      }),
      max: maxBy(items, "duration"),
    };
  });

  const tablesItems = map(values(rootMap), "max");

  console.log(tablesItems);

  const drawTableWithWorkers = (record: any) => {
    console.log("FOR WORKERS", record);
    console.log("FOR WORKERS");

    const data = sortBy(
      values(rootMap[record.plugin].items[record.file].items),
      "duration"
    ).reverse();

    return <WorkersTable data={data} />;
  };
  const drawTableWithFiles = (record: any) => {
    const data = map(values(rootMap[record.plugin].items), "max");

    return (
      <FilesTable data={data} drawTableWithWorkers={drawTableWithWorkers} />
    );
  };

  return (
    <PluginsTable data={tablesItems} drawTableWithFiles={drawTableWithFiles} />
  );
};

export default OverallWorkers;
