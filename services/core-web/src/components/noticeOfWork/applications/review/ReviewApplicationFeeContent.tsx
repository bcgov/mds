import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { isNil } from "lodash";
import { Alert, Button, Drawer } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { change, Field } from "redux-form";
import { CloseOutlined } from "@ant-design/icons";
import { dateNotAfterOther, dateNotBeforeOther, number } from "@common/utils/Validate";
import {
  getDurationText,
  isDateRangeValid,
  isPitsQuarriesAdjustmentFeeValid,
  isPlacerAdjustmentFeeValid,
} from "@common/utils/helpers";
import LinkButton from "@/components/common/buttons/LinkButton";
import { CoreTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";
import CoreTable from "@/components/common/CoreTable";

interface ReviewApplicationFeeContentProps {
  isViewMode: boolean;
  initialValues: any;
  isAdmin: boolean;
  change: any;
  adjustedTonnage: number;
  proposedTonnage: number;
  proposedStartDate: string;
  proposedAuthorizationEndDate: string;
  isPreLaunch: boolean;
}

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

export const ReviewApplicationFeeContent: FC<ReviewApplicationFeeContentProps> = (props) => {
  const [isFeeDrawerVisible, setIsFeeDrawerVisible] = useState(false);
  const [isApplicationFeeValid, setIsApplicationFeeValid] = useState(true);
  const [dateRangeValid, setDateRangeValid] = useState(true);

  const {
    proposedStartDate,
    proposedAuthorizationEndDate,
    adjustedTonnage,
    proposedTonnage,
    isAdmin,
    isViewMode,
    isPreLaunch,
  } = props;

  const adjustmentExceedsFeePitsQuarries = (proposed, adjusted) =>
    isPitsQuarriesAdjustmentFeeValid(proposed, adjusted);

  const adjustmentExceedsFeePlacer = (proposed, adjusted, start, end): boolean => {
    return dateRangeValid ? true : isPlacerAdjustmentFeeValid(proposed, adjusted, start, end);
  };

  const setIsApplicationFeeValidHandler = (type, proposed, adjusted, start, end) => {
    let applicationFeeValid = true;

    // Application fee only apply to Placer, Sand and Gravel, and Quarry mines.
    if (type === "PLA") {
      applicationFeeValid = adjustmentExceedsFeePlacer(proposed, adjusted, start, end);
    }
    if (type === "SAG" || type === "QCA" || type === "QIM") {
      applicationFeeValid = adjustmentExceedsFeePitsQuarries(proposed, adjusted);
    }

    setIsApplicationFeeValid(applicationFeeValid);
  };

  const updateCalculatedTermOfApplication = (start, end) =>
    props.change(
      FORM.EDIT_NOTICE_OF_WORK,
      "calculated_term_of_application",
      getDurationText(start, end)
    );

  const setIsDateRangeValidHandler = (start, end) => {
    setDateRangeValid(isDateRangeValid(start, end));
  };

  useEffect(() => {
    setIsDateRangeValidHandler(proposedStartDate, proposedAuthorizationEndDate);
    if (!isNil(proposedTonnage) && !isNil(adjustedTonnage)) {
      setIsApplicationFeeValidHandler(
        props.initialValues.notice_of_work_type_code,
        proposedTonnage,
        adjustedTonnage,
        proposedStartDate,
        proposedAuthorizationEndDate
      );
    }
  }, []);

  useEffect(() => {
    // Handle changes to proposed start and end dates.
    setIsDateRangeValidHandler(props.proposedStartDate, proposedAuthorizationEndDate);
    updateCalculatedTermOfApplication(proposedStartDate, proposedAuthorizationEndDate);

    // Handle changes to proposed and adjusted tonnage.

    setIsApplicationFeeValidHandler(
      props.initialValues.notice_of_work_type_code,
      proposedTonnage,
      adjustedTonnage,
      proposedStartDate,
      proposedAuthorizationEndDate
    );
  }, [proposedStartDate, proposedAuthorizationEndDate]);

  useEffect(() => {}, [adjustedTonnage, proposedTonnage]);

  const toggleFeeDrawer = () => setIsFeeDrawerVisible(!isFeeDrawerVisible);

  const DrawerContent = () => (
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

  updateCalculatedTermOfApplication(proposedStartDate, proposedAuthorizationEndDate);

  const showCalculationInvalidError =
    !isDateRangeValid &&
    !isNil(adjustedTonnage) &&
    props.initialValues.notice_of_work_type_code === "PLA";

  return (
    <>
      <Drawer
        title="Application Fee Calculation Chart"
        placement="right"
        closable={false}
        onClose={toggleFeeDrawer}
        visible={isFeeDrawerVisible}
      >
        <Button ghost className="modal__close" onClick={toggleFeeDrawer}>
          <CloseOutlined />
        </Button>
        {DrawerContent()}
      </Drawer>
      <div className="fee-determination--block">
        <div className="inline-flex between">
          <h4>
            Permit Application Fee Assessment
            <CoreTooltip title="The application fee collected for this application was based on the term of application and tonnage. If the tonnage field needs to be altered and the application fee should be increased, you must reject this application. See Fee Chart for reference." />
          </h4>
          <LinkButton onClick={toggleFeeDrawer}>View Fee Chart</LinkButton>
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
          disabled={isViewMode || !isAdmin}
          validate={[dateNotAfterOther(proposedAuthorizationEndDate)]}
        />
        <div className="field-title">
          Proposed Authorization End Date
          <CoreTooltip title="Altering this field requires the applicant to pay a different application fee than was previously paid. If this field is to be altered, the applicant must re-apply for a Notice of Work. You set the actual Start and End dates when you process the permit." />
        </div>
        <Field
          id="proposed_end_date"
          name="proposed_end_date"
          component={RenderDate}
          disabled={isViewMode || !isAdmin}
          validate={[dateNotBeforeOther(proposedStartDate)]}
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
        <div className="field-title">Years Sought for Authorization to Complete this Work</div>
        <Field
          id="term_of_application"
          name="term_of_application"
          component={RenderField}
          validate={[number]}
          disabled={isViewMode || !isAdmin}
        />
        <div className="field-title">
          Proposed Annual Maximum Tonnage
          {isPreLaunch && <NOWFieldOriginTooltip />}
          <CoreTooltip title="The proposed annual maximum tonnage as submitted in the application. This cannot be changed." />
        </div>
        <Field
          id="proposed_annual_maximum_tonnage"
          name="proposed_annual_maximum_tonnage"
          component={RenderField}
          validate={[number]}
          disabled={isViewMode || !isAdmin}
        />
        <div className="field-title">
          Actual Annual Maximum Tonnage
          <CoreTooltip title="This is to be used if the Proposed Maximum Annual Tonnage Extracted amount changes during Technical Review. Please enter the new total for the Maximum Annual Tonnage Extracted that the proponent is proposing. Changing this amount may affect the amount of the Permit Fee assessed. If the amount is over the fee threshold of the next fee amount, the application will need to be rejected and the applicant will need to reapply." />
        </div>
        <Field
          id="adjusted_annual_maximum_tonnage"
          name="adjusted_annual_maximum_tonnage"
          component={RenderField}
          disabled={isViewMode}
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
        {!isApplicationFeeValid && (
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
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(null, mapDispatchToProps)(ReviewApplicationFeeContent);
