import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Alert, Badge } from "antd";
import Callout from "@mds/common/components/common/Callout";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector } from "react-redux";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IAuthorizationSummary } from "@mds/common/interfaces";
import { Link, useHistory } from "react-router-dom";

import {
  getDropdownProjectSummaryPermitTypes,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ColumnsType } from "antd/es/table";

import { formatDateTimeTz } from "@mds/common/redux/utils/helpers";

export const ProjectDescriptionTab = () => {
  const history = useHistory();
  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);

  const permits = useSelector(getPermits);
  const project = useSelector(getProject);
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const notApplicableText = "N/A";

  let processedOtherActPermitResult: any[] = [];

  const createStatusColumn = (text: string) => ({
    key: text,
    title: "Status",
    render: () => <Badge status={"error"} text={text} />,
  });

  const minesActStatusColumn = createStatusColumn("Submitted");
  const otherActStatusColumn = createStatusColumn("Failed");

  const minesActColumns: ColumnsType<IAuthorizationSummary> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Permit", false),
    renderTextColumn("date_submitted", "Date", false),
    minesActStatusColumn,
  ];

  const otherActColumns: ColumnsType<IAuthorizationSummary> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Authorization", false),
    renderTextColumn("ams_tracking_number", "Tracking #", false),
    renderTextColumn("date_submitted", "Date", false),
    otherActStatusColumn,
  ];

  const parseProjectTypeLabel = (authType: string) => {
    const projectType = dropdownProjectSummaryPermitTypes.find((x) => x.value === authType);
    return projectType?.label;
  };

  const parseTransformedProjectSummaryAuthorizationTypes = (
    projectSummaryPermitType: string,
    authType: string
  ) => {
    const projectType = transformedProjectSummaryAuthorizationTypes.find(
      (x: any) => x.code === projectSummaryPermitType
    );

    const jobType = projectType?.children.find((x: any) => x.code === authType);
    return jobType?.description;
  };

  const getPermitNumber = (permit_guid: string): string => {
    const permit = permits.find(({ permit_guid: id }) => id === permit_guid);
    return permit?.permit_no ?? notApplicableText;
  };

  const loadMinesActPermitData = (authorizations) => {
    const result = authorizations
      .filter(
        (authorization) => authorization.project_summary_authorization_type === "MINES_ACT_PERMIT"
      )
      .map((authorization) => {
        const dateSubmitted = formatDateTimeTz(authorization.ams_submission_timestamp);
        const projectType = parseProjectTypeLabel(authorization?.project_summary_permit_type[0]);
        const permitNo =
          authorization?.project_summary_permit_type[0] === "AMENDMENT"
            ? getPermitNumber(authorization?.existing_permits_authorizations[0])
            : notApplicableText;
        const projectSummaryAuthorizationGuid = authorization?.project_summary_authorization_guid;

        return {
          project_type: projectType,
          permit_no: permitNo,
          date_submitted: dateSubmitted,
          project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        };
      });

    setMinesActData(result);
  };

  const processOtherActAuthorization = (
    authorization,
    permitAuthorizationType,
    projectSummaryAuthorizationType
  ) => {
    if (
      authorization.ams_status_code === "400" &&
      authorization.project_summary_authorization_type === projectSummaryAuthorizationType
    ) {
      const dateSubmitted = formatDateTimeTz(authorization.ams_submission_timestamp);
      const permitTypeLabel = parseProjectTypeLabel(authorization.project_summary_permit_type[0]);
      const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
        permitAuthorizationType,
        projectSummaryAuthorizationType
      )} - ${permitTypeLabel}`;
      const permitNo =
        authorization.project_summary_permit_type[0] === "AMENDMENT"
          ? authorization.existing_permits_authorizations[0]
          : notApplicableText;
      const projectSummaryAuthorizationGuid = authorization?.project_summary_authorization_guid;

      return {
        project_type: projectType,
        permit_no: permitNo,
        ams_tracking_number: notApplicableText,
        date_submitted: dateSubmitted,
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
      };
    }
    return null;
  };

  const processOtherActAuthorizations = (
    authorizations,
    permitAuthorizationType,
    projectSummaryAuthorizationType
  ) => {
    const filteredResults = authorizations
      .map((authorization) =>
        processOtherActAuthorization(
          authorization,
          permitAuthorizationType,
          projectSummaryAuthorizationType
        )
      )
      .filter(Boolean);
    processedOtherActPermitResult.push(...filteredResults);
  };

  const processAndSetData = (authorizations, types, actType, setData) => {
    types.forEach((type) => {
      processOtherActAuthorizations(authorizations, actType, type);
    });
    setData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];
  };

  const loadOtherActPermitData = (authorizations) => {
    const environmentalManagementActTypes = [
      "AIR_EMISSIONS_DISCHARGE_PERMIT",
      "EFFLUENT_DISCHARGE_PERMIT",
      "REFUSE_DISCHARGE_PERMIT",
      "MUNICIPAL_WASTEWATER_REGULATION",
    ];
    const waterSustainabilityActTypes = ["CHANGE_APPROVAL", "USE_APPROVAL", "WATER_LICENCE"];
    const forestryActTypes = ["OCCUPANT_CUT_LICENCE"];
    processAndSetData(
      authorizations,
      environmentalManagementActTypes,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      setEnvironmentalManagementActData
    );
    processAndSetData(
      authorizations,
      waterSustainabilityActTypes,
      "WATER_SUSTAINABILITY_ACT",
      setWaterSustainabilityActData
    );
    processAndSetData(authorizations, forestryActTypes, "FORESTRY_ACT", setForestryActData);
  };

  useEffect(() => {
    loadMinesActPermitData(project.project_summary.authorizations);
    loadOtherActPermitData(project.project_summary.authorizations);
  }, [
    project.project_summary.authorizations,
    transformedProjectSummaryAuthorizationTypes,
    dropdownProjectSummaryPermitTypes,
  ]);

  const handleViewProjectDescriptionClicked = () => {
    const projectGuid = project.project_guid;
    const projectSummaryGuid = project.project_summary_guid;
    const url = GLOBAL_ROUTES?.EDIT_PROJECT_SUMMARY.dynamicRoute(
      projectGuid,
      projectSummaryGuid,
      "purpose-and-authorization",
      false
    );
    history.push(url);
  };

  return (
    <>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Typography.Title level={4}>Project Description Overview</Typography.Title>
            </Col>
            <Col>
              <Button onClick={handleViewProjectDescriptionClicked} type="primary">
                {"View Project Description Details"}
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Typography.Paragraph>
            {`Below are the authorization submissions and their status in the project description. Both the Major Mines Office and Ministry of Environments reviews must be completed for this
           stage to be considered complete.`}
          </Typography.Paragraph>

          <Callout
            message={
              <div className="nod-callout">
                <h4>{"Submission Failed"}</h4>
                <p>
                  {
                    "One or more of your environment authorizations has not been submitted successfully. Please retry the submission."
                  }
                </p>
              </div>
            }
            severity={CALLOUT_SEVERITY.danger}
          />

          <Typography.Title level={3}>Submission Progress</Typography.Title>
          <Typography.Title level={4}>Major Mines Office</Typography.Title>
          <Typography.Title level={5}>Mines Act</Typography.Title>
          <CoreTable dataSource={minesActData} columns={minesActColumns} />
          <Typography.Title level={4}>Ministry of Environment</Typography.Title>
          <Typography.Title level={5}>Environmental Management Act</Typography.Title>
          {environmentalManagementActData?.length > 0 && (
            <Alert
              message={"Submission Failed Please Retry"}
              showIcon
              type="error"
              description={
                "One or more of your environment authorization application has not been submitted successfully. Please retry the submission."
              }
              action={
                <Link to={GLOBAL_ROUTES.ADD_PROJECT_SUMMARY.dynamicRoute(project.mine_guid)}>
                  <Button>Retry Failed Submission</Button>
                </Link>
              }
              style={{ marginBottom: "12px" }}
            />
          )}
          <CoreTable
            rowKey="project_summary_authorization_guid"
            dataSource={environmentalManagementActData}
            columns={otherActColumns}
          />
          <br />
          <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
          <CoreTable
            rowKey="project_summary_authorization_guid"
            dataSource={waterSustainabilityActData}
            columns={otherActColumns}
          />
          <br />
          <Typography.Title level={5}>Forestry Act</Typography.Title>
          <CoreTable dataSource={forestryActData} columns={otherActColumns} />
        </Col>
      </Row>
    </>
  );
};
export default ProjectDescriptionTab;
