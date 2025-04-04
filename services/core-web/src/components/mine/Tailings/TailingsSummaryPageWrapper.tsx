import React, { FC } from "react";
import { TailingsProvider } from "@mds/common/components/tailings/TailingsContext";
import AddPartyRelationshipModal from "@/components/modalContent/AddPartyRelationshipModal";
import TailingsSummaryPage from "@mds/common/components/tailings/TailingsSummaryPage";


export const TailingsSummaryPageWrapper: FC = () => {
  return (
    <TailingsProvider
      value={{ addContactModalConfig: AddPartyRelationshipModal }}
    >
      <TailingsSummaryPage />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
