import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Button, Alert, Badge, Empty, List } from "antd";
import Callout from "@mds/common/components/common/Callout";
import {
  CALLOUT_SEVERITY,
  NOT_APPLICABLE,
  ENVIRONMENTAL_MANAGMENT_ACT,
  AMS_STATUS_CODES_SUCCESS,
  AMS_STATUS_CODE_ERROR,
  AMS_STATUS_CODE_WARNING,
  AMS_STATUS_CODE_DEFAULT,
  WASTE_DISCHARGE_AUTHORIZATION_PROCESS,
  AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT,
  AMS_AUTHORIZATION_TYPES_TEXT,
  AMS_APPROVED_STATUSES,
  AMS_WARNING_STATUSES,
  AMS_STOPPED_STATUSES
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
import { useSelector } from "react-redux";
import { useAppDispatch } from "@mds/common/redux/rootState";
import { openModal } from "@mds/common/redux/actions/modalActions";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { renderTextColumn, renderActionsColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { IAuthorizationSummary, IProjectSummaryAuthorization } from "@mds/common/interfaces";
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
  fetchProjectSummaryEnvironmentAuthorizationStatuses,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import Loading from "@mds/common/components/common/Loading";
import { formatProjectPayload } from "@mds/common/utils/helpers";
import ProjectCallout from "../projects/ProjectCallout";
import EnvironmentAuthorizationDocumentsModal from "../documents/EnvironmentAuthorizationDocumentsModal";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common/utils";

const ProjectDescriptionTab = () => {
  const { isFeatureEnabled } = useFeatureFlag();
  const amsFinalAppEnabled = isFeatureEnabled(Feature.AMS_FINAL_APPLICATION);
  const [shouldDisplayRetryButton, setShouldDisplayRetryButton] = useState(false);
  const dispatch = useAppDispatch();
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

  const openFinalApplication = (record: IProjectSummaryAuthorization) => {
    history.push(
      GLOBAL_ROUTES?.AMS_FINAL_APPLICATION.dynamicRoute(
        project.project_guid,
        project.project_summary.project_summary_guid,
        record.project_summary_authorization_guid
      )
    );
  };

  const actions = [
    {
      key: "view",
      label: "View ministry documents",
      clickFunction: (_event, record) => {
        dispatch(
          openModal({
            props: {
              title: "View Ministry Documents",
              documents: record.documents
            },
            content: EnvironmentAuthorizationDocumentsModal,
          })
        );
      },
    },
    amsFinalAppEnabled && {
      key: "final-app",
      label: "Manage Final Application",
      clickFunction: (_e, record) => openFinalApplication(record)
    }
  ].filter(Boolean);

  const recordActionsFilter = (record, allActions) => {
    if (!record.ams_tracking_number) {
      return allActions.filter((a) => a.key !== "final-app");
    }
    return allActions;
  }

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
    renderActionsColumn({ actions, recordActionsFilter, title: "Documents" }),
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
    projectSummaryAuthorizationType,
    statusData,
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
        projectSummaryAuthorizationType,
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
      const amsAuthorizationNumber = statusData?.ams_authorization_number || null;
      const regionalCaseManager = statusData?.regional_case_manager || null;
      const documents = statusData?.documents || null;
      const authorizationTitle = `${AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES_TEXT[projectSummaryAuthorizationType]} 
        ${AMS_AUTHORIZATION_TYPES_TEXT[authorization.project_summary_permit_type[0]]}(${permitNo}):`;
      let ams_error_messages = {
        title: authorizationTitle,
        errors: authorization?.ams_outcome,
      }

      let status = createStatusBadge(NOT_APPLICABLE, AMS_STATUS_CODE_DEFAULT);
      if (authorization?.ams_status_code === "500") {
        status = createStatusBadge("Failed", AMS_STATUS_CODE_ERROR);
        setShouldDisplayRetryButton(true);
      } else if (authorization?.ams_status_code === "400") {
        status = createStatusBadge("Rejected", AMS_STATUS_CODE_ERROR);
      } else if (authorization?.ams_status_code === "200") {
        if (statusData) {
          if (AMS_APPROVED_STATUSES[statusData.status]) {
            status = createStatusBadge(AMS_APPROVED_STATUSES[statusData.status], AMS_STATUS_CODES_SUCCESS);
          }

          if (AMS_WARNING_STATUSES[statusData.status]) {
            status = createStatusBadge(AMS_WARNING_STATUSES[statusData.status], AMS_STATUS_CODE_WARNING);
          }

          if (AMS_STOPPED_STATUSES[statusData.status]) {
            status = createStatusBadge(AMS_STOPPED_STATUSES[statusData.status], AMS_STATUS_CODE_ERROR);
          }
        }
        ams_error_messages = null;
      }

      return {
        project_type: projectType,
        permit_no: permitNo,
        ams_tracking_number: amsTrackingNumber,
        date_submitted: dateSubmitted,
        project_summary_authorization_guid: projectSummaryAuthorizationGuid,
        status: status,
        ams_error_messages: ams_error_messages,
        ams_authorization_number: amsAuthorizationNumber,
        regional_case_manager: regionalCaseManager,
        documents: documents,
      };
    }
    return null;
  };

  const processEnvironmentalActAuthorizations = (
    authorizations,
    permitAuthorizationType,
    projectSummaryAuthorizationType,
    statuses,
  ) => {
    const filteredResults = authorizations
      .map((authorization) => {
        const statusData = statuses.find(status => status.ams_tracking_number === authorization.ams_tracking_number);
        return processEnvironmentalActAuthorization(
          authorization,
          permitAuthorizationType,
          projectSummaryAuthorizationType,
          statusData,
        )
      }
      )
      .filter(Boolean);

    processedEnvironmentActPermitResult.push(...filteredResults);
  };

  const loadEnvironmentActPermitData = (authorizations, statuses) => {
    Object.values(AMS_ENVIRONMENTAL_MANAGEMENT_ACT_TYPES).forEach((type) => {
      processEnvironmentalActAuthorizations(authorizations, ENVIRONMENTAL_MANAGMENT_ACT, type, statuses);
    });

    const hasSubmissionErrors = processedEnvironmentActPermitResult.some(
      (fr) => fr.status.text === "Failed" || fr.status.text === "Rejected"
    );
    setHasFailedAMSSubmission(hasSubmissionErrors);
    setEnvironmentalManagementActData([...processedEnvironmentActPermitResult]);
    processedEnvironmentActPermitResult = [];
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
    const amsAuthorizations = project?.project_summary.authorizations?.filter(
      auth => auth.ams_tracking_number && auth.ams_tracking_number !== "0"
    );

    const amsTrackingNumbers = amsAuthorizations?.map(auth => auth.ams_tracking_number);
    if (amsTrackingNumbers.length > 0) {
      setIsLoaded(false);
      dispatch(fetchProjectSummaryEnvironmentAuthorizationStatuses(amsTrackingNumbers)).then((statuses) => {
        loadEnvironmentActPermitData(project.project_summary.authorizations, statuses);
        setIsLoaded(true);
      });
    } else {
      loadEnvironmentActPermitData(project.project_summary.authorizations, amsTrackingNumbers);
    }
  }, [
    project.project_summary.authorizations,
    transformedProjectSummaryAuthorizationTypes,
    dropdownProjectSummaryPermitTypes,
  ]);

  const handleViewProjectDescriptionClicked = () => {
    const isEditableStatus = !['DFT', 'CHR'].includes(project.project_summary.status_code)
    const url = GLOBAL_ROUTES?.EDIT_PROJECT_SUMMARY.dynamicRoute(
      project.project_summary.project_guid,
      project.project_summary.project_summary_guid,
      "basic-information",
      isEditableStatus
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

  const emptyGraphic = (
    <Empty
      description={
        <div className="center">
          <Typography.Paragraph className="light light--sm">
            Tracking number and status will be available once the Project Description is submitted.
          </Typography.Paragraph>
        </div>
      }
    />
  );

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
                <Button onClick={handleViewProjectDescriptionClicked} type="primary" data-cy="view-project-description-details-button">
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
            <ProjectCallout
              status_code={project?.project_summary?.status_code}
            />
            {hasFailedAMSSubmission && (
              <Callout
                title="Environmental Management Act Submission Unsuccessful"
                message="One or more of your environment authorization applications has not been
                      submitted successfully."
                severity={CALLOUT_SEVERITY.danger}
              />
            )}

            <Typography.Title level={3} className="font-colour">
              Submission Progress
            </Typography.Title>
            {minesActData.length === 0 &&
              waterSustainabilityActData.length === 0 &&
              forestryActData.length === 0 &&
              environmentalManagementActData.length === 0 &&
              emptyGraphic}
            {minesActData.length > 0 && (
              <>
                <Typography.Title level={5} className="primary-colour">
                  Major Mines Office
                </Typography.Title>
                <Typography.Text className="desktop-bold">Mines Act</Typography.Text>
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
                <Typography.Text className="desktop-bold">Water Sustainability Act</Typography.Text>
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
                <Typography.Text className="desktop-bold">Forestry Act</Typography.Text>
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
                <Typography.Title level={5} className="primary-colour">
                  Ministry of Environment
                </Typography.Title>
                <Typography.Text className="desktop-bold">
                  Environmental Management Act
                </Typography.Text>
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
                    description={
                      <div>
                        <Typography.Text>
                          One or more of the environment authorization application was not submitted successfully. Please <b>retry the failed submission</b> or <b>start a new application</b> for the rejected authorization(s). You can link this submission to the new application on the Related Projects page.
                        </Typography.Text>
                        <List
                          className="project-description-tab-errors"
                          itemLayout="horizontal"
                          dataSource={environmentalManagementActData}
                          renderItem={(item) => {
                            return item.ams_error_messages ?
                              <li key={item.ams_error_messages.title}>
                                <div className="inline-flex">
                                  <div className="flex-4">
                                    <Row>
                                      <Col span={21}>
                                        {item.ams_error_messages.title}
                                        <List
                                          className="project-description-tab-errors"
                                          itemLayout="horizontal"
                                          dataSource={item.ams_error_messages.errors}
                                          renderItem={(msg) => {
                                            return (<li key={`${item.ams_error_messages.title}-${msg}`}>
                                              <Row>
                                                <Col span={21}>
                                                  {msg}
                                                </Col>
                                              </Row>
                                            </li>)
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  </div>
                                </div>
                              </li> : null
                          }}
                        />
                      </div>}
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
        </Row >
      ) : (
        <Loading />
      )}
    </>
  );
};

export default ProjectDescriptionTab;
