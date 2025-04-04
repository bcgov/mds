import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Row, Col, Typography, Descriptions, Input, Button } from "antd";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import { getDropdownMajorMinesApplicationStatusCodes, getMajorMinesApplicationStatusCodesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  fetchProjectById,
  updateMajorMineApplication,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { formatDate, formatUrlToUpperCaseString } from "@mds/common/redux/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import { getFormattedProjectApplication, getProject } from "@mds/common/redux/selectors/projectSelectors";
import * as routes from "@/constants/routes";
import UpdateStatusForm from "@/components/Forms/MajorProject/UpdateStatusForm";
import DocumentTable from "@mds/common/components/documents/DocumentTable";
import { ScrollSideMenuProps } from "@mds/common/components/common/ScrollSideMenu";
import { fetchMineDocuments } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getMineDocuments } from "@mds/common/redux/selectors/mineSelectors";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { MajorMineApplicationDocument } from "@mds/common/models/documents/document";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";
import Loading from "@mds/common/components/common/Loading";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import ArchivedDocumentsSection from "@mds/common/components/projects/ArchivedDocumentsSection";
import { FORM } from "@mds/common/constants/forms";
import { Feature } from "@mds/common/utils/featureFlag";
import { IProject } from "@mds/common/interfaces/projects";


const MajorMineApplicationTab: FC = () => {
  const dispatch = useDispatch();
  const { projectGuid } = useParams<{ tab: string, projectGuid: string }>();

  const majorMineApplication = useSelector(getFormattedProjectApplication);
  const project: IProject = useSelector(getProject);
  const majorMineAppStatusCodesHash = useSelector(getMajorMinesApplicationStatusCodesHash);
  const mineDocuments = useSelector(getMineDocuments);
  const dropdownMajorMineAppStatusCodes = useSelector(getDropdownMajorMinesApplicationStatusCodes);
  const archivedDocuments = mineDocuments?.map((doc) => new MajorMineApplicationDocument(doc))

  const defaultLoaded = project.project_guid === projectGuid;
  const { isFeatureEnabled } = useFeatureFlag();
  const archiveFeatureEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_ARCHIVE_FILE);
  const decisionPackageEnabled = isFeatureEnabled(Feature.MAJOR_PROJECT_DECISION_PACKAGE);

  const [isLoaded, setIsLoaded] = useState(defaultLoaded);
  const [isCompressionModal, setIsCompressionModal] = useState(false);

  const { major_mine_application_guid, primary_contact, status_code, update_user, update_timestamp, documents = [] } = majorMineApplication;

  const majorMineApplicationDocs = documents.map((doc) => new MajorMineApplicationDocument({
    ...doc,
    entity_title: project.project_title
  }));

  const updateDate = formatDate(update_timestamp);

  const fetchData = async () => {
    await dispatch(fetchProjectById(projectGuid));
    if (major_mine_application_guid) {
      await dispatch(fetchMineDocuments(project.mine_guid, {
        is_archived: true,
        major_mine_application_guid
      }));
    }
  };

  useEffect(() => {
    fetchData().then(() => setIsLoaded(true));
  }, [projectGuid]);

  const handleUpdateMMA = async (values) => {
    await dispatch(updateMajorMineApplication({
      projectGuid,
      majorMineApplicationGuid: major_mine_application_guid
    }, values));

    return fetchData();
  };

  const headerHeight = 121;
  const tabNavHeight = 60;
  const topOffset = headerHeight + tabNavHeight;

  const documentSections = [
    { href: "primary-documents", documents: majorMineApplicationDocs.filter((doc) => doc.major_mine_application_document_type_code === "PRM") },
    { href: "spatial-components", documents: majorMineApplicationDocs.filter((doc) => doc.major_mine_application_document_type_code === "SPT") },
    { href: "supporting-documents", documents: majorMineApplicationDocs.filter((doc) => doc.major_mine_application_document_type_code === "SPR") },
    decisionPackageEnabled && { href: "ministry-decision-documents", documents: project?.project_decision_package?.documents ?? [] },
  ].map((section) => section && ({ ...section, title: formatUrlToUpperCaseString(section.href) }));

  const archiveMenuOption = archiveFeatureEnabled && { href: "archived-documents", title: "Archived Documents" }
  const menuOptions = [{ href: "basic-information", title: "Basic Information" }, ...documentSections, archiveMenuOption].filter(Boolean);

  const sideBarRoute = {
    url: routes.PROJECT_APPLICATION,
    params: [project.project_guid],
  };

  const scrollSideMenuProps: ScrollSideMenuProps = {
    menuOptions,
    featureUrlRoute: sideBarRoute.url.hashRoute,
    featureUrlRouteArguments: sideBarRoute.params,
  };

  const descriptions = [
    { label: "Primary Contact", value: primary_contact },
    { label: "Ministry Contact", value: project?.project_lead_name },
    { label: "Submitted", value: formatDate(majorMineApplication?.create_timestamp) },
    { label: "Status", value: majorMineAppStatusCodesHash[status_code] }
  ];

  return isLoaded ? (
    <ScrollSidePageWrapper
      header={null}
      headerHeight={topOffset}
      menuProps={scrollSideMenuProps}
      content={<><Row gutter={[16, 16]}>
        <Col span={24}>
          <UpdateStatusForm
            displayValues={{
              status_code,
              update_user,
              updateDate,
            }}
            handleSubmit={handleUpdateMMA}
            formName={FORM.UPDATE_MAJOR_MINE_APPLICATION}
            dropdownOptions={dropdownMajorMineAppStatusCodes}
          />
        </Col>
      </Row>

        <Row id="basic-information" gutter={[16, 16]}>
          <Col span={24}><Typography.Title level={3}>Basic Information</Typography.Title></Col>
          {descriptions.map((description) => <Col xs={24} md={12} key={description.label}>
            <Descriptions layout="vertical" colon={false} style={{ maxWidth: "95%" }}>
              <Descriptions.Item label={description.label} className="vertical-description">
                <Input
                  value={description.value ?? Strings.EMPTY_FIELD}
                  disabled
                />
              </Descriptions.Item>
            </Descriptions>
          </Col>)}
        </Row>
        <DocumentCompression
          mineDocuments={majorMineApplicationDocs}
          setCompressionModalVisible={(isVisible) => setIsCompressionModal(isVisible)}
          isCompressionModalVisible={isCompressionModal}
          showDownloadWarning={true}
        />
        <Row justify="space-between">
          <Col>
            <Typography.Title level={4} id="application-files">Application Files</Typography.Title>
          </Col>
          <Col>
            <Button
              disabled={documents.length === 0}
              type="primary"
              onClick={() => setIsCompressionModal(true)}
              icon={<DownloadOutlined />}
            >
              Download All Application Files
            </Button>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          {documentSections.map((section) =>
            <Col span={24} key={section.href}>
              <Typography.Title level={5} id={section.href} style={{ fontWeight: "bold" }}>{section.title}</Typography.Title>
              <DocumentTable
                documents={section.documents}
                canArchiveDocuments={archiveFeatureEnabled}
                onArchivedDocuments={fetchData}
                isLoaded={isLoaded}
                showVersionHistory={true}
                enableBulkActions={true}
              />
            </Col>
          )}
          {archiveFeatureEnabled &&
            <Col span={24}>
              <ArchivedDocumentsSection
                documents={archivedDocuments}
              />
            </Col>}
        </Row></>}
    />
  ) : <Loading />;
};

export default MajorMineApplicationTab;