import { Bar } from "@ant-design/charts";
import { SettingOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Divider,
  PageHeader,
  Progress,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { Collapse, Select } from "antd";
import Paragraph from "antd/lib/skeleton/Paragraph";
import {
  flatten,
  groupBy,
  keys,
  map,
  mapValues,
  maxBy,
  minBy,
  orderBy,
  sortBy,
  sumBy,
  values,
} from "lodash";

import Loader from "../../Components/Loader/Loader";
import { usePluginsState } from "../../Store/Plugins";

import styles from "./Events.module.scss";
import EventsTable from "./Events/EventsTable";

const { Panel } = Collapse;
const { Option } = Select;

const WorkersTable = (props: any) => {
  const maxDuration =
    maxBy(props.data as unknown as [{ duration: number }], "duration")
      ?.duration || 0;

  const columns = [
    {
      title: "File",
      dataIndex: "file",
      key: "file",
    },
    {
      title: "PID",
      dataIndex: "pid",
      key: "pid",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center" as any,
      render: (tag: string) => {
        const color = tag === "master" ? "green" : "geekblue";

        return (
          <Tag color={color} key={tag}>
            {tag.toUpperCase()}
          </Tag>
        );
      },
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
    key: `${item.file}:${item.pid}`,
    duration: item.duration,
    pid: item.pid,
    file: item.file,
    type: item.worker ? "worker" : "master",
    listener: item.listener,
    event: item.event,
  }));

  return (
    <div className={styles.overallWorker}>
      <Table
        bordered
        pagination={{ pageSize: 50 }}
        size="small"
        columns={columns}
        dataSource={sortBy(data, "duration").reverse()}
        expandable={{
          expandedRowRender: props.drawTableWithProcess,
        }}
      />
    </div>
  );
};

