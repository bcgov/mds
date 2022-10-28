import React from "react";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import { renderConfig } from "@/components/common/config";
import TailingsSummaryPage from "./TailingsSummaryPage";
import LinkButton from "@/components/common/LinkButton";
import ContactDetails from "@/components/common/ContactDetails";
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
    >
      <TailingsSummaryPage />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
