import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button, Steps, Radio, Row, Col } from "antd";
import { SafetyCertificateOutlined, RocketOutlined } from "@ant-design/icons";
import { getFormValues, submit } from "redux-form";
import { isEmpty } from "lodash";
import { bindActionCreators } from "redux";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import {
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { createPermit, createPermitAmendment } from "@mds/common/redux/actionCreators/permitActionCreator";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import CustomPropTypes from "@/customPropTypes";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";
import { validateIfApplicationTypeCorrespondsToPermitNumber } from "@common/utils/Validate";

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
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
};

const defaultProps = {
  title: "",
  isNoticeOfWorkTypeDisabled: true,
};

export const StartDraftPermitModal = (props) => {
  const [currentStep, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerateThroughCore, setGenerateThroughCore] = useState(true);

  const onChange = (e) => setGenerateThroughCore(e.target.value);

  const handleCreatePermit = (isExploration) => {
    const payload = {
      permit_status_code: "D",
      is_exploration: isExploration,
      now_application_guid: props.noticeOfWork.now_application_guid,
      populate_with_conditions: isGenerateThroughCore,
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
        populate_with_conditions: isGenerateThroughCore,
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
    if (
      props.preDraftFormValues.type_of_application !== props.noticeOfWork.type_of_application ||
      props.preDraftFormValues.notice_of_work_type_code !==
        props.noticeOfWork.notice_of_work_type_code
    ) {
      const payload = {
        ...props.noticeOfWork,
        type_of_application: props.preDraftFormValues.type_of_application,
        notice_of_work_type_code: props.preDraftFormValues.notice_of_work_type_code,
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

      const isApplicationTypeMatchPermitNumber = validateIfApplicationTypeCorrespondsToPermitNumber(
        values.notice_of_work_type_code,
        props.permits.find((p) => p.permit_guid === values.permit_guid)
      );
      return (
        !values.type_of_application ||
        !values.permit_guid ||
        !values.permit_amendment_type_code ||
        isApplicationTypeMatchPermitNumber
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
      {!props.noticeOfWork.is_source_permit_generated_in_core &&
      props.noticeOfWork.application_type_code === "ADA" ? (
        <p className="center" />
      ) : (
        <p>
          Are you ready to begin <Highlight search={props.tab}>{props.tab}</Highlight>?
        </p>
      )}
      <br />
      {!props.noticeOfWork.is_source_permit_generated_in_core &&
        props.noticeOfWork.application_type_code === "ADA" && (
          <Radio.Group onChange={onChange} value={isGenerateThroughCore}>
            <Row gutter={16}>
              <Col span={12} className="border--right--layout">
                <Radio value> Write Permit in Core </Radio>
                <p className="p-light">
                  <br />
                  This will include the default conditions for the type of permit you are amending.
                  The Preamble will not include the files from the original authorization.
                  <br />
                  <br />
                  You need to:
                  <br />
                  1. Attach the files that made up the original approved work for the authorization.
                  <br />
                  2. Update the conditions to match what was authorized in the original, and update
                  them if required.
                  <br />
                  <br />
                  This is a longer process, however, the information will be saved as data and will
                  be used to populate future amendments.
                  <br />
                  <br />
                </p>
                <div className="center">
                  <SafetyCertificateOutlined
                    className={
                      !isGenerateThroughCore ? "icon-xxxl--lightgrey" : "icon-xxxl--violet"
                    }
                  />
                </div>
              </Col>
              <Col span={12}>
                <Radio value={false}> Upload Permit </Radio>
                <p className="p-light">
                  <br />
                  Upload a Permit Document that was generated outside of Core.
                  <br />
                  <br />
                  This is a quicker process, however, the conditions in the permit will not be saved
                  as data and cannot be used for reporting.
                  <br />
                  <br />
                </p>
                <div className="center">
                  <RocketOutlined
                    className={isGenerateThroughCore ? "icon-xxxl--lightgrey" : "icon-xxxl--violet"}
                  />
                </div>
              </Col>
            </Row>
            <br />
            <br />
          </Radio.Group>
        )}
    </>
  );

  const isAmendment = props.preDraftFormValues?.type_of_application !== "New Permit";
  const initialValues = {
    is_exploration: false,
    permit_amendment_type_code: props.permitType,
    type_of_application: props.noticeOfWork?.type_of_application,
    permit_guid: props.noticeOfWork.source_permit_guid || null,
    disabled: props.noticeOfWork.source_permit_guid,
    notice_of_work_type_code: props.noticeOfWork.notice_of_work_type_code,
  };

  const sourceAmendmentMessage = props.noticeOfWork.is_source_permit_generated_in_core
    ? `This is an amendment to an authorization that was written in Core. All available information, files and conditions have been carried forward from the authorization you are amending.`
    : `This is an amendment to an authorization that was not written in Core.`;
  const amendmentMessage = props.noticeOfWork.source_permit_guid
    ? sourceAmendmentMessage
    : `This is an Amendment to an existing permit, which must be selected before drafting its conditions. This cannot be changed once drafting has started.`;
  const steps = [
    {
      title: "Confirm Permit",
      content: (
        <>
          {props.preDraftFormValues?.type_of_application && (
            <Alert
              description={
                isAmendment
                  ? amendmentMessage
                  : `This is a New Permit. A new permit number will be generated once ready to issue. This cannot be changed once drafting has started.`
              }
              type="info"
              showIcon
            />
          )}
          <br />
          <PreDraftPermitForm
            initialValues={initialValues}
            permits={props.permits}
            isCoalOrMineral={props.isCoalOrMineral}
            isNoticeOfWorkTypeDisabled={props.isNoticeOfWorkTypeDisabled}
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
