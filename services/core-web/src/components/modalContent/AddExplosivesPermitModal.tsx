import React, { FC } from "react";
import { IOption, IGroupedDropdownList, IExplosivesPermitDocument } from "@mds/common/interfaces";
import ExplosivesPermitFormNew from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFormNew";

interface ExplosivesPermitModalProps {
  title: string;
  initialValues: any;
  documents: IExplosivesPermitDocument[];
  mineGuid: string;
  isApproved: boolean;
  documentTypeDropdownOptions: IOption[];
  isPermitTab: boolean;
  inspectors: IGroupedDropdownList[];
  isProcessed: boolean;
  isAmendment: boolean;
  onSubmit: (values) => void | Promise<void>;
}

export const AddExplosivesPermitModal: FC<ExplosivesPermitModalProps> = (props) => (
  <div>
    <ExplosivesPermitFormNew {...props} />
  </div>
);

export default AddExplosivesPermitModal;
