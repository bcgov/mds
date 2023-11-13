import React, { FC, useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link, useHistory } from "react-router-dom";
import { Row, Col, Typography, Divider, Skeleton } from "antd";
import { EnvironmentOutlined, BookOutlined } from "@ant-design/icons";
import { fetchSubscribedMinesByUser } from "@mds/common/redux/actionCreators/mineActionCreator";
import { fetchGlobalMineAlerts } from "@/actionCreators/mineAlertActionCreator";
import { getSubscribedMines, getSubscribedMinesLoaded } from "@mds/common/redux/selectors/mineSelectors";
import { getGlobalMineAlerts } from "@/selectors/mineAlertSelectors";
import { formatDateTime } from "@common/utils/helpers";
import { IMine, IMineAlert } from "@mds/common";
import * as routes from "@/constants/routes";
import { RootState } from "@/App";
import { ActionCreator } from "@mds/common/interfaces/actionCreator"
import * as router from "@/constants/routes";

interface HomeMineActivityProps {
  subscribedMines: IMine[];
  subscribedMinesLoaded: boolean;
  mines: IMine[];
  alerts: IMineAlert[];
  alertsLoaded: boolean;
  fetchSubscribedMinesByUser: ActionCreator<typeof fetchSubscribedMinesByUser>;
  fetchGlobalMineAlerts: ActionCreator<typeof fetchGlobalMineAlerts>;
}

const SubscribedMine = ({ mine }) => {
  return (
    <div key={mine.mine_no} className="home-subscribed-mine">
      <Link to={routes.MINE_GENERAL.dynamicRoute(mine.mine_guid)}>
        <Typography.Title level={4} className="home-subscribed-mine-name">
          <EnvironmentOutlined />
          {mine.mine_name}
        </Typography.Title>
      </Link>
      <span className="home-subscribed-mine-no">Mine Number: {mine.mine_no}</span>
    </div>
  );
};

const NoSubscribedMines = () => {
  return (
    <div className="center no-subscribed-mines">
      <div className="no-subscribed-mines-icon">
        <BookOutlined />
      </div>
      You have not subscribed to any mines yet. Subscribe to mines to be alerted of their latest
      activity in CORE
    </div>
  );
};

const GlobalMineAlert = ({ alert }) => {
  const history = useHistory();

  const navigateToMine = (mine_guid: string) => {
    history.push(routes.MINE_GENERAL.dynamicRoute(mine_guid));
  };

  return (
    <div onClick={() => navigateToMine(alert.mine_guid)} className="global-mine-alert">
      <Typography.Paragraph className="mine-alert-message">{alert.message}</Typography.Paragraph>
      <div className="mine-alert-details">
        <Link to={routes.MINE_GENERAL.dynamicRoute(alert.mine_guid)}>{alert.mine_name}</Link> •{" "}
        {alert.mine_no} • <div className="mine-alert-date">{formatDateTime(alert.start_date)}</div>
      </div>
      <Divider />
    </div>
  );
};

const HomeMineActivity: FC<HomeMineActivityProps> = ({
  subscribedMines,
  subscribedMinesLoaded,
  mines,
  alerts,
  alertsLoaded,
  ...props
}) => {
  const skeletonAlerts = Array(10);
  const skeletonMines = Array(5);

  const [formattedAlerts, setAlerts] = useState(alertsLoaded ? alerts : skeletonAlerts);
  const [userMines, setUserMines] = useState(skeletonMines);

  const fetchData = async () => {
    if (!subscribedMinesLoaded) {
      props.fetchSubscribedMinesByUser();
    }
    if (!alertsLoaded) {
      props.fetchGlobalMineAlerts();
    }
  };

  useEffect(() => {
    if (alertsLoaded) {
      setAlerts(alerts);
    }
  }, [alertsLoaded]);

  useEffect(() => {
    if (subscribedMinesLoaded) {
      setUserMines(subscribedMines);
    }
  }, [subscribedMinesLoaded]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Row gutter={16}>
      <Col xs={24} lg={12}>
        <div
          className="home-bordered-content"
          id="home-subscribed-mines-container"
          style={{ minHeight: userMines?.length >= 10 ? "838px" : "inherit" }}
        >
          <Typography.Title level={4}>My Subscribed Mines</Typography.Title>
          <Typography.Paragraph>
            Your subscribed mines. To subscribe to more mines, go to the mine&apos;s overview page
            and select &quot;Subscribe to Mine&quot; from the options menu.
          </Typography.Paragraph>
          {userMines.slice(0, 10).map((mine) => (
            <Skeleton loading={!subscribedMinesLoaded} active key={`subscribed-${mine.mine_guid}`}>
              <SubscribedMine mine={mine} />
            </Skeleton>
          ))}

          {subscribedMinesLoaded && userMines.length === 0 ? (
            <NoSubscribedMines />
          ) : (
            <Link to={router.CUSTOM_HOME_PAGE.route}>View all subscribed mines</Link>
          )}
        </div>
      </Col>

      <Col xs={24} lg={12}>
        <div className="home-bordered-content" style={{ maxHeight: "838px", overflowY: "scroll" }}>
          <Typography.Title level={4}>Latest Mine Alerts</Typography.Title>
          <Typography.Paragraph>
            Here are the latest mine alerts from across CORE.
          </Typography.Paragraph>

          {formattedAlerts.map((alert) => (
            <Skeleton loading={!alertsLoaded} active key={`global-alerts-${alert.mine_alert_guid}`}>
              <GlobalMineAlert key={alert.mine_alert_guid} alert={alert} />
            </Skeleton>
          ))}
        </div>
      </Col>
    </Row>
  );
};

const mapStateToProps = (state: RootState) => ({
  subscribedMines: getSubscribedMines(state),
  subscribedMinesLoaded: getSubscribedMinesLoaded(state),
  alerts: getGlobalMineAlerts(state).records,
  alertsLoaded: getGlobalMineAlerts(state).loaded,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchSubscribedMinesByUser,
      fetchGlobalMineAlerts,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(HomeMineActivity);
