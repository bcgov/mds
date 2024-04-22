import React from "react";
import { Link, useHistory } from "react-router-dom";
import IRTDownloadTemplate from "@/components/Forms/projects/informationRequirementsTable/IRTDownloadTemplate";
import { ENVIRONMENT, IProject, IRequirement } from "@mds/common";
import * as API from "@mds/common/constants/API";
import { Button, Popconfirm, Typography } from "antd";
import * as routes from "@/constants/routes";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import HourglassOutlined from "@ant-design/icons/HourglassOutlined";
import { IRTFileImport } from "@/components/Forms/projects/informationRequirementsTable/IRTFileImport";
import AuthorizationWrapper from "@mds/common/wrappers/AuthorizationWrapper";
import InformationRequirementsTableForm from "@/components/Forms/projects/informationRequirementsTable/InformationRequirementsTableForm";

interface stepFormsProps {
  submitting: boolean;
  next: () => void;
  prev: () => void;
  handleTabChange: (tab: string) => void;
  handleIRTUpdate: (values: any, message: string) => void;
  importIsSuccessful: (success: boolean, err: string) => void;
  downloadIRTTemplate: (url: string) => void;
  openViewFileHistoryModal: () => void;
  project: IProject;
  requirements: IRequirement[];
  informationRequirementsTableDocumentTypesHash: any;
  uploadedSuccessfully: boolean;
  tabs;
  activeTab: string;
}

const StepForms = ({
  submitting,
  next,
  prev,
  handleTabChange,
  handleIRTUpdate,
  importIsSuccessful,
  downloadIRTTemplate,
  openViewFileHistoryModal,
  project,
  requirements,
  informationRequirementsTableDocumentTypesHash,
  uploadedSuccessfully,
  tabs,
  activeTab,
}: stepFormsProps) => {
  const history = useHistory();

  return [
    {
      title: "Download Template",
      content: (
        <IRTDownloadTemplate
          downloadIRTTemplate={() =>
            downloadIRTTemplate(
              ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
            )
          }
        />
      ),
      buttons: [
        null,
        <Button key="continue" id="step1-next" type="primary" onClick={() => next()}>
          Continue to Import
        </Button>,
      ],
    },
    {
      title: "Import File",
      content: (
        <IRTFileImport
          projectGuid={project.project_guid}
          informationRequirementsTableDocumentTypesHash={
            informationRequirementsTableDocumentTypesHash
          }
          importIsSuccessful={importIsSuccessful}
          downloadIRTTemplate={downloadIRTTemplate}
        />
      ),
      buttons: [
        <>
          <Button
            id="step-back"
            className="full-mobile"
            style={{ marginRight: "12px" }}
            onClick={() => prev()}
            disabled={submitting}
          >
            Back
          </Button>
          <Button
            id="step2-next"
            type="primary"
            onClick={() => {
              history.push({
                pathname: `${routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                  project?.project_guid,
                  project?.information_requirements_table?.irt_guid
                )}`,
                state: { current: 2 },
              });
            }}
            disabled={!uploadedSuccessfully && !project?.information_requirements_table?.irt_guid}
          >
            Continue to Review
          </Button>
        </>,
      ],
    },
    {
      title: "Review & Submit",
      content: (
        <>
          {project?.information_requirements_table?.status_code === "DFT" ? (
            <>
              <Typography.Title level={4}>Review IRT before submission</Typography.Title>
              <Typography.Paragraph>
                Review imported data before submission. Check the requirements and comments fields
                that are required for the project.
              </Typography.Paragraph>
            </>
          ) : null}

          <InformationRequirementsTableForm
            informationRequirementsTable={project?.information_requirements_table}
            requirements={requirements}
            tab={activeTab}
            sideMenuOptions={tabs}
            handleTabChange={handleTabChange}
          />
        </>
      ),
      buttons: [
        <>
          {project.information_requirements_table?.status_code === "DFT" ? (
            <>
              <Button
                id="step-back"
                className="full-mobile"
                style={{ marginRight: "24px" }}
                onClick={() => {
                  history.push({
                    pathname: `${routes.ADD_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                      project.project_guid
                    )}`,
                    state: { current: 1 },
                  });
                }}
              >
                Back
              </Button>
              <Link
                to={routes.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                  project?.project_guid,
                  project?.information_requirements_table?.irt_guid
                )}
              >
                <AuthorizationWrapper>
                  <Popconfirm
                    placement="topRight"
                    title="Are you sure you want to submit your final IRT, no changes could be made after submitting?"
                    onConfirm={() =>
                      handleIRTUpdate(
                        {
                          status_code: "SUB",
                        },
                        "Successfully submitted final IRT."
                      )
                    }
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button id="submit_irt" type="primary">
                      Submit IRT
                    </Button>
                  </Popconfirm>
                </AuthorizationWrapper>
              </Link>
            </>
          ) : (
            <>
              {project.information_requirements_table?.status_code !== "APV" &&
                project.information_requirements_table?.status_code !== "UNR" && (
                  <Button
                    htmlType="submit"
                    style={{ marginRight: "24px" }}
                    onClick={() => {
                      history.push({
                        pathname: `${routes.RESUBMIT_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                          project?.project_guid,
                          project?.information_requirements_table?.irt_guid
                        )}`,
                        state: { current: 1 },
                      });
                    }}
                    disabled={submitting}
                  >
                    Resubmit IRT
                  </Button>
                )}
              <Button
                type="ghost"
                style={{ border: "none", marginRight: "12px" }}
                className="full-mobile"
                onClick={() =>
                  downloadIRTTemplate(
                    ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                  )
                }
              >
                <DownloadOutlined />
                Download IRT template
              </Button>

              <Button
                type="ghost"
                style={{ border: "none" }}
                className="full-mobile"
                onClick={openViewFileHistoryModal}
              >
                <HourglassOutlined />
                File History
              </Button>
            </>
          )}
        </>,
      ],
    },
  ];
};

export default StepForms;
