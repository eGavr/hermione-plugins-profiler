import { PageHeader } from "antd";

import Loader from "../../../components/Loader";
import { usePluginsState } from "../../../store/plugins";

import styles from "./Events.module.scss";
import EventsTable from "./EventsTable";
import PluginsTable from "./PluginsTable";
import ProcsTable from "./ProcsTable";

const Events: React.FC = () => {
  const state = usePluginsState();

  if (!state.isLoaded()) {
    return <Loader />;
  }

  // TODO: or add lables for async methods

  const dataMap = state.getMap();

  return (
    <div className={styles.events}>
      {dataMap.list.map((listenerName) => {
        const listenerslevel = dataMap.map[listenerName];

        return (
          <div key={listenerName}>
            <PageHeader title={listenerName} subTitle="(listener)" />
            <EventsTable
              data={listenerslevel.list}
              drawNestedTable={(record) => {
                const eventsLevel = listenerslevel.map[record.event];

                return (
                  <ProcsTable
                    data={eventsLevel.list}
                    drawNestedTable={(record) => {
                      const pluginsLevel =
                        eventsLevel.map[`${record.filePath}:${record.pid}`];

                      return (
                        <PluginsTable
                          data={pluginsLevel.list}
                          map={pluginsLevel.map}
                          drawNestedTable={(record) => <div>KEK</div>}
                        />
                      );
                    }}
                  />
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Events;
