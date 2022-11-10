import React from "react";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import { renderConfig } from "@/components/common/config";
import TailingsSummaryPage from "./TailingsSummaryPage";
import LinkButton from "@/components/common/LinkButton";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";

export const TailingsSummaryPageWrapper = () => {
  const tsfComponents = {
    LinkButton,
    ContactDetails,
  };

  return (
    <TailingsProvider
      components={tsfComponents}
      renderConfig={renderConfig}
      addContactModalConfig={modalConfig.ADD_CONTACT}
      tsfFormName={FORM.ADD_TAILINGS_STORAGE_FACILITY}
      canAssignEor
      eorHistoryColumns={["name", "status", "dates", "letters"]}
    >
      <TailingsSummaryPage />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
