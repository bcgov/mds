import { Button, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Field, getFormValues, change } from "@mds/common/components/forms/form";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { IMine, IMineReportDefinition, IMineReportSubmission } from "@mds/common/interfaces";
import FormWrapper from "../forms/FormWrapper";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import { required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import RenderSelect from "../forms/RenderSelect";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { useParams } from "react-router-dom";
import {
  MINE_REPORTS_ENUM,
  MineReportType,
  REPORT_TYPE_CODES,
} from "@mds/common/constants/enums";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  getReportDefinitionsLoaded,
  reportParamsGetAll,
  fetchComplianceReports,
  getMineReportDefinitionByGuid,
  getFormattedMineReportDefinitionOptions,
} from "@mds/common/redux/slices/complianceReportsSlice";
import { CodeReportInfoBox } from "./ReportInfoBox";
import { RenderPRRFields } from "./PermitRequiredReportFields";

interface ReportGetStartedProps {
  mine: IMine;
  handleSubmit: (values: Partial<IMineReportSubmission>) => void;
  formButtons: ReactNode;
  setDisableNextButton?: (value: boolean) => void;
}

const ReportGetStarted: FC<ReportGetStartedProps> = ({
  mine,
  handleSubmit,
  formButtons,
  setDisableNextButton,
}) => {
  const dispatch = useAppDispatch();
  const { reportType } = useParams<{ reportType?: string }>();
  const system = useAppSelector(getSystemFlag);
  const formValues = useAppSelector(getFormValues(FORM.VIEW_EDIT_REPORT)) as IMineReportSubmission;
  const [commonReportDefinitionOptions, setCommonReportDefinitionOptions] = useState([]);
  const mineReportDefinitionOptions = useAppSelector(getFormattedMineReportDefinitionOptions);
  const selectedCodeReportDefinition: IMineReportDefinition = useAppSelector(
    getMineReportDefinitionByGuid(formValues?.mine_report_definition_guid)
  );
  const reportDefinitionsLoaded = useAppSelector(getReportDefinitionsLoaded(reportParamsGetAll));

  useEffect(() => {
    if (!reportDefinitionsLoaded) {
      dispatch(fetchComplianceReports(reportParamsGetAll));
    }
  }, []);

  useEffect(() => {
    if (selectedCodeReportDefinition?.is_prr_only) {
      setDisableNextButton(true);
    } else {
      setDisableNextButton(false);
    }
  }, [selectedCodeReportDefinition, setDisableNextButton]);

  useEffect(() => {
    // Filter out common reports and sort alphabetically
    const commonReportDefinitions = mineReportDefinitionOptions
      .filter((report) => report.is_common)
      .sort((a, b) => a.report_name.localeCompare(b.report_name));
    setCommonReportDefinitionOptions(commonReportDefinitions);
  }, [mineReportDefinitionOptions]);

  const handleReportDefinitionChange = (newValue: string) => {
    dispatch(change(FORM.VIEW_EDIT_REPORT, "mine_report_definition_guid", newValue));
  };

  return (
    <FormWrapper
      name={FORM.VIEW_EDIT_REPORT}
      onSubmit={handleSubmit}
      reduxFormConfig={{ destroyOnUnmount: false, enableReinitialize: true }}
      initialValues={{
        report_type: reportType ? MineReportType[reportType] : REPORT_TYPE_CODES.CRR,
      }}
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
              value: REPORT_TYPE_CODES.CRR,
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
              value: REPORT_TYPE_CODES.PRR,
            },
          ]}
        />
        {formValues?.report_type === REPORT_TYPE_CODES.PRR && (
          <RenderPRRFields mineGuid={mine.mine_guid} />
        )}
        {formValues?.report_type === REPORT_TYPE_CODES.CRR && (
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
                <div className="light-grey-border">
                  <Field
                    name="mine_report_definition_guid"
                    placeholder="Enter a code section or report name"
                    required
                    validate={[required]}
                    props={{
                      label: (
                        <Typography.Title level={5} style={{ display: "inline" }}>
                          Report Code Requirement
                        </Typography.Title>
                      ),
                      labelSubtitle:
                        "Search for a code section or the report name you would like to submit",
                      data: mineReportDefinitionOptions,
                    }}
                    component={RenderSelect}
                  />
                  <Typography.Paragraph
                    strong
                    className="margin-large--top"
                    style={{ marginBottom: 0 }}
                  >
                    Common Reports
                  </Typography.Paragraph>
                  {commonReportDefinitionOptions.map((report) => (
                    <Row key={report.report_name}>
                      <Col span={24}>
                        <Button
                          onClick={() => handleReportDefinitionChange(report.value)}
                          type="text"
                          className="report-link btn-sm-padding"
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
                <CodeReportInfoBox
                  mineReportDefinition={selectedCodeReportDefinition}
                  verb="submitting"
                />
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
