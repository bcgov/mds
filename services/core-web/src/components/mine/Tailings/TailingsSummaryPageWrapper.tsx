import React, { FC } from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import TailingsSummaryPage from "@common/components/tailings/TailingsSummaryPage";
import { renderConfig } from "@/components/common/config";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/buttons/LinkButton";
import Loading from "@/components/common/Loading";
import {
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_TAILINGS,
  MINE_TAILINGS_DETAILS,
} from "@/constants/routes";

interface TailingsSummaryPageWrapperProps {
  match: {
    params: {
      id: string;
      tailingsStorageFacilityGuid: string;
      tab: string;
    };
  };
  canEditTSF: boolean;
}

export const TailingsSummaryPageWrapper: FC<RouteComponentProps &
  TailingsSummaryPageWrapperProps> = (props) => {
  const { match, canEditTSF } = props;

  const tsfComponents = {
    LinkButton,
    ContactDetails,
    Loading,
  };

  const routes = {
    MINE_TAILINGS_DETAILS,
    EDIT_TAILINGS_STORAGE_FACILITY,
    MINE_DASHBOARD: MINE_TAILINGS,
  };

  return (
    <TailingsProvider
      components={tsfComponents}
      renderConfig={renderConfig}
      addContactModalConfig={modalConfig.ADD_PARTY_RELATIONSHIP}
      tsfFormName={FORM.ADD_STORAGE_FACILITY}
      tsfGuid={match.params.tailingsStorageFacilityGuid}
      showUpdateTimestamp
      routes={routes}
      eorHistoryColumns={["name", "status", "dates", "letters", "ministryAcknowledged"]}
      canAssignEor
      isCore
    >
      <TailingsSummaryPage
        form={FORM.ADD_STORAGE_FACILITY}
        mineGuid={match.params.id}
        tsfGuid={match.params.tailingsStorageFacilityGuid}
        tab={match.params.tab}
        canEditTSF={canEditTSF}
      />
    </TailingsProvider>
  );
};

export default withRouter(TailingsSummaryPageWrapper);
