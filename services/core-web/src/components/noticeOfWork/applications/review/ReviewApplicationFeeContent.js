import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { PropTypes } from "prop-types";
import { isNil } from "lodash";
import { Drawer, Button, Alert } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { Field, change } from "redux-form";
import { CloseOutlined } from "@ant-design/icons";
import { number, dateNotBeforeOther, dateNotAfterOther } from "@common/utils/Validate";
import {
  getDurationText,
  isPlacerAdjustmentFeeValid,
  isPitsQuarriesAdjustmentFeeValid,
  isDateRangeValid,
} from "@common/utils/helpers";
import LinkButton from "@/components/common/buttons/LinkButton";
import CustomPropTypes from "@/customPropTypes";
import { CoreTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";
import CoreTable from "@/components/common/CoreTable";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  change: PropTypes.func.isRequired,
  adjustedTonnage: PropTypes.number,
  proposedTonnage: PropTypes.number,
  proposedStartDate: PropTypes.string,
  proposedAuthorizationEndDate: PropTypes.string,
  isPreLaunch: PropTypes.bool.isRequired,
};

const defaultProps = {
  adjustedTonnage: null,
  proposedTonnage: null,
  proposedStartDate: null,
  proposedAuthorizationEndDate: null,
};

const tableOneColumns = [
  {
    title: "Tonnes proposed to be moved in highest producing year",
    children: [
      {
        title: "Placer mine proposed to operate for 5 years or less",
        dataIndex: "less_than_5",
        key: "less_than_5",
      },
      {
        title: "Placer mine proposed to operate for more than 5 years",
        dataIndex: "more_than_5",
        key: "more_than_5",
      },
    ],
  },
  {
    title: "Permit Fee",
    dataIndex: "permit_fee",
    key: "permit_fee",
    width: 100,
    className: "right",
  },
];

const tableTwoColumns = [
  {
    title: "Tonnes proposed to be extracted in highest producing year",
    dataIndex: "tonnes_per_year",
    key: "tonnes_per_year",
  },
  {
    title: "Permit Fee",
    dataIndex: "permit_fee",
    key: "permit_fee",
    width: 100,
    className: "right",
  },
];

const tableOneData = [
  { more_than_5: "< 10,000", less_than_5: "< 60,000", permit_fee: "$0" },
  { more_than_5: "10,000 – < 60,000", less_than_5: "60,000 – < 125,000", permit_fee: "$4,000" },
  { more_than_5: "60,000 – < 125,000", less_than_5: "125,000 – < 250,000", permit_fee: "$8,000" },
  { more_than_5: "125,000 – < 250,000", less_than_5: "250,000 – < 500,000", permit_fee: "$16,000" },
  { more_than_5: "≥ 250,000", less_than_5: "≥ 500,000", permit_fee: "$32,000" },
];

const tableTwoData = [
  { tonnes_per_year: "< 5,000", permit_fee: "$0" },
  { tonnes_per_year: "5,000 – < 10,000", permit_fee: "$1,500" },
  { tonnes_per_year: "10,000 – < 20,000", permit_fee: "$3,000" },
  { tonnes_per_year: "20,000 – < 30,000", permit_fee: "$6,000" },
  { tonnes_per_year: "30,000 – < 40,000", permit_fee: "$9,000" },
  { tonnes_per_year: "40,000 – < 50,000", permit_fee: "$12,000" },
  { tonnes_per_year: "50,000 – < 60,000", permit_fee: "$15,000" },
  { tonnes_per_year: "60,000 – < 70,000", permit_fee: "$18,000" },
  { tonnes_per_year: "70,000 – < 80,000", permit_fee: "$21,000" },
  { tonnes_per_year: "80,000 – < 90,000", permit_fee: "$24,000" },
  { tonnes_per_year: "90,000 – < 100,000", permit_fee: "$27,000" },
  { tonnes_per_year: "100,000 – < 130,000", permit_fee: "$30,000" },
  { tonnes_per_year: "130,000 – < 170,000", permit_fee: "$40,000" },
  { tonnes_per_year: "≥ 170,000", permit_fee: "$50,000" },
];

export class ReviewApplicationFeeContent extends Component {
  state = {
    isApplicationFeeValid: true,
    isDateRangeValid: true,
    isFeeDrawerVisible: false,
  };

