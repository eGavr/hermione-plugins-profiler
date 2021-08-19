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
import { useEffect } from "react";

import styles from "./Overall.module.scss";
import { usePluginsState } from "./State";

const OverallWorkers: React.FC = () => {
  const state = usePluginsState();

  if (!state.isLoaded()) {
    return (
      <div className={styles.spinContainer}>
        <Spin size="large" />
      </div>
    );
  }

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

  const data = [
    {
      key: 1,
      plugin: "plugin-name-some",
      duration: 10,
      description: "some description",
    },
    {
      key: 2,
      plugin: "plugin-name-some",
      duration: 20,
      description: "some description",
    },
    {
      key: 3,
      plugin: "plugin-name-some",
      duration: 80,
      description: "some description",
    },
  ];

  return (
    <div className={styles.overallWorker}>
      <Divider>Details by workers for init stage</Divider>
      <Table
        bordered
        pagination={{ position: [] }}
        size="small"
        columns={columns}
        dataSource={data}
        expandable={{
          expandedRowRender: (record) => {
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

            const nestData = [
              {
                key: 1,
                file: "some_file_path_with_host.name.json",
                duration: 10,
                description: "some description",
              },
              {
                key: 2,
                file: "some_file_path_with_host.name.json",
                duration: 20,
                description: "some description",
              },
              {
                key: 3,
                file: "some_file_path_with_host.name.json",
                duration: 80,
                description: "some description",
              },
            ];

            return (
              <Table
                bordered
                pagination={{ position: [] }}
                size="small"
                columns={nestedCols}
                dataSource={nestData}
                expandable={{
                  expandedRowRender: (record) => {
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

                    const ndData = [
                      {
                        key: 1,
                        pid: "2391",
                        duration: 10,
                        start: 1629357410235,
                        description: "some description",
                      },
                      {
                        key: 2,
                        pid: "2391",
                        duration: 20,
                        start: 1629357410235,
                        description: "some description",
                      },
                      {
                        key: 3,
                        pid: "2391",
                        duration: 80,
                        start: 1629357410235,
                        description: "some description",
                      },
                    ];

                    return (
                      <Table
                        bordered
                        pagination={{ position: [] }}
                        size="small"
                        columns={ndCols}
                        dataSource={ndData}
                      />
                    );
                  },
                }}
              />
            );
          },
        }}
      />
    </div>
  );
};

export default OverallWorkers;
