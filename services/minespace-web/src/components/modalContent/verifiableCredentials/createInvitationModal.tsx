import React, { FC } from "react";
import CreateInvitationForm from "@/components/Forms/verifiableCredentials/CreateInvitationForm";

interface CreateInvitationModalProps {
  closeModal: () => void;
  partyGuid: string;
  partyName: string;
}

export const CreateInvitationModal: FC<CreateInvitationModalProps> = ({
  partyName = "",
  partyGuid = "",
  closeModal,
}) => {
  return (
    <div>
      <CreateInvitationForm closeModal={closeModal} partyGuid={partyGuid} partyName={partyName} />
    </div>
  );
};

export default CreateInvitationModal;
