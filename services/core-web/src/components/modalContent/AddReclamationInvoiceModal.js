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
  const newBalance = props.formValues.amount ? props.balance - props.formValues.amount : 0;
  const isNewBalanceNegative = newBalance < 0;
  const showErrors = props.balance < 0 || newBalance < 0;
  return (
    <div>
      {showErrors && (
        <div className="error center">
          <Alert
            message={
              isNewBalanceNegative
                ? `Total Spent exceeds Total Confiscated. Balance including the current invoice amount: ${formatMoney(
                    newBalance
                  )}`
                : `Total Spent exceeds Total Confiscated. Balance: ${formatMoney(props.balance)}`
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
