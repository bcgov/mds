import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Collapse, Button, Alert } from "antd";
import { formatDateTime, flattenObject } from "@common/utils/helpers";
import { ReadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getPermitConditions,
  getDraftPermitAmendmentForNOW,
  getEditingConditionFlag,
} from "@mds/common/redux/selectors/permitSelectors";
import {
  fetchPermitConditions,
  deletePermitCondition,
  updatePermitCondition,
  setEditingConditionFlag,
  fetchDraftPermitByNOW,
} from "@mds/common/redux/actionCreators/permitActionCreator";
import { maxBy } from "lodash";
import AddCondition from "@/components/Forms/permits/conditions/AddCondition";
import ConditionLayerOne from "@/components/Forms/permits/conditions/ConditionLayerOne";
import VariableConditionMenu from "@/components/Forms/permits/conditions/VariableConditionMenu";
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
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  isSourcePermitGeneratedInCore: PropTypes.bool.isRequired,
  isNoWApplication: PropTypes.bool.isRequired,
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

  handleDelete = (condition) => {
    this.setState({ submitting: true });
    this.props
      .deletePermitCondition(
        this.props.draftPermitAmendment.permit_amendment_guid,
        condition.permit_condition_guid
      )
      .then(() => {
        this.setState({ submitting: false });
        this.props.closeModal();
        this.fetchPermitConditions();
        this.props.fetchDraftPermitByNOW(
          null,
          this.props.draftPermitAmendment.now_application_guid
        );
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
      .updatePermitCondition(
        values.permit_condition_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        values
      )
      .then(() => {
        this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
        this.props.fetchDraftPermitByNOW(
          null,
          this.props.draftPermitAmendment.now_application_guid
        );
        this.props.setEditingConditionFlag(false);
      });
  };

  reorderConditions = (condition, isMoveUp) => {
    condition.display_order = isMoveUp ? condition.display_order - 1 : condition.display_order + 1;
    return this.props
      .updatePermitCondition(
        condition.permit_condition_guid,
        this.props.draftPermitAmendment.permit_amendment_guid,
        condition
      )
      .then(() => {
        this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
        this.props.fetchDraftPermitByNOW(
          null,
          this.props.draftPermitAmendment.now_application_guid
        );
      });
  };

  setConditionEditingFlag = (value) => {
    this.props.setEditingConditionFlag(value);
  };

  render = () => {
    const conditionsMetadata = this.props.draftPermitAmendment
      ? {
          last_updated_by: this.props.draftPermitAmendment.permit_conditions_last_updated_by,
          last_updated_date: this.props.draftPermitAmendment.permit_conditions_last_updated_date,
        }
      : null;
    return (
      <>
        {!this.props.isSourcePermitGeneratedInCore && !this.props.isNoWApplication && (
          <>
            <Alert
              description="The source authorization was not written in Core. The conditions below are defaults, not specific to this application or site."
              type="info"
              showIcon
            />
            <br />
          </>
        )}
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
              {conditionsMetadata && conditionsMetadata.last_updated_date
                ? formatDateTime(conditionsMetadata.last_updated_date)
                : "N/A"}
              <br />
              <b>Updated by: </b>
              {conditionsMetadata && conditionsMetadata.last_updated_by
                ? conditionsMetadata.last_updated_by
                : "N/A"}
              <br />
            </p>
          </div>
        </div>
        <div>
          {this.props.editingConditionFlag && <VariableConditionMenu />}
          <Collapse>
            {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
              const conditions = this.props.conditions.filter(
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
                      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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
        </div>
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
      fetchDraftPermitByNOW,
    },
    dispatch
  );

Conditions.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
