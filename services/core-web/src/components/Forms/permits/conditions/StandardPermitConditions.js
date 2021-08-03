/* eslint-disable */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Collapse, Button } from "antd";
import { flattenObject } from "@common/utils/helpers";
import { ReadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@common/selectors/staticContentSelectors";
import {
  getStandardPermitConditions,
  getEditingConditionFlag,
} from "@common/selectors/permitSelectors";
import {
  setEditingConditionFlag,
  updateStandardPermitCondition,
  deleteStandardPermitCondition,
  createStandardPermitCondition,
  fetchStandardPermitConditions,
} from "@common/actionCreators/permitActionCreator";
import { maxBy } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import { COLOR } from "@/constants/styles";
import LoadingWrapper from "@/components/common/wrappers/LoadingWrapper";

const propTypes = {
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  editingConditionFlag: PropTypes.bool.isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  deletePermitCondition: PropTypes.func.isRequired,
  updatePermitCondition: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

export class StandardPermitConditions extends Component {
  constructor(props) {
    super(props);
    this.state = { submitting: false, isLoaded: false };
    this.fetchStandardPermitConditions();
    props.setEditingConditionFlag(false);
  }

  componentDidMount() {
    this.fetchStandardPermitConditions();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.type && nextProps.type !== this.props.type) {
      this.setState({ isLoaded: false });
      this.fetchStandardPermitConditions();
    }
  }

  fetchStandardPermitConditions = () => {
    this.props.fetchStandardPermitConditions(this.props.type).then(() => {
      console.log("FETCHED");
      console.log(this.props.conditions);
      this.setState({ isLoaded: true });
    });
  };

  handleDelete = (permitConditionGuid) => {
    this.setState({ submitting: true });
    this.props.deleteStandardPermitCondition(permitConditionGuid).then(() => {
      this.setState({ submitting: false });
      this.props.closeModal();
      this.fetchStandardPermitConditions();
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

  openViewConditionModal = (event, conditions, conditionCategory) => {
    event.preventDefault();
    return this.props.openModal({
      props: {
        title: conditionCategory,
        closeModal: this.props.closeModal,
        conditions,
      },
      width: "50vw",
      isViewOnly: true,
      content: modalConfig.VIEW_CONDITION_MODAL,
    });
  };

  handleEdit = (values) => {
    return this.props
      .updateStandardPermitCondition(values.permit_condition_guid, values)
      .then(() => {
        this.fetchStandardPermitConditions();
        this.props.setEditingConditionFlag(false);
      });
  };

  reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return this.props
      .updateStandardPermitCondition(condition.permit_condition_guid, condition)
      .then(() => {
        this.fetchStandardPermitConditions();
      });
  };

  setConditionEditingFlag = (value) => {
    this.props.setEditingConditionFlag(value);
  };

  render = () => {
    console.log("this.props.conditions", this.props.conditions);
    console.log(this.state.isLoaded);
    return (
      <>
        {this.state.isLoaded && (
          <LoadingWrapper condition={this.state.isLoaded}>
            <Collapse>
              {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
                const conditions = this.props.conditions.filter(
                  (condition) =>
                    condition.condition_category_code === conditionCategory.condition_category_code
                );

                console.log("conditions", conditions);
                return (
                  <Collapse.Panel
                    style={{ padding: "18px 16px", backgroundColor: COLOR.lightGrey }}
                    header={
                      <span>
                        {`${conditionCategory.step} ${conditionCategory.description} (${
                          Object.values(flattenObject({ conditions })).filter(
                            (value) => value === "CON"
                          ).length
                        } conditions)`}
                        <span onClick={(event) => event.stopPropagation()}>
                          <Button
                            ghost
                            onClick={(event) =>
                              this.openViewConditionModal(
                                event,
                                this.props.conditions.filter(
                                  (condition) =>
                                    condition.condition_category_code ===
                                    conditionCategory.condition_category_code
                                ),
                                conditionCategory.description
                              )
                            }
                          >
                            <ReadOutlined className="padding-sm--right icon-sm violet" />
                          </Button>
                        </span>
                      </span>
                    }
                    key={conditionCategory.condition_category_code}
                    id={conditionCategory.condition_category_code}
                  >
                    {conditions.map((condition) => (
                      <ConditionLayerOne
                        isAdminControl
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
                        permit_amendment_id: null,
                        parent_condition_type_code: "SEC",
                        sibling_condition_type_code:
                          conditions.length === 0 ? null : conditions[0].condition_type_code,
                      }}
                      layer={0}
                    />
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </LoadingWrapper>
        )}
      </>
    );
  };
}

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  permitConditionTypeOptions: getPermitConditionTypeOptions(state),
  conditions: getStandardPermitConditions(state),
  editingConditionFlag: getEditingConditionFlag(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      setEditingConditionFlag,
      updateStandardPermitCondition,
      deleteStandardPermitCondition,
      createStandardPermitCondition,
      fetchStandardPermitConditions,
    },
    dispatch
  );

StandardPermitConditions.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(StandardPermitConditions);
