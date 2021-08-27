import { Progress, Table, Tag } from "antd";
import { map, maxBy, sortBy } from "lodash";

type TableRecord = {
  duration: number;
  numberOfProcesses: number;
  event: string;
  listenerName: string;
  pid: number;
  filePath: string;
  calls: number;
  waitable: boolean;
};

type Props = {
  data: Array<TableRecord>;
  drawNestedTable: (record: TableRecord) => React.ReactNode;
};

const EventsTable: React.FC<Props> = (props) => {
  const maxDuration = maxBy(map(props.data, "duration")) || 0;
  const data = props.data.map((item) => ({
    ...item,
    key: item.event,
    processes: item.numberOfProcesses,
  }));

  const columns = [
    {
      title: "Event",
      dataIndex: "event",
      key: "event",
    },
    {
      title: "Number of processes",
      dataIndex: "numberOfProcesses",
      key: "numberOfProcesses",
    },
    {
      title: "Number of calls",
      dataIndex: "calls",
      key: "calls",
    },
    {
      title: "Type",
      dataIndex: "waitable",
      key: "waitable",
      align: "center" as any,
      render: (waitable: string) => {
        const [type, color] = waitable
          ? ["WAITABLE", "green"]
          : ["NON_WAITABLE", "geekblue"];

        return (
          <Tag color={color} key={type}>
            {type.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      width: "50%",
      title: "Max by process duration",
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

  return (
    <div>
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
