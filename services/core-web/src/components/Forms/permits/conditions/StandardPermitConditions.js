import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Collapse, Button } from "antd";
import { withRouter } from "react-router-dom";
import { flattenObject } from "@common/utils/helpers";
import { ReadOutlined } from "@ant-design/icons";
import VariableConditionMenu from "@/components/Forms/permits/conditions/VariableConditionMenu";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getStandardPermitConditions,
  getEditingConditionFlag,
} from "@mds/common/redux/selectors/permitSelectors";
import {
  setEditingConditionFlag,
  updateStandardPermitCondition,
  deleteStandardPermitCondition,
  fetchStandardPermitConditions,
} from "@mds/common/redux/actionCreators/permitActionCreator";
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
  fetchStandardPermitConditions: PropTypes.func.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  deleteStandardPermitCondition: PropTypes.func.isRequired,
  updateStandardPermitCondition: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: {
      type: PropTypes.string,
    },
  }).isRequired,
};

const typeFromURL = {
  "sand-and-gravel": "SAG",
  quarry: "QCA",
  exploration: "MIN",
  placer: "PLA",
};
export class StandardPermitConditions extends Component {
  constructor(props) {
    super(props);
    this.state = { submitting: false, isLoaded: false, type: "SAG" };
    props.setEditingConditionFlag(false);
  }

  componentDidMount() {
    const { type } = this.props.match.params;
    this.fetchStandardPermitConditions(typeFromURL[type]);
  }

  componentWillReceiveProps(nextProps) {
    const locationChanged = this.props.match.params !== nextProps.match.params;
    if (locationChanged) {
      const { type } = nextProps.match.params;
      this.setState({ isLoaded: false });
      this.fetchStandardPermitConditions(typeFromURL[type]);
    }
  }

  fetchStandardPermitConditions = (type) => {
    this.props.fetchStandardPermitConditions(type).then(() => {
      this.setState({ type, isLoaded: true });
    });
  };

  handleDelete = (condition) => {
    this.setState({ submitting: true });
    this.props.deleteStandardPermitCondition(condition.standard_permit_condition_guid).then(() => {
      this.setState({ submitting: false });
      this.props.closeModal();
      this.fetchStandardPermitConditions(this.state.type);
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
      .updateStandardPermitCondition(values.standard_permit_condition_guid, values)
      .then(() => {
        this.fetchStandardPermitConditions(this.state.type);
        this.props.setEditingConditionFlag(false);
      });
  };

  reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return this.props
      .updateStandardPermitCondition(condition.standard_permit_condition_guid, condition)
      .then(() => {
        this.fetchStandardPermitConditions(this.state.type);
      });
  };

  setConditionEditingFlag = (value) => {
    this.props.setEditingConditionFlag(value);
  };

  render = () => {
    const templateType = {
      QCA: "Quarry",
      MIN: "MX/CX",
      PLA: "Placer",
      SAG: "Sand & Gravel",
    };
    return (
      <LoadingWrapper condition={this.state.isLoaded}>
        <>
          <h2>{templateType[this.state.type]} Template Permit Conditions</h2>
          <Divider />
          {this.props.editingConditionFlag && <VariableConditionMenu isManagementView />}
          <Collapse>
            {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
              const conditions =
                this.props.conditions &&
                this.props.conditions.filter(
                  (condition) =>
                    condition.condition_category_code === conditionCategory.condition_category_code
                );
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
                  {conditions &&
                    conditions.map((condition) => (
                      <ConditionLayerOne
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
                    initialValues={
                      conditions && conditions.length !== 0
                        ? {
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
                          }
                        : {
                            condition_category_code: conditionCategory.condition_category_code,
                            condition_type_code: "SEC",
                            display_order: 1,
                            parent_permit_condition_id: null,
                            permit_amendment_id: null,
                            parent_condition_type_code: "SEC",
                            sibling_condition_type_code: null,
                          }
                    }
                    layer={0}
                  />
                </Collapse.Panel>
              );
            })}
          </Collapse>
        </>
      </LoadingWrapper>
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
      fetchStandardPermitConditions,
    },
    dispatch
  );

StandardPermitConditions.propTypes = propTypes;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StandardPermitConditions));
