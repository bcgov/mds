import React from "react";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import TailingsSummaryPage from "@common/components/tailings/TailingsSummaryPage";
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

export const TailingsSummaryPageWrapper = () => {
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
      canAssignEor
      routes={routes}
      eorHistoryColumns={["name", "status", "dates", "letters"]}
    >
      <TailingsSummaryPage form={FORM.ADD_TAILINGS_STORAGE_FACILITY} />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
