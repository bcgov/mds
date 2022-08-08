import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, List, Row, Tabs, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";

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

const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);

  const handleCollapse = () => {
    setOpen(!open);
  };

  const modalRef = useRef(null);
  outsideClickHandler(modalRef, setOpen, open);

  return (
    <div ref={modalRef}>
      <Button
        onClick={handleCollapse}
        type="text"
        icon={
          <Badge className="notification-badge" count={5}>
            <BellOutlined className="notification-icon" />
          </Badge>
        }
      />
      <div
        ref={modalRef}
        className={`notification-drawer ${open ? "notification-drawer-open" : ""}`}
      >
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
            <div className="notification-list-item">
              <div className="notification-dot" />
              <Typography.Text>
                Your NOD [NOD#] requires additional information to be reviewed
              </Typography.Text>
              <Row className="items-center margin-small" gutter={6}>
                <Col>
                  <Typography.Text className="notification-info-text">Gold Mine</Typography.Text>
                </Col>
                <Col>
                  <div className="notification-separator" />
                </Col>
                <Col>
                  <Typography.Text className="notification-info-text">Permit #</Typography.Text>
                </Col>
                <Col>
                  <div className="notification-separator" />
                </Col>
                <Col>
                  <Typography.Text className="notification-info-text">
                    July 15 2022 11:00AM
                  </Typography.Text>
                </Col>
              </Row>
            </div>
            <List.Item>
              <div className="notification-list-item">
                <div className="notification-dot" />
                <Typography.Text>
                  Review of your NOD [NOD#] Submission is Now in Progress
                </Typography.Text>
                <Row className="items-center margin-small" gutter={6}>
                  <Col>
                    <Typography.Text className="notification-info-text">Gold Mine</Typography.Text>
                  </Col>
                  <Col>
                    <div className="notification-separator" />
                  </Col>
                  <Col>
                    <Typography.Text className="notification-info-text">Permit #</Typography.Text>
                  </Col>
                  <Col>
                    <div className="notification-separator" />
                  </Col>
                  <Col>
                    <Typography.Text className="notification-info-text">
                      July 15 2022 11:00AM
                    </Typography.Text>
                  </Col>
                </Row>
              </div>
            </List.Item>
            <List.Item>
              <div className="notification-list-item">
                <Typography.Text>Mine Activity</Typography.Text>
              </div>
            </List.Item>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationDrawer;
