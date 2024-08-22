import React, { FC, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getLatestAmendmentByPermitGuid,
  getPermitByGuid,
} from "@mds/common/redux/selectors/permitSelectors";
import { IMine, IPermit, IPermitAmendment } from "@mds/common";
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
} from "@mds/common/redux/slices/permitServiceSlice";

const tabs = ["overview", "conditions"];

const ViewPermit: FC = () => {
  const dispatch = useDispatch();

  const { id, permitGuid, tab } = useParams<{ id: string; permitGuid: string; tab: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const latestAmendment: IPermitAmendment = useSelector(getLatestAmendmentByPermitGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const { isFeatureEnabled } = useFeatureFlag();
  const enablePermitConditionsTab = isFeatureEnabled(Feature.PERMIT_CONDITIONS_PAGE);
  const permitExtraction = useSelector(getPermitExtractionByGuid(permitGuid));

  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);
  const history = useHistory();

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
    console.log("extraction updated:", permitExtraction);
  }, [permitExtraction]);

  const canViewConditions = latestAmendment?.conditions?.length > 0;

  const getConditionBadge = () => {
    const conditionStatus: PresetStatusColorType = canViewConditions ? "success" : "error";
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
      children: <PermitConditions latestAmendment={latestAmendment} />,
      disabled: !canViewConditions,
    },
  ].filter(Boolean);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    return history.push(routes.VIEW_MINE_PERMIT.dynamicRoute(id, permitGuid, newActiveTab));
  };

  const canStartExtraction =
    !permitExtraction?.status || permitExtraction.status === PermitExtractionStatus.error;
  const onConditionsTab = tab === tabs[1];

  const headerActions = [
    onConditionsTab &&
      canStartExtraction && {
        key: "extract",
        label: "Extract Permit Conditions",
        clickFunction: () => dispatch(initiatePermitExtraction({ permit_guid: permitGuid })),
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
