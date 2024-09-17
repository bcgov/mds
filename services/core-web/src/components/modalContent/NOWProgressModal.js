import React, { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button } from "antd";
import Highlight from "react-highlighter";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import * as FORM from "@/constants/forms";

const propTypes = {
  title: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
  tabCode: PropTypes.string.isRequired,
  trigger: PropTypes.string.isRequired,
  handleProgress: PropTypes.func.isRequired,
};

const defaultProps = {
  title: "",
};

export const NOWProgressModal = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleProgress = (tabCode, trigger) => {
    setIsSubmitting(true);
    props.handleProgress(tabCode, trigger).finally(() => setIsSubmitting(false));
  };
  return (
    <div>
      {props.trigger === "Start" && (
        <>
          <p>
            Starting <Highlight search={props.tab}>{props.tab}</Highlight> allows you to begin the{" "}
            <Highlight search={props.tab}>{props.tab}</Highlight> process.
          </p>
          <br />
          <p>
            While in progress, You can make any necessary changes to this section of the
            application.
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
      )}
      {props.trigger === "Complete" && (
        <>
          <Alert
            description={`If you need to make changes or add documentation later, click 'Resume ${props.tab}'.`}
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
          disabled={isSubmitting}
        >
          <Button className="full-mobile" type="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
        </Popconfirm>
        <AuthorizationWrapper permission={Permission.EDIT_PERMITS}>
          <Button
            type="primary"
            onClick={() => handleProgress(props.tabCode, props.trigger)}
            loading={isSubmitting}
          >
            {props.title}
          </Button>
        </AuthorizationWrapper>
      </div>
    </div>
  );
};

NOWProgressModal.propTypes = propTypes;
NOWProgressModal.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  preDraftFormValues: getFormValues(FORM.PRE_DRAFT_PERMIT)(state),
});

export default connect(mapStateToProps, null)(NOWProgressModal);
