import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Divider } from "antd";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import NullScreen from "@/components/common/NullScreen";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const ViewAllConditionsModal = (props) => {
  return (
    <div>
      {props.conditions.length > 0 ? (
        <>
          {props.permitConditionCategoryOptions.map((conditionCategory) => {
            const conditions = props.conditions.filter(
              (condition) =>
                condition.condition_category_code === conditionCategory.condition_category_code
            );
            return (
              <div key={conditionCategory.condition_category_code}>
                <h4>{`${conditionCategory.step} ${conditionCategory.description}`}</h4>
                <Divider />
                {conditions?.length > 0 &&
                  conditions.map((condition) => (
                    <ConditionLayerOne condition={condition} isViewOnly />
                  ))}
              </div>
            );
          })}
        </>
      ) : (
        <NullScreen type="permit-conditions" />
      )}

      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={() => props.closeModal()}>
          Close
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  permitConditionTypeOptions: getPermitConditionTypeOptions(state),
});

ViewAllConditionsModal.propTypes = propTypes;

export default connect(mapStateToProps)(ViewAllConditionsModal);
