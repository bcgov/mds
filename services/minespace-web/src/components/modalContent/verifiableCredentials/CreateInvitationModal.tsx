import React, { FC } from "react";
import CreateInvitationForm from "@/components/Forms/verifiableCredentials/CreateInvitationForm";

interface CreateInvitationModalProps {
  partyGuid: string;
  partyName: string;
  connectionState: string;
}

export const CreateInvitationModal: FC<CreateInvitationModalProps> = ({
  partyName = "",
  partyGuid = "",
  connectionState = "",
}) => {
  return (
    <div>
      <CreateInvitationForm
        partyGuid={partyGuid}
        partyName={partyName}
        connectionState={connectionState}
      />
    </div>
  );
};

export default CreateInvitationModal;