  componentDidMount() {
    this.setIsDateRangeValid(this.props.proposedStartDate, this.props.proposedAuthorizationEndDate);
    if (!isNil(this.props.proposedTonnage) && !isNil(this.props.adjustedTonnage)) {
      this.setIsApplicationFeeValid(
        this.props.initialValues.notice_of_work_type_code,
        this.props.proposedTonnage,
        this.props.adjustedTonnage,
        this.props.proposedStartDate,
        this.props.proposedAuthorizationEndDate
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    // Handle changes to proposed start and end dates.
    const proposedStartDateChanged = this.props.proposedStartDate !== nextProps.proposedStartDate;
    const proposedAuthorizationEndDateChanged =
      this.props.proposedAuthorizationEndDate !== nextProps.proposedAuthorizationEndDate;
    if (proposedStartDateChanged || proposedAuthorizationEndDateChanged) {
      this.setIsDateRangeValid(nextProps.proposedStartDate, nextProps.proposedAuthorizationEndDate);
      this.updateCalculatedTermOfApplication(
        nextProps.proposedStartDate,
        nextProps.proposedAuthorizationEndDate
      );
    }

    // Handle changes to proposed and adjusted tonnage.
    const adjustedChanged = this.props.adjustedTonnage !== nextProps.adjustedTonnage;
    const proposedChanged = this.props.proposedTonnage !== nextProps.proposedTonnage;
    if (
      proposedChanged ||
      adjustedChanged ||
      proposedStartDateChanged ||
      proposedAuthorizationEndDateChanged
    ) {
      this.setIsApplicationFeeValid(
        this.props.initialValues.notice_of_work_type_code,
        nextProps.proposedTonnage,
        nextProps.adjustedTonnage,
        nextProps.proposedStartDate,
        nextProps.proposedAuthorizationEndDate
      );
    }
  }

  setIsDateRangeValid = (start, end) => {
    this.setState({ isDateRangeValid: isDateRangeValid(start, end) });
  };

  setIsApplicationFeeValid = (type, proposed, adjusted, start, end) => {
    let isApplicationFeeValid = true;

    // Application fee only apply to Placer, Sand and Gravel, and Quarry mines.
    if (type === "PLA") {
      isApplicationFeeValid = this.adjustmentExceedsFeePlacer(proposed, adjusted, start, end);
    }
    if (type === "SAG" || type === "QCA" || type === "QIM") {
      isApplicationFeeValid = this.adjustmentExceedsFeePitsQuarries(proposed, adjusted);
    }

    this.setState({ isApplicationFeeValid });
  };

  updateCalculatedTermOfApplication = (start, end) =>
    this.props.change(
      FORM.EDIT_NOTICE_OF_WORK,
      "calculated_term_of_application",
      getDurationText(start, end)
    );

  adjustmentExceedsFeePlacer = (proposed, adjusted, start, end) =>
    !this.state.isDateRangeValid
      ? true
      : isPlacerAdjustmentFeeValid(proposed, adjusted, start, end);

  adjustmentExceedsFeePitsQuarries = (proposed, adjusted) =>
    isPitsQuarriesAdjustmentFeeValid(proposed, adjusted);

  toggleFeeDrawer = () =>
    this.setState((prevState) => ({
      isFeeDrawerVisible: !prevState.isFeeDrawerVisible,
    }));

  DrawerContent = () => (
    <div>
      <h4>Table 1: Permit Fees for Placer Mines</h4>
      <CoreTable columns={tableOneColumns} dataSource={tableOneData} bordered size="small" />
      <br />
      <h4>Table 2: Permit Fees for Pits and Quarries</h4>
      <CoreTable columns={tableTwoColumns} dataSource={tableTwoData} bordered size="small" />
      <br />
      <a
        href="https://www.bclaws.ca/civix/document/id/complete/statreg/54_2015"
        target="_blank"
        className="right"
        rel="noopener noreferrer"
      >
        View Mines Fee Regulation
      </a>
    </div>
  );

  render() {
    this.updateCalculatedTermOfApplication(
      this.props.proposedStartDate,
      this.props.proposedAuthorizationEndDate
    );

    const showCalculationInvalidError =
      !this.state.isDateRangeValid &&
      !isNil(this.props.adjustedTonnage) &&
      this.props.initialValues.notice_of_work_type_code === "PLA";

    return (
      <>
        <Drawer
          title="Application Fee Calculation Chart"
          placement="right"
          closable={false}
          onClose={this.toggleFeeDrawer}
          visible={this.state.isFeeDrawerVisible}
        >
          <Button ghost className="modal__close" onClick={this.toggleFeeDrawer}>
            <CloseOutlined />
          </Button>
          {this.DrawerContent()}
        </Drawer>
        <div className="fee-determination--block">
          <div className="inline-flex between">
            <h4>
              Permit Application Fee Assessment
              <CoreTooltip title="The application fee collected for this application was based on the term of application and tonnage. If the tonnage field needs to be altered and the application fee should be increased, you must reject this application. See Fee Chart for reference." />
            </h4>
            <LinkButton onClick={this.toggleFeeDrawer}>View Fee Chart</LinkButton>
          </div>
          <br />
          <div className="field-title">
            Proposed Start Date
            <CoreTooltip title="Altering this field requires the applicant to pay a different application fee than was previously paid. If this field is to be altered, the applicant must re-apply for a Notice of Work. You set the actual Start and End dates when you process the permit." />
          </div>
          <Field
            id="proposed_start_date"
            name="proposed_start_date"
            component={RenderDate}
            disabled={this.props.isViewMode || !this.props.isAdmin}
            validate={[dateNotAfterOther(this.props.proposedAuthorizationEndDate)]}
          />
          <div className="field-title">
            Proposed Authorization End Date
            <CoreTooltip title="Altering this field requires the applicant to pay a different application fee than was previously paid. If this field is to be altered, the applicant must re-apply for a Notice of Work. You set the actual Start and End dates when you process the permit." />
          </div>
          <Field
            id="proposed_end_date"
            name="proposed_end_date"
            component={RenderDate}
            disabled={this.props.isViewMode || !this.props.isAdmin}
            validate={[dateNotBeforeOther(this.props.proposedStartDate)]}
          />
          <div className="field-title">
            Proposed Term of Application
            <CoreTooltip title="This field is calculated based on the proposed start and end dates. If this field is to be altered, the applicant must re-apply for a Notice of Work." />
          </div>
          <Field
            id="calculated_term_of_application"
            name="calculated_term_of_application"
            component={RenderField}
            disabled
          />
          <div className="field-title">
            Proposed Annual Maximum Tonnage
            {this.props.isPreLaunch && <NOWFieldOriginTooltip />}
            <CoreTooltip title="The proposed annual maximum tonnage as submitted in the application. This cannot be changed." />
          </div>
          <Field
            id="proposed_annual_maximum_tonnage"
            name="proposed_annual_maximum_tonnage"
            component={RenderField}
            validate={[number]}
            disabled={this.props.isViewMode || !this.props.isAdmin}
          />
          <div className="field-title">
            Actual Annual Maximum Tonnage
            <CoreTooltip title="This is to be used if the Proposed Maximum Annual Tonnage Extracted amount changes during Technical Review. Please enter the new total for the Maximum Annual Tonnage Extracted that the proponent is proposing. Changing this amount may affect the amount of the Permit Fee assessed. If the amount is over the fee threshold of the next fee amount, the application will need to be rejected and the applicant will need to reapply." />
          </div>
          <Field
            id="adjusted_annual_maximum_tonnage"
            name="adjusted_annual_maximum_tonnage"
            component={RenderField}
            disabled={this.props.isViewMode}
            validate={[number]}
          />
          {showCalculationInvalidError && (
            <div className="error">
              <Alert
                message="Cannot calculate application fee using Adjusted Annual Maximum Tonnage because the proposed dates are invalid."
                type="error"
                showIcon
              />
            </div>
          )}
          {!this.state.isApplicationFeeValid && (
            <div className="error">
              <Alert
                message="The Adjusted Annual Maximum Tonnage exceeds the limit allowed for permit fees paid. You must reject the application and ask the proponent to re-apply, or reduce the tonnage entered."
                type="error"
                showIcon
              />
            </div>
          )}
        </div>
      </>
    );
  }
}

ReviewApplicationFeeContent.propTypes = propTypes;
ReviewApplicationFeeContent.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ReviewApplicationFeeContent);
