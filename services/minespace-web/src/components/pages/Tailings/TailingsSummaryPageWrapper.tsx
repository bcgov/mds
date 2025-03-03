import React, { FC } from "react";
import { TailingsProvider } from "@mds/common/components/tailings/TailingsContext";
import AddContactModal from "@/components/modalContent/contacts/AddContactModal";
import TailingsSummaryPage from "@mds/common/components/tailings/TailingsSummaryPage";

export const TailingsSummaryPageWrapper: FC = () => {
  return (
    <TailingsProvider value={{ addContactModalConfig: AddContactModal }}>
      <TailingsSummaryPage />
    </TailingsProvider>
  );
};

export default TailingsSummaryPageWrapper;
