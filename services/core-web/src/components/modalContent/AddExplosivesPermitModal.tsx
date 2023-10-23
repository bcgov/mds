import React, { FC } from "react";
import { IOption, IGroupedDropdownList } from "@mds/common";
import ExplosivesPermitForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitForm";
import { Feature, isFeatureEnabled } from "@mds/common";
import ExplosivesPermitFormNew from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFormNew";

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

export const AddExplosivesPermitModal: FC<ExplosivesPermitModalProps> = (props) => (
  <div>
    {isFeatureEnabled(Feature.ESUP_PERMIT_AMENDMENT) ? (
      <ExplosivesPermitFormNew {...props} />
    ) : (
      <ExplosivesPermitForm {...props} />
    )}
  </div>
);

export default AddExplosivesPermitModal;
