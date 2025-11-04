import React, { FC, useEffect, useState } from "react";
import { Button } from "antd";
import {
  getMineRegionHash,
  getMineTenureTypesHash,
  getCommodityOptionHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getSubscribedMines } from "@mds/common/redux/selectors/mineSelectors";
import { fetchSubscribedMinesByUser, unSubscribe } from "@mds/common/redux/actionCreators/mineActionCreator";
import { SubscriptionTable } from "./SubscriptionTable";
import { testEmailsAction } from "@mds/common/redux/actionCreators/mineActionCreator";
import { detectProdEnvironment } from "@mds/common/utils";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";


/**
 * @const CustomHomePage is a personalized landing page for users
 *
 */
const CustomHomePage: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const isProd = detectProdEnvironment();
  const dispatch = useAppDispatch();

  const isAdmin = useAppSelector(userHasRole(USER_ROLES.role_admin));
  const subscribedMines = useAppSelector(getSubscribedMines);
  const mineRegionHash = useAppSelector(getMineRegionHash);
  const mineTenureHash = useAppSelector(getMineTenureTypesHash);
  const mineCommodityOptionsHash = useAppSelector(getCommodityOptionHash);

  useEffect(() => {
    dispatch(fetchSubscribedMinesByUser()).then(() => {
      setIsLoaded(true);
    })
  }, []);

  const handleUnSubscribe = (event, mineGuid, mineName) => {
    event.preventDefault();
    dispatch(unSubscribe(mineGuid, mineName)).then(() => {
      dispatch(fetchSubscribedMinesByUser());
    });
  };

  const testEmails = () => {
    testEmailsAction().then((r) => {
      const { templates } = r;
      templates.forEach((t) => {
        testEmailsAction(t.name)
      })
    });
  };

  return (
    <div className="landing-page">
      <div className="landing-page__header">
        <h1>My Dashboard</h1>
        {!isProd && isAdmin && <Button type="primary" onClick={testEmails}>Test Emails</Button>}
      </div>
      <div className="landing-page__content page__content">
        <h4>Subscribed Mines</h4>
        <br />
        <SubscriptionTable
          isLoaded={isLoaded}
          subscribedMines={subscribedMines}
          mineRegionHash={mineRegionHash}
          mineTenureHash={mineTenureHash}
          mineCommodityOptionsHash={mineCommodityOptionsHash}
          handleUnSubscribe={handleUnSubscribe}
        />
      </div>
    </div>
  );
};

export default CustomHomePage;
