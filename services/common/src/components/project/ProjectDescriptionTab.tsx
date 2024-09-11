import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Alert, Badge } from "antd";
import Callout from "@mds/common/components/common/Callout";
import {
  CALLOUT_SEVERITY,
  NOT_APPLICABLE,
  ENVIRONMENTAL_MANAGMENT_ACT,
  AMS_STATUS_CODES_SUCCESS,
  AMS_STATUS_CODE_ERROR,
  WASTE_DISCHARGE_AUTHORIZATION_PROCESS,
} from "@mds/common/constants/strings";
import {
  AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES,
  AMS_AUTHORIZATION_TYPES,
  AMS_MINES_ACT_TYPE,
  AMS_WATER_SUSTAINABILITY_ACT_TYPES,
  AMS_FORESTRY_ACT_TYPE,
} from "@mds/common/constants/enums";
import CoreTable from "@mds/common/components/common/CoreTable";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector, useDispatch } from "react-redux";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IAuthorizationSummary } from "@mds/common/interfaces";
import { useHistory, Link } from "react-router-dom";

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
import Loading from "@mds/common/components/common/Loading";
import { formatProjectPayload } from "@mds/common/utils/helpers";

const ProjectDescriptionTab = () => {
  const [shouldDisplayRetryButton, setShouldDisplayRetryButton] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const [minesActData, setMinesActData] = useState([]);
  const [environmentalManagementActData, setEnvironmentalManagementActData] = useState([]);
  const [waterSustainabilityActData, setWaterSustainabilityActData] = useState([]);
  const [forestryActData, setForestryActData] = useState([]);
  const [hasFailedAMSSubmission, setHasFailedAMSSubmission] = useState(false);
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

  let processedEnvironmentActPermitResult: any[] = [];

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

  const nonAMSStatusColumn = createStatusColumn("Submitted", AMS_STATUS_CODES_SUCCESS);

  const nonAMSActColumns: ColumnsType<IAuthorizationSummary> = [
    renderTextColumn("project_type", "Type", false),
    renderTextColumn("permit_no", "Permit", false),
    renderTextColumn("date_submitted", "Date", false),
    nonAMSStatusColumn,
  ];

  const amsActColumns: ColumnsType<IAuthorizationSummary> = [
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
    return permit?.permit_no ?? NOT_APPLICABLE;
  };

  const loadOtherActPermitData = (authorizations, authTypes, setData) => {
    const result = authorizations
      .filter((authorization) =>
        Object.values(authTypes).includes(authorization.project_summary_authorization_type)
      )
      .map((authorization) => {
        const dateSubmitted = formatDateTimeTz(authorization.ams_submission_timestamp);
        const projectType = authorization?.project_summary_permit_type.map((type) => (
          <div key={authorization.project_summary_authorization_guid}>
            {parseProjectTypeLabel(type)}
          </div>
        ));
        const permitNo =
          authorization?.project_summary_permit_type[0] === AMS_AUTHORIZATION_TYPES.AMENDMENT &&
          authorization?.existing_permits_authorizations
            ? getPermitNumber(authorization?.existing_permits_authorizations[0])
            : NOT_APPLICABLE;
        const projectSummaryAuthorizationGuid = authorization?.project_summary_authorization_guid;

        return {
          project_type: projectType,
          permit_no: permitNo,
          date_submitted: dateSubmitted,
          project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        };
      });

    setData(result);
  };

  const processEnvironmentalActAuthorization = (
    authorization,
    permitAuthorizationType,
    projectSummaryAuthorizationType
  ) => {
    if (
      (authorization?.ams_status_code === "400" ||
        authorization?.ams_status_code === "500" ||
        authorization?.ams_status_code === "200") &&
      authorization.project_summary_authorization_type === projectSummaryAuthorizationType
    ) {
      const dateSubmitted = formatDateTimeTz(authorization.ams_submission_timestamp);
      const permitTypeLabel = parseProjectTypeLabel(authorization.project_summary_permit_type[0]);
      const projectType = `${parseTransformedProjectSummaryAuthorizationTypes(
        permitAuthorizationType,
        projectSummaryAuthorizationType
      )} - ${permitTypeLabel}`;
      const permitNo =
        authorization?.project_summary_permit_type[0] === AMS_AUTHORIZATION_TYPES.AMENDMENT &&
        authorization?.existing_permits_authorizations
          ? authorization?.existing_permits_authorizations[0]
          : NOT_APPLICABLE;
      const projectSummaryAuthorizationGuid = authorization?.project_summary_authorization_guid;
      const amsTrackingNumber =
        authorization?.ams_tracking_number && authorization?.ams_tracking_number !== "0"
          ? authorization?.ams_tracking_number
          : NOT_APPLICABLE;

      let status = createStatusBadge("Rejected", AMS_STATUS_CODE_ERROR);
      if (authorization?.ams_status_code === "500") {
        status = createStatusBadge("Failed", AMS_STATUS_CODE_ERROR);
        setShouldDisplayRetryButton(true);
      } else if (authorization?.ams_status_code === "200") {
        status = createStatusBadge("Submitted", AMS_STATUS_CODES_SUCCESS);
      }

      return {
        project_type: projectType,
        permit_no: permitNo,
        ams_tracking_number: amsTrackingNumber,
        date_submitted: dateSubmitted,
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        status: status,
      };
    }
    return null;
  };

  const processEnvironmentalActAuthorizations = (
    authorizations,
    permitAuthorizationType,
    projectSummaryAuthorizationType
  ) => {
    const filteredResults = authorizations
      .map((authorization) =>
        processEnvironmentalActAuthorization(
          authorization,
          permitAuthorizationType,
          projectSummaryAuthorizationType
        )
      )
      .filter(Boolean);

    processedEnvironmentActPermitResult.push(...filteredResults);
  };

  const processAndSetData = (authorizations, types, actType, setData) => {
    Object.values(types).forEach((type) => {
      processEnvironmentalActAuthorizations(authorizations, actType, type);
    });

    const hasSubmissionErrors = processedEnvironmentActPermitResult.some(
      (fr) => fr.status.status !== AMS_STATUS_CODES_SUCCESS
    );
    setHasFailedAMSSubmission(hasSubmissionErrors);
    setData([...processedEnvironmentActPermitResult]);
    processedEnvironmentActPermitResult = [];
  };

  const loadEnvironmentActPermitData = (authorizations) => {
    processAndSetData(
      authorizations,
      AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES,
      ENVIRONMENTAL_MANAGMENT_ACT,
      setEnvironmentalManagementActData
    );
  };

  useEffect(() => {
    loadOtherActPermitData(
      project.project_summary.authorizations,
      AMS_MINES_ACT_TYPE,
      setMinesActData
    );
    loadOtherActPermitData(
      project.project_summary.authorizations,
      AMS_WATER_SUSTAINABILITY_ACT_TYPES,
      setWaterSustainabilityActData
    );
    loadOtherActPermitData(
      project.project_summary.authorizations,
      AMS_FORESTRY_ACT_TYPE,
      setForestryActData
    );
    loadEnvironmentActPermitData(project.project_summary.authorizations);
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
        if (permitType === AMS_AUTHORIZATION_TYPES.AMENDMENT) {
          if (!authorization.amendment_changes) {
            authorization.amendment_changes = [];
          }
          output[authType].AMENDMENT.push(authorization);
          if (!output[authType].NEW) {
            output[authType].NEW = [];
          }
        } else if (permitType === AMS_AUTHORIZATION_TYPES.NEW) {
          output[authType].NEW.push(authorization);
          if (!output[authType].AMENDMENT) {
            output[authType].AMENDMENT = [];
          }
        }
      });
    });

    for (const authType in output) {
      if (!AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES[authType]) {
        output[authType] = input.filter(
          (auth) => auth.project_summary_authorization_type === authType
        );
      }
    }

    return output;
  };

  const handleTransformPayload = (valuesFromForm: any) => {
    return formatProjectPayload(valuesFromForm, { projectSummaryAuthorizationTypesArray });
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
          contact.address = contact.address.length === 0 ? null : contact.address[0];
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
          payload,
          null
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
                <Typography.Title level={2}>Project Description Overview</Typography.Title>
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

            {hasFailedAMSSubmission && (
              <Callout
                message={
                  <div className="nod-callout">
                    <h4>Submission Unsuccessful</h4>
                    <p>
                      One or more of your environment authorization applications has not been
                      submitted successfully. Please retry the submission.
                    </p>
                  </div>
                }
                severity={CALLOUT_SEVERITY.danger}
              />
            )}

            <Typography.Title level={3}>Submission Progress</Typography.Title>
            {minesActData.length > 0 && (
              <>
                <Typography.Title level={4}>Major Mines Office</Typography.Title>
                <Typography.Title level={5}>Mines Act</Typography.Title>
                <CoreTable
                  rowKey="project_summary_authorization_guid"
                  dataSource={minesActData}
                  columns={nonAMSActColumns}
                />
                <br />
              </>
            )}
            {waterSustainabilityActData.length > 0 && (
              <>
                <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
                <CoreTable
                  rowKey="project_summary_authorization_guid"
                  dataSource={waterSustainabilityActData}
                  columns={nonAMSActColumns}
                />
                <br />
              </>
            )}
            {forestryActData.length > 0 && (
              <>
                <Typography.Title level={5}>Forestry Act</Typography.Title>
                <CoreTable
                  rowKey="project_summary_authorization_guid"
                  dataSource={forestryActData}
                  columns={nonAMSActColumns}
                />
                <br />
              </>
            )}
            {environmentalManagementActData.length > 0 && (
              <>
                <Typography.Title level={4}>Ministry of Environment</Typography.Title>
                <Typography.Title level={5}>Environmental Management Act</Typography.Title>
                <Typography.Paragraph>
                  An Environmental Protection Officer will contact you once your application is
                  reviewed and accepted. In the meantime, to learn about the ministry’s structured
                  application process and timelines to get a waste discharge authorization, please
                  visit{" "}
                  <Link to={{ pathname: WASTE_DISCHARGE_AUTHORIZATION_PROCESS }} target="_blank">
                    The waste discharge authorization process
                  </Link>
                  .
                </Typography.Paragraph>
                {hasFailedAMSSubmission && (
                  <Alert
                    message="Submission Unsuccessful"
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
                  columns={amsActColumns}
                />
              </>
            )}
          </Col>
        </Row>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default ProjectDescriptionTab;
