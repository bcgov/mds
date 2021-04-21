import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Menu, Dropdown } from "antd";
import {
  getEditingConditionFlag,
  getDraftPermitAmendmentForNOW,
} from "@common/selectors/permitSelectors";
import {
  setEditingConditionFlag,
  createPermitCondition,
  fetchPermitConditions,
  fetchDraftPermitByNOW,
} from "@common/actionCreators/permitActionCreator";
import CustomPropTypes from "@/customPropTypes";
import AddButton from "@/components/common/AddButton";
import Condition from "@/components/Forms/permits/conditions/Condition";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  editingConditionFlag: PropTypes.bool.isRequired,
  setEditingConditionFlag: PropTypes.func.isRequired,
  createPermitCondition: PropTypes.func.isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  fetchDraftPermitByNOW: PropTypes.func.isRequired,
  draftPermitAmendment: CustomPropTypes.permit.isRequired,
};

const defaultProps = {};

export class AddCondition extends Component {
  state = { isEditing: false, conditionType: "SEC" };

  handleSubmit = (values) => {
    const payload = { ...values, condition_type_code: this.state.conditionType };
    return this.props
      .createPermitCondition(this.props.draftPermitAmendment.permit_amendment_guid, payload)
      .then(() => {
        this.setState({ isEditing: false });
        this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
        this.props.fetchDraftPermitByNOW(
          null,
          this.props.draftPermitAmendment.now_application_guid
        );
        this.props.setEditingConditionFlag(false);
      });
  };

  handleCancel = (value) => {
    this.props.setEditingConditionFlag(value);
    this.setState({ isEditing: false });
  };

  render = () => {
    const conditionMenu = () =>
      ({
        SEC: (
          <Menu>
            {(!this.props.initialValues.sibling_condition_type_code ||
              this.props.initialValues.sibling_condition_type_code === "SEC") && (
              <Menu.Item>
                <button
                  type="button"
                  className="full"
                  onClick={() => {
                    this.props.setEditingConditionFlag(true);
                    this.setState({ isEditing: true, conditionType: "SEC" });
                  }}
                >
                  Sub-Section
                </button>
              </Menu.Item>
            )}
            {(!this.props.initialValues.sibling_condition_type_code ||
              this.props.initialValues.sibling_condition_type_code === "CON") && (
              <Menu.Item>
                <button
                  type="button"
                  className="full"
                  onClick={() => {
                    this.props.setEditingConditionFlag(true);
                    this.setState({ isEditing: true, conditionType: "CON" });
                  }}
                >
                  Condition
                </button>
              </Menu.Item>
            )}
          </Menu>
        ),
        CON: (
          <Menu>
            <Menu.Item>
              <button
                type="button"
                className="full"
                onClick={() => {
                  this.props.setEditingConditionFlag(true);
                  this.setState({ isEditing: true, conditionType: "LIS" });
                }}
              >
                List Item
              </button>
            </Menu.Item>
          </Menu>
        ),
        LIS: (
          <Menu>
            <Menu.Item>
              <button
                type="button"
                className="full"
                onClick={() => {
                  this.props.setEditingConditionFlag(true);
                  this.setState({ isEditing: true, conditionType: "LIS" });
                }}
              >
                List Item
              </button>
            </Menu.Item>
          </Menu>
        ),
      }[this.props.initialValues.parent_condition_type_code]);

    const hasSibling = this.props.initialValues.sibling_condition_type_code;
    const addTitle = hasSibling ? "Add Another" : "Create";
    return (
      <>
        {!this.state.isEditing && this.props.editingConditionFlag && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
            <Dropdown
              className="full-height"
              overlay={conditionMenu()}
              placement="bottomLeft"
              disabled
            >
              <AddButton type="secondary" disabled>
                {addTitle}
              </AddButton>
            </Dropdown>
          </NOWActionWrapper>
        )}
        {!this.props.editingConditionFlag && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
            <Dropdown className="full-height" overlay={conditionMenu()} placement="bottomLeft">
              <AddButton type="secondary">{addTitle}</AddButton>
            </Dropdown>
          </NOWActionWrapper>
        )}
        {this.state.isEditing && (
          <Condition
            new
            handleCancel={() => this.handleCancel()}
            handleSubmit={(values) => this.handleSubmit(values)}
            initialValues={{
              ...this.props.initialValues,
              condition_type_code: this.state.conditionType,
            }}
          />
        )}
      </>
    );
  };
}

const mapStateToProps = (state) => ({
  editingConditionFlag: getEditingConditionFlag(state),
  draftPermitAmendment: getDraftPermitAmendmentForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setEditingConditionFlag,
      fetchPermitConditions,
      createPermitCondition,
      fetchDraftPermitByNOW,
    },
    dispatch
  );

AddCondition.propTypes = propTypes;
AddCondition.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(AddCondition);
