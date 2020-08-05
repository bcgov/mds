import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider, Icon, Row, Collapse, Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import CustomPropTypes from "@/customPropTypes";
import Condition from "@/components/Forms/permits/conditions/Condition";
import Section from "@/components/Forms/permits/conditions/Section";
import AddButton from "@/components/common/AddButton";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@common/selectors/staticContentSelectors";
import { getPermitConditions } from "@common/selectors/permitSelectors";
import { fetchPermitConditions } from "@common/actionCreators/permitActionCreator";
import { getDraftPermitForNOW } from "@common/selectors/permitSelectors";
import { getNoticeOfWork } from "@common/selectors/noticeOfWorkSelectors";

const { Panel } = Collapse;

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  conditions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  permitConditionCategoryOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitConditionTypeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  fetchPermitConditions: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
};

const defaultProps = {};

const draft = "DFT";

export class Conditions extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.fetchPermitConditions();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.draftPermit !== this.props.draftPermit ||
      prevProps.noticeOfWork !== this.props.noticeOfWork
    ) {
      this.fetchPermitConditions();
    }
  }

  fetchPermitConditions = () => {
    if (this.props.draftPermit && this.props.noticeOfWork) {
      const draftAmendment = this.props.draftPermit.permit_amendments.filter(
        (amendment) =>
          amendment.now_application_guid === this.props.noticeOfWork.now_application_guid &&
          amendment.permit_amendment_status_code === draft
      )[0];
      this.props.fetchPermitConditions(null, null, draftAmendment.permit_amendment_guid);
    }
  };

  render() {
    return (
      <>
        <Collapse>
          {this.props.permitConditionCategoryOptions.map((conditionCategory) => (
            <Panel
              header={conditionCategory.description}
              key={conditionCategory.condition_category_code}
              id={conditionCategory.condition_category_code}
            >
              {this.props.conditions
                .filter(
                  (condition) =>
                    condition.condition_category_code === conditionCategory.condition_category_code
                )
                .map((condition) => (
                  <Condition condition={condition} />
                ))}
              <Divider />
              <AddButton type="secondary">Add Sub-Section</AddButton>
              <Section new />
              <Button type="secondary" className="full-mobile btn--middle">
                <Icon type="undo" theme="outlined" className="padding-small--right icon-sm" />
                Restore Deleted Standard Conditions
              </Button>
            </Panel>
          ))}
        </Collapse>
      </>
    );
  }
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
    },
    dispatch
  );

Conditions.propTypes = propTypes;
Conditions.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Conditions);
