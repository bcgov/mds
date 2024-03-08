import React, { FC, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Col, Row, Tabs, Typography } from "antd";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";

import Permits from "@/components/dashboard/mine/permits/Permits";
import DigitalPermits from "@/components/dashboard/mine/permits/DigitalPermits";

import {
  Feature,
  IExplosivesPermit,
  IMine,
  IPermit,
  VC_CONNECTION_STATES,
  isFeatureEnabled,
} from "@mds/common";
import NotFoundNotice from "@/components/common/NotFoundNotice";

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
}

const initialTab = "all_permits";

export const PermitTabContainer: FC<PermitTabContainerProps> = ({
  match,
  mine,
  permits,
  ...props
}) => {
  const [isLoaded] = useState<boolean>(false);
  const [activeTab] = useState<string>(null);

  return (
    <Tabs type="card">
      <Tabs.TabPane tab="All Permits" key={initialTab}>
        <Permits mine={mine} match={match} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Digital Permit Credentials" key={"digital_permit_credentials"}>
        <DigitalPermits mine={mine} match={match} />
      </Tabs.TabPane>
    </Tabs>
  );
};

const mapStateToProps = (state) => ({
  permits: getPermits(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PermitTabContainer);
