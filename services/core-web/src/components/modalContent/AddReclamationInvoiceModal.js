import React from "react";
import PropTypes from "prop-types";
import { Alert } from "antd";
import { connect } from "react-redux";
import { formatMoney } from "@common/utils/helpers";
import { getFormValues } from "redux-form";
import * as FORM from "@/constants/forms";
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
  balance: PropTypes.string,
  formValues: CustomPropTypes.invoice.isRequired,
};

const defaultProps = {
  invoice: {},
  edit: false,
  balance: "",
};

export const AddReclamationInvoiceModal = (props) => {
  const handleAddReclamationInvoice = (values) =>
    props.edit
      ? props.onSubmit(values, props.invoice.reclamation_invoice_guid)
      : props.onSubmit(values, props.permitGuid);

  const newBalance = props.formValues.amount
    ? props.balance - props.formValues.amount
    : props.balance;
  const isValueDiff = Math.ceil(props.formValues.amount) !== Math.ceil(props.invoice.amount);
  const updatedBalance =
    props.edit && isValueDiff
      ? props.balance - (props.formValues.amount - props.invoice.amount)
      : props.balance;
  const showErrors = props.balance < 0 || newBalance < 0;
  return (
    <div>
      {showErrors && (
        <div className="error center">
          <Alert
            message={
              props.edit
                ? `Total Spent exceeds Total Confiscated. Current Balance: ${formatMoney(
                    props.balance
                  )}, Balance including the updated invoice amount: ${formatMoney(updatedBalance)}`
                : `Total Spent exceeds Total Confiscated. Current Balance: ${formatMoney(
                    props.balance
                  )}, Balance including new Invoice Amount: ${formatMoney(newBalance)}`
            }
            type="warning"
            showIcon
          />
          <br />
        </div>
      )}
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

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADD_RECLAMATION_INVOICE)(state) || {},
});

export default connect(mapStateToProps)(AddReclamationInvoiceModal);
