import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Field, getFormValues, change } from "@mds/common/components/forms/form";
import ArrowRightOutlined from "@ant-design/icons/ArrowRightOutlined";
import { useSelector, useDispatch } from "react-redux";
import { IMine, IMineReportDefinition, IMineReportPermitRequirement, IMineReportSubmission, IPermitAmendment, IPermitCondition, IPermitConditionCategory } from "@mds/common/interfaces";
import {
  createDropDownList,
  formatComplianceCodeReportName,
  formatDate,
} from "@mds/common/redux/utils/helpers";
import ExportOutlined from "@ant-design/icons/ExportOutlined";
import FormWrapper from "../forms/FormWrapper";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import { required, requiredRadioButton } from "@mds/common/redux/utils/Validate";
import RenderSelect from "../forms/RenderSelect";
import {
  getDropdownPermitConditionCategoryOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getCategoriesWithReports, getLatestAmendmentByPermitGuid, getMineReportPermitRequirementById, getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { useParams } from "react-router-dom";
import { MINE_REPORTS_ENUM, MineReportType, REPORT_TYPE_CODES, SystemFlagEnum } from "@mds/common/constants/enums";
import { FORM } from "@mds/common/constants/forms";
import { MMO_EMAIL} from "@mds/common/constants/strings";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { transformPermitReportRequirement } from "@mds/common/utils/helpers";
import { getReportDefinitionsLoaded, reportParamsGetAll, fetchComplianceReports, getMineReportDefinitionByGuid, getFormattedMineReportDefinitionOptions } from "@mds/common/redux/slices/complianceReportsSlice";

interface ReportGetStartedProps {
  mine: IMine;
  handleSubmit: (values: Partial<IMineReportSubmission>) => void;
  formButtons: ReactNode;
  setDisableNextButton?: (value: boolean) => void;
}

export const CodeReportInfoBox: FC<{ mineReportDefinition: IMineReportDefinition; verb: string }> = ({
  mineReportDefinition,
  verb,
}) => {
  return (
    <div className="report-info-box">
      {mineReportDefinition && (
        <div>
          {mineReportDefinition.is_prr_only && (
            <Alert
              showIcon
              description="Please submit this report as a permit required report."
              type="warning"
              className="margin-large--bottom"
            />
          )}
          <Typography.Title level={4} className="primary-colour">
            You are {verb}
          </Typography.Title>
          <Typography.Title level={5}>
            {formatComplianceCodeReportName(mineReportDefinition)}
          </Typography.Title>

          {mineReportDefinition.compliance_articles[0].long_description && (
            <>
              <Typography.Title level={5}>About this submission type:</Typography.Title>
              <Typography.Paragraph>
                {mineReportDefinition.compliance_articles[0].long_description}
              </Typography.Paragraph>
            </>
          )}
          {mineReportDefinition.compliance_articles[0].help_reference_link && (
            <Button
              target="_blank"
              rel="noopener noreferrer"
              href={mineReportDefinition.compliance_articles[0].help_reference_link}
              type="default"
            >
              More information <ExportOutlined />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const PermitReportInfoBox: FC<{ summary?: boolean, twoColumn?: boolean, getConditionHref?: () => string, permitReport: IMineReportPermitRequirement, verb: string }> = ({
  summary = false,
  twoColumn = false,
  getConditionHref,
  permitReport,
  verb,
}) => {

  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const transformedReport = transformPermitReportRequirement(permitReport);

  return (
    <div className={`${summary ? "report-summary-box" : "report-info-box"}`}>
      {transformedReport && (
        <div>
          <Typography.Title level={4} className="primary-colour">
            You are {verb}:
          </Typography.Title>
          <Typography.Title level={5}>
            {transformedReport.report_name}
          </Typography.Title>

          <Typography.Title level={5}>Condition:</Typography.Title>
          <Typography.Paragraph>
            {transformedReport.conditionName ?? "Not Specified"}
          </Typography.Paragraph>

          <Row>
            <Col span={twoColumn ? 12 : 24}>
              <Typography.Title level={5}>Frequency:</Typography.Title>
              <Typography.Paragraph>
                {transformedReport.frequency}
              </Typography.Paragraph>

              <Typography.Title level={5}>Due Date:</Typography.Title>
              <Typography.Paragraph>
                {transformedReport.initial_due_date ? formatDate(transformedReport.initial_due_date) : "Not Specified"}
              </Typography.Paragraph>
            </Col>
            <Col span={twoColumn ? 12 : 24}>
              <Typography.Title level={5}>Regulatory Authority:</Typography.Title>
              <Typography.Paragraph>
                {transformedReport.regulatory_authority}
              </Typography.Paragraph>

              <Typography.Title level={5}>Ministry Recipient:</Typography.Title>
              <Typography.Paragraph>
                {transformedReport.ministry_recipient}
              </Typography.Paragraph>
            </Col>
          </Row>

          { isCore && getConditionHref && ( <Button
              target="_blank"
              rel="noopener noreferrer"
              href={getConditionHref()}
              type="default"
            >
              View Permit Condition <ExportOutlined />
            </Button>
          )}
          
        </div>
      )}
    </div>
  );
};

export const ConditionCategories: FC<{permitGuid: string, formName: FORM}> = ({
  permitGuid,
  formName
}) => {

  const dispatch = useAppDispatch();
  const conditionCategories = useSelector( getCategoriesWithReports(permitGuid));

  function handleSelectedReportChange(value: any): void {
    dispatch(change(formName, "mine_report_permit_requirement_id", value));
  }

  return (
    <>
      { conditionCategories?.map((category) => (
        <div key={category.condition_category_code}>
          <Typography.Paragraph
            strong
            className="margin-large--top"
            style={{ marginBottom: 0 }}
          >
            {category.description}
          </Typography.Paragraph>

          { category.reports?.map((report) => (
            <Row key={report.report_name}>
              <Col span={24}>
                <Button
                  onClick={() => handleSelectedReportChange(report.mine_report_permit_requirement_id)}
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
    ))}
  </>
  )
}

export const PermitReportCodeRequirement: FC<{ permitGuid: string, amendment: IPermitAmendment, formValues: IMineReportSubmission, formName: FORM, summary?: boolean}> = ({
  permitGuid,
  amendment,
  formValues,
  summary = false,
  formName
}) => {

  const dispatch = useAppDispatch();
  const conditionCategories = useSelector( getCategoriesWithReports(permitGuid));
  const reports = amendment?.mine_report_permit_requirements;
  const reportOptions = createDropDownList(reports, "report_name", "mine_report_permit_requirement_id");

  //TODO need steps added to conditions

  const selectedReport = reports ? reports.find( report => report.mine_report_permit_requirement_id === formValues?.mine_report_permit_requirement_id) : null;
  const selectedCategory = selectedReport ? conditionCategories.find( cat => cat.condition_category_code === selectedReport?.condition_category_code) : null;
  //const selectedCondition = selectedReport ? findCondition(selectedReport.permit_condition_id, amendment.conditions) : null;

  useEffect( () => {
    if(selectedReport){
      dispatch(change(formName, "permit_condition_category_code", selectedCategory.condition_category_code));
    }
  }, [formValues.mine_report_permit_requirement_id])

  return (
    <Field
      name="mine_report_permit_requirement_id"
      placeholder="Enter code section number or report name"
      required
      validate={[required]}
      props={{
        label: summary ? "Report Code Requirement" : (
          <Typography.Title level={5} style={{ display: "inline" }}>
            Report Code Requirement
          </Typography.Title>
        ),
        labelSubtitle: summary ? "" :
          "Search for a code section or the report name you would like to submit.",
        data: reportOptions,
      }}
      component={RenderSelect}
    />
  )
}

export const RenderPRRFields: FC<{ mineGuid: string; fullWidth?: boolean, summary?: boolean, formName?: FORM }> = ({
  mineGuid,
  fullWidth = false,
  summary = false,
  formName = FORM.VIEW_EDIT_REPORT
}) => {
  const system = useSelector(getSystemFlag);
  const dispatch = useAppDispatch();
  const dropdownPermitConditionCategoryOptions = useSelector(
    getDropdownPermitConditionCategoryOptions
  );
  const permits = useSelector(getPermits);
  const permitDropdown = createDropDownList(permits, "permit_no", "permit_guid");
  const permitMineGuid = permits[0]?.mine_guid;
  const [loaded, setLoaded] = useState(permits.length > 0 && permitMineGuid === mineGuid);
  const isCore = system === SystemFlagEnum.core;

  const formValues = useSelector(getFormValues(formName)) as IMineReportSubmission;  
  const latestAmendment = useAppSelector(getLatestAmendmentByPermitGuid(formValues?.permit_guid));
  const hasValidatedReports = latestAmendment?.conditions_review_completed && latestAmendment?.mine_report_permit_requirements.length > 0;

  const selectedPermitReportDefinition = useSelector(
    getMineReportPermitRequirementById(formValues?.permit_guid,formValues?.mine_report_permit_requirement_id)
  )

  function getConditionHref(){
    return GLOBAL_ROUTES?.VIEW_MINE_PERMIT_AMENDMENT.hashRoute(
      mineGuid,
      formValues?.permit_guid,
      latestAmendment?.permit_amendment_guid,
      "conditions",
      "#"+selectedPermitReportDefinition?.condition_category_code
    ).toString()
  } 

  useEffect(() => {
    if (!loaded || permitMineGuid !== mineGuid) {
      setLoaded(false);
      dispatch(fetchPermits(mineGuid)).then(() => setLoaded(true));
    }
  }, [mineGuid]);

  return (
    <>
      {!isCore && (
        <>
          <Typography.Title level={5}>Select permit condition category</Typography.Title>
          <Typography.Paragraph>
            Newer regional permits have sections A to E, which are the same categories shown for
            permit-required report. If your permit does not contain the categories below, select the
            most fitting category. If you are unsure about category selection, please contact the
            permitting inspector or your regional office for assistance.
          </Typography.Paragraph>
        </>
      )}
      <Col md={!fullWidth && 12} sm={24}>
        <Field
          name="permit_guid"
          label="Permit Number"
          required
          validate={[required]}
          data={permitDropdown}
          component={RenderSelect}
        />
      </Col>

      {!isCore && !hasValidatedReports && (
        <Col span={24} className="radio-two-column-container">
          <Field
            name="permit_condition_category_code"
            required
            validate={[required]}
            label="Permit Condition Category"
            className="responsive-2-column"
            component={RenderRadioButtons}
            customOptions={dropdownPermitConditionCategoryOptions}
          />
        </Col>
      )}
      {isCore && !hasValidatedReports && (
        <Col md={!fullWidth && 12} sm={24}>
          <Field
            name="permit_condition_category_code"
            required
            validate={[required]}
            label="Permit Condition Category"
            component={RenderSelect}
            data={dropdownPermitConditionCategoryOptions}
          />
        </Col>
      )}
      {hasValidatedReports && summary && (
        <Col span={24}>
          <PermitReportCodeRequirement 
            amendment={latestAmendment}
            permitGuid={formValues?.permit_guid}
            formValues={formValues}
            formName={formName}
            summary={summary}
          />
        </Col>
      )}
      {hasValidatedReports && !summary && (
        <Row gutter={24} className="margin-large--bottom">
          <Col span={12}>
            <div className="light-grey-border">
              <PermitReportCodeRequirement 
                amendment={latestAmendment}
                permitGuid={formValues?.permit_guid}
                formValues={formValues}
                formName={formName}
              />
              <ConditionCategories
                formName={formName}
                permitGuid={formValues?.permit_guid}
              />
            </div>
          </Col>
          <Col span={12}>
              <PermitReportInfoBox getConditionHref={getConditionHref} permitReport={selectedPermitReportDefinition} verb="submitting"/>
          </Col>
        </Row>
      )}
    </>
  );
};

const ReportGetStarted: FC<ReportGetStartedProps> = ({
  mine,
  handleSubmit,
  formButtons,
  setDisableNextButton,
}) => {
  const dispatch = useDispatch();
  const { reportType } = useParams<{ reportType?: string }>();
  const system = useSelector(getSystemFlag);
  const formValues = useSelector(getFormValues(FORM.VIEW_EDIT_REPORT)) as IMineReportSubmission;
  const [commonReportDefinitionOptions, setCommonReportDefinitionOptions] = useState([]);
  const mineReportDefinitionOptions = useSelector(getFormattedMineReportDefinitionOptions);
  const selectedCodeReportDefinition: IMineReportDefinition = useSelector(
    getMineReportDefinitionByGuid(formValues?.mine_report_definition_guid)
  );
  const reportDefinitionsLoaded = useSelector(getReportDefinitionsLoaded(reportParamsGetAll));

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
        {system !== SystemFlagEnum.core &&
          mine.major_mine_ind &&
          formValues?.report_type === REPORT_TYPE_CODES.PRR && (
            <Alert
              description={
                <>
                  Please note that the Major Mines Office (MMO) is currently unable to receive
                  permit-required reports through MineSpace. You must submit your permit-required
                  report to the MMO general intake inbox at {MMO_EMAIL}. Please request assistance
                  for transferring large files by contacting{" "}
                  <a href={`mailto:${MMO_EMAIL}`}>{MMO_EMAIL}</a>
                </>
              }
              type="warning"
              showIcon
              className="margin-small--bottom"
            />
          )}
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
                <CodeReportInfoBox mineReportDefinition={selectedCodeReportDefinition} verb="submitting" />
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
