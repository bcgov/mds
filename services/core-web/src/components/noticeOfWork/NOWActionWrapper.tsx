import React, { FC, useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { isEmpty, isEqual } from "lodash";
import { withRouter, RouteComponentProps } from "react-router-dom";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import {
  getNoticeOfWork,
  getApplicationDelay,
  getNOWProgress,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { APPLICATION_PROGRESS_TRACKING } from "@/constants/NOWConditions";

/**
 * @constant NOWActionWrapper conditionally renders NoW actions based on various conditions (ie, Rejected, Permit issued, client delay, stages not started, etc)
 * persists permissions using authWrapper - These actions are not visible to admin if disabled.
 */

interface NOWActionWrapperProps {
  noticeOfWork?: any;
  children?: any;
  progress?: any;
  applicationDelay?: any;
  tab?: string;
  allowAfterProcess?: boolean;
  ignoreDelay?: boolean;
  location?: { pathname: string };
  isDisabledReviewButton?: boolean;
  permission?: any;
}

export const NOWActionWrapper: FC<RouteComponentProps & NOWActionWrapperProps> = (props) => {
  const [disableTab, setDisableTab] = useState(false);
  const [adminDashboard, setAdminDashboard] = useState(false);

  const handleDisableTab = (tab, progress, isDisabledReviewButton) => {
    if (tab) {
      // application_progress_status_code does not have end_date. Status:In Progress
      if (!isEmpty(progress[tab]) && !progress[tab].end_date) {
        setDisableTab(false);
      } else if (!isDisabledReviewButton && isEmpty(progress[tab])) {
        // DisabledReviewButton applies for CON/REF to show CON/REF package buttons in not started state.
        // Otherwise, if not CON/REF tab, do not show buttons.
        // application_progress_status_code does not exist. Status:Not started
        setDisableTab(true);
      } else if (!isEmpty(progress[tab]) && progress[tab].end_date) {
        // application_progress_status_code has end date. Status: Complete
        setDisableTab(true);
      }
    } else {
      setDisableTab(false);
    }
  };

  useEffect(() => {
    // allow all actions if component is being used on the Admin Dashboard (ie Standard PErmit Condition Management)
    const isAdminRoute = props.location.pathname.includes("admin/permit-condition-management");
    const isEditPermitConditions = props.location.pathname.includes("edit-permit-conditions");
    const isAdminDashboard = isAdminRoute || isEditPermitConditions;
    if (isAdminDashboard) {
      setDisableTab(false);
      setAdminDashboard(isAdminDashboard);
    } else {
      const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
        props.noticeOfWork.application_type_code
      ].includes(props.tab);
      if (tabShouldIncludeProgress) {
        handleDisableTab(props.tab, props.progress, props.isDisabledReviewButton);
      } else {
        setDisableTab(false);
      }
    }
  }, []);

  const usePrevProps = (data) => {
    const ref = useRef<any>();
    useEffect(() => {
      ref.current = data;
    });
    return ref.current;
  };

  let prevProps = usePrevProps(props);

  useEffect(() => {
    if (prevProps === undefined) {
      prevProps = props;
    }

    const tabChanged = prevProps.tab !== props.tab;
    const progressNoWExists =
      isEmpty(prevProps.progress[prevProps.tab]) && !isEmpty(props.progress[prevProps.tab]);
    const progressChanged = !isEqual(
      props.progress[prevProps.tab],
      prevProps.progress[prevProps.tab]
    );
    const isAdminRoute = prevProps.location.pathname.includes("admin/permit-condition-management");
    const isEditPermitConditions = prevProps.location.pathname.includes("edit-permit-conditions");
    const isAdminDashboard = isAdminRoute || isEditPermitConditions;

    if (!isAdminDashboard) {
      const tabShouldIncludeProgress = APPLICATION_PROGRESS_TRACKING[
        prevProps.noticeOfWork.application_type_code
      ].includes(props.tab);

      if ((tabChanged || progressNoWExists || progressChanged) && tabShouldIncludeProgress) {
        handleDisableTab(props.tab, props.progress, props.isDisabledReviewButton);
      }
    }
  }, [props.tab, props.progress, props.isDisabledReviewButton]);

  const isApplicationDelayed = props.ignoreDelay ? false : !isEmpty(props.applicationDelay);
  const isApplicationComplete =
    props.noticeOfWork.now_application_status_code === "AIA" ||
    props.noticeOfWork.now_application_status_code === "WDN" ||
    props.noticeOfWork.now_application_status_code === "REJ" ||
    props.noticeOfWork.now_application_status_code === "NPR";

  const disabled = isApplicationDelayed || isApplicationComplete || disableTab;
  return !disabled || props.allowAfterProcess || adminDashboard ? (
    <AuthorizationWrapper {...props}>
      {React.createElement("span", null, props.children)}
    </AuthorizationWrapper>
  ) : (
    <div />
  );
};

const mapStateToProps = (state) => ({
  progress: getNOWProgress(state),
  noticeOfWork: getNoticeOfWork(state),
  applicationDelay: getApplicationDelay(state),
});

export default withRouter(
  connect(mapStateToProps)(NOWActionWrapper) as FC<NOWActionWrapperProps & RouteComponentProps>
);
