import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { Menu } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { change, getFormValues } from "redux-form";
import { getNOWReclamationSummary } from "@common/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkActivityTypeOptions } from "@common/selectors/staticContentSelectors";

import { CoreTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";

const propTypes = {
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  isManagementView: PropTypes.bool,
  activityTypeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  isManagementView: false,
};

export class VariableConditionMenu extends Component {
  handleClick(value) {
    const condition = this.props.formValues.condition ? this.props.formValues.condition : "";
    const newValues = `${condition} ${value.key}`;
    return this.props.change(FORM.CONDITION_SECTION, "condition", newValues);
  }

  render() {
    const filteredActivityTypes = this.props.activityTypeOptions.filter(
      ({ value }) =>
        // filter out activities that do not have reclamation data
        value !== "placer" && value !== "water_supply" && value !== "blasting_operation"
    );
    // The standard permit condition management can see all reclamation options, draft permit tab can only use reclamation activities related to the NoW.
    const reclamationMenuOptions = this.props.isManagementView
      ? filteredActivityTypes
      : this.props.reclamationSummary;
    return (
      <div className="condition-menu-container">
        <h4>
          Condition Data Variables
          <CoreTooltip
            title="Hover your mouse over the menus until you find the variable data you'd like to enter. Put it into your edited Permit Condition by clicking on it. This will populate the edited condition with a variable in the Draft permit screen. The Data from the Application tab will show up correctly in the PDF Draft permit in place of the variable. Please ensure all variable data fields you select have the correct information in the Application tab before adding these fields to your draft permit."
            iconColor="white"
          />
        </h4>
        <Menu
          onClick={(values) => this.handleClick(values)}
          className="variable-menu"
          mode="vertical"
        >
          <Menu.SubMenu key="mine" title="Mine">
            <Menu.Item key="{mine_name}">Mine Name</Menu.Item>
            <Menu.Item key="{mine_no}">Mine Number</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="now" title="Notice of Work">
            <Menu.Item key="{proposed_annual_maximum_tonnage}">Proposed Annual Tonnage</Menu.Item>
            {reclamationMenuOptions.length > 0 && (
              <Menu.SubMenu key="rec" title="Reclamation">
                {reclamationMenuOptions?.map((activity, i) => (
                  <Menu.SubMenu key={i} title={activity.label}>
                    <Menu.Item key={`{${activity.value}.total}{hectare_unit}`}>
                      Total Disturbed Area
                    </Menu.Item>
                    <Menu.Item key={`{${activity.value}.cost}`}>Total Cost</Menu.Item>
                  </Menu.SubMenu>
                ))}
              </Menu.SubMenu>
            )}
          </Menu.SubMenu>
          <Menu.SubMenu key="draft" title="Draft Permit">
            <Menu.Item key="{issue_date}">Issue Date</Menu.Item>
            <Menu.Item key="{authorization_end_date}">Authorization End Date</Menu.Item>
            <Menu.Item key="{permit_no}">Permit Number</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="sec" title="Security">
            <Menu.Item key="{total_liability}">Total Liability</Menu.Item>
            <Menu.Item key="{liability_adjustment}">Assessed Liability Adjustment</Menu.Item>
            <Menu.Item key="{security_received_date}">Security Received Date</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="email" title="Emails">
            <Menu.Item key="{major_mine_inbox}">Major Mine Inbox</Menu.Item>
            <Menu.Item key="{regional_mine_inbox}">
              Regional Mine Inbox
              <CoreTooltip title="Defaults to the region associated with the Mine." />
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </div>
    );
  }
}

VariableConditionMenu.propTypes = propTypes;
VariableConditionMenu.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.CONDITION_SECTION)(state) || {},
  reclamationSummary: getNOWReclamationSummary(state),
  activityTypeOptions: getDropdownNoticeOfWorkActivityTypeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VariableConditionMenu);
