import React from "react";
import PropTypes from "prop-types";
import { Result, Button } from "antd";

const propTypes = {
  handleDelete: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  condition: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const DeleteDraftPermitModal = (props) => {
  return (
    <div>
      <Result
        status="warning"
        style={{ padding: "0px" }}
        title={`You're about to delete this draft permit and all its associated data.
        `}
        subTitle="Are you sure you want to continue?"
      />
      <br />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Cancel
        </Button>
        <Button
          className="full-mobile"
          type="danger"
          htmlType="submit"
          onClick={() => props.handleDelete()}
          loading={props.submitting}
        >
          {props.title}
        </Button>
      </div>
    </div>
  );
};

DeleteDraftPermitModal.propTypes = propTypes;

export default DeleteDraftPermitModal;
