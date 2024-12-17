import React, { RefObject, useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row, Tabs, Typography } from "antd";
import BellOutlined from "@ant-design/icons/BellOutlined";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActivities,
  markActivitiesAsRead,
} from "@mds/common/redux/actionCreators/activityActionCreator";
import { formatDateTime } from "@common/utils/helpers";
import { getActivities } from "@mds/common/redux/selectors/activitySelectors";
import { getUserInfo } from "@mds/common/redux/selectors/authenticationSelectors";
import { storeActivities } from "@mds/common/redux/actions/activityActions";
import { useHistory } from "react-router-dom";
import {
  EDIT_MINE_INCIDENT,
  EDIT_PROJECT_SUMMARY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
  REVIEW_INFORMATION_REQUIREMENTS_TABLE,
  REVIEW_MAJOR_MINE_APPLICATION,
  REPORT_VIEW_EDIT,
} from "@/constants/routes";
import { IActivity } from "@mds/common/interfaces";

const NotificationDrawer = () => {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const userInfo = useSelector(getUserInfo);
  const activities = useSelector(getActivities);

  const handleMarkAsRead = async (guid: string = null) => {
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
    await dispatch(
      storeActivities({
        records: readActivities,
        totalActivities: readActivities.length,
      })
    );
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

  const navigationHandler = (notification: IActivity) => {
    switch (notification.notification_document.metadata.entity) {
      case "MineReport":
        const { metadata } = notification.notification_document;
        return {
          route: REPORT_VIEW_EDIT.dynamicRoute(metadata.mine.mine_guid, metadata.entity_guid),
          state: { isEditMode: true },
        };
      case "NoticeOfDeparture":
        return {
          route: MINE_DASHBOARD.dynamicRoute(
            notification.notification_document.metadata.mine.mine_guid,
            "nods"
          ),
          search: `?${new URLSearchParams({
            nod: notification.notification_document.metadata.entity_guid,
          })}`,
          state: {},
        };
      case "MineIncident":
        return {
          route: EDIT_MINE_INCIDENT.dynamicRoute(
            notification.notification_document.metadata.mine.mine_guid,
            notification.notification_document.metadata.entity_guid
          ),
          state: {},
        };
      case "ProjectSummary":
        return {
          route: EDIT_PROJECT_SUMMARY.dynamicRoute(
            notification.notification_document.metadata.project.project_guid,
            notification.notification_document.metadata.entity_guid
          ),
          state: {},
        };
      case "InformationRequirementsTable":
        return {
          route: REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
            notification.notification_document.metadata.project.project_guid,
            notification.notification_document.metadata.entity_guid
          ),
          state: { current: 2 },
        };
      case "MajorMineApplication":
        return {
          route: REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
            notification.notification_document.metadata.project.project_guid,
            notification.notification_document.metadata.entity_guid
          ),
          state: { current: 2 },
        };
      case "EngineerOfRecord":
        return {
          route: EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
            notification.notification_document.metadata.mine_tailings_storage_facility
              .mine_tailings_storage_facility_guid,
            notification.notification_document.metadata.mine.mine_guid,
            "engineer-of-record"
          ),
          state: {},
        };
      case "QualifiedPerson":
        return {
          route: EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
            notification.notification_document.metadata.mine_tailings_storage_facility
              .mine_tailings_storage_facility_guid,
            notification.notification_document.metadata.mine.mine_guid,
            "qualified-person"
          ),
          state: {},
        };
      default:
        return null;
    }
  };

  const activityClickHandler = async (notification: IActivity) => {
    await handleMarkAsRead(notification.notification_guid);
    handleCollapse();
    const routeSpecifics = navigationHandler(notification);
    const route = {
      pathname: routeSpecifics?.route,
      search: routeSpecifics?.search,
      state: { ...(routeSpecifics?.state ?? {}) },
    };
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
            tab={
              <Typography.Title level={5} className="notification-tab-header">
                Mine Activity
              </Typography.Title>
            }
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

export default NotificationDrawer;
