import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button } from "antd";
import Callout from "@/components/common/Callout";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IAuthorizationSummaryColumn } from "@mds/common/interfaces";

import {
  getDropdownProjectSummaryPermitTypes,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ColumnsType } from "antd/es/table";

export const ProjectDescriptionTab = () => {
  const history = useHistory();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);
  const [otherLegislationActData, setOtherLegislationActData] = useState([]);
  const permits = useSelector(getPermits);
  const project = useSelector(getProject);
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const notApplicableText = "N/A";
  const failedSubmissionStatus = "Failed";

  let processedOtherActPermitResult: any[] = [];

  const minesActColumns: ColumnsType<IAuthorizationSummaryColumn> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Permit", false),
    renderTextColumn("status", "Status", false),
  ];

  const otherActColumns: ColumnsType<IAuthorizationSummaryColumn> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Authorization", false),
    renderTextColumn("ams_tracking_number", "Tracking #", false),
    renderTextColumn("status", "Status ", false),
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
    const result = [];
    const submissionStatus = "Submitted";
    authorizations.forEach((authorization) => {
      if (
        authorization.ams_status_code === "400" &&
        authorization.project_summary_authorization_type === "MINES_ACT_PERMIT"
      ) {
        const projectType = parseProjectTypeLabel(authorization?.project_summary_permit_type[0]);
        if (authorization?.project_summary_permit_type[0] === "AMENDMENT") {
          result.push({
            project_type: projectType,
            permit_no: getPermitNumber(authorization?.existing_permits_authorizations[0]),
            status: submissionStatus,
          });
        } else {
          result.push({
            project_type: projectType,
            permit_no: notApplicableText,
            status: submissionStatus,
          });
        }
      }
    });
    setMinesActData(result);
  };

  const processOtherActAuthorizations = (
    authorizations: any[],
    permitAuthorizationType: string,
    projectSummaryAuthorizationType: string
  ) => {
    authorizations.forEach((authorization) => {
      if (
        authorization.ams_status_code === "400" &&
        authorization.project_summary_authorization_type === projectSummaryAuthorizationType
      ) {
        const permitTypeLabel = parseProjectTypeLabel(
          authorization?.project_summary_permit_type[0]
        );
        const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
          permitAuthorizationType,
          projectSummaryAuthorizationType
        )} - ${permitTypeLabel}`;
        if (authorization?.project_summary_permit_type[0] === "AMENDMENT") {
          processedOtherActPermitResult.push({
            project_type: projectType,
            permit_no: authorization?.existing_permits_authorizations[0],
            status: failedSubmissionStatus,
            ams_tracking_number: notApplicableText,
          });
        } else {
          processedOtherActPermitResult.push({
            project_type: projectType,
            permit_no: notApplicableText,
            status: failedSubmissionStatus,
            ams_tracking_number: notApplicableText,
          });
        }
      }
    });
  };

  const loadOtherActPermitData = (authorizations) => {
    processOtherActAuthorizations(
      authorizations,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "AIR_EMISSIONS_DISCHARGE_PERMIT"
    );
    processOtherActAuthorizations(
      authorizations,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "EFFLUENT_DISCHARGE_PERMIT"
    );
    processOtherActAuthorizations(
      authorizations,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "REFUSE_DISCHARGE_PERMIT"
    );
    processOtherActAuthorizations(
      authorizations,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "MUNICIPAL_WASTEWATER_REGULATION"
    );
    setEnvironmentalManagementActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];
    processOtherActAuthorizations(authorizations, "WATER_SUSTAINABILITY_ACT", "CHANGE_APPROVAL");
    processOtherActAuthorizations(authorizations, "WATER_SUSTAINABILITY_ACT", "USE_APPROVAL");
    processOtherActAuthorizations(authorizations, "WATER_SUSTAINABILITY_ACT", "WATER_LICENCE");
    setWaterSustainabilityActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];
    processOtherActAuthorizations(authorizations, "FORESTRY_ACT", "OCCUPANT_CUT_LICENCE");
    setForestryActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];

    processOtherActAuthorizations(authorizations, "OTHER_LEGISLATION", "OTHER");
    setOtherLegislationActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];
  };

  useEffect(() => {
    loadMinesActPermitData(project.project_summary.authorizations);
    loadOtherActPermitData(project.project_summary.authorizations);
  }, [
    project.project_summary.authorizations,
    transformedProjectSummaryAuthorizationTypes,
    dropdownProjectSummaryPermitTypes,
  ]);

  console.log("project:", project);

  return (
    <>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Typography.Title level={4}>Project Description Overview</Typography.Title>
            </Col>
            <Col>
              <Button type="primary">{"View Project Description Details"}</Button>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Typography.Paragraph>
            {`Below are the authorization submissions and their status in the project description. Both the Major Mines Office and Ministry of Environments reviews must be completed for this
           stage to be considered complete.`}
          </Typography.Paragraph>
          <Callout
            style={{ marginTop: 0 }}
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
          <CoreTable dataSource={environmentalManagementActData} columns={otherActColumns} />
          <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
          <CoreTable dataSource={waterSustainabilityActData} columns={otherActColumns} />
          <Typography.Title level={5}>Forestry Act</Typography.Title>
          <CoreTable dataSource={forestryActData} columns={otherActColumns} />
          <Typography.Title level={5}>Other Legislation</Typography.Title>
          <CoreTable dataSource={otherLegislationActData} columns={otherActColumns} />
        </Col>
      </Row>
    </>
  );
};
export default ProjectDescriptionTab;
