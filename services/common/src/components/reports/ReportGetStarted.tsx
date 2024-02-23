import { Alert, Button, Col, Form, Row, Select, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Field, getFormValues } from "redux-form";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { useSelector, useDispatch } from "react-redux";
import { IMine, IMineReportDefinition, IMineReportSubmission } from "@mds/common/interfaces";
import { getMineReportDefinitionOptions } from "@mds/common/redux/reducers/staticContentReducer";
import {
  createDropDownList,
  formatComplianceCodeReportName,
} from "@mds/common/redux/utils/helpers";
import { uniqBy } from "lodash";
import ExportOutlined from "@ant-design/icons/ExportOutlined";
import { FORM, MINE_REPORTS_ENUM, MMO_EMAIL } from "../..";
import FormWrapper from "../forms/FormWrapper";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import { required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import RenderSelect from "../forms/RenderSelect";
import { getDropdownPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";

interface ReportGetStartedProps {
  setSelectedReportDefinition: (report: IMineReportDefinition) => void;
  selectedReportDefinition: IMineReportDefinition;
  mine: IMine;
  handleSubmit: (values: Partial<IMineReportSubmission>) => void;
  formButtons: ReactNode;
}

const RenderPRRFields: FC<any> = ({ mineGuid }) => {
  const dispatch = useDispatch();
  const dropdownPermitConditionCategoryOptions = useSelector(
    getDropdownPermitConditionCategoryOptions
  );
  const permits = useSelector(getPermits);
  const permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
  const [loaded, setLoaded] = useState(permits.length > 0);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchPermits(mineGuid)).then(() => setLoaded(true));
    }
  });

  return (
    <>
      <Typography.Title level={5}>Select permit condition category</Typography.Title>
      <Typography.Paragraph>
        Newer regional permits have sections A to E, which are the same categories shown for
        permit-required report. If your permit does not contain the categories below, select the
        most fitting category. If you are unsure about category selection, please contact the
        permitting inspector or your regional office for assistance.
      </Typography.Paragraph>
      <Col md={12} sm={24}>
        <Field
          name="permit_guid"
          label="Permit Number"
          required
          validate={[required]}
          data={permitDropdown}
          component={RenderSelect}
        />
      </Col>
      <Field
        name="permit_condition_category_code"
        required
        validate={[required]}
        label="Permit Condition Category"
        component={RenderRadioButtons}
        customOptions={dropdownPermitConditionCategoryOptions}
      />
    </>
  );
};

