import React from "react";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import TailingsSummaryPage from "@common/components/tailings/TailingsSummaryPage";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import LinkButton from "@/components/common/LinkButton";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import {
  ADD_TAILINGS_STORAGE_FACILITY,
  EDIT_TAILINGS_STORAGE_FACILITY,
  MINE_DASHBOARD,
} from "@/constants/routes";

const propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      mineGuid: PropTypes.string,
      tailingsStorageFacilityGuid: PropTypes.string,
      tab: PropTypes.string,
    }),
  }).isRequired,
};

export const TailingsSummaryPageWrapper = (props) => {
  const { match } = props;
  const tsfComponents = {
    LinkButton,
    ContactDetails,
    Loading,
  };

  const routes = {
    ADD_TAILINGS_STORAGE_FACILITY,
    EDIT_TAILINGS_STORAGE_FACILITY,
    MINE_DASHBOARD,
  };

  return (
    <TailingsProvider
      components={tsfComponents}
      renderConfig={renderConfig}
      addContactModalConfig={modalConfig.ADD_CONTACT}
      tsfFormName={FORM.ADD_TAILINGS_STORAGE_FACILITY}
      tsfGuid={match.params.tailingsStorageFacilityGuid}
      canAssignEor
      routes={routes}
      eorHistoryColumns={["name", "status", "dates", "letters"]}
    >
      <TailingsSummaryPage
        form={FORM.ADD_TAILINGS_STORAGE_FACILITY}
        mineGuid={match.params.mineGuid}
        tsfGuid={match.params.tailingsStorageFacilityGuid}
        tab={match.params.tab}
      />
    </TailingsProvider>
  );
};

TailingsSummaryPageWrapper.propTypes = propTypes;

export default TailingsSummaryPageWrapper;
