import React, { RefObject, useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Tabs, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchActivities,
  markActivitiesAsRead,
} from "@mds/common/redux/actionCreators/activityActionCreator";
import { formatDateTimeUserTz } from "@common/utils/helpers";
import { getActivities } from "@mds/common/redux/selectors/activitySelectors";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import { useHistory } from "react-router-dom";
import { storeActivities } from "@mds/common/redux/actions/activityActions";
import {
  MINE_TAILINGS_DETAILS,
  NOTICE_OF_DEPARTURE,
  EDIT_PROJECT_SUMMARY,
  EDIT_PROJECT,
  VIEW_MINE_INCIDENT,
  REPORT_VIEW_EDIT,
} from "@/constants/routes";
import { IActivity } from "@mds/common/interfaces";

const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const userInfo = useSelector(getUserInfo);
  const activities = useSelector(getActivities)

  const handleMarkAsRead = async (guid = null) => {
    if (guid) {
      await dispatch(markActivitiesAsRead([guid]));
    }

    const readActivities = activities.map((activity) => {
      if (guid) {
        if (activity.notification_guid === guid) {
          return {
            ...activity,
            notification_read: true,
          };
        }
        return activity;
      }
      return {
        ...activity,
        notification_read: true,
      };
    });
    await dispatch(storeActivities({
      records: readActivities,
      totalActivities: readActivities.length,
    }));
  };

  const outsideClickHandler = (ref: RefObject<HTMLDivElement>) => {
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

  const handleCollapse = () => {
    setOpen(!open);
  };

  const handleMarkAllAsRead = async () => {
    const activitiesToMarkAsRead = activities.reduce((acc, activity) => {
      if (activity.notification_read === false) {
        acc.push(activity.notification_guid);
      }
      return acc;
    }, []);

    if (activitiesToMarkAsRead.length > 0) {
      dispatch(markActivitiesAsRead(activitiesToMarkAsRead));
    }
    await handleMarkAsRead();
    handleCollapse();
  };

  const navigationHandler = async (notification: IActivity) => {
    switch (notification.notification_document.metadata.entity) {
      case "MineReport":
        return REPORT_VIEW_EDIT.dynamicRoute(
          notification.notification_document.metadata.mine.mine_guid,
          notification.notification_document.metadata.entity_guid
        );
      case "NoticeOfDeparture":
        return NOTICE_OF_DEPARTURE.dynamicRoute(
          notification.notification_document.metadata.mine.mine_guid,
          notification.notification_document.metadata.entity_guid
        );
      case "MineIncident":
        return VIEW_MINE_INCIDENT.dynamicRoute(
          notification.notification_document.metadata.mine.mine_guid,
          notification.notification_document.metadata.entity_guid
        );
      case "ProjectSummary":
        return EDIT_PROJECT_SUMMARY.dynamicRoute(
          notification.notification_document.metadata.project.project_guid,
          notification.notification_document.metadata.entity_guid
        );
      case "InformationRequirementsTable":
        return EDIT_PROJECT.dynamicRoute(
          notification.notification_document.metadata.project.project_guid,
          "information-requirements-table"
        );
      case "MajorMineApplication":
        return EDIT_PROJECT.dynamicRoute(
          notification.notification_document.metadata.project.project_guid,
          "app"
        );
      case "EngineerOfRecord":
        return MINE_TAILINGS_DETAILS.dynamicRoute(
          notification.notification_document.metadata.mine_tailings_storage_facility
            .mine_tailings_storage_facility_guid,
          notification.notification_document.metadata.mine.mine_guid,
          "engineer-of-record"
        );
      case "QualifiedPerson":
        return MINE_TAILINGS_DETAILS.dynamicRoute(
          notification.notification_document.metadata.mine_tailings_storage_facility
            .mine_tailings_storage_facility_guid,
          notification.notification_document.metadata.mine.mine_guid,
          "qualified-person"
        );
      case "DocumentManagement":
        return EDIT_PROJECT.dynamicRoute(
          notification.notification_document.metadata.entity_guid,
          "documents"
        );
      default:
        return null;
    }
  };

  const activityClickHandler = async (notification: IActivity) => {
    await handleMarkAsRead(notification.notification_guid);
    handleCollapse();
    const route = await navigationHandler(notification);
    history.push(route);
  };

  const modalRef = useRef(null);
  outsideClickHandler(modalRef);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchActivities(userInfo?.preferred_username));
    };

    if (userInfo?.preferred_username) {
      fetchData();
    }
  }, [userInfo?.preferred_username]);

  return (
    <div ref={modalRef}>
      <Button
        onClick={handleCollapse}
        type="text"
        className={`notification-button ${open ? "notification-button-open" : ""}`}
        icon={
          <Badge
            className="notification-badge"
            count={activities?.filter((act) => !act?.notification_read).length || 0}
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
            <div className="notification-button-all-container">
              <Button
                className="notification-button-all"
                size="small"
                type="text"
                onClick={() => handleMarkAllAsRead()}
              >
                Mark all as read
              </Button>
            </div>
            {(activities || [])?.map((activity) => (
              <div className="notification-list-item" key={activity.notification_guid}>
                <div className={!activity.notification_read ? "notification-dot" : ""} />
                <div tabIndex={0} role="button" onClick={() => activityClickHandler(activity)}>
                  <Typography.Text>{activity.notification_document?.message}</Typography.Text>
                  <Row className="items-center margin-small" gutter={6}>
                    <Col>
                      <Typography.Text className="notification-info-text">
                        {activity.notification_document?.metadata?.mine?.mine_name}
                      </Typography.Text>
                    </Col>
                    {activity.notification_document?.metadata?.permit && (
                      <>
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
                      </>
                    )}
                    <Col>
                      <Typography.Text className="notification-info-text">
                        {formatDateTimeUserTz(activity.create_timestamp)}
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

export default NotificationDrawer;
