import React, { FC, useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  getAmendment,
  getLatestAmendmentByPermitGuid,
  getPermitByGuid,
} from "@mds/common/redux/selectors/permitSelectors";
import { IMine, IPermit, IPermitAmendment, IPermitAmendmentDocument } from "@mds/common/interfaces";
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
import { USER_ROLES } from "@mds/common/constants/environment";
import Loading from "@mds/common/components/common/Loading";
import { PERMIT_CONDITION_STATUS_CODE } from "@mds/common/constants/enums";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import PermitConditionsSelectDocumentModal from "@/components/mine/Permit/PermitConditionsSelectDocumentModal";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";

const tabs = ["overview", "conditions"];

const ViewPermit: FC = () => {
  const dispatch = useAppDispatch();
  const pars = useParams();
  const { id, permitGuid, tab, permitAmendmentGuid } = useParams<{ id: string; permitGuid: string; permitAmendmentGuid: string; tab: string }>();
  const permit: IPermit = useAppSelector(getPermitByGuid(permitGuid));
  const currentAmendment: IPermitAmendment = useAppSelector(getAmendment(permitGuid, permitAmendmentGuid));
  const latestAmendment: IPermitAmendment = useAppSelector(getLatestAmendmentByPermitGuid(permitGuid));

  const amendments = permit?.permit_amendments;
  let amendmentToViewConditions = currentAmendment;
  if (latestAmendment && !latestAmendment?.conditions_review_completed && currentAmendment?.permit_amendment_guid) {
    const latestCompletedAmendment = amendments?.find(a => a.conditions_review_completed);
    if (latestCompletedAmendment) {
      amendmentToViewConditions = latestCompletedAmendment;
    }
  }

  const mine: IMine = useAppSelector((state) => getMineById(state, id));
  const { isFeatureEnabled } = useFeatureFlag();
  const enablePermitConditionsTab = true || isFeatureEnabled(Feature.PERMIT_CONDITIONS_PAGE);
  const permitExtraction = useAppSelector(
    getPermitExtractionByGuid(latestAmendment?.permit_amendment_id)
  );

  const { is_generated_in_core } = latestAmendment ?? {};
  const isExtracted = !is_generated_in_core;
  const previousAmendmentIndex = permit?.permit_amendments?.findIndex(a => a.permit_amendment_id === latestAmendment?.permit_amendment_id) + 1 || -1;
  const previousAmendment = previousAmendmentIndex > 0 ? permit.permit_amendments[previousAmendmentIndex] : null;
  const userCanEditConditions = useAppSelector((state) =>
    userHasRole(state, USER_ROLES.role_edit_template_conditions)
  );
  const documents = latestAmendment?.related_documents ?? [];

  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);
  const history = useHistory();

  const statusTimerRef = useRef(null);
  const [pollForStatus, setPollForStatus] = useState(false);

  const hasConditions = latestAmendment?.conditions?.length > 0;
  const isReviewComplete = latestAmendment?.conditions?.every(
    (con) => con.permit_condition_status_code === PERMIT_CONDITION_STATUS_CODE.COM
  );

  const canStartExtraction =
    ((documents.length > 0 && !permitExtraction?.task_status) ||
      [PermitExtractionStatus.error, PermitExtractionStatus.not_started, PermitExtractionStatus.deleted].includes(
        permitExtraction?.task_status
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
  }, [permitExtraction?.task_status]);

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
    let conditionStatus: PresetStatusColorType = hasConditions ? "success" : "error";
    if (hasConditions && !isReviewComplete) {
      conditionStatus = "warning";
    }
    return <Badge status={conditionStatus} />;
  };

  const tabItems = [
    {
      key: tabs[0],
      label: "Permit Overview",
      children: !latestAmendment ? <Loading /> : <ViewPermitOverview latestAmendment={latestAmendment} />,
    },
    enablePermitConditionsTab && {
      key: tabs[1],
      label: <>{getConditionBadge()} Permit Conditions</>,
      children: (
        <PermitConditions
          isReviewComplete={isReviewComplete}
          isExtracted={isExtracted}
          latestAmendment={latestAmendment}
          currentAmendment={currentAmendment}
          previousAmendment={previousAmendment}
          canStartExtraction={canStartExtraction}
          userCanEdit={userCanEditConditions}
        />
      ),
    },
  ].filter(Boolean);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    const amendmentGuid = newActiveTab === tabs[1] ? amendmentToViewConditions?.permit_amendment_guid : latestAmendment?.permit_amendment_guid;

    return history.push(routes.VIEW_MINE_PERMIT_AMENDMENT.dynamicRoute(id, permitGuid, amendmentGuid, newActiveTab));
  };

  const onConditionsTab = tab === tabs[1];

  const handleSelectedDocumentExtraction = async (document: IPermitAmendmentDocument) => {
    dispatch(closeModal());
    await dispatch(
      initiatePermitExtraction({
        permit_amendment_id: latestAmendment?.permit_amendment_id,
        permit_amendment_document_guid: document.permit_amendment_document_guid,
      })
    );
  };

  const handleOpenFileSelectionModal = () => {
    dispatch(
      openModal({
        props: {
          title: `Extract Permit Conditions`,
          documents: documents,
          onSubmit: handleSelectedDocumentExtraction,
        },
        content: PermitConditionsSelectDocumentModal,
      })
    );
  };

  const handleInitiateExtraction = async () => {
    if (documents.length > 1) {
      handleOpenFileSelectionModal();
      return;
    }

    await dispatch(
      initiatePermitExtraction({
        permit_amendment_id: latestAmendment?.permit_amendment_id,
        permit_amendment_document_guid: documents[0].permit_amendment_document_guid,
      })
    );
  };

  const handleDeleteConditions = async () => {
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

  const showHeaderActions =
    !is_generated_in_core && enablePermitConditionsTab && headerActions.length > 0;

  const headerActionComponent = showHeaderActions ? (
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
