import React from "react";
import PropTypes from "prop-types";
import { Field, isSubmitting } from "redux-form";
import { formatDate, formatMoney } from "@common/utils/helpers";
import { Button, Col, Row, Alert } from "antd";
import { maxLength } from "@mds/common/redux/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { useSelector } from "react-redux";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  prev: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftAmendment: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  draftAmendment: {},
};

export const RejectApplicationForm = (props) => {
  const submitting = useSelector(isSubmitting(FORM.REJECT_APPLICATION));
  return (
    <FormWrapper
      name={FORM.REJECT_APPLICATION}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      isModal
      onSubmit={props.onSubmit}>
      {props.draftAmendment?.security_received_date && props.draftAmendment?.liability_adjustment && (
        <Alert
          message="Return Reclamation Securities"
          description={`A Security adjustment of ${formatMoney(
            props.draftAmendment.liability_adjustment
          )} was received on ${formatDate(
            props.noticeOfWork.security_received_date
          )} for this application which needs to be returned to the applicant or moved to a new application by the applicant. Update this information before rejecting.`}
          type="error"
          showIcon
          style={{ textAlign: "left" }}
        />
      )}
      <br />
      <Row>
        <Col span={24}>
          <Field
            id="status_reason"
            name="status_reason"
            label={
              (props.type === "REJ" && "Reason for Rejection") ||
              (props.type === "WDN" && "Reason for Withdrawal") ||
              ""
            }
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[maxLength(4000)]}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <Button
          className="full-mobile"
          type="tertiary"
          onClick={props.prev}
          disabled={submitting}
        >
          Back
        </Button>
        <RenderSubmitButton buttonText={props.title} disableOnClean={false} />
      </div>
    </FormWrapper>
  )
};

RejectApplicationForm.propTypes = propTypes;
RejectApplicationForm.defaultProps = defaultProps;

export default RejectApplicationForm;
