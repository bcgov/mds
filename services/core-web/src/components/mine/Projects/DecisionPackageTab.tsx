import React, { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Col, Row, Typography } from "antd";
import { FolderViewOutlined, LockOutlined } from "@ant-design/icons";
import { getFormValues } from "@mds/common/components/forms/form";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
  createProjectDecisionPackage,
  fetchProjectById,
  removeDocumentFromProjectDecisionPackage,
  updateProjectDecisionPackage,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import * as routes from "@/constants/routes";
import ScrollSideMenu from "@mds/common/components/common/ScrollSideMenu";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import UpdateDecisionPackageStatusForm from "@/components/Forms/majorMineApplication/UpdateDecisionPackageStatusForm";
import { modalConfig } from "@/components/modalContent/config";
import { getProjectDecisionPackageStatusCodesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { Feature } from "@mds/common/utils/featureFlag";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import * as Strings from "@mds/common/constants/strings";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { IProject } from "@mds/common/interfaces/projects";
import { IMineDocument } from "@mds/common/interfaces/mineDocument.interface";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";

export interface DecisionPackageTabProps {
  match?: {
    params?: {
      projectGuid?: string;
      tab?: string;
    };
  };
  project?: IProject | any;
  fetchProjectById?: (projectGuid: string) => Promise<any> | any;
  archivedDocuments?: IMineDocument[] | any[];
  mineDocuments?: IMineDocument[] | any[];
  fetchMineDocuments?: (mineGuid: string, params: any) => Promise<any> | any;
  openModal?: (payload: any) => void;
  closeModal?: () => void;
  isFeatureEnabled?: (feature: Feature | string) => boolean;
  updateProjectDecisionPackage?: (params: any, values: any) => Promise<any> | any;
  createProjectDecisionPackage?: (params: any, values: any) => Promise<any> | any;
  removeDocumentFromProjectDecisionPackage?: (
    projectGuid: string,
    projectDecisionPackageGuid: string,
    documentKey: string
  ) => Promise<any> | any;
  projectDecisionPackageStatusCodesHash?: Record<string, string>;
  formValues?: any;
}

export const DecisionPackageTab: FC<DecisionPackageTabProps> = (props) => {
  const dispatch = useAppDispatch();
  const routeParams = useParams<{ projectGuid?: string; tab?: string }>();
  const { isFeatureEnabled: hookIsFeatureEnabled } = useFeatureFlag();

  const reduxProject = useAppSelector(getProject);
  const reduxStatusCodesHash = useAppSelector(getProjectDecisionPackageStatusCodesHash);
  const reduxFormValues = useAppSelector(getFormValues(FORM.UPDATE_PROJECT_DECISION_PACKAGE)) || {};
  const reduxMineDocuments = useAppSelector(getMineDocuments);

  const project = props.project ?? reduxProject;
  const projectDecisionPackageStatusCodesHash =
    props.projectDecisionPackageStatusCodesHash ?? reduxStatusCodesHash;
  const formValues = props.formValues ?? reduxFormValues;
  const mineDocuments = props.mineDocuments ?? props.archivedDocuments ?? reduxMineDocuments;

  const projectGuid = props.match?.params?.projectGuid ?? routeParams?.projectGuid;
  const tab = props.match?.params?.tab ?? routeParams?.tab;

  const isFeatureEnabled = props.isFeatureEnabled ?? hookIsFeatureEnabled;

  const handleFetchProjectById =
    props.fetchProjectById ?? ((guid: string) => dispatch(fetchProjectById(guid)));
  const handleFetchMineDocuments =
    props.fetchMineDocuments ??
    ((mineGuid: string, params: any) => dispatch(fetchMineDocuments(mineGuid, params)));
  const handleCreateProjectDecisionPackage =
    props.createProjectDecisionPackage ??
    ((params: any, values: any) => dispatch(createProjectDecisionPackage(params, values)));
  const handleUpdateProjectDecisionPackageAction =
    props.updateProjectDecisionPackage ??
    ((params: any, values: any) => dispatch(updateProjectDecisionPackage(params, values)));
  const handleRemoveDocument =
    props.removeDocumentFromProjectDecisionPackage ??
    ((pGuid: string, pkgGuid: string, docKey: string) =>
      dispatch(removeDocumentFromProjectDecisionPackage(pGuid, pkgGuid, docKey)));
  const handleOpenModalAction = props.openModal ?? ((payload: any) => dispatch(openModal(payload)));
  const handleCloseModalAction = props.closeModal ?? (() => dispatch(closeModal()));

  const [fixedTop, setFixedTop] = useState(false);

  const handleScroll = () => {
    if (window.pageYOffset > 170) {
      setFixedTop(true);
    } else {
      setFixedTop(false);
    }
  };

  const handleFetchData = async () => {
    if (!projectGuid) return;
    const resProject = await handleFetchProjectById(projectGuid);
    const decisionPackageGuid = resProject?.project_decision_package?.project_decision_package_guid;
    if (decisionPackageGuid && resProject?.mine_guid) {
      await handleFetchMineDocuments(resProject.mine_guid, {
        is_archived: true,
        project_decision_package_guid: decisionPackageGuid,
      });
    }
  };

  useEffect(() => {
    handleFetchData();
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (tab === "project-decision-package") {
      handleFetchData();
    }
  }, [tab]);

  const handleUpdateProjectDecisionPackage = async (arg1: any, arg2?: any) => {
    const values = arg2 !== undefined ? arg2 : arg1;
    const projectDecisionPackage = project?.project_decision_package;
    const projectDecisionPackageGuid = projectDecisionPackage?.project_decision_package_guid;

    if (!projectDecisionPackageGuid) {
      await handleCreateProjectDecisionPackage(
        {
          projectGuid: project?.project_guid,
        },
        values
      );
      return handleFetchData();
    }
    await handleUpdateProjectDecisionPackageAction(
      {
        projectGuid,
        projectDecisionPackageGuid,
      },
      values
    );
    return handleFetchData();
  };

  const handleDeleteDocument = async (event: React.MouseEvent, documentKey: string) => {
    event?.preventDefault?.();
    const { project_guid: pGuid, project_decision_package } = project || {};

    await handleRemoveDocument(
      pGuid,
      project_decision_package?.project_decision_package_guid,
      documentKey
    );
    return handleFetchData();
  };

  const handleUploadDocument = (arg1: any, arg2?: any, arg3?: any) => {
    let files: any[] = [];
    let flags: any = {};
    if (Array.isArray(arg1)) {
      files = arg1;
      flags = arg2 || {};
    } else if (Array.isArray(arg2)) {
      files = arg2;
      flags = arg3 || {};
    }

    const { isDecisionPackageEligible, addFilesToDecisionPackage } = flags;
    let project_decision_package_document_type_code: string;
    if (isDecisionPackageEligible && addFilesToDecisionPackage) {
      project_decision_package_document_type_code = "DCP";
    } else if (isDecisionPackageEligible && !addFilesToDecisionPackage) {
      project_decision_package_document_type_code = "ADG";
    } else {
      project_decision_package_document_type_code = "INM";
    }

    const payload = {
      documents: files.map((doc) => ({
        ...doc,
        project_decision_package_document_type_code,
      })),
      status_code: formValues?.status_code,
    };
    handleUpdateProjectDecisionPackage(payload);
    return handleCloseModalAction();
  };

  const handleOpenModal = (modalType: string) => {
    let title: string;
    let contentTitle: string;
    let instructions: string;
    let content: any = modalConfig.UPLOAD_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL;
    let submitHandler: any = handleUploadDocument;
    let optionalProps: any = {};

    if (modalType === "upload-document") {
      title = "Upload Documents";
      instructions =
        "Please upload all relevant decision documentation below. You can add this set of files directly to your decision package by selecting the option below.";
      contentTitle = "Upload Documents";
    } else if (modalType === "internal") {
      title = "Upload Internal Documents";
      instructions =
        "Upload internal documents that are created durring the review process. These files are for internal staff only and will not be shown to proponents.";
      contentTitle = "Upload Internal Ministry Document";
    } else if (modalType === "edit-decision-package") {
      content = modalConfig.UPDATE_PROJECT_DECISION_PACKAGE_DOCUMENT_MODAL;
      submitHandler = handleUpdateProjectDecisionPackage;
      optionalProps = {
        documents: project?.project_decision_package?.documents,
        status_code: project?.project_decision_package?.status_code,
      };
    }

    return handleOpenModalAction({
      props: {
        title,
        contentTitle,
        instructions,
        projectGuid: project?.project_guid,
        modalType,
        isModal: true,
        onSubmit: submitHandler,
        afterClose: () => {},
        optionalProps,
      },
      content,
    });
  };

  const renderArchivedDocumentsSection = (archivedDocs: any[]) => {
    return (
      <ArchivedDocumentsSection
        additionalColumns={[
          renderCategoryColumn("category_code", "Category", Strings.CATEGORY_CODE, true),
        ]}
        documents={
          archivedDocs && archivedDocs.length > 0
            ? archivedDocs.map((doc: any) => new MajorMineApplicationDocument(doc))
            : []
        }
        href="archived-documents-decision-package"
      />
    );
  };

  const renderDocumentSection = (
    proj: any,
    sectionTitle: React.ReactNode,
    sectionHref: string,
    sectionText: React.ReactNode,
    sectionDocuments: any[]
  ) => {
    const titleElement = (
      <Typography.Text strong style={{ fontSize: "1.5rem" }}>
        {sectionTitle}
      </Typography.Text>
    );

    return (
      <div id={sectionHref}>
        <p>{titleElement}</p>
        <br />
        <p>{sectionText}</p>
        <DocumentTable
          enableBulkActions={true}
          documents={sectionDocuments?.reduce(
            (docs: any[], doc: any) => [
              {
                key: doc.mine_document_guid,
                mine_document_guid: doc.mine_document_guid,
                document_manager_guid: doc.document_manager_guid,
                document_name: doc.document_name,
                upload_date: doc.upload_date,
              },
              ...docs,
            ],
            []
          )}
          excludedColumnKeys={["category"]}
          additionalColumnProps={[{ key: "name", colProps: { width: "80%" } }]}
          canArchiveDocuments={true}
          onArchivedDocuments={handleFetchData}
          onReplaceDocument={handleFetchData}
          removeDocument={handleDeleteDocument}
          showVersionHistory={true}
        />
      </div>
    );
  };

  const projectDecisionPackage = project?.project_decision_package;
  const allDocuments = projectDecisionPackage?.documents;
  const hasStartedPackage =
    Boolean(projectDecisionPackage?.project_decision_package_guid) &&
    projectDecisionPackage?.status_code !== "NTS";

  const canArchiveDocuments = isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE);
  const menuOptions = [
    { href: "decision-package-documents", title: "Decision Package" },
    { href: "additional-goverment-documents", title: "Government Documents" },
    { href: "internal-ministry-documents", title: "Internal Documents" },
    canArchiveDocuments && {
      href: "archived-documents-decision-package",
      title: "Archived Documents",
    },
  ].filter(Boolean);

  return (
    <>
      <div className={fixedTop ? "side-menu--fixed" : "side-menu"}>
        <ScrollSideMenu
          menuOptions={menuOptions}
          featureUrlRoute={routes.PROJECT_DECISION_PACKAGE.hashRoute}
          featureUrlRouteArguments={[projectGuid]}
        />
      </div>
      <div className={fixedTop ? "side-menu--content top-125" : "side-menu--content"}>
        <Row>
          <UpdateDecisionPackageStatusForm
            initialValues={{
              status_code: projectDecisionPackage?.status_code || "NTS",
            }}
            displayValues={{
              status_code: projectDecisionPackage?.status_code || "NTS",
              projectDecisionPackageStatusCodesHash,
              updateUser: projectDecisionPackage?.update_user,
              updateDate: projectDecisionPackage?.update_timestamp,
              documents: projectDecisionPackage?.documents,
            }}
            onSubmit={handleUpdateProjectDecisionPackage}
          />
          <Col span={24}>
            <Typography.Title level={3}>
              <br />
              <FolderViewOutlined className="violet" />
              &nbsp;Decision Package (Proponent Visible)
            </Typography.Title>
            <hr />
          </Col>
        </Row>
        {renderDocumentSection(
          project,
          <Row>
            <Col xs={24} md={12}>
              Decision Package Documents
            </Col>
            <Col xs={24} md={12}>
              <Button
                type="primary"
                style={{ float: "right" }}
                disabled={!hasStartedPackage}
                onClick={() => handleOpenModal("upload-document")}
              >
                + Add Documents
              </Button>
              <Button
                type={"secondary" as any}
                style={{ float: "right" }}
                disabled={!hasStartedPackage || allDocuments?.length === 0}
                onClick={() => handleOpenModal("edit-decision-package")}
              >
                <img {...({ name: "edit" } as any)} src={EDIT_OUTLINE_VIOLET} alt="Edit" />
                &nbsp; Edit Package
              </Button>
            </Col>
          </Row>,
          "decision-package-documents",
          <Typography.Text>
            <b>These files are visible to the proponent.</b> Upload Ministry Decision documentation.
          </Typography.Text>,
          allDocuments?.filter(
            (doc) => doc.project_decision_package_document_type_code === "DCP"
          ) || []
        )}
        <br />
        {renderDocumentSection(
          project,
          "Additional Government Documents",
          "additional-goverment-documents",
          <Typography.Text>
            <b>These files are visible to the proponent.</b> Upload Supplemental Ministry
            documentation.
          </Typography.Text>,
          allDocuments?.filter(
            (doc) => doc.project_decision_package_document_type_code === "ADG"
          ) || []
        )}
        <br />
        <Row>
          <Col span={24}>
            <Typography.Title level={3}>
              <LockOutlined className="violet" />
              &nbsp;Confidential Internal Documents (Ministry Visible Only)
            </Typography.Title>
            <hr />
          </Col>
        </Row>
        {renderDocumentSection(
          project,
          <Row>
            <Col xs={24} md={12}>
              Internal Ministry Documentation
            </Col>
            <Col xs={24} md={12}>
              <Button
                type="primary"
                style={{ float: "right" }}
                disabled={!hasStartedPackage}
                onClick={() => handleOpenModal("internal")}
              >
                + Add Documents
              </Button>
            </Col>
          </Row>,
          "internal-ministry-documents",
          <Typography.Text>
            <b>These files are for internal staff only and will not be shown to proponents.</b>{" "}
            Upload internal documents that are created durring the review process.
          </Typography.Text>,
          allDocuments?.filter(
            (doc) => doc.project_decision_package_document_type_code === "INM"
          ) || []
        )}
        {renderArchivedDocumentsSection(mineDocuments)}
      </div>
    </>
  );
};

export default DecisionPackageTab;
