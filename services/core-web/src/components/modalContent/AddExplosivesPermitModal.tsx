import React, { FC } from "react";
import ExplosivesPermitForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitForm";
import { IOption, IGroupedDropdownList } from "@mds/common";

interface ExplosivesPermitModalProps {
  title: string;
  initialValues: any;
  mineGuid: string;
  isApproved: boolean;
  documentTypeDropdownOptions: IOption[];
  isPermitTab: boolean;
  inspectors: IGroupedDropdownList[];
  closeModal: () => void;
  isProcessed: boolean;
}

export const AddExplosivesPermitModal: FC<ExplosivesPermitModalProps> = (props) => {
  return (
    <div>
      <ExplosivesPermitForm {...props} />
    </div>
  );
};

export default AddExplosivesPermitModal;
