import React, { FC, useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { Row, Col, Card, Typography, Divider } from "antd";

import {
  fetchSubscribedMinesByUser,
  fetchMineRecords,
} from "@common/actionCreators/mineActionCreator";
import { fetchGlobalMineAlerts } from "@/actionCreators/mineAlertActionCreator";
import { getSubscribedMines, getMines } from "@common/selectors/mineSelectors";
import { getGlobalMineAlerts } from "@/selectors/mineAlertSelectors";
import { formatDateTime } from "@common/utils/helpers";
import { IMine, IMineAlert } from "@mds/common";

interface HomeMineActivityProps {
  subscribedMines: IMine[];
  mines: IMine[];
  alerts: IMineAlert[];
  fetchSubscribedMinesByUser: any;
  fetchMineRecords: any;
  fetchGlobalMineAlerts: any;
}

const SubscribedMines = ({ mines = [] }) => {
  if (mines.length === 0) {
    return (
      <div>
        You have not subscribed to any mines yet. Subscribe to mines to be alerted of their latest
        activity in CORE
      </div>
    );
  }
  return (
    <>
      {mines.map((mine) => (
        <div key={mine.mine_no}>
          <Typography.Title level={4}>{mine.mine_name}</Typography.Title>
          Mine Number: {mine.mine_no}
        </div>
      ))}
    </>
  );
};

const GlobalMineAlert = (alert: IMineAlert) => {
  // console.log(alert);
  return (
    <div>
      <Typography.Paragraph>{alert.message}</Typography.Paragraph>
      <div>
        {alert.mine_name} Permit #?? {formatDateTime(alert.start_date)}
      </div>
      <Divider />
    </div>
  );
};

const HomeMineActivity: FC<HomeMineActivityProps> = ({
  subscribedMines,
  mines,
  alerts,
  ...props
}) => {
  const [loaded, setIsLoaded] = useState(false);
  const [formattedAlerts, setAlerts] = useState([]);

  const fetchData = async () => {
    await props.fetchMineRecords();
    await props.fetchSubscribedMinesByUser();
    await props.fetchGlobalMineAlerts();

    const alertsWithMines = alerts.map((alert) => {
      const mine = mines[alert.mine_guid] ?? { mine_name: "", mine_no: "" };
      return {
        ...alert,
        mine_name: mine.mine_name,
        mine_no: mine.mine_no,
      };
    });
    setAlerts(alertsWithMines);
  };

  useEffect(() => {
    if (!loaded) {
      fetchData().then(() => setIsLoaded(true));
    }
  });
  console.log(formattedAlerts);

  return (
    <Row>
      <Col span={12}>
        <Card>
          <Typography.Title level={2}>Subscribed Mines</Typography.Title>
          <Typography.Paragraph>
            Your subscribed mines. To subscribe to more mines, go to the mine&apos;s overview page
            and select &quot;Subscribe to Mine&quot; from the options menu.
          </Typography.Paragraph>
          <SubscribedMines mines={subscribedMines} />
        </Card>
      </Col>

      <Col span={12}>
        <Card>
          <Typography.Title level={2}>Latest Mine Alerts</Typography.Title>
          <Typography.Paragraph>
            Here are the latest mine alerts from across CORE.
          </Typography.Paragraph>
          {formattedAlerts.map((alert) => (
            <GlobalMineAlert key={alert.mine_alert_guid} {...alert} />
          ))}
        </Card>
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  subscribedMines: getSubscribedMines(state),
  mines: getMines(state),
  alerts: getGlobalMineAlerts(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      fetchMineRecords,
      fetchGlobalMineAlerts,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(HomeMineActivity);
