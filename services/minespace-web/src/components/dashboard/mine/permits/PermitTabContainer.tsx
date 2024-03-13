import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";

import { Tabs } from "antd";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";

import Permits from "@/components/dashboard/mine/permits/Permits";
import DigitalPermits from "@/components/dashboard/mine/permits/DigitalPermits";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

import { IMine, IPermit, VC_CONNECTION_STATES } from "@mds/common";

interface IParams {
  id: string;
  activeTab: string;
}

interface IMatch {
  params: IParams;
}

interface PermitTabContainerProps {
  match: IMatch;
  mine: IMine;
  permits: IPermit[];
  fetchPermits: ActionCreator<typeof fetchPermits>;
}

const initialTab = "all_permits";

export const PermitTabContainer: FC<PermitTabContainerProps> = ({
  match,
  mine,
  permits,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeTab] = useState<string>(null);

  useEffect(() => {
    if (!isLoaded) {
      Promise.all([props.fetchPermits(mine.mine_guid)]).then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  const showDigitalWalletSection = () => {
    // list of permittees from open permits with no duplicates
    const permittees: any[] = [];
    permits
      .filter((p) => p.permit_status_code === "O")
      .forEach((permit) => {
        if (!permittees.find((p) => p.current_permittee_guid === permit.current_permittee_guid)) {
          const permittee = {
            name: permit.current_permittee,
            current_permittee_guid: permit.current_permittee_guid,
            status: permit.current_permittee_digital_wallet_connection_state,
          };
          permittees.push(permittee);
        }
      });

    const showDigitalWalletInfo = permittees.some(
      (p) => VC_CONNECTION_STATES[p.status] !== VC_CONNECTION_STATES.active
    );
    return showDigitalWalletInfo;
  };
  return (
    <Tabs type="card">
      <Tabs.TabPane tab="All Permits" key={initialTab}>
        <Permits mine={mine} match={match} permits={permits} />
      </Tabs.TabPane>

      {showDigitalWalletSection && (
        <Tabs.TabPane tab="Digital Permit Credentials" key={"digital_permit_credentials"}>
          <DigitalPermits mine={mine} match={match} permits={permits} />
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
