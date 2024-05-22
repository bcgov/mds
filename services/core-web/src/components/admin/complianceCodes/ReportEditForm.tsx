import React from "react";
import { FieldArray, getFormValues } from "redux-form";
import { useSelector } from "react-redux";
import { Row, Col, Typography, Button, Collapse, Popconfirm } from "antd";
import { IComplianceArticle } from "@mds/common";
import { ReportDefinitionFieldSelect } from "@mds/common/components/reports/ReportDefinitionFieldSelect";
import { ReportInfoBox } from "@mds/common/components/reports/ReportGetStarted";
import * as FORM from "@/constants/forms";
import { TRASHCAN } from "@/constants/assets";
import { getMineReportDefinitionOptions } from "@mds/common/redux/selectors/staticContentSelectors";

export interface ReportEditProps {
  complianceCodes: IComplianceArticle[];
  isEditMode: boolean;
}

export const ReportEditForm = (props: ReportEditProps) => {
  const formValues = useSelector(getFormValues(FORM.ADD_COMPLIANCE_CODE));
  const mineReportDefinitionOptions = useSelector(getMineReportDefinitionOptions);

  const renderPanelHeader = (fields, index, isEditMode) => {
    return (
      <Row justify="space-between">
        <Typography.Text className="purple" strong>
          Code Required Report
        </Typography.Text>

        {isEditMode ? (
          <div onClick={(event) => event.stopPropagation()}>
            <Popconfirm
              placement="topRight"
              title={`Are you sure you want to remove CRR ${index + 1}?`}
              onConfirm={() => fields.remove(index)}
              okText="Yes"
              cancelText="No"
            >
              <Button ghost size="small" style={{ margin: 0 }}>
                <img src={TRASHCAN} alt="Remove Code Required Report" />
              </Button>
            </Popconfirm>
          </div>
        ) : (
          ""
        )}
      </Row>
    );
  };

  const renderReports = ({ fields }) => (
    <Row style={{ width: "100%" }}>
      {fields.map((report, index) => {
        const reportData = formValues.reports && formValues.reports[index];
        const reportDefinition =
          mineReportDefinitionOptions?.find(
            (d) => d?.mine_report_definition_guid === reportData.mine_report_definition_guid
          ) || {};
        const reportWCompliance = {
          ...reportDefinition,
          compliance_articles: [formValues],
        };

        return (
          <Collapse
            key={index}
            className="magazine-collapse margin-large--bottom"
            style={{ width: "100%" }}
            defaultActiveKey={0}
          >
            <Collapse.Panel
              header={renderPanelHeader(fields, index, props.isEditMode)}
              className="magazine-collapse"
              showArrow={false}
              key={index}
            >
              <Row style={{ width: "100%" }}>
                <Col span="24">
                  <>
                    <ReportDefinitionFieldSelect
                      id={`${report}.mine_report_definition_guid`}
                      label="Report Name"
                      required={true}
                      name={`${report}.mine_report_definition_guid`}
                    />
                  </>
                </Col>
                <Col span="24">
                  {reportData?.mine_report_definition_guid ? (
                    <ReportInfoBox mineReportDefinition={reportWCompliance} verb="requesting" />
                  ) : (
                    ""
                  )}
                </Col>
              </Row>
            </Collapse.Panel>
          </Collapse>
        );
      })}
      <Row gutter={[16, 16]} justify="end">
        {props.isEditMode ? (
          <Col span="24">
            <Button style={{ margin: 0 }} onClick={() => fields.unshift({})}>
              + Add Report
            </Button>
          </Col>
        ) : (
          ""
        )}
      </Row>
    </Row>
  );

  return (
    <Row className="form-row-margin" style={{ width: "100%" }}>
      <Col span="24">
        <Typography.Title level={4} className="field-title">
          Add Report
        </Typography.Title>
        <Typography.Paragraph>
          Select the Code Required Report(s) corresponding to the code. Once saved, they will be
          accessible to MineSpace users for Selection in <b>Incidents, Variances, Reports.</b>
        </Typography.Paragraph>
      </Col>
      <Col span={24}>
        <FieldArray props={{}} name="reports" component={renderReports} />
      </Col>
    </Row>
  );
};
