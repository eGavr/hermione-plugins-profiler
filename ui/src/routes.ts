import { ApiOutlined } from "@ant-design/icons";
import _ from "lodash";

import Plugins from "./Pages/Plugins";

export const routes = [
  {
    title: "Plugins",
    Icon: ApiOutlined,
    subItems: [
      {
        title: "Init stage of master",
        path: "/plugins/overall/master",
        Component: Plugins.OverallMaster,
      },
      {
        title: "Init stage of workers",
        path: "/plugins/overall/workers",
        Component: Plugins.OverallWorkers,
      },
      {
        title: "Events",
        path: "/plugins/events",
        Component: Plugins.Events,
      },
    ],
  },
];

const [firstItem] = routes;
const [firstSubitem] = firstItem.subItems;

export const defaultPath = firstSubitem.path;
export const defaultOpenedMenu = [firstItem.title];
export const defaultOpenedSubMenu = [defaultPath];
export const allRoutes = _.chain(routes).map("subItems").flatten().value();
