import React, { useEffect, useState } from "react";
import Loading from "@/components/common/Loading";
import hoistNonReactStatics from "hoist-non-react-statics";
import {
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import * as routes from "@/constants/routes";
import { clearNoticeOfWorkApplication } from "@mds/common/redux/actions/noticeOfWorkActions";
import NOWStatusIndicator from "@/components/noticeOfWork/NOWStatusIndicator";
import NullScreen from "@/components/common/NullScreen";
import { fetchDraftPermitByNOW, fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useAppDispatch } from "@mds/common/redux/rootState";
/**
 * @constant ApplicationGuard - Higher Order Component that fetches applications, and handles all common logic between the application routes.
 * If users try to access an "Administrative Amendment" via the Notice of work Flow, they will be redirected.
 * If users try to access an "Notice of Work" via the Administrative Amendment Flow, they will be redirected.
 * If the Guid in the url changes, HOC looks for that change and updates.
 * If the guid is not an application_guid, HOC shows nullScreen
 * HOC handles all fixedTop/Scroll logic and passes flag to children
 *
 */

const ApplicationGuard = (WrappedComponent) => {
  const applicationGuard = (props) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const location = useLocation<{ applicationPageFromRoute?: any }>();
    const { id, tab } = useParams<{ id: string, tab: string }>();
    const showNullScreen = !location.state && !id;
    const [fixedTop, setFixedTop] = useState(false);
    const fixedTopRef = React.useRef(fixedTop);

    useEffect(() => {
      fixedTopRef.current = fixedTop;
    }, [fixedTop]);
    const [isLoaded, setIsLoaded] = useState(false);
    const applicationPageFromRoute = location?.state?.applicationPageFromRoute;
    const [mineGuid, setMineGuid] = useState();

    const handleScroll = () => {
      const scrollHeight = window.scrollY ?? window.pageYOffset;
      if (scrollHeight > 170 && !fixedTopRef.current) {
        setFixedTop(true);
      } else if (scrollHeight <= 170 && fixedTopRef.current) {
        setFixedTop(false);
      }
    };

    const handleCorrectRouteByApplicationType = (data) => {
      const onNoWApp = location.pathname.includes("notice-of-work");
      const onAApp = location.pathname.includes("administrative-amendment");

      if (data.application_type_code === "NOW" && onAApp) {
        history.replace(
          routes.NOTICE_OF_WORK_APPLICATION.dynamicRoute(
            id,
            tab
          )
        );
      } else if (data.application_type_code === "ADA" && onNoWApp) {
        history.replace(
          routes.ADMIN_AMENDMENT_APPLICATION.dynamicRoute(
            id,
            tab
          )
        );
      } else if (data.is_historic && (onNoWApp || onAApp)) {
        history.replace(
          routes.VIEW_NOTICE_OF_WORK_APPLICATION.dynamicRoute(
            id,
            "application"
          )
        );
      }
      setIsLoaded(true);
    };

    const loadApplication = async () => {
      setIsLoaded(false);
      await
        dispatch(fetchImportedNoticeOfWorkApplication(id)).then(({ data }) => {
          setMineGuid(data.mine_guid);
          dispatch(fetchDraftPermitByNOW(data.mine_guid, id));
          if (data.application_type_code === "NOW") {
            dispatch(fetchOriginalNoticeOfWorkApplication(id));
            dispatch(fetchImportNoticeOfWorkSubmissionDocumentsJob(id));
          }
          if (data.application_type_code === "ADA") {
            dispatch(fetchPermits(data.mine_guid));
          }
          handleCorrectRouteByApplicationType(data);
        })
    };

    const renderTabTitle = (title, tabSection) => (
      <span>
        {/* @ts-ignore - the `type="badge"` is correct, probably just doesn't like the connect/withRouter */}
        <NOWStatusIndicator type="badge" tabSection={tabSection} />
        {title}
      </span>
    );

    useEffect(() => {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }, []);

    useEffect(() => {
      loadApplication();
    }, [id])

    if (showNullScreen) {
      return <NullScreen type="unauthorized-page" />;
    }
    if (isLoaded) {
      return (
        <WrappedComponent
          {...props}
          mineGuid={mineGuid}
          fixedTop={fixedTop}
          applicationPageFromRoute={applicationPageFromRoute}
          renderTabTitle={renderTabTitle}
        />
      );
    }
    return <Loading />;
  };


  hoistNonReactStatics(applicationGuard, WrappedComponent);
  return applicationGuard;
};

export default ApplicationGuard;
