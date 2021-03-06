import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button, Steps } from "antd";
import { getFormValues, submit } from "redux-form";
import { isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { createPermit, createPermitAmendment } from "@common/actionCreators/permitActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import { getPermits } from "@common/selectors/permitSelectors";
import CustomPropTypes from "@/customPropTypes";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";

const propTypes = {
  title: PropTypes.string,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  preDraftFormValues: PropTypes.objectOf(PropTypes.oneOfType[(PropTypes.string, PropTypes.bool)])
    .isRequired,
  permitType: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
  handleDraftPermit: PropTypes.func.isRequired,
  createPermit: PropTypes.func.isRequired,
  createPermitAmendment: PropTypes.func.isRequired,
  startOrResumeProgress: PropTypes.func.isRequired,
};

const defaultProps = {
  title: "",
};

export const StartDraftPermitModal = (props) => {
  const [currentStep, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePermit = (isExploration) => {
    const payload = {
      permit_status_code: "D",
      is_exploration: isExploration,
      now_application_guid: props.noticeOfWork.now_application_guid,
    };
    return props
      .createPermit(props.noticeOfWork.mine_guid, payload)
      .then(() => {
        props.startOrResumeProgress("DFT", "Start");
        props.handleDraftPermit();
        props.submit(FORM.PRE_DRAFT_PERMIT);
        props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
      })
      .finally(() => setIsSubmitting(false));
  };

  const startDraftPermit = (isAmendment, permitPayload) => {
    if (isAmendment) {
      const payload = {
        permit_amendment_status_code: "DFT",
        now_application_guid: props.noticeOfWork.now_application_guid,
        permit_amendment_type_code: permitPayload.permit_amendment_type_code,
      };
      return props
        .createPermitAmendment(props.noticeOfWork.mine_guid, permitPayload.permit_guid, payload)
        .then(() => {
          props.handleDraftPermit();
          props.startOrResumeProgress("DFT", "Start");
          // submitting to clear the form after success
          props.submit(FORM.PRE_DRAFT_PERMIT);
        })
        .finally(() => setIsSubmitting(false));
    }
    const isExploration = permitPayload.is_exploration ?? false;
    return handleCreatePermit(isExploration);
  };

  const handleSubmit = (isAmendment) => {
    setIsSubmitting(true);
    if (props.preDraftFormValues.type_of_application !== props.noticeOfWork.type_of_application) {
      const payload = {
        ...props.noticeOfWork,
        type_of_application: props.preDraftFormValues.type_of_application,
      };
      return props
        .updateNoticeOfWorkApplication(
          payload,
          props.noticeOfWork.now_application_guid,
          "Successfully Updated the Application Type."
        )
        .then(() => startDraftPermit(isAmendment, props.preDraftFormValues))
        .catch(() => setIsSubmitting(false));
    }
    return startDraftPermit(isAmendment, props.preDraftFormValues);
  };

  // eslint-disable-next-line import/prefer-default-export
  const invalidUpdateStatusPayload = (values) => {
    if (!isEmpty(values)) {
      if (values.type_of_application === "New Permit") {
        return (
          !values.type_of_application ||
          !values.permit_amendment_type_code ||
          values.is_exploration === null
        );
      }
      return (
        !values.type_of_application || !values.permit_guid || !values.permit_amendment_type_code
      );
    }
    return true;
  };

  const prev = () => setStep(currentStep - 1);
  const next = () => setStep(currentStep + 1);

  const renderDisclaimer = () => (
    <>
      <p>
        Starting <Highlight search={props.tab}>{props.tab}</Highlight> allows you to begin the{" "}
        <Highlight search={props.tab}>{props.tab}</Highlight> process.
      </p>
      <br />
      <p>
        While in progress, You can make any necessary changes to this section of the application.
      </p>
      <br />
      <p>
        Click &quot;Complete {props.tab}&quot; when you are finished. If you need to make any
        changes later, click &quot;Resume {props.tab}&quot;.
      </p>
      <br />
      <p>
        Are you ready to begin <Highlight search={props.tab}>{props.tab}</Highlight>?
      </p>
      <br />
    </>
  );

  const isAmendment = props.preDraftFormValues?.type_of_application !== "New Permit";
  const steps = [
    {
      title: "Confirm Permit",
      content: (
        <>
          {props.preDraftFormValues?.type_of_application && (
            <Alert
              description={
                isAmendment
                  ? `This is an Amendment to an existing permit, which must be selected before drafting its conditions. This cannot be changed once drafting has started.`
                  : `This is a New Permit. A new permit number will be generated once ready to issue. This cannot be changed once drafting has started.`
              }
              type="info"
              showIcon
            />
          )}
          <br />
          <PreDraftPermitForm
            initialValues={{
              is_exploration: false,
              permit_amendment_type_code: props.permitType,
              type_of_application: props.noticeOfWork?.type_of_application,
              permit_guid: null,
            }}
            permits={props.permits}
            isCoalOrMineral={props.isCoalOrMineral}
          />
        </>
      ),
    },
    {
      title: "Start Draft",
      content: renderDisclaimer(),
    },
  ];

  return (
    <div>
      <Steps current={currentStep}>
        {steps.map((step) => (
          <Steps.Step key={step.title} title={step.title} />
        ))}
      </Steps>
      <br />
      <div>{steps[currentStep].content}</div>
      <div className="right center-mobile bottom">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={() => props.closeModal()}
          okText="Yes"
          cancelText="No"
          disabled={isSubmitting}
        >
          <Button className="full-mobile" type="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </Popconfirm>
        {currentStep === 0 && (
          <Button
            className="full-mobile"
            type="primary"
            onClick={next}
            disabled={invalidUpdateStatusPayload(props.preDraftFormValues)}
          >
            Proceed
          </Button>
        )}
        {currentStep === 1 && (
          <>
            <Button className="full-mobile" type="tertiary" onClick={prev} disabled={isSubmitting}>
              Back
            </Button>
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Button
                type="primary"
                onClick={() => handleSubmit(isAmendment)}
                loading={isSubmitting}
              >
                {props.title}
              </Button>
            </AuthorizationWrapper>
          </>
        )}
      </div>
    </div>
  );
};

StartDraftPermitModal.propTypes = propTypes;
StartDraftPermitModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  preDraftFormValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      updateNoticeOfWorkApplication,
      submit,
      createPermit,
      createPermitAmendment,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(StartDraftPermitModal);
