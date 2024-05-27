import { FORM } from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { getFormValues } from "redux-form";
import { useSelector } from "react-redux";
import {
  getDropdownProjectSummaryPermitTypes,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";

import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import CoreTable from "@mds/common/components/common/CoreTable";
import { ColumnsType } from "antd/es/table";
import { Button, Alert, Typography, Col, Row } from "antd";
import { EDIT_PROJECT_SUMMARY } from "@/constants/routes";
import { useHistory } from "react-router-dom";

interface IAuthorizationSummaryColumn {
  type: string;
  permit_no: string;
}

export const ApplicationSummary: FC = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );

  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);
  const [otherLegislationActData, setOtherLegislationActData] = useState([]);
  const history = useHistory();

  const processedEnvironmentActPermitResult: any[] = [];
  let processedOtherActPermitResult: any[] = [];

  const minesActColumns: ColumnsType<IAuthorizationSummaryColumn> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Permit", false),
  ];

  const otherActColumns: ColumnsType<IAuthorizationSummaryColumn> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Authorization", false),
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

  const loadMinesActPermitData = (payload) => {
    const result = [];
    if (payload?.MINES_ACT_PERMIT) {
      for (const permit of payload.MINES_ACT_PERMIT) {
        for (const projectType of permit.project_summary_permit_type) {
          result.push({
            project_type: parseProjectTypeLabel(projectType),
            permit_no: "N/A",
          });
        }
      }
    }
    setMinesActData(result);
  };

  const processEnvironmentActPermitAuthorizations = (
    payload: any,
    permitAuthorizationType: string,
    permitType: string
  ) => {
    if (payload?.[permitType]?.AMENDMENT) {
      for (let i = 0; i < payload[permitType].AMENDMENT.length; i++) {
        const permit = payload[permitType].AMENDMENT[i];
        const permitTypeLabel = parseProjectTypeLabel("AMENDMENT");
        const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
          permitAuthorizationType,
          permitType
        )} - ${permitTypeLabel}`;

        processedEnvironmentActPermitResult.push({
          project_type: projectType,
          permit_no: permit.existing_permits_authorizations?.[0],
        });
      }
    }
    const permitTypes = ["NEW", "CLOSURE", "OTHER"];

    for (const type of permitTypes) {
      if (payload?.[permitType]?.[type]) {
        for (let i = 0; i < payload[permitType][type].length; i++) {
          const permitTypeLabel = parseProjectTypeLabel(type);
          const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
            permitAuthorizationType,
            permitType
          )} - ${permitTypeLabel}`;
          processedEnvironmentActPermitResult.push({
            project_type: projectType,
            permit_no: "N/A",
          });
        }
      }
    }
  };

  const processOtherActPermitAuthorizations = (
    payload: any,
    permitAuthorizationType: string,
    permitType: string
  ) => {
    const permits = payload?.[permitType];

    if (permits?.[0]?.existing_permits_authorizations?.length) {
      permits[0].existing_permits_authorizations.forEach((authorization: string) => {
        const permitTypeLabel = parseProjectTypeLabel("AMENDMENT");
        const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
          permitAuthorizationType,
          permitType
        )} - ${permitTypeLabel}`;

        processedOtherActPermitResult.push({
          project_type: projectType,
          permit_no: authorization,
        });
      });
    }

    if (permits?.[0].project_summary_permit_type?.length) {
      permits[0].project_summary_permit_type.forEach((type: string) => {
        if (type !== "AMENDMENT") {
          const permitTypeLabel = parseProjectTypeLabel(type);
          const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
            permitAuthorizationType,
            permitType
          )} - ${permitTypeLabel}`;

          processedOtherActPermitResult.push({
            project_type: projectType,
            permit_no: "N/A",
          });
        }
      });
    }
  };

  const loadPermitData = (payload) => {
    processEnvironmentActPermitAuthorizations(
      payload,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "AIR_EMISSIONS_DISCHARGE_PERMIT"
    );
    processEnvironmentActPermitAuthorizations(
      payload,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "EFFLUENT_DISCHARGE_PERMIT"
    );
    processEnvironmentActPermitAuthorizations(
      payload,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "REFUSE_DISCHARGE_PERMIT"
    );
    processEnvironmentActPermitAuthorizations(
      payload,
      "ENVIRONMENTAL_MANAGMENT_ACT",
      "MUNICIPAL_WASTEWATER_REGULATION"
    );

    setEnvironmentalManagementActData(processedEnvironmentActPermitResult);

    processOtherActPermitAuthorizations(payload, "WATER_SUSTAINABILITY_ACT", "CHANGE_APPROVAL");
    processOtherActPermitAuthorizations(payload, "WATER_SUSTAINABILITY_ACT", "USE_APPROVAL");
    processOtherActPermitAuthorizations(payload, "WATER_SUSTAINABILITY_ACT", "WATER_LICENCE");
    setWaterSustainabilityActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];

    processOtherActPermitAuthorizations(payload, "FORESTRY_ACT", "OCCUPANT_CUT_LICENCE");
    setForestryActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];

    processOtherActPermitAuthorizations(payload, "OTHER_LEGISLATION", "OTHER");
    setOtherLegislationActData([...processedOtherActPermitResult]);
    processedOtherActPermitResult = [];
  };

  useEffect(() => {
    loadMinesActPermitData(formValues.authorizations);
    loadPermitData(formValues.authorizations);
  }, [formValues, transformedProjectSummaryAuthorizationTypes, dropdownProjectSummaryPermitTypes]);

  const handleEditClicked = () => {
    const projectGuid = formValues?.project_guid;
    const projectSummaryGuid = formValues?.project_summary_guid;
    const url = EDIT_PROJECT_SUMMARY.dynamicRoute(
      projectGuid,
      projectSummaryGuid,
      "purpose-and-authorization"
    );
    history.push(url);
  };

  return (
    <div className="ant-form-vertical">
      <Typography.Title level={3}>Application Summary</Typography.Title>
      <Typography.Paragraph>
        {
          "Let's review what you're submitting. These files are not reviewed as part of the submission."
        }
      </Typography.Paragraph>
      <Alert
        description="A fee may be requested from the ministries for the review of each permit or authorization. Incorrect authorization numbers will cause delays or rejection of the submission."
        type="warning"
        showIcon
      />
      <br />
      <Typography.Title level={4}>Major Mines Office</Typography.Title>
      <Row gutter={8}>
        <Col md={12} sm={24}>
          <Typography.Title level={5}>Mines Act</Typography.Title>
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button type="default" onClick={handleEditClicked}>
            Edit
          </Button>
        </Col>
      </Row>
      <CoreTable dataSource={minesActData} columns={minesActColumns} />
      <br />
      <Typography.Title level={4}>Ministry of Environment</Typography.Title>
      <Row gutter={8}>
        <Col md={12} sm={24}>
          <Typography.Title level={5}>Environmental Management Act</Typography.Title>
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button type="default" onClick={handleEditClicked}>
            Edit
          </Button>
        </Col>
      </Row>
      <CoreTable dataSource={environmentalManagementActData} columns={otherActColumns} />
      <br />
      <Row gutter={8}>
        <Col md={12} sm={24}>
          <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button type="default" onClick={handleEditClicked}>
            Edit
          </Button>
        </Col>
      </Row>
      <CoreTable dataSource={waterSustainabilityActData} columns={otherActColumns} />
      <br />
      <Row gutter={8}>
        <Col md={12} sm={24}>
          <Typography.Title level={5}>Forestry Act</Typography.Title>
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button type="default" onClick={handleEditClicked}>
            Edit
          </Button>
        </Col>
      </Row>
      <CoreTable dataSource={forestryActData} columns={otherActColumns} />
      <br />
      <Row gutter={8}>
        <Col md={12} sm={24}>
          <Typography.Title level={5}>Other Legislation</Typography.Title>
        </Col>
        <Col md={12} sm={24} style={{ textAlign: "right" }}>
          <Button type="default" onClick={handleEditClicked}>
            Edit
          </Button>
        </Col>
      </Row>
      <CoreTable dataSource={otherLegislationActData} columns={otherActColumns} />
    </div>
  );
};
