import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import { getPermitConditionCategoryOptions } from "@common/selectors/staticContentSelectors";
import {
  getPermitConditions,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import {
  fetchPermitConditions,
  deletePermitCondition,
  setEditingConditionFlag,
} from "@common/actionCreators/permitActionCreator";
import { maxBy, concat } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import Condition from "@/components/Forms/permits/conditions/Condition";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";

const { Panel } = Collapse;

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  deletePermitCondition: PropTypes.func.isRequired,
};

export class Conditions extends Component {
  constructor(props) {
    super(props);
    this.state = { submitting: false };
    this.fetchPermitConditions();
    props.setEditingConditionFlag(false);
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.draftPermitAmendment !== this.props.draftPermitAmendment) {
      this.fetchPermitConditions();
    }
  };

  fetchPermitConditions = () => {
    if (this.props.draftPermitAmendment) {
      this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
    }
  };

  handleDelete = (permitConditionGuid) => {
    this.setState({ submitting: true });
    this.props
      .deletePermitCondition(
        this.props.draftPermitAmendment.permit_amendment_guid,
        permitConditionGuid
      )
      .then(() => {
        this.setState({ submitting: false });
        this.props.closeModal();
        this.fetchPermitConditions();
      });
  };

  openDeleteConditionModal = (condition) => {
    this.props.openModal({
      props: {
        title: "Delete condition",
        handleDelete: this.handleDelete,
        closeModal: this.props.closeModal,
        submitting: this.state.submitting,
        condition,
      },
      width: "50vw",
      content: modalConfig.DELETE_CONDITION_MODAL,
    });
  };

  render = () => (
    <>
      <Collapse>
        {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
          const conditions = this.props.conditions.filter(
            (condition) =>
              condition.condition_category_code === conditionCategory.condition_category_code
          );
          return (
            <Panel
              header={`${conditionCategory.step} ${conditionCategory.description} (${
                conditions.reduce((a, e) => concat(a, e.sub_conditions), []).length
              } conditions)`}
              key={conditionCategory.condition_category_code}
              id={conditionCategory.condition_category_code}
            >
              {conditions.map((condition) => (
                <Condition
                  condition={condition}
                  handleSubmit={(values) => this.handleAddCondition(values)}
                  handleDelete={this.openDeleteConditionModal}
                />
              ))}
              <Divider />
              <AddCondition
                initialValues={{
                  condition_category_code: conditionCategory.condition_category_code,
                  condition_type_code: "SEC",
                  display_order:
                    conditions.length === 0
                      ? 1
                      : maxBy(conditions, "display_order").display_order + 1,
                  parent_permit_condition_id: null,
                  permit_amendment_id: this.props.draftPermitAmendment.permit_amendment_id,
                }}
              />
              {false && (
                <Button type="secondary" className="full-mobile btn--middle">
                  <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                  Restore Deleted Standard Conditions
                </Button>
              )}
            </Panel>
          );
        })}
      </Collapse>
    </>
  );
}

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  conditions: getPermitConditions(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchPermitConditions,
      setEditingConditionFlag,
      deletePermitCondition,
    },
    dispatch
  );

Conditions.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
