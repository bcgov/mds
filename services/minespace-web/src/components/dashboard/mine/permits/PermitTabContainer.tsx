import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";

import { Tabs } from "antd";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";

import Permits from "@/components/dashboard/mine/permits/Permits";
import DigitalPermits from "@/components/dashboard/mine/permits/DigitalPermits";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

import { Feature, IMine, IPermit, VC_CONNECTION_STATES, isFeatureEnabled } from "@mds/common";

interface PermitTabContainerProps {
  mine: IMine;
  permits: IPermit[];
  fetchPermits: ActionCreator<typeof fetchPermits>;
}

const initialTab = "all_permits";

export const PermitTabContainer: FC<PermitTabContainerProps> = ({ mine, permits, ...props }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      Promise.all([props.fetchPermits(mine.mine_guid)]).then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  const showDigitalWalletTab = () => {
    // list of permittees from open permits with no duplicates
    const open_permits = permits.filter((p) => p.permit_status_code === "O");

    const result =
      mine.major_mine_ind &&
      isFeatureEnabled(Feature.VERIFIABLE_CREDENTIALS) &&
      open_permits.length > 0;
    return result;
  };
  return (
    <Tabs type="card">
      <Tabs.TabPane tab="All Permits" key={initialTab}>
        <Permits mine={mine} permits={permits} />
      </Tabs.TabPane>

      {showDigitalWalletTab() && (
        <Tabs.TabPane tab="Digital Permit Credentials" key={"digital_permit_credentials"}>
          <DigitalPermits mine={mine} permits={permits} />
        </Tabs.TabPane>
      )}
    </Tabs>
  );
};

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = { fetchPermits };

export default connect(mapStateToProps, mapDispatchToProps)(PermitTabContainer);
