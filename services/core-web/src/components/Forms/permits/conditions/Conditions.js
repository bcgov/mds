import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Row, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { getPermitConditions , getDraftPermitForNOW } from "@common/selectors/permitSelectors";
import {
  fetchPermitConditions,
  createPermitCondition,
} from "@common/actionCreators/permitActionCreator";

import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";
import { maxBy } from "lodash";
import AddSection from "@/components/Forms/permits/conditions/AddSection";
import Condition from "@/components/Forms/permits/conditions/Condition";
import CustomPropTypes from "@/customPropTypes";

const { Panel } = Collapse;

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitConditionTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  createPermitCondition: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
};

const defaultProps = {};

const draft = "DFT";

export class Conditions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draftAmendment:
        this.props.draftPermit &&
        this.props.draftPermit.permit_amendments.filter(
          (amendment) =>
            amendment.now_application_guid === this.props.noticeOfWork.now_application_guid &&
            amendment.permit_amendment_status_code === draft
        )[0],
    };
    this.fetchPermitConditions();
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.draftPermit !== this.props.draftPermit) {
      const draftAmendment =
        this.props.draftPermit &&
        this.props.draftPermit.permit_amendments.filter(
          (amendment) =>
            amendment.now_application_guid === this.props.noticeOfWork.now_application_guid &&
            amendment.permit_amendment_status_code === draft
        )[0];
      this.setState({ draftAmendment }).then(() => {
        this.fetchPermitConditions();
      });
    }
  };

  fetchPermitConditions = () => {
    if (this.state.draftAmendment) {
      this.props.fetchPermitConditions(null, null, this.state.draftAmendment.permit_amendment_guid);
    }
  };

  handleAddSection = (values) => {
    this.props
      .createPermitCondition(null, null, this.state.draftAmendment.permit_amendment_guid, values)
      .then(() => this.fetchPermitConditions());
  };

  render = () => (
    <>
      <Collapse>
        {this.props.permitConditionCategoryOptions.map((conditionCategory) => {
          const conditions = this.props.conditions.filter(
            (condition) =>
              condition.condition_category_code === conditionCategory.condition_category_code
          );
          const nextNumber =
            conditions.length > 1 ? maxBy(conditions, "display_order").display_order + 1 : 1;
          return (
            <Panel
              header={conditionCategory.description}
              key={conditionCategory.condition_category_code}
              id={conditionCategory.condition_category_code}
            >
              {conditions.map((condition) => (
                <Condition condition={condition} />
              ))}
              <Divider />
              <AddSection
                initialValues={{
                  condition_category_code: conditionCategory.condition_category_code,
                  condition_type_code: "SEC",
                  display_order: nextNumber,
                  parent_condition_id: null,
                  permit_amendment_id: this.state.draftAmendment.permit_amendment_id,
                }}
                handleSubmit={(values) => this.handleAddSection(values)}
              />
              <Button type="secondary" className="full-mobile btn--middle">
                <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                Restore Deleted Standard Conditions
              </Button>
            </Panel>
          );
        })}
      </Collapse>
    </>
  );
}

const mapStateToProps = (state) => ({
  permitConditionCategoryOptions: getPermitConditionCategoryOptions(state),
  permitConditionTypeOptions: getPermitConditionTypeOptions(state),
  conditions: getPermitConditions(state),
  noticeOfWork: getNoticeOfWork(state),
  draftPermit: getDraftPermitForNOW(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchPermitConditions,
      createPermitCondition,
    },
    dispatch
  );

Conditions.propTypes = propTypes;
Conditions.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
