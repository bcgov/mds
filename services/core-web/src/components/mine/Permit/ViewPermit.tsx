import React, { FC, useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getLatestAmendmentByPermitGuid,
  getPermitByGuid,
} from "@mds/common/redux/selectors/permitSelectors";
import { IMine, IPermit, IPermitAmendment, USER_ROLES } from "@mds/common";
import ViewPermitOverview from "@/components/mine/Permit/ViewPermitOverview";
import PermitConditions from "@/components/mine/Permit/PermitConditions";

import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import CorePageHeader from "@mds/common/components/common/CorePageHeader";
import * as routes from "@/constants/routes";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils/featureFlag";
import { PresetStatusColorType } from "antd/es/_util/colors";
import { Badge } from "antd";
import { ActionMenuButton } from "@mds/common/components/common/ActionMenu";
import {
  getPermitExtractionByGuid,
  initiatePermitExtraction,
  PermitExtractionStatus,
  fetchPermitExtractionTasks,
  deletePermitConditions,
  fetchPermitExtractionStatus,
} from "@mds/common/redux/slices/permitServiceSlice";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";

const tabs = ["overview", "conditions"];

const ViewPermit: FC = () => {
  const dispatch = useDispatch();

  const { id, permitGuid, tab } = useParams<{ id: string; permitGuid: string; tab: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const latestAmendment: IPermitAmendment = useSelector(getLatestAmendmentByPermitGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const { isFeatureEnabled } = useFeatureFlag();
  const enablePermitConditionsTab = isFeatureEnabled(Feature.PERMIT_CONDITIONS_PAGE);
  const permitExtraction = useSelector(
    getPermitExtractionByGuid(latestAmendment?.permit_amendment_id)
  );

  const userCanEditConditions = useSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_template_conditions)
  );
  const documents = latestAmendment?.related_documents ?? [];

  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);
  const history = useHistory();

  const defaultIsNewImport = [
    PermitExtractionStatus.in_progress,
    PermitExtractionStatus.complete,
  ].includes(permitExtraction?.task_status);
  const [isNewImport, setIsNewImport] = useState(defaultIsNewImport);

  const statusTimerRef = useRef(null);
  const [pollForStatus, setPollForStatus] = useState(false);

  const hasConditions = latestAmendment?.conditions?.length > 0;

  const canStartExtraction =
    ((documents.length > 0 && !permitExtraction?.status) ||
      [PermitExtractionStatus.error, PermitExtractionStatus.not_started].includes(
        permitExtraction?.status
      )) &&
    !hasConditions;

  useEffect(() => {
    if (!permit?.permit_id) {
      dispatch(fetchPermits(id));
    }
  }, [permit]);

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(id));
    }
  }, [mine]);

  useEffect(() => {
    if (permitExtraction?.task_status === PermitExtractionStatus.complete && !hasConditions) {
      dispatch(fetchPermits(id));
    }

    if (permitExtraction?.task_status === PermitExtractionStatus.in_progress) {
      setPollForStatus(true);
    } else {
      setPollForStatus(false);
    }
  }, [permitExtraction?.task_status, isNewImport]);

  useEffect(() => {
    if (enablePermitConditionsTab && latestAmendment) {
      dispatch(
        fetchPermitExtractionTasks({ permit_amendment_id: latestAmendment.permit_amendment_id })
      );
    }
  }, [latestAmendment]);

  useEffect(() => {
    const startPoll = () => {
      statusTimerRef.current = setInterval(() => {
        dispatch(
          fetchPermitExtractionStatus({
            permit_amendment_id: latestAmendment.permit_amendment_id,
            task_id: permitExtraction.task_id,
          })
        );
      }, 5000);
    };

    const stopPoll = () => {
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    };

    if (pollForStatus) {
      startPoll();
    } else {
      stopPoll();
    }

    return () => {
      stopPoll();
    };
  }, [pollForStatus, permitExtraction?.task_id]);

  const getConditionBadge = () => {
    const conditionStatus: PresetStatusColorType = hasConditions ? "success" : "error";
    return <Badge status={conditionStatus} />;
  };

  const tabItems = [
    {
      key: tabs[0],
      label: "Permit Overview",
      children: <ViewPermitOverview latestAmendment={latestAmendment} />,
    },
    enablePermitConditionsTab && {
      key: tabs[1],
      label: <>{getConditionBadge()} Permit Conditions</>,
      children: (
        <PermitConditions
          latestAmendment={latestAmendment}
          canStartExtraction={canStartExtraction}
          userCanEdit={userCanEditConditions}
        />
      ),
    },
  ].filter(Boolean);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    return history.push(routes.VIEW_MINE_PERMIT.dynamicRoute(id, permitGuid, newActiveTab));
  };

  const onConditionsTab = tab === tabs[1];

  const handleInitiateExtraction = async () => {
    await dispatch(
      initiatePermitExtraction({
        permit_amendment_id: latestAmendment?.permit_amendment_id,
        permit_amendment_document_guid: documents[0].permit_amendment_document_guid,
      })
    );
    setIsNewImport(true);
  };

  const handleDeleteConditions = async () => {
    setIsNewImport(false);
    await dispatch(
      deletePermitConditions({ permit_amendment_id: latestAmendment?.permit_amendment_id })
    );

    dispatch(fetchPermits(id));
  };

  const headerActions = [
    onConditionsTab &&
      userCanEditConditions && {
        key: "extract",
        label: "Extract Permit Conditions",
        disabled: !canStartExtraction,
        clickFunction: handleInitiateExtraction,
      },
    onConditionsTab &&
      userCanEditConditions && {
        key: "delete_conditions",
        label: "Delete Permit Conditions",
        disabled: !hasConditions,
        clickFunction: handleDeleteConditions,
      },
  ].filter(Boolean);

  const headerActionComponent =
    enablePermitConditionsTab && headerActions.length > 0 ? (
      <ActionMenuButton actions={headerActions} />
    ) : null;

  return (
    <div className="fixed-tabs-container">
      <CorePageHeader
        entityLabel={permit?.permit_no ?? ""}
        entityType="Permit"
        mineGuid={id}
        current_permittee={permit?.current_permittee ?? ""}
        breadCrumbs={[{ route: routes.MINE_PERMITS.dynamicRoute(id), text: "All Permits" }]}
        extraElement={headerActionComponent}
        tabProps={{
          items: tabItems,
          defaultActiveKey: activeTab,
          onChange: handleTabChange,
        }}
      />
    </div>
  );
};

export default ViewPermit;
