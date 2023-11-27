import React, { FC } from "react";
import ExplosivesPermitDecisionForm from "@/components/Forms/ExplosivesPermit/ExplosivesPermitDecisionForm";
import { IExplosivesPermitDocumentType, IParty } from "@mds/common";

interface ExplosivesPermitApplicationDecisionModalProps {
  initialValues: any;
  documentType: IExplosivesPermitDocumentType;
  inspectors: IParty[];
  onSubmit: any;
  previewDocument: any;
  closeModal: any;
}

export const ExplosivesPermitApplicationDecisionModal: FC<ExplosivesPermitApplicationDecisionModalProps> = ({
  initialValues,
  documentType,
  inspectors,
  onSubmit,
  previewDocument,
  closeModal,
}) => (
  <ExplosivesPermitDecisionForm
    initialValues={initialValues}
    documentType={documentType}
    inspectors={inspectors}
    onSubmit={onSubmit}
    previewDocument={previewDocument}
    closeModal={closeModal}
  />
);

export default ExplosivesPermitApplicationDecisionModal;
