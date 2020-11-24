import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Collapse, Button } from "antd";
import { formatDateTime } from "@common/utils/helpers";
import { UndoOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@common/selectors/staticContentSelectors";
import {
  getPermitConditions,
  getDraftPermitAmendmentForNOW,
  getEditingConditionFlag,
} from "@common/selectors/permitSelectors";
import {
  fetchPermitConditions,
  deletePermitCondition,
  updatePermitCondition,
  setEditingConditionFlag,
} from "@common/actionCreators/permitActionCreator";
import { maxBy, concat } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import Condition from "@/components/Forms/permits/conditions/Condition";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { COLOR } from "@/constants/styles";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  editingConditionFlag: PropTypes.bool.isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  deletePermitCondition: PropTypes.func.isRequired,
  updatePermitCondition: PropTypes.func.isRequired,
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

  handleEdit = (values) =>
    this.props.updatePermitCondition(values.permit_condition_guid, values).then(() => {
      this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
      this.props.setEditingConditionFlag(false);
    });

  reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return this.props.updatePermitCondition(condition.permit_condition_guid, condition).then(() => {
      this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
    });
  };

  setConditionEditingFlag = (value) => {
    this.props.setEditingConditionFlag(value);
  };

  getLastUpdatedByConditionForEach = (acc, conditions) => {
    conditions.forEach((item) => {
      if (!acc) {
        acc = item;
      }

      if (item.sub_conditions && item.sub_conditions.length > 0) {
        acc = this.getLastUpdatedByConditionForEach(acc, item.sub_conditions);
      }

      acc = new Date(acc.update_timestamp) > new Date(item.update_timestamp) ? acc : item;
    });

    return acc;
  };

  render = () => {
    const mostRecentCondition = this.getLastUpdatedByConditionForEach(null, this.props.conditions);
    return (
      <>
        <div
          style={{
            display: "inline-block",
            backgroundColor: "#f4f0f0",
            padding: 16,
            borderRadius: 5,
            marginBottom: 20,
            minWidth: 345,
          }}
        >
          <div style={{ marginLeft: 24 }}>
            <p>
              <b>Updated at: </b>
              {mostRecentCondition && mostRecentCondition.update_timestamp
                ? formatDateTime(mostRecentCondition.update_timestamp)
                : "N/A"}
              <br />
              <b>Updated by: </b>
              {mostRecentCondition ? mostRecentCondition.update_user : "N/A"}
              <br />
            </p>
          </div>
        </div>

        <Collapse>
          {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
            const conditions = this.props.conditions.filter(
              (condition) =>
                condition.condition_category_code === conditionCategory.condition_category_code
            );
            return (
              <Collapse.Panel
                style={{ padding: "18px 16px", backgroundColor: COLOR.lightGrey }}
                header={`${conditionCategory.step} ${conditionCategory.description} (${
                  conditions.reduce((a, e) => concat(a, e.sub_conditions), []).length
                } conditions)`}
                key={conditionCategory.condition_category_code}
                id={conditionCategory.condition_category_code}
              >
                {conditions.map((condition) => (
                  <Condition
                    condition={condition}
                    reorderConditions={this.reorderConditions}
                    handleSubmit={this.handleEdit}
                    handleDelete={this.openDeleteConditionModal}
                    setConditionEditingFlag={this.setConditionEditingFlag}
                    editingConditionFlag={this.props.editingConditionFlag}
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
                    <UndoOutlined className="padding-small--right icon-sm" />
                    Restore Deleted Standard Conditions
                  </Button>
                )}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </>
    );
  };
}

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  permitConditionTypeOptions: getPermitConditionTypeOptions(state),
  conditions: getPermitConditions(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
  editingConditionFlag: getEditingConditionFlag(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchPermitConditions,
      setEditingConditionFlag,
      deletePermitCondition,
      updatePermitCondition,
    },
    dispatch
  );

Conditions.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
