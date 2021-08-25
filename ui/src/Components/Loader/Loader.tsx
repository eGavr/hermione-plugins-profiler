import { Spin } from "antd";

import styles from "./Loader.module.scss";

const Loader: React.FC = () => (
  <div className={styles.loader}>
    <Spin size="large" />
  </div>
);

export default Loader;
