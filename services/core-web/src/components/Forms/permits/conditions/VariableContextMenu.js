import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { isNil } from "lodash";
import { Drawer, Button, Cascader, Alert, Menu } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { Field, change, getFormValues } from "redux-form";
import {
  getNoticeOfWork,
  getOriginalNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNOWReclamationSummary,
} from "@common/selectors/noticeOfWorkSelectors";
import { CloseOutlined } from "@ant-design/icons";
import { number, dateNotBeforeOther, dateNotAfterOther } from "@common/utils/Validate";
import {
  getDurationText,
  isPlacerAdjustmentFeeValid,
  isPitsQuarriesAdjustmentFeeValid,
  isDateRangeValid,
} from "@common/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";
import { CoreTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
// import RenderCascader from "@/components/common/RenderCascader";
import * as FORM from "@/constants/forms";

import { MailOutlined, AppstoreOutlined, SettingOutlined } from "@ant-design/icons";

const { SubMenu } = Menu;

const propTypes = {};

const defaultProps = {};

export class VariableContextMenu extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    document.addEventListener("contextmenu", this._handleContextMenu);
    document.addEventListener("click", this._handleClick);
    document.addEventListener("scroll", this._handleScroll);
  }

  componentWillUnmount() {
    document.removeEventListener("contextmenu", this._handleContextMenu);
    document.removeEventListener("click", this._handleClick);
    document.removeEventListener("scroll", this._handleScroll);
  }

  _handleContextMenu = (event) => {
    event.preventDefault();

    this.setState({ visible: true });

    const clickX = event.clientX;
    const clickY = event.clientY;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const rootW = this.root.offsetWidth;
    const rootH = this.root.offsetHeight;

    const right = screenW - clickX > rootW;
    const left = !right;
    const top = screenH - clickY > rootH;
    const bottom = !top;

    if (right) {
      this.root.style.left = `${clickX + 5}px`;
    }

    if (left) {
      this.root.style.left = `${clickX - rootW - 5}px`;
    }

    if (top) {
      this.root.style.top = `${clickY + 5}px`;
    }

    if (bottom) {
      this.root.style.top = `${clickY - rootH - 5}px`;
    }
  };

  _handleClick = (event) => {
    const { visible } = this.state;
    const wasOutside = !(event.target.contains === this.root);

    if (wasOutside && visible) this.setState({ visible: false });
  };

  _handleScroll = () => {
    const { visible } = this.state;

    if (visible) this.setState({ visible: false });
  };

  handleClick(value) {
    const newValues = `${this.props.formValues.condition} ${value.key}`;
    return this.props.change(FORM.CONDITION_SECTION, "condition", newValues);
  }

  render() {
    console.log(this.props.reclamationSummary);
    return (
      <div className="menu-div">
        <h4>Condition Data Variables</h4>
        <CoreTooltip title="Hover your mouse over the menus until you find the variable data you'd like to enter. Put it into your edited Permit Condition by clicking on it. This will populate the edited condition with a variable in the Draft permit screen. The Data from the Application tab will show up correctly in the PDF Draft permit in place of the variable. Please ensure all variable data fields you select have the correct information in the Application tab before adding these fields to your draft permit." />
        <Menu
          onClick={(values) => this.handleClick(values)}
          style={{ width: 256 }}
          className="contextMenu"
          mode="vertical"
          ref={(ref) => {
            this.root = ref;
          }}
        >
          <SubMenu key="now" title="Notice of Work">
            <Menu.Item key="{proposed_annual_maximum_tonnage}">Proposed Annual Tonnage</Menu.Item>
            {this.props.reclamationSummary.length > 0 && (
              <SubMenu key="rec" title="Reclamation">
                {this.props.reclamationSummary?.map((activity, i) => (
                  <SubMenu key={i} title={activity.label}>
                    <Menu.Item key="{total}">Total Disturbed Area</Menu.Item>
                    <Menu.Item key="{cost}">Total Cost</Menu.Item>
                  </SubMenu>
                ))}
              </SubMenu>
            )}
          </SubMenu>
          <SubMenu key="draft" title="Draft Permit">
            <Menu.Item key="{issue_date}">Issue Date</Menu.Item>
            <Menu.Item key="{authorization_end_date}">Authorization End Date</Menu.Item>
            <Menu.Item key="{permit_no}">Permit Number</Menu.Item>
          </SubMenu>
          <SubMenu key="sec" title="Security">
            <Menu.Item key="{liability_adjustment}">Assessed Liability Adjustment</Menu.Item>
          </SubMenu>
        </Menu>
      </div>
    );
    // );
  }
}

VariableContextMenu.propTypes = propTypes;
VariableContextMenu.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.CONDITION_SECTION)(state) || {},
  reclamationSummary: getNOWReclamationSummary(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(VariableContextMenu);
