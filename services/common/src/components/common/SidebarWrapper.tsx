import React, { FC, ReactNode } from "react";
import { Menu, Layout } from "antd";
import { Route, Switch, useHistory } from "react-router-dom";
import { ItemType } from "antd/lib/menu/hooks/useItems";

const { Content, Sider } = Layout;

export const SidebarContext = React.createContext<any>({
  sharedData: null,
});

export const { Provider: SidebarProvider, Consumer: SidebarConsumer } = SidebarContext;

export const SidebarRoutes = ({ routes }) => {
  return (
    <Switch>
      {routes.map((route) => (
        <Route key={route.key} exact path={route.path} component={route.component} />
      ))}
      <div>no match. :(</div>
    </Switch>
  );
};

export const SidebarNavigation = ({ routes, dynamicRoute, sharedData }) => {
  const history = useHistory();

  const onClick = (keyPath: string[]) => {
    history.push(dynamicRoute(sharedData, keyPath));
  };

  return (
    <Sider>
      <Menu style={{ height: "100%" }} onClick={(item) => onClick(item.keyPath)} items={routes} />
    </Sider>
  );
};

interface SidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;

  component?: React.ComponentType;
  path?: string;
  exact?: boolean;
}

interface SidebarWrapperProps {
  items: SidebarItem[];
  routes?: ReactNode; // if not passed in, will be generated from items. Expects a react-router-dom <Switch>
  sharedData?: any;
  isLoaded?: boolean;
}

const SidebarWrapper: FC<SidebarWrapperProps> = ({ items, routes, sharedData }) => {
  const history = useHistory();
  const navRoutes = routes ?? <SidebarRoutes routes={items} />;

  const clickHandlers = items.reduce((acc, item) => {
    return {
      ...acc,
      [item.key]: item.onClick ?? (() => history.push(item.path)),
    };
  }, {});

  const onClick = (item: ItemType) => {
    const handleClick = clickHandlers[item.key];
    handleClick();
  };
  return (
    <Layout>
      <SidebarProvider value={sharedData}>
        <Sider>
          <Menu style={{ height: "100%" }} onClick={(item) => onClick(item)} items={items} />
        </Sider>
        <Content>{navRoutes}</Content>
      </SidebarProvider>
    </Layout>
  );
};

export default SidebarWrapper;
