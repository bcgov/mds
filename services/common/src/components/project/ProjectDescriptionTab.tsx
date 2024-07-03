import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Alert, Badge } from "antd";
import Callout from "@mds/common/components/common/Callout";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector, useDispatch } from "react-redux";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IAuthorizationSummary } from "@mds/common/interfaces";
import { useHistory } from "react-router-dom";

import {
  getDropdownProjectSummaryPermitTypes,
  getProjectSummaryAuthorizationTypesArray,
  getTransformedProjectSummaryAuthorizationTypes,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { ColumnsType } from "antd/es/table";

import { formatDateTimeTz } from "@mds/common/redux/utils/helpers";

import { PresetStatusColorType } from "antd/es/_util/colors";

import {
  updateProjectSummary,
  fetchProjectById,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { isArray } from "lodash";
import { removeNullValuesRecursive } from "@mds/common/constants/utils";
import Loading from "@mds/common/components/common/Loading";

export const ProjectDescriptionTab = () => {
  const [shouldDisplayRetryButton, setShouldDisplayRetryButton] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(true);

  const permits = useSelector(getPermits);
  const project = useSelector(getProject);
  const transformedProjectSummaryAuthorizationTypes = useSelector(
    getTransformedProjectSummaryAuthorizationTypes
  );
  const dropdownProjectSummaryPermitTypes = useSelector(getDropdownProjectSummaryPermitTypes);
  const projectSummaryAuthorizationTypesArray = useSelector(
    getProjectSummaryAuthorizationTypesArray
  );

  const notApplicableText = "N/A";

  let processedOtherActPermitResult: any[] = [];

  const createStatusColumn = (text: string, badgeStatus: PresetStatusColorType) => ({
    key: text,
    title: "Status",
    render: () => <Badge status={badgeStatus} text={text} />,
  });

  const createStatusBadge = (text: string, badgeStatus: PresetStatusColorType) => ({
    status: badgeStatus,
    text: text,
  });

  const statusColumn = {
    key: "status",
    title: "Status",
    render: (record) => <Badge status={record.status.status} text={record.status.text} />,
  };

  const minesActStatusColumn = createStatusColumn("Submitted", "success");

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
    statusColumn,
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
      (authorization.ams_status_code === "400" || authorization.ams_status_code === "500") &&
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

      let status = createStatusBadge("Rejected", "error");
      if (authorization.ams_status_code === "500") {
        status = createStatusBadge("Failed", "error");
        setShouldDisplayRetryButton(true);
      }

      return {
        project_type: projectType,
        permit_no: permitNo,
        ams_tracking_number: notApplicableText,
        date_submitted: dateSubmitted,
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        status: status,
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
    const url = GLOBAL_ROUTES?.EDIT_PROJECT_SUMMARY.dynamicRoute(
      project.project_summary.project_guid,
      project.project_summary.project_summary_guid,
      "purpose-and-authorization",
      false
    );
    history.push(url);
  };

  const transformAuthorizations = (valuesFromForm: any) => {
    const { authorizations = {}, project_summary_guid } = valuesFromForm;

    const transformAuthorization = (type, authorization) => {
      return { ...authorization, project_summary_authorization_type: type, project_summary_guid };
    };

    let updatedAuthorizations = [];
    let newAmsAuthorizations = [];
    let amendAmsAuthorizations = [];

    projectSummaryAuthorizationTypesArray.forEach((type) => {
      const authsOfType = authorizations[type];
      if (authsOfType) {
        if (isArray(authsOfType)) {
          const formattedAuthorizations = authsOfType.map((a) => {
            return transformAuthorization(type, a);
          });
          updatedAuthorizations = updatedAuthorizations.concat(formattedAuthorizations);
        } else {
          newAmsAuthorizations = newAmsAuthorizations.concat(
            authsOfType?.NEW.map((a) =>
              transformAuthorization(type, {
                ...a,
                project_summary_permit_type: ["NEW"],
              })
            )
          );
          amendAmsAuthorizations = amendAmsAuthorizations.concat(
            authsOfType?.AMENDMENT.map((a) =>
              transformAuthorization(type, {
                ...a,
                project_summary_permit_type: ["AMENDMENT"],
              })
            )
          );
        }
      }
    });
    return {
      authorizations: updatedAuthorizations,
      ams_authorizations: { amendments: amendAmsAuthorizations, new: newAmsAuthorizations },
    };
  };

  const handleTransformPayload = (payload: any) => {
    let payloadValues: any = {};
    const updatedAuthorizations = transformAuthorizations(payload);
    const values = removeNullValuesRecursive(payload);
    payloadValues = {
      ...values,
      ...updatedAuthorizations,
    };
    delete payloadValues.authorizationTypes;
    return payloadValues;
  };

  /* Transforms project summary authorizations to match the
   *  shape of project summary authorization form values.
   */
  const transformProjectSummaryAuthorizations = (input) => {
    const output: any = {};
    input.forEach((authorization) => {
      const authType = authorization.project_summary_authorization_type;

      if (!output[authType]) {
        output[authType] = { types: [], AMENDMENT: [], NEW: [] };
      }

      authorization.project_summary_permit_type.forEach((permitType) => {
        if (!output[authType].types.includes(permitType)) {
          output[authType].types.push(permitType);
        }
        if (permitType === "AMENDMENT") {
          if (!authorization.amendment_changes) {
            authorization.amendment_changes = [];
          }
          output[authType].AMENDMENT.push(authorization);
          if (!output[authType].NEW) {
            output[authType].NEW = [];
          }
        } else if (permitType === "NEW") {
          output[authType].NEW.push(authorization);
          if (!output[authType].AMENDMENT) {
            output[authType].AMENDMENT = [];
          }
        }
      });
    });

    if (output.MINES_ACT_PERMIT) {
      output.MINES_ACT_PERMIT = input.filter(
        (auth) => auth.project_summary_authorization_type === "MINES_ACT_PERMIT"
      );
    }

    return output;
  };

  const handleRetryAMSSubmissionClicked = async () => {
    setIsLoaded(false);

    try {
      const transformedAuthorizations = transformProjectSummaryAuthorizations(
        project.project_summary.authorizations
      );
      const projectSummary = {
        ...project.project_summary,
        authorizations: transformedAuthorizations,
      };
      const payload = handleTransformPayload({
        ...projectSummary,
        ams_terms_agreed: true,
        confirmation_of_submission: true,
      });

      // Normalize contacts' addresses
      payload.contacts.forEach((contact) => {
        if (Array.isArray(contact.address)) {
          contact.address = contact.address.length === 0 ? null : contact.address.join(", ");
        }
      });

      // Normalize facility operator's address
      if (Array.isArray(payload.facility_operator.address)) {
        payload.facility_operator.address =
          payload.facility_operator.address.length === 0
            ? null
            : payload.facility_operator.address[0];
      }
      await dispatch(
        updateProjectSummary(
          {
            projectGuid: project.project_summary.project_guid,
            projectSummaryGuid: project.project_summary.project_summary_guid,
          },
          payload
        )
      );
      await dispatch(fetchProjectById(project.project_summary.project_guid));
      setIsLoaded(true);
    } catch (error) {
      setIsLoaded(true);
    }
  };

  return (
    <>
      {isLoaded ? (
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Row justify="space-between">
              <Col>
                <Typography.Title level={4}>Project Description Overview</Typography.Title>
              </Col>
              <Col>
                <Button onClick={handleViewProjectDescriptionClicked} type="primary">
                  View Project Description Details
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Typography.Paragraph>
              Below are the authorization submissions and their status in the project description.
              Both the Major Mines Office and Ministry of Environments reviews must be completed for
              this stage to be considered complete.
            </Typography.Paragraph>

            <Callout
              message={
                <div className="nod-callout">
                  <h4>Submission Failed</h4>
                  <p>
                    One or more of your environment authorization applications has not been
                    submitted successfully. Please retry the submission.
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
                message="Submission Failed Please Retry"
                showIcon
                type="error"
                description={`Your environment authorization application was not submitted successfully. Please retry the submission or start a new application for the rejected authorization(s). You can link the submission to the new application on the Related Projects page. One or more of your environment authorization application has not been submitted successfully. Please retry the submission.`}
                action={
                  shouldDisplayRetryButton ? (
                    <Button onClick={handleRetryAMSSubmissionClicked}>
                      Retry Failed Submission
                    </Button>
                  ) : null
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
      ) : (
        <Loading />
      )}
    </>
  );
};
export default ProjectDescriptionTab;
