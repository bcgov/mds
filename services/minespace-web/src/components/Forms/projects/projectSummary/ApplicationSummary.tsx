import { FORM } from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { getFormValues } from "redux-form";
import { useSelector } from "react-redux";
import {
  getDropdownProjectSummaryPermitTypes,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getAmsAuthorizationTypes } from "@mds/common/redux/selectors/projectSelectors";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import CoreTable from "@mds/common/components/common/CoreTable";
import { ColumnsType } from "antd/es/table";

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
  const amsAuthTypes = useSelector(getAmsAuthorizationTypes);

  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);
  const [otherLegislationActData, setOtherLegislationActData] = useState([]);

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
      const types = payload[permitType].types;
      for (let i = 0; i < payload[permitType].AMENDMENT.length; i++) {
        const permit = payload[permitType].AMENDMENT[i];
        const type = types[i];
        const permitTypeLabel = parseProjectTypeLabel(type);
        const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
          permitAuthorizationType,
          permitType
        )} - ${permitTypeLabel}`;

        if (type === "AMENDMENT") {
          processedEnvironmentActPermitResult.push({
            project_type: projectType,
            permit_no: permit.existing_permits_authorizations?.[0] || "N/A",
          });
        } else if (type === "NEW") {
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

  return (
    <>
      <CoreTable dataSource={minesActData} columns={minesActColumns} />
      <CoreTable dataSource={environmentalManagementActData} columns={otherActColumns} />
      <CoreTable dataSource={waterSustainabilityActData} columns={otherActColumns} />
      <CoreTable dataSource={forestryActData} columns={otherActColumns} />
      <CoreTable dataSource={otherLegislationActData} columns={otherActColumns} />
    </>
  );
};
