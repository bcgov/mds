import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Tabs, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getActivities } from "@common/reducers/activityReducer";
import PropTypes from "prop-types";
import { getUserInfo, isAuthenticated } from "@common/selectors/authenticationSelectors";
import { formatDateTime } from "@common/utils/helpers";

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
  }, [ref]);
};

const propTypes = {
  getActivities: PropTypes.func.isRequired,
  userInfo: PropTypes.objectOf(PropTypes.string).isRequired,
};

const NotificationDrawer = (props) => {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);

  const modalRef = useRef(null);
  outsideClickHandler(modalRef, setOpen, open);

  useEffect(() => {
    if (props.userInfo?.preferred_username) {
      (async () => {
        const { data: acts } = await props.getActivities(props.userInfo?.preferred_username);
        setActivities(acts.records);
        setTotalActivities(acts.total || 0);
      })();
    }
  }, [props.userInfo.preferred_username]);

  const handleCollapse = () => {
    setOpen(!open);
  };

  return (
    <div ref={modalRef}>
      <Button
        onClick={handleCollapse}
        type="text"
        icon={
          <Badge className="notification-badge" count={totalActivities}>
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
            {(activities || [])?.map((activity) => (
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

NotificationDrawer.propTypes = propTypes;

const mapStateToProps = (state) => ({
  userInfo: getUserInfo(state),
  isAuthenticated: isAuthenticated(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getActivities,
    },
    dispatch
  );

export default connect(mapDispatchToProps, mapStateToProps)(NotificationDrawer);
