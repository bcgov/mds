import React, { FC } from "react";
import CreateInvitationForm from "@/components/Forms/verifiableCredentials/CreateInvitationForm";

interface CreateInvitationModalProps {
  closeModal: () => void;
  partyGuid: string;
  partyName: string;
  connectionState: string;
}

export const CreateInvitationModal: FC<CreateInvitationModalProps> = ({
  partyName = "",
  partyGuid = "",
  connectionState = "",
  closeModal,
}) => {
  return (
    <div>
      <CreateInvitationForm
        closeModal={closeModal}
        partyGuid={partyGuid}
        partyName={partyName}
        connectionState={connectionState}
      />
    </div>
  );
};

export default CreateInvitationModal;
