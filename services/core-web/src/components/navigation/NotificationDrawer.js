import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Tabs, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  fetchActivities,
  markActivitiesAsRead,
} from "@common/actionCreators/activityActionCreator";
import PropTypes from "prop-types";
import { formatDateTime } from "@common/utils/helpers";
import { getActivities } from "@common/selectors/activitySelectors";
import { getUserInfo } from "@common/selectors/authenticationSelectors";
import { NOTICE_OF_DEPARTURE } from "@/constants/routes";
import { Link } from "react-router-dom";
import { storeActivities } from "@common/actions/activityActions";

const propTypes = {
  fetchActivities: PropTypes.func.isRequired,
  markActivitiesAsRead: PropTypes.func.isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  activities: PropTypes.objectOf(PropTypes.string).isRequired,
  storeActivities: PropTypes.func.isRequired,
};

const NotificationDrawer = (props) => {
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = async () => {
    const readActivities = props.activities.map((activity) => {
      return {
        ...activity,
        notification_read: true,
      };
    });
    await props.storeActivities({
      records: readActivities,
      totalActivities: readActivities.length,
    });
  };

  const outsideClickHandler = (ref) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (open) {
          if (ref.current && !ref.current.contains(event.target)) {
            handleMarkAsRead();
            setOpen(!open);
          }
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, open]);
  };

  const handleCollapse = () => {
    const activitiesToMarkAsRead = props.activities.reduce((acc, activity) => {
      if (activity.notification_read === false) {
        acc.push(activity.notification_guid);
      }
      return acc;
    }, []);

    if (activitiesToMarkAsRead.length > 0) {
      props.markActivitiesAsRead(activitiesToMarkAsRead);
    }
    if (open) {
      handleMarkAsRead();
    }
    setOpen(!open);
  };

  const navigationHandler = (notification) => {
    switch (notification.notification_document.metadata.entity) {
      case "NoticeOfDeparture":
        return NOTICE_OF_DEPARTURE.dynamicRoute(
          notification.notification_document.metadata.mine.mine_guid,
          notification.notification_document.metadata.entity_guid
        );
      default:
        return null;
    }
  };

  const modalRef = useRef(null);
  outsideClickHandler(modalRef);

  useEffect(() => {
    if (props.userInfo?.preferred_username) {
      props.fetchActivities(props.userInfo?.preferred_username);
    }
  }, [props.userInfo.preferred_username]);

  return (
    <div ref={modalRef}>
      <Button
        onClick={handleCollapse}
        type="text"
        className={`notification-button ${open ? "notification-button-open" : ""}`}
        icon={
          <Badge
            className="notification-badge"
            count={props.activities?.filter((act) => !act?.notification_read).length || 0}
          >
            <BellOutlined className="notification-icon" />
          </Badge>
        }
      />
      <div className={`notification-drawer ${open ? "notification-drawer-open" : ""}`}>
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ backgroundColor: "#FFF" }}
          className="notification-tabs"
        >
          <Tabs.TabPane
            className="notification-tab-pane"
            tab={<Typography className="notification-tab-header">Mine Activity</Typography>}
            key="1"
          >
            {(props.activities || [])?.map((activity) => (
              <div className="notification-list-item">
                <div className={!activity.notification_read ? "notification-dot" : ""} />
                <Link to={navigationHandler(activity)} onClick={handleCollapse}>
                  <Typography.Text>{activity.notification_document?.message}</Typography.Text>
                  <Row className="items-center margin-small" gutter={6}>
                    <Col>
                      <Typography.Text className="notification-info-text">
                        {activity.notification_document?.metadata?.mine?.mine_name}
                      </Typography.Text>
                    </Col>
                    <Col>
                      <div className="notification-separator" />
                    </Col>
                    <Col>
                      <Typography.Text className="notification-info-text">
                        {activity.notification_document?.metadata?.permit?.permit_no}
                      </Typography.Text>
                    </Col>
                    <Col>
                      <div className="notification-separator" />
                    </Col>
                    <Col>
                      <Typography.Text className="notification-info-text">
                        {formatDateTime(activity.create_timestamp)}
                      </Typography.Text>
                    </Col>
                  </Row>
                </Link>
              </div>
            ))}
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  activities: getActivities(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchActivities,
      markActivitiesAsRead,
      storeActivities,
    },
    dispatch
  );

NotificationDrawer.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NotificationDrawer);
