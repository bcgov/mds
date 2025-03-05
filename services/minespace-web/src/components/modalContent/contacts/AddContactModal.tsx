import React, { FC } from "react";
import AddContactForm, { AddContactFormProps } from "@/components/Forms/contacts/AddContactForm";

export const AddContactModal: FC<AddContactFormProps> = (props) => {
  return <AddContactForm {...props} />;
};

export default AddContactModal;
