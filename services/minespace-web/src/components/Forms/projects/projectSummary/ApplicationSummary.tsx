import { FORM } from "@mds/common";
import React, { FC, useEffect, useState } from "react";
import { getFormValues } from "redux-form";
import { useSelector } from "react-redux";
import {
  getDropdownProjectSummaryPermitTypes,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getAmsAuthorizationTypes } from "@mds/common/redux/selectors/projectSelectors";

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
  const [otherLegislationData, setOtherLegislationData] = useState([]);

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

  const loadMinesActData = (payload) => {
    console.log("dropdownProjectSummaryPermitTypes", dropdownProjectSummaryPermitTypes);
    console.log(
      "transformedProjectSummaryAuthorizationTypes",
      transformedProjectSummaryAuthorizationTypes
    );
    console.log("amsAuthTypes", amsAuthTypes);
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
  console.log("minesActData", minesActData);

  const loadEnvironmentalManagementActData = (payload) => {
    const result: any[] = [];
    if (payload?.EFFLUENT_DISCHARGE_PERMIT) {
      if (payload.EFFLUENT_DISCHARGE_PERMIT?.AMENDMENT) {
        for (let i = 0; i < payload.EFFLUENT_DISCHARGE_PERMIT.AMENDMENT.length; i++) {
          if (payload.EFFLUENT_DISCHARGE_PERMIT.types[i] === "AMENDMENT") {
            result.push({
              project_type: parseTransformedProjectSummaryAuthorizationTypes(
                "ENVIRONMENTAL_MANAGMENT_ACT",
                "EFFLUENT_DISCHARGE_PERMIT"
              ),
              permit_no:
                payload.EFFLUENT_DISCHARGE_PERMIT.AMENDMENT[i].existing_permits_authorizations[0],
            });
          }
        }
      }
    }
    console.log("result", result);
  };

  console.log("minesActData", minesActData);
  console.log("environmentalManagementActData", environmentalManagementActData);

  useEffect(() => {
    loadMinesActData(formValues.authorizations);
    loadEnvironmentalManagementActData(formValues.authorizations);
  }, [formValues, transformedProjectSummaryAuthorizationTypes, dropdownProjectSummaryPermitTypes]);

  return <></>;
};
