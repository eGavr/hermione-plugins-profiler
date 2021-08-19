import path from "path";

import {
  CheckCircleTwoTone,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { notification, Spin } from "antd";
import { Button, Layout } from "antd";
import P from "bluebird";
import { useEffect } from "react";
import { useState } from "react";

import { usePluginsState } from "../Pages/Plugins/State";

import styles from "./Main.module.scss";
import SideMenu from "./SideMenu";

const { Content, Footer, Sider } = Layout;

const MainLayout: React.FC = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  const state = usePluginsState();

  useEffect(() => {
    let animationChain = P.delay(1000);

    state.onSourceUpdates((sources) => {
      const progressItems = sources.map((source) => {
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
            {source.items.length} rows
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
    });

    state.onAllLoaded(() => {
      animationChain.then(() => {
        notification.close("file-loader");
        state.markAsLoaded();
      });
    });

    if (state.shouldFetch()) {
      state.fetch();
    }
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
