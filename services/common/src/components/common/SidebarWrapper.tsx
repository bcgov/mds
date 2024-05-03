import React, { FC, ReactNode, ReactNodeArray, useMemo } from "react";
import { Menu, Layout } from "antd";
import { Route, Switch, useHistory } from "react-router-dom";
import { ItemType } from "antd/lib/menu/hooks/useItems";

/**
 * USAGE NOTES:
 * 1. Side navigation usually wants to be full-width.
 *    - Due to app structure, this is handled in Routes
 *    - Make sure component is *not* wrapped with ColumnWrapper
 * 2. To allow flexibility, children are passed to the wrapper for nav items
 *    - but for ease of use, there are generator components
 *      - pass the same 'items' to the wrapper and nav component to
 *        generate a matching menu and route switch
 *    - where routes are already defined, these can be passed in directly as pageContent
 *      - items will be necessary to pass in for the menu
 *      - or use different page structure + onClick param for items
 * 3. nested menu items are not yet implemented
 * 4. Shared data can be passed down from the parent to the child content pages
 *    - simply pass in as sharedData, and call useContext(SidebarContext) in the child to access
 *    - for complex typing, create an interface in the parent and import in children
 */

const { Content, Sider } = Layout;

export const SidebarContext = React.createContext<any>({
  sharedData: null,
});

export const { Provider: SidebarProvider, Consumer: SidebarConsumer } = SidebarContext;

interface SidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;

  // below are necessary to generate the routes
  component?: React.ComponentType;
  path?: string;
  exact?: boolean;
}

interface SidebarRoutesProps {
  routes: SidebarItem[];
}

export const SidebarRoutes: FC<SidebarRoutesProps> = ({ routes }) => {
  return (
    <Switch>
      {routes.map((route) => (
        <Route key={route.key} exact={route.exact} path={route.path} component={route.component} />
      ))}
    </Switch>
  );
};

interface SidebarNavigationProps {
  items: SidebarItem[];
  selectedKeys: string[];
}
export const SidebarNavigation: FC<SidebarNavigationProps> = ({ items, selectedKeys }) => {
  const history = useHistory();

  const clickHandlers = useMemo(() => {
    return items.reduce((acc, item) => {
      return {
        ...acc,
        [item.key]: item.onClick ?? (() => history.push(item.path)),
      };
    }, {});
  }, [items, history]);

  const onClick = (item: ItemType) => {
    const handleClick = clickHandlers[item.key];
    handleClick();
  };

  return (
    <Menu
      style={{ height: "100%" }}
      onClick={(item) => onClick(item)}
      items={items}
      selectedKeys={selectedKeys}
    />
  );
};

interface SidebarWrapperProps {
  items: SidebarItem[];
  // pageContent can be either pre-generated routes or different page structure
  pageContent?: ReactNode;
  sharedData?: any;
  // to be displayed in the side nav
  children: ReactNode | ReactNodeArray;
}

const SidebarWrapper: FC<SidebarWrapperProps> = ({
  items = [],
  pageContent,
  sharedData,
  children,
}) => {
  const navRoutes = pageContent ?? <SidebarRoutes routes={items} />;

  const siderWidth = 241;
  return (
    <Layout className="sidebar-wrapper">
      <SidebarProvider value={sharedData}>
        <Sider width={siderWidth} className="sider-fixed">
          {children}
        </Sider>
        <Content style={{ marginLeft: siderWidth }}>{navRoutes}</Content>
      </SidebarProvider>
    </Layout>
  );
};

export default SidebarWrapper;
