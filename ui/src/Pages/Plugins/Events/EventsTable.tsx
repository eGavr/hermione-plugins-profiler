import { State } from "@hookstate/core";
import { Progress, Table } from "antd";
import { get, map, max, maxBy, sortBy } from "lodash";

import styles from "./EventsTable.module.scss";

type Props = {
  data: Array<{
    numberOfProcesses: number;
    origin: any;
  }>;
  drawNestedTable: (record: unknown) => React.ReactNode;
};

const EventsTable: React.FC<Props> = (props: any) => {
  const durations = props.data.map((item: any) => item.origin.duration.get());
  const maxDuration: number = max(durations) || 0;
  const columns = [
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
    },
    {
      title: "Number of processes",
      dataIndex: "processes",
      key: "processes",
    },
    {
      width: "50%",
      title: "duration",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => {
        const percent = (100 / maxDuration) * duration - 1;

        return (
          <Progress
            percent={percent}
            strokeWidth={25}
            strokeLinecap="square"
            format={() => `${duration} ms`}
          />
        );
      },
    },
  ];

  const data = props.data.map((item: any) => ({
    ...item,
    key: item.origin.event.get(),
    event: item.origin.event.get(),
    processes: item.numberOfProcesses,
    duration: item.origin.duration.get(),
  }));

  return (
    <div className={styles.overallWorker}>
      <Table
        bordered
        pagination={false}
        size="small"
        columns={columns}
        dataSource={sortBy(data, "duration").reverse()}
        expandable={{ expandedRowRender: props.drawNestedTable }}
      />
    </div>
  );
};

export default EventsTable;
