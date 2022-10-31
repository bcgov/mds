import React from "react";

import TailingsProvider from "@common/components/tailings/TailingsProvider";
import ContactDetails from "@common/components/ContactDetails";
import { renderConfig } from "@/components/common/config";
import TailingsSummaryPage from "./TailingsSummaryPage";
import { modalConfig } from "@/components/modalContent/config";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/buttons/LinkButton";

export const TailingsSummaryPageWrapper = () => {
  const tsfComponents = {
    LinkButton,
    ContactDetails,
  };

  return (
    <TailingsProvider
      components={tsfComponents}
      renderConfig={renderConfig}
      addContactModalConfig={modalConfig.ADD_PARTY_RELATIONSHIP}
      tsfFormName={FORM.ADD_STORAGE_FACILITY}
    >
      <TailingsSummaryPage />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
