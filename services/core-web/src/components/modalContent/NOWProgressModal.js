import React from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button } from "antd";
import Highlight from "react-highlighter";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import PreDraftPermitForm from "@/components/Forms/permits/PreDraftPermitForm";

const propTypes = {
  title: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  tabCode: PropTypes.string.isRequired,
  trigger: PropTypes.string.isRequired,
  handleProgress: PropTypes.func.isRequired,
  isAmendment: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {
  title: "",
};

export const NOWProgressModal = (props) => (
  <div>
    {props.trigger === "Start" && (
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
        {props.tabCode === "DFT" && (
          <>
            {props.isAmendment
              ? `You are now creating an amendment for a permit. Please select the permit that this amendment is for.`
              : `You are now creating a new permit. Please check the box below if this is an exploratory permit.`}
            <PreDraftPermitForm
              initialValues={{ is_exploration: false }}
              permits={props.permits}
              isAmendment={props.isAmendment}
            />
          </>
        )}
      </>
    )}
    {props.trigger === "Complete" && (
      <>
        <Alert
          message={`If you need to make changes or add documentation later, click 'Resume ${props.tab}'.`}
          type="info"
          showIcon
        />
        <br />
        <p>
          Are you sure you would like to complete the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process?
        </p>
        <br />
      </>
    )}
    {props.trigger === "Resume" && (
      <>
        <p>
          Are you sure you would like to resume the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process?
        </p>
        <br />
      </>
    )}
    <br />
    <br />
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
      <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
        <Button type="primary" onClick={() => props.handleProgress(props.tabCode, props.trigger)}>
          {props.title}
        </Button>
      </AuthorizationWrapper>
    </div>
  </div>
);

NOWProgressModal.propTypes = propTypes;
NOWProgressModal.defaultProps = defaultProps;
export default NOWProgressModal;
