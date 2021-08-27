import path from "path";

import {
  CheckCircleTwoTone,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { notification, Spin } from "antd";
import { Button, Layout } from "antd";
import P from "bluebird";
import { uniq } from "lodash";
import { useEffect } from "react";
import { useState } from "react";

import { usePluginsState } from "../store/plugins";
import { loadFile } from "../utils/loader";

import styles from "./Main.module.scss";
import SideMenu from "./SideMenu";

const { Content, Footer, Sider } = Layout;

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

const MainLayout: React.FC = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const state = usePluginsState();
  let animationChain = P.delay(1000);
  const updateFileListComponent = () => {
    const progressItems = state.getSources().map((source) => {
      const Icon = {
        loading: <LoadingOutlined twoToneColor="blue" />,
        empty: <LoadingOutlined />,
        loaded: <CheckCircleTwoTone twoToneColor="#52c41a" />,
        error: <CloseCircleOutlined twoToneColor="red" />,
      }[source.loadState];

      return (
        <div key={source.filePath}>
          <Spin indicator={Icon} />
          &nbsp; Loading {path.basename(source.filePath)}&nbsp;/&nbsp;
          {source.rowsCount} rows
        </div>
      );
    });

    animationChain = animationChain.delay(5).then(() => {
      notification.open({
        description: progressItems,
        message: "Downloads:",
        duration: 0,
        closeIcon: <span />,
        key: "file-loader",
      });
    });
  };
  const hideFileListComponent = () => {
    notification.close("file-loader");
  };

  useEffect(() => {
    if (!state.shouldFetch()) {
      return;
    }

    state.setLoadingState();

    files.forEach((filePath) => {
      state.addUntrackedSource(filePath);

      const loader = loadFile(filePath);

      loader
        .on("chunk", (receivedItems) => {
          state.addUntrackedItems(filePath, receivedItems);

          updateFileListComponent();
        })
        .on("start", () => {
          state.setUntrackedLoadingSourceState(filePath);

          updateFileListComponent();
        })
        .on("error", (msg: string) => {
          state.setUntrackedErrorSourceState(filePath, msg);

          updateFileListComponent();
        })
        .on("complete", () => {
          state.setUntrackedCompleteSourceState(filePath);

          if (state.isAllSourcesLoaded()) {
            animationChain.then(() => {
              hideFileListComponent();
              state.buildMap();
              state.setLoadedState();
            });
          }
        });
    });
  });

  return (
    <Layout className={styles.container}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={() => setCollapsed(!collapsed)}
      >
        <SideMenu />
      </Sider>
      <Layout className={styles.rightLayout}>
        <Content className={styles.contentContainer}>
          <div className={styles.content}>{props.children}</div>
        </Content>
        <Footer className={styles.footer}>
          <Button type="link" href="https://github.com/gemini-testing/hermione">
            Profiler for hermione
          </Button>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
