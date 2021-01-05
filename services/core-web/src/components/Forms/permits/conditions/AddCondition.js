import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
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
import Section from "@/components/Forms/permits/conditions/Section";
import SubCondition from "@/components/Forms/permits/conditions/SubCondition";
import ListItem from "@/components/Forms/permits/conditions/ListItem";
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
  alternateTitle: PropTypes.string,
};

const defaultProps = { alternateTitle: "" };

const ConditionComponent = (props) =>
  ({
    SEC: <Section {...props} />,
    CON: <SubCondition {...props} />,
    LIS: <ListItem {...props} />,
  }[props.initialValues.condition_type_code]);

const ButtonText = (condition_type_code) =>
  ({
    SEC: "Add Sub-Section",
    CON: "Add Condition",
    LIS: "Add List Item",
  }[condition_type_code]);

export class AddCondition extends Component {
  state = { isEditing: false };

  handleSubmit = (values) =>
    this.props
      .createPermitCondition(this.props.draftPermitAmendment.permit_amendment_guid, values)
      .then(() => {
        this.setState({ isEditing: false });
        this.props.fetchPermitConditions(this.props.draftPermitAmendment.permit_amendment_guid);
        this.props.fetchDraftPermitByNOW(
          null,
          this.props.draftPermitAmendment.now_application_guid
        );
        this.props.setEditingConditionFlag(false);
      });

  handleCancel = (value) => {
    this.props.setEditingConditionFlag(value);
    this.setState({ isEditing: false });
  };

  render = () => {
    const title = this.props.alternateTitle
      ? this.props.alternateTitle
      : ButtonText(this.props.initialValues.condition_type_code);
    return (
      <>
        {!this.state.isEditing && this.props.editingConditionFlag && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
            <AddButton type="secondary" disabled>
              {title}
            </AddButton>
          </NOWActionWrapper>
        )}
        {!this.props.editingConditionFlag && (
          <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab="DFT">
            <AddButton
              type="secondary"
              onClick={() => {
                this.props.setEditingConditionFlag(true);
                this.setState({ isEditing: true });
              }}
            >
              {title}
            </AddButton>
          </NOWActionWrapper>
        )}
        {this.state.isEditing && (
          <ConditionComponent
            new
            handleCancel={() => this.handleCancel()}
            handleSubmit={(values) => this.handleSubmit(values)}
            initialValues={this.props.initialValues}
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
