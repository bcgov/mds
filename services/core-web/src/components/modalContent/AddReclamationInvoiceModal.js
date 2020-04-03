import React from "react";
import PropTypes from "prop-types";
import ReclamationInvoiceForm from "@/components/Forms/Securities/ReclamationInvoiceForm";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  permitGuid: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  invoice: CustomPropTypes.invoice,
  edit: PropTypes.bool,
};

const defaultProps = {
  invoice: {},
  edit: false,
};

export const AddReclamationInvoiceModal = (props) => {
  const handleAddReclamationInvoice = (values) => {
    const newValues = props.edit ? { values, ...props.invoice } : values;
    props.edit
      ? props.onSubmit(values, props.invoice.reclamation_invoice_guid)
      : props.onSubmit(values, props.permitGuid);
  };

  return (
    <div>
      <ReclamationInvoiceForm
        onSubmit={handleAddReclamationInvoice}
        closeModal={props.closeModal}
        title={props.title}
        initialValues={props.invoice}
        invoice={props.invoice}
        mineGuid={props.mineGuid}
      />
    </div>
  );
};

AddReclamationInvoiceModal.propTypes = propTypes;
AddReclamationInvoiceModal.defaultProps = defaultProps;

export default AddReclamationInvoiceModal;
