import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { isNil } from "lodash";
import { Drawer, Button, Table, Alert } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { Field } from "redux-form";
import { CloseOutlined } from "@ant-design/icons";
import { number } from "@common/utils/Validate";
import { getDurationText } from "@common/utils/helpers";
import LinkButton from "@/components/common/LinkButton";
import CustomPropTypes from "@/customPropTypes";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import moment from "moment";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
  adjustedTonnage: PropTypes.number,
  proposedTonnage: PropTypes.number,
};
const defaultProps = {
  adjustedTonnage: null,
  proposedTonnage: null,
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
    isFeeDrawerVisible: false,
    isDateRangeInvalid: false,
    isExactlyFiveOrUnder: false,
  };

  componentDidMount() {
    const duration = moment.duration(
      moment(this.props.initialValues.proposed_end_date).diff(
        moment(this.props.initialValues.proposed_start_date)
      )
    );
    const isExactlyFiveOrUnder =
      (duration.years() === 5 &&
        duration.months() === 0 &&
        duration.weeks() === 0 &&
        duration.days() === 0) ||
      duration.years() < 5;
    // eslint-disable-next-line no-underscore-dangle
    const isDateRangeInvalid = Math.sign(duration._milliseconds) === -1;
    this.setState({ isDateRangeInvalid, isExactlyFiveOrUnder });
    if (!isNil(this.props.proposedTonnage) && !isNil(this.props.adjustedTonnage)) {
      this.typeDeterminesFee(
        this.props.initialValues.notice_of_work_type_code,
        this.props.proposedTonnage,
        this.props.adjustedTonnage
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const adjustedChanged = this.props.adjustedTonnage !== nextProps.adjustedTonnage;
    const proposedChanged = this.props.proposedTonnage !== nextProps.proposedTonnage;
    const adjusted = !isNil(nextProps.adjustedTonnage);
    if ((proposedChanged || adjustedChanged) && adjusted) {
      this.typeDeterminesFee(
        this.props.initialValues.notice_of_work_type_code,
        nextProps.proposedTonnage,
        nextProps.adjustedTonnage
      );
    }
  }

  // eslint-disable-next-line consistent-return
  typeDeterminesFee = (type, proposed, adjusted) => {
    // application fees only apply to Placer, S&G, and Q mines
    if (type === "PLA") {
      return this.adjustmentExceedsFeePlacer(proposed, adjusted);
    }
    if (type === "SAG" || type === "QCA" || type === "QIM") {
      return this.adjustmentExceedsFeePitsQuarries(proposed, adjusted);
    }
  };

  // Application fees are valid if they remain in the same fee bracket || they fall into the lower bracket
  // Fees need to be readjusted if they move to a higher bracket only
  adjustmentExceedsFeePlacer = (proposed, adjusted) => {
    let isFeeValid = true;
    if (this.state.isDateRangeInvalid) {
      return this.setState({ isApplicationFeeValid: isFeeValid });
    }
    if (this.state.isExactlyFiveOrUnder) {
      if (proposed < 60000) {
        isFeeValid = adjusted < 60000;
      } else if (proposed >= 60000 && proposed < 125000) {
        isFeeValid = adjusted < 125000;
      } else if (proposed >= 125000 && proposed < 250000) {
        isFeeValid = adjusted < 250000;
      } else if (proposed >= 250000 && proposed < 500000) {
        isFeeValid = adjusted < 500000;
      } else {
        // Anything above 500,000 is valid as the applicatcant alredy paid the max fee.
        isFeeValid = true;
      }
    } else if (proposed < 10000) {
      isFeeValid = adjusted < 10000;
    } else if (proposed >= 10000 && proposed < 60000) {
      isFeeValid = adjusted < 60000;
    } else if (proposed >= 60000 && proposed < 125000) {
      isFeeValid = adjusted < 125000;
    } else if (proposed >= 125000 && proposed < 250000) {
      isFeeValid = adjusted < 250000;
    } else {
      // Anything above 250,000 is valid as the applicatcant alredy paid the max fee.
      isFeeValid = true;
    }
    return this.setState({ isApplicationFeeValid: isFeeValid });
  };

  adjustmentExceedsFeePitsQuarries = (proposed, adjusted) => {
    let isFeeValid = true;
    if (proposed < 5000) {
      isFeeValid = adjusted < 5000;
    } else if (proposed >= 5000 && proposed < 10000) {
      isFeeValid = adjusted < 10000;
    } else if (proposed >= 10000 && proposed < 20000) {
      isFeeValid = adjusted < 20000;
    } else if (proposed >= 20000 && proposed < 30000) {
      isFeeValid = adjusted < 30000;
    } else if (proposed >= 30000 && proposed < 40000) {
      isFeeValid = adjusted < 40000;
    } else if (proposed >= 40000 && proposed < 50000) {
      isFeeValid = adjusted < 50000;
    } else if (proposed >= 50000 && proposed < 60000) {
      isFeeValid = adjusted < 60000;
    } else if (proposed >= 60000 && proposed < 70000) {
      isFeeValid = adjusted < 70000;
    } else if (proposed >= 70000 && proposed < 80000) {
      isFeeValid = adjusted < 80000;
    } else if (proposed >= 80000 && proposed < 90000) {
      isFeeValid = adjusted < 90000;
    } else if (proposed >= 90000 && proposed < 100000) {
      isFeeValid = adjusted < 100000;
    } else if (proposed >= 100000 && proposed < 130000) {
      isFeeValid = adjusted < 130000;
    } else if (proposed >= 130000 && proposed < 170000) {
      isFeeValid = adjusted < 170000;
    }
    // Anything above 170,000 is valid as the applicatcant alredy paid the max fee.
    return this.setState({ isApplicationFeeValid: isFeeValid });
  };

  toggleFeeDrawer = () =>
    this.setState((prevState) => ({
      isFeeDrawerVisible: !prevState.isFeeDrawerVisible,
    }));

  DrawerContent = () => (
    <div>
      <h4>Table 1: Permit Fees for Placer Mines</h4>
      <Table
        columns={tableOneColumns}
        dataSource={tableOneData}
        bordered
        size="small"
        pagination={false}
      />
      <br />
      <h4>Table 2: Permit Fees for Pits and Quarries</h4>
      <Table
        columns={tableTwoColumns}
        dataSource={tableTwoData}
        bordered
        size="small"
        pagination={false}
      />
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
    this.props.initialValues.calculated_term_of_application = getDurationText(
      this.props.initialValues.proposed_start_date,
      this.props.initialValues.proposed_end_date
    );
    const showCalculationInvalidError =
      this.state.isDateRangeInvalid &&
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
              <CoreTooltip title="The application fee collected for this application was based on the Term of application and tonnage. If the tonnage field needs to be altered and the application fee should be increased, you must reject this application. See Fee Chart for reference." />
            </h4>
            <LinkButton onClick={this.toggleFeeDrawer}>View Fee Chart</LinkButton>
          </div>
          <br />
          <div className="field-title">
            Proposed Start Date
            <CoreTooltip title="Altering this field requires the applicant to pay a different application fee that was previously paid. If this field is to be altered, the applicant must re-apply for a notice of work." />
          </div>
          <Field
            id="proposed_start_date"
            name="proposed_start_date"
            component={RenderDate}
            disabled
          />
          <div className="field-title">
            Proposed End Date
            <CoreTooltip title="Altering this field requires the applicant to pay a different application fee that was previously paid. If this field is to be altered, the applicant must re-apply for a notice of work." />
          </div>
          <Field id="proposed_end_date" name="proposed_end_date" component={RenderDate} disabled />
          <div className="field-title">
            Proposed Term of Application
            <CoreTooltip title="This field is calculated based on the proposed start and end dates. If this field is to be altered, the applicant must re-apply for a notice of work." />
          </div>
          <Field
            id="calculated_term_of_application"
            name="calculated_term_of_application"
            component={RenderField}
            disabled
          />
          <div className="field-title">
            Proposed Annual Maximum Tonnage
            <CoreTooltip title="This amount is found within the application in vFCBC or on the first page of the application form pdf and needs to be entered manually in order to continue processing this application." />
          </div>
          <Field
            id="proposed_annual_maximum_tonnage"
            name="proposed_annual_maximum_tonnage"
            component={RenderField}
            disabled={this.props.isViewMode}
            validate={[number]}
          />
          <div className="field-title">
            Adjusted Annual Maximum Tonnage
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

export default ReviewApplicationFeeContent;
