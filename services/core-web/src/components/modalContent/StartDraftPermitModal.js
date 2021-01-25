import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button, Steps } from "antd";
import { getFormValues, submit, getFormSyncErrors } from "redux-form";
import { flattenObject } from "@common/utils/helpers";
import { bindActionCreators } from "redux";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import ChangeApplicationTypeForm from "@/components/Forms/noticeOfWork/ChangeApplicationTypeForm";

const propTypes = {
  title: PropTypes.string,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  startDraftPermit: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
  isCoalOrMineral: PropTypes.bool.isRequired,
  formErrors: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  preDraftFormValues: PropTypes.objectOf(PropTypes.oneOfType[(PropTypes.string, PropTypes.bool)])
    .isRequired,
  applicationType: PropTypes.string.isRequired,
  permitType: PropTypes.string.isRequired,
  submit: PropTypes.func.isRequired,
};

const defaultProps = {
  title: "",
};

export const StartDraftPermitModal = (props) => {
  const [currentStep, setStep] = useState(0);
  const [permitFormData, setPermitFormData] = useState({});

  // eslint-disable-next-line consistent-return
  const handlePermit = () => {
    setPermitFormData(props.preDraftFormValues);
    const payload = {
      ...props.noticeOfWork,
      type_of_application: props.applicationType,
    };
    const errors = Object.keys(flattenObject(props.formErrors));
    props.submit(FORM.PRE_DRAFT_PERMIT);
    if (errors.length === 0) {
      return props
        .updateNoticeOfWorkApplication(
          payload,
          props.noticeOfWork.now_application_guid,
          "Successfully Updated the Application Type."
        )
        .then(() => {
          setStep(currentStep + 1);
          props.fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid);
        });
    }
  };

  const prev = () => setStep(currentStep - 1);

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
  const isAmendment = props.applicationType !== "New Permit";
  const steps = [
    {
      title: "Confirm Permit",
      content: (
        <>
          {props.applicationType && (
            <Alert
              description={
                isAmendment
                  ? `This is an Amendment to an existing permit, which must be selected before drafting it's conditions. This cannot be changed once drafting has started.`
                  : `This is a New Permit. A new permit number will be generated once ready to issue. This cannot be changed once drafting has started.`
              }
              type="info"
              showIcon
            />
          )}
          <br />
          <ChangeApplicationTypeForm initialValues={props.noticeOfWork} />
          <PreDraftPermitForm
            initialValues={{
              is_exploration: false,
              permit_amendment_type_code: props.permitType,
            }}
            permits={props.permits}
            applicationType={props.applicationType}
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
        >
          <Button className="full-mobile" type="secondary">
            Cancel
          </Button>
        </Popconfirm>
        {currentStep === 0 && (
          <Button className="full-mobile" type="primary" onClick={handlePermit}>
            Update Application and Proceed
          </Button>
        )}
        {currentStep === 1 && (
          <>
            <Button className="full-mobile" type="tertiary" onClick={prev}>
              Back
            </Button>
            <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
              <Button
                type="primary"
                onClick={() => props.startDraftPermit(isAmendment, permitFormData)}
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
  applicationType: (getFormValues(FORM.CHANGE_NOW_TYPE)(state) || {}).type_of_application,
  formErrors: getFormSyncErrors(FORM.PRE_DRAFT_PERMIT)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchImportedNoticeOfWorkApplication,
      updateNoticeOfWorkApplication,
      submit,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(StartDraftPermitModal);
