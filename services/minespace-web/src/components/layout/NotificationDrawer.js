import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Tabs, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchActivities } from "@common/actionCreators/activityActionCreator";
import PropTypes from "prop-types";
import { formatDateTime } from "@common/utils/helpers";
import { getActivities } from "@common/selectors/activitySelectors";
import { getUserInfo } from "@/selectors/authenticationSelectors";

const propTypes = {
  fetchActivities: PropTypes.func.isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
  activities: PropTypes.objectOf(PropTypes.string).isRequired,
};

const outsideClickHandler = (ref, setOpen, open) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open) {
        if (ref.current && !ref.current.contains(event.target)) {
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

const NotificationDrawer = (props) => {
  const [open, setOpen] = useState(false);

  const handleCollapse = () => {
    setOpen(!open);
  };

  const modalRef = useRef(null);
  outsideClickHandler(modalRef, setOpen, open);

  useEffect(() => {
    if (props.userInfo?.preferred_username) {
      props.fetchActivities(props.userInfo?.preferred_username);
    }
  }, [props.userInfo.preferred_username]);

  return (
    <div ref={modalRef}>
      <Button
        className="notification-button"
        onClick={handleCollapse}
        type="text"
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
            tab={<Typography.Title level={5}>Mine Activity</Typography.Title>}
            key="1"
          >
            {(props.activities || [])?.map((activity) => (
              <div>
                <div className="notification-list-item">
                  <div className={!activity.notification_read ? "notification-dot" : ""} />
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
                </div>
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
    },
    dispatch
  );

NotificationDrawer.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NotificationDrawer);
