import React from "react";
import { withRouter } from "react-router-dom";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import TailingsSummaryPage from "@common/components/tailings/TailingsSummaryPage";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/buttons/LinkButton";
import Loading from "@/components/common/Loading";
import { MINE_TAILINGS, EDIT_TAILINGS_STORAGE_FACILITY, MINE_TAILINGS_DETAILS } from "@/constants/routes";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
      tab: PropTypes.string,
    }),
  }).isRequired,
}

export const TailingsSummaryPageWrapper = (props) => {
  const { match } = props;

  const tsfComponents = {
    LinkButton,
    ContactDetails,
    Loading
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
      showUpdateTimestamp
      routes={routes}
      eorHistoryColumns={['name', 'status', 'dates', 'letters', 'ministryAcknowledged']}
      canAssignEor
      isCore
    >
      <TailingsSummaryPage
        form={FORM.ADD_STORAGE_FACILITY}
        mineGuid={match.params.id}
        tsfGuid={match.params.tailingsStorageFacilityGuid}
        tab={match.params.tab}  
      />
    </TailingsProvider>
  );
};

TailingsSummaryPageWrapper.propTypes = propTypes;

export default withRouter(TailingsSummaryPageWrapper);
