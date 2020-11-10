/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Alert, Popconfirm, Button } from "antd";
import Highlight from "react-highlighter";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  closeModal: PropTypes.func.isRequired,
  tab: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

export const NOWProgressModal = (props) => (
  <div>
    {props.trigger === "Start" && (
      <>
        <p className="p-light">
          Starting <Highlight search={props.tab}>{props.tab}</Highlight> allows you to begin the{" "}
          <Highlight search={props.tab}>{props.tab}</Highlight> process.
        </p>
        <br />
        <p className="p-light">
          While in progress, You can make any necessary changes to this section of the application.
        </p>
        <br />
        <p className="p-light">
          Click "Complete {props.tab}" when you are finished. If you need to make any changes later,
          click "Resume {props.tab}".
        </p>
        <br />
        <p className="p-light">
          Are you ready to begin <Highlight search={props.tab}>{props.tab}</Highlight>?
        </p>
        <br />
      </>
    )}
    {props.trigger === "Complete" && (
      <Alert
        message="Do not Click on COMPLETE if you are waiting to receive additional documentation."
        type="warning"
        showIcon
      />
    )}
    <div className="right center-mobile">
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
