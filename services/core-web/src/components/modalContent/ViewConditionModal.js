import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import Condition from "@/components/Forms/permits/conditions/Condition";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ViewConditionModal = (props) => {
  return (
    <div>
      {props.conditions?.length > 0 ? (
        props.conditions.map((condition) => <Condition condition={condition} isViewOnly />)
      ) : (
        <p>
          <NullScreen />
        </p>
      )}
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={() => props.closeModal()}>
          Close
        </Button>
      </div>
    </div>
  );
};

ViewConditionModal.propTypes = propTypes;

export default ViewConditionModal;
