import React, { FC, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { IMine, IPermit } from "@mds/common";
import ViewPermitOverview from "@/components/mine/Permit/ViewPermitOverview";
import ViewPermitConditions from "@/components/mine/Permit/PermitConditions";

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

const ViewPermit: FC = () => {
  const dispatch = useDispatch();

  const { id, permitGuid, tab } = useParams<{ id: string; permitGuid: string; tab: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const { isFeatureEnabled } = useFeatureFlag();
  const enablePermitConditionsTab = isFeatureEnabled(Feature.PERMIT_CONDITIONS_PAGE);

  const [activeTab, setActiveTab] = useState(tab ?? "overview");
  const history = useHistory();

  const latestAmendment = useMemo(() => {
    if (!permit) return undefined;
    return permit.permit_amendments[permit.permit_amendments.length - 1];
  }, [permit]);

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

  const canViewConditions = latestAmendment?.conditions?.length > 0;

  const getConditionBadge = () => {
    const conditionStatus: PresetStatusColorType = canViewConditions ? "success" : "error";
    return <Badge status={conditionStatus} />;
  };

  const tabItems = [
    {
      key: "overview",
      label: "Permit Overview",
      children: <ViewPermitOverview />,
    },
    enablePermitConditionsTab && {
      key: "conditions",
      label: <>{getConditionBadge()} Permit Conditions</>,
      children: <ViewPermitConditions latestAmendment={latestAmendment} />,
      disabled: !canViewConditions,
    },
  ].filter(Boolean);

  const handleTabChange = (newActiveTab: string) => {
    setActiveTab(newActiveTab);
    return history.push(routes.VIEW_MINE_PERMIT.dynamicRoute(id, permitGuid, newActiveTab));
  };

  const headerActions = [
    {
      key: "test",
      label: "Test",
      clickFunction: () => console.log("action not implemented", permit),
    },
  ];

  const headerActionComponent = <ActionMenuButton actions={headerActions} />;

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
