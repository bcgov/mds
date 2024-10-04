import { Button, Drawer } from "antd";
import React, { FC, useState } from "react";
import { Route, Switch } from "react-router-dom";

interface HelpGuideProps {
  helpKey: string;
}
const HelpGuideContent: FC<HelpGuideProps> = ({ helpKey }) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => setOpen(true);
  const hideDrawer = () => setOpen(false);

  return (
    <>
      <Button onClick={showDrawer}>?</Button>
      <Drawer placement="right" onClose={hideDrawer} open={open}>
        {helpKey}
      </Drawer>
    </>
  );
};

const HelpGuide: FC = () => {
  return (
    <Switch>
      {Object.entries(GLOBAL_ROUTES).map(([routeName, routeData]) => {
        const { route = "", helpKey = "" } = routeData as any;
        return (
          <Route key={routeName} exact={true} path={route}>
            {helpKey && <HelpGuideContent helpKey={helpKey} />}
          </Route>
        );
      })}
    </Switch>
  );
};

export default HelpGuide;
