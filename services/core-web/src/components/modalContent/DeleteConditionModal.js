import React from "react";
import PropTypes from "prop-types";
import { Result, Button } from "antd";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";

const propTypes = {
  handleDelete: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  condition: PropTypes.objectOf(PropTypes.any).isRequired,
};

const label = {
  SEC: "section? All associated conditions and list items will be removed.",
  CON: "condition? All associated list items will be removed.",
  LIS: "list item?",
};

export const DeleteConditionModal = (props) => {
  return (
    <div>
      <Result
        status="warning"
        style={{ padding: "0px" }}
        title={`Are you sure you want to delete the following ${
          label[props.condition.condition_type_code]
        }`}
      />
      <br />
      <ConditionLayerOne condition={props.condition} isViewOnly />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Cancel
        </Button>
        <Button
          className="full-mobile"
          type="primary"
          htmlType="submit"
          onClick={() => props.handleDelete(props.condition.permit_condition_guid)}
          loading={props.submitting}
        >
          {props.title}
        </Button>
      </div>
    </div>
  );
};

DeleteConditionModal.propTypes = propTypes;

export default DeleteConditionModal;