const PluginsTable = (props: any) => {
  const data = props.data.map((item: any) => ({
    key: item.pluginName,
    calls: item.calls,
    min: item.min,
    mid: item.mid,
    max: item.max,
    pluginName: item.pluginName,
    sum: item.sum,
  }));

  const columns = [
    {
      title: "Plugin name",
      dataIndex: "pluginName",
      key: "pluginName",
    },
    {
      title: "Calls",
      dataIndex: "calls",
      key: "calls",
    },
    {
      width: "50%",
      title: "Duration",
      children: [
        {
          title: "Min(ms)",
          dataIndex: "min",
          key: "min",
          render: (duration: number) => {
            const maxDuration = maxBy(props.data as any[], "min")?.min;
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
        {
          title: "Mid(ms)",
          dataIndex: "mid",
          key: "mid",
          render: (duration: number) => {
            const maxDuration = maxBy(props.data as any[], "mid")?.mid;
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
        {
          title: "Max(ms)",
          dataIndex: "max",
          key: "max",
          render: (duration: number) => {
            const maxDuration = maxBy(props.data as any[], "max")?.max;
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
        {
          title: "Sum(ms)",
          dataIndex: "sum",
          key: "sum",
          render: (duration: number) => {
            const maxDuration = maxBy(props.data as any[], "sum")?.sum;
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
      ],
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
        expandable={{
          expandedRowRender: props.drawTableWithProcess,
        }}
      />
    </div>
  );
};

const Events: React.FC = () => {
  const state = usePluginsState();

  if (!state.isLoaded()) {
    return <Loader />;
  }

  // const itemsMap = state.state().sources.flatMap((source) => {
  //   return source.items.map((item) => ({
  //     event: item.event.get(),
  //     listener: item.listenerName.get(),
  //     duration: item.duration.get(),
  //     pid: item.pid.get(),
  //     start: item.start.get(),
  //     end: item.end.get(),
  //     pluginName: item.pluginName.get(),
  //     file: source.filePath.get(),
  //     worker: item.worker.get(),
  //   }));
  // });

  // const group = mapValues(groupBy(itemsMap, "listener"), (items: any) => {
  //   const res = mapValues(groupBy(items, "event"), (items) => {
  //     const pids = groupBy(items, (item) => `${item.file}:${item.pid}`);
  //     const list = mapValues(pids, (items) => {
  //       const sum = sumBy(items, "duration");

  //       return {
  //         worker: items[0].worker,
  //         pid: items[0].pid,
  //         file: items[0].file,
  //         calls: items.length,
  //         duration: sum,
  //         event: items[0].event,
  //         listener: items[0].listener,
  //         pluginName: items[0].pluginName,
  //       };
  //     });

  //     return {
  //       max: {
  //         ...maxBy(values(list), "duration"),
  //         processes: values(list).length,
  //       },
  //       list: values(list),
  //       pids,
  //       items: mapValues(pids, (items) => {
  //         const names = mapValues(groupBy(items, "pluginName"), (items) => {
  //           return {
  //             worker: items[0].worker,
  //             pid: items[0].pid,
  //             file: items[0].file,
  //             calls: items.length,
  //             event: items[0].event,
  //             listener: items[0].listener,
  //             pluginName: items[0].pluginName,
  //             sum: sumBy(items, "duration"),
  //             max: maxBy(items, "duration").duration,
  //             min: minBy(items, "duration").duration,
  //             mid: sortBy(items, "duration")[Math.round((items.length - 1) / 2)]
  //               .duration,
  //           };
  //         });

  //         return {
  //           items: values(names),
  //         };
  //       }),
  //     };
  //   });

  //   return res;
  // });

  // const drawTableWithPlugins = (record: any) => {
  //   const data =
  //     group[record.listener][record.event].items[`${record.file}:${record.pid}`]
  //       .items;

  //   // CONFIG

  //   const dt =
  //     group[record.listener][record.event].pids[`${record.file}:${record.pid}`];

  //   console.log(dt);

  //   const min = minBy(dt, "start").start;
  //   const groupped = mapValues(groupBy(dt, "pluginName"), (items) => {
  //     return orderBy(items, "start").map((item, idx) => ({
  //       label: `${item.pluginName} (${idx + 1})`,
  //       value: [item.start - min, item.end - min],
  //       start: item.start,
  //       duration: item.duration,
  //     }));
  //   });

  //   const items = flatten(values(groupped));
  //   const diagHeight = 30 * items.length;

  //   // TODO: implement custom toolbar
  //   const config = {
  //     height: diagHeight > 400 ? 400 : diagHeight,
  //     autoFit: false,
  //     renderer: "svg" as any,
  //     data: sortBy(items, "start"),
  //     isRange: true,
  //     xField: "value",
  //     yField: "label",
  //     color: "#1c90ff",
  //     tooltip: false,
  //     barStyle: {
  //       stroke: "#1c90ff",
  //       lineWidth: 1,
  //     },
  //     xAxis: {
  //       label: {
  //         formatter: (date: number) =>
  //           `${date / 1000}sec / ${Math.round(date / 1000 / 60)}min`,
  //       },
  //     } as any,
  //     label: {
  //       content: function content(item: any) {
  //         return `${item.duration} ms`;
  //       },
  //       position: "right" as any,
  //       layout: [{ type: "adjust-color" }] as any,
  //     },
  //   };

  //   if (diagHeight > 400) {
  //     (config as any).scrollbar = {
  //       type: "vertical",
  //       width: 10,
  //       categorySize: 30,
  //       animate: false,
  //     };
  //   }

  //   return (
  //     <>
  //       <PluginsTable data={data} />
  //       <Collapse
  //         style={{
  //           boxSizing: "border-box",
  //           margin: "-6px -5px 0px -5px",
  //           border: "1px solid #f0f0f0",
  //         }}
  //       >
  //         <Panel header="Timeline diagram" key="1">
  //           <div
  //             style={{
  //               position: "relative",
  //               height: diagHeight > 600 ? 400 : diagHeight,
  //               width: "100%",
  //             }}
  //           >
  //             <div style={{ position: "absolute", width: "100%" }}>
  //               <Bar {...config} />
  //             </div>
  //           </div>
  //         </Panel>
  //       </Collapse>
  //     </>
  //   );
  // };

  // const drawTableWithProcess = (record: any) => {
  //   const data = group[record.listener][record.event].list;
  //   // console.log(data);

  //   return (
  //     <WorkersTable data={data} drawTableWithProcess={drawTableWithPlugins} />
  //   );
  // };

  // TODO: figure out double draw table on extend
  // TODO: Move some async events to master tab (start runner, end runner)
  // TODO: or add lables to async methods
  // TODO: add events map and show on event

  console.log("RERENDER", state.getMap());

  return null;

  // return (
  //   <div className={styles.events}>
  //     {state.getListeners().map((listener) => {
  //       const data = state.getEventsForListener(listener);

  //       return (
  //         <div key={listener}>
  //           <PageHeader title={listener} subTitle="(listener)" />
  //           <EventsTable
  //             data={data}
  //             drawNestedTable={(record) => {
  //               console.log(record);

  //               return <></>;
  //             }}
  //             // data={state.getEventMeasures(eventName)}
  //             // drawTableWithProcess={drawTableWithProcess}
  //           />
  //         </div>
  //       );
  //     })}
  //   </div>
  // );
};

export default Events;