const ReportGetStarted: FC<ReportGetStartedProps> = ({
  setSelectedReportDefinition,
  selectedReportDefinition,
  mine,
  handleSubmit,
  formButtons,
}) => {
  const formValues = useSelector(getFormValues(FORM.VIEW_EDIT_REPORT));
  const [commonReportDefinitionOptions, setCommonReportDefinitionOptions] = useState([]);
  const [formattedMineReportDefinitionOptions, setFormattedMineReportDefinitionOptions] = useState(
    []
  );
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);

  useEffect(() => {
    // Format the mine report definition options for the search bar
    const newFormattedMineReportDefinitionOptions = mineReportDefinitionOptions
      .map((report) => {
        return {
          label: formatComplianceCodeReportName(report),
          value: report.mine_report_definition_guid,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    setFormattedMineReportDefinitionOptions(
      uniqBy(newFormattedMineReportDefinitionOptions, "value")
    );

    // Filter out common reports and sort alphabetically
    const commonReportDefinitions = mineReportDefinitionOptions
      .filter((report) => report.is_common)
      .sort((a, b) => a.report_name.localeCompare(b.report_name));
    setCommonReportDefinitionOptions(commonReportDefinitions);
  }, [mineReportDefinitionOptions]);

  const handleChange = (newValue: string) => {
    // Set the selected report definition to be displayed and used in the next step
    const newReport = mineReportDefinitionOptions.find(
      (report) => report.mine_report_definition_guid === newValue
    );
    setSelectedReportDefinition(newReport);
  };

  return (
    <FormWrapper
      name={FORM.VIEW_EDIT_REPORT}
      onSubmit={handleSubmit}
      reduxFormConfig={{ destroyOnUnmount: false }}
    >
      <div>
        <Typography.Title level={3}>Getting Started with your Report Submission</Typography.Title>
        <Typography.Paragraph>
          The Province is committed to ensuring that B.C. remains a leader in mining regulation and
          oversight, while enhancing responsible resource development and strengthening First
          Nations involvement in the B.C.&apos;s mining sector. Find more guidance and related
          documents{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia/health-safety-reclamation-code-guidance?keyword=code&keyword=required&keyword=report"
          >
            here
          </a>
          .
        </Typography.Paragraph>
        <Typography.Title level={5}>What type of report are you submitting today?</Typography.Title>
        {mine.major_mine_ind && (
          <Alert
            description={
              <>
                Please note that the Major Mines Office (MMO) is currently unable to receive
                permit-required reports through MineSpace. You must submit your permit-required
                report to the MMO general intake inbox at {MMO_EMAIL}. Please request assistance for
                transferring large files by contacting{" "}
                <a href={`mailto:${MMO_EMAIL}`}>{MMO_EMAIL}</a>
              </>
            }
            type="warning"
            showIcon
            className="margin-small--bottom"
          />
        )}
        <Field
          name="report_type"
          component={RenderRadioButtons}
          props={{ isVertical: true }}
          validate={[requiredRadioButton]}
          customOptions={[
            {
              label: (
                <>
                  <b>{MINE_REPORTS_ENUM.CRR}</b>
                  <br />
                  Documents submitted pursuant to regulatory requirements established by the Health,
                  Safety and Reclamation Code for Mines in British Columbia (HSRC).
                </>
              ),
              value: "CRR",
            },
            {
              label: (
                <>
                  <b>{MINE_REPORTS_ENUM.PRR}</b>
                  <br />
                  Documents submitted pursuant to regulatory requirements established by conditions
                  in site-specific Mines Act permits.
                </>
              ),
              value: "PRR",
            },
          ]}
        />
        {formValues?.report_type === "PRR" && <RenderPRRFields mineGuid={mine.mine_guid} />}
        {formValues?.report_type === "CRR" && (
          <>
            <Typography.Title level={5}>
              Enter code section or choose from the submission list or select report type in the
              next step.
            </Typography.Title>
            <Typography.Paragraph>
              Quickly select a common report type or select another report type on the report
              details screen.
            </Typography.Paragraph>
            <Row gutter={24} className="margin-large--bottom">
              <Col span={12}>
                <div className="light-grey-border padding-md--sides">
                  <Typography.Paragraph strong className="margin-large--top">
                    Report Code Requirement
                  </Typography.Paragraph>
                  <Form layout="vertical">
                    <Form.Item label="Enter Code Section">
                      <Select
                        showSearch
                        onChange={handleChange}
                        filterOption={(input, option) =>
                          (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                        }
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        placeholder="10.4.1"
                        options={formattedMineReportDefinitionOptions}
                      />
                    </Form.Item>
                  </Form>
                  <Typography.Paragraph strong className="margin-large--top">
                    Common Reports
                  </Typography.Paragraph>
                  {commonReportDefinitionOptions.map((report) => (
                    <Row key={report.report_name}>
                      <Col span={24}>
                        <Button
                          onClick={() => setSelectedReportDefinition(report)}
                          type="text"
                          className="report-link"
                        >
                          <Typography.Text>{report.report_name}</Typography.Text>
                          <span className="margin-large--left">
                            <ArrowRightOutlined />
                          </span>
                        </Button>
                      </Col>
                    </Row>
                  ))}
                </div>
              </Col>
              <Col span={12}>
                <div className="report-info-box">
                  {selectedReportDefinition && (
                    <div>
                      <Typography.Title level={4}>You are submitting</Typography.Title>
                      <Typography.Title level={5}>
                        {formatComplianceCodeReportName(selectedReportDefinition)}
                      </Typography.Title>
                      <Typography.Paragraph>
                        {selectedReportDefinition.description}
                      </Typography.Paragraph>
                      <Typography.Title level={5}>About this submission type:</Typography.Title>
                      {selectedReportDefinition.compliance_articles[0].long_description && (
                        <Typography.Paragraph>
                          {selectedReportDefinition.compliance_articles[0].long_description}
                        </Typography.Paragraph>
                      )}
                      {selectedReportDefinition.compliance_articles[0].help_reference_link && (
                        <Button
                          target="_blank"
                          rel="noopener noreferrer"
                          href={selectedReportDefinition.compliance_articles[0].help_reference_link}
                          type="default"
                        >
                          More information <ExportOutlined />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
      {formButtons}
    </FormWrapper>
  );
};

export default ReportGetStarted;
