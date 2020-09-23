/* eslint-disable */
import React, { useState } from "react";
import { PropTypes } from "prop-types";
import { Drawer, Button, Table } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import { Field, Fields } from "redux-form";
import { CloseOutlined } from "@ant-design/icons";
import RenderFieldWithDropdown from "@/components/common/RenderFieldWithDropdown";
import { number, numberWithUnitCode } from "@common/utils/Validate";
import LinkButton from "@/components/common/LinkButton";
import { CoreTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
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
  },
];

const tableOneData = [
  { more_than_5: "< 10 000", less_than_5: "< 60 000", permit_fee: "$0" },
  { more_than_5: "10 000 – < 60 000", less_than_5: "60 000 – < 125 000", permit_fee: "$4 000" },
  { more_than_5: "60 000 – < 125 000", less_than_5: "125 000 – < 250 000", permit_fee: "$8 000" },
  { more_than_5: "125 000 – < 250 000", less_than_5: "250 000 – < 500 000", permit_fee: "$16 000" },
  { more_than_5: "≥ 250 000", less_than_5: "≥ 500 000", permit_fee: "$32 000" },
];

const tableTwoData = [
  { tonnes_per_year: "< 5 000", permit_fee: "$0" },
  { tonnes_per_year: "5 000 – < 10 000", permit_fee: "$1 500" },
  { tonnes_per_year: "10 000 – < 20 000", permit_fee: "$3 000" },
  { tonnes_per_year: "20 000 – < 30 000", permit_fee: "$6 000" },
  { tonnes_per_year: "30 000 – < 40 000", permit_fee: "$9 000" },
  { tonnes_per_year: "40 000 – < 50 000", permit_fee: "$12 000" },
  { tonnes_per_year: "50 000 – < 60 000", permit_fee: "$15 000" },
  { tonnes_per_year: "60 000 – < 70 000", permit_fee: "$18 000" },
  { tonnes_per_year: "70 000 – < 80 000", permit_fee: "$21 000" },
  { tonnes_per_year: "80 000 – < 90 000", permit_fee: "$24 000" },
  { tonnes_per_year: "90 000 – < 100 000", permit_fee: "$27 000" },
  { tonnes_per_year: "100 000 – < 130 000", permit_fee: "$30 000" },
  { tonnes_per_year: "130 000 – < 170 000", permit_fee: "$40 000" },
  { tonnes_per_year: "≥ 170 000", permit_fee: "$50 000" },
];

export const ReviewApplicationFeeContent = (props) => {
  const [isFeeDrawerVisible, setVisible] = useState(false);

  const toggleFeeDrawer = () => {
    setVisible(!isFeeDrawerVisible);
  };

  const DrawerContent = () => (
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
    </div>
  );

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
            <CoreTooltip title="The application fee collected for this application was based on the Term of application and tonnage. If the tonnage field needs to be altered and the application fee should be increased, you must reject this application. See Fee Chart for reference." />
          </h4>
          <LinkButton onClick={toggleFeeDrawer}>View Fee Chart</LinkButton>
        </div>
        <br />
        <div className="field-title">
          Proposed Start Date
          <CoreTooltip title="Altering this field requires the applicant to pay a different application fee that was previously paid. If this field is to be altered, the applicant must re-apply for a notice of work" />
        </div>
        <Field
          id="proposed_start_date"
          name="proposed_start_date"
          component={RenderDate}
          disabled
        />
        <div className="field-title">
          Proposed End Date
          <CoreTooltip title="Altering this field requires the applicant to pay a different application fee that was previously paid. If this field is to be altered, the applicant must re-apply for a notice of work" />
        </div>
        <Field id="proposed_end_date" name="proposed_end_date" component={RenderDate} disabled />
        <div className="field-title">
          Term of Application
          <CoreTooltip title="This field is calculated based on the proposed start and end dates. If this field is to be altered, the applicant must re-apply for a notice of work" />
        </div>
        <Field
          id="term_of_application"
          name="term_of_application"
          component={RenderField}
          disabled
          validate={[number]}
        />
        <div className="field-title">
          Proposed Annnual Maximum Tonnage
          <CoreTooltip title="This field is calculated based on the proposed start and end dates. If this field is to be altered, the applicant must re-apply for a notice of work" />
        </div>
        <Fields
          names={["proposed_annnual_maximum_tonnage", "annnual_maximum_tonnage_unit_type_code"]}
          id="proposed_annnual_maximum_tonnage"
          dropdownID="annnual_maximum_tonnage_unit_type_code"
          component={RenderFieldWithDropdown}
          disabled={props.isViewMode}
          validate={[numberWithUnitCode]}
          data={props.unitTypeOptions}
        />
        <div className="field-title">
          Adjusted Annnual Maximum Tonnage
          <CoreTooltip title="This field is calculated based on the proposed start and end dates. If this field is to be altered, the applicant must re-apply for a notice of work" />
        </div>
        <Fields
          names={["adjusted_annnual_maximum_tonnage", "annnual_maximum_tonnage_unit_type_code"]}
          id="adjusted_annnual_maximum_tonnage"
          dropdownID="annnual_maximum_tonnage_unit_type_code"
          component={RenderFieldWithDropdown}
          disabled={props.isViewMode}
          validate={[numberWithUnitCode]}
          data={props.unitTypeOptions}
        />
      </div>
    </>
  );
};

ReviewApplicationFeeContent.propTypes = propTypes;

export default ReviewApplicationFeeContent;
