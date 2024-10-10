import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import { Col, Row, Tabs, Typography } from "antd";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { IProject } from "@mds/common/interfaces/projects/project.interface";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { fetchProjectById } from "@mds/common/redux/actionCreators/projectActionCreator";
import {
  fetchMineDocuments,
  fetchMineRecordById,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { fetchEMLIContactsByRegion } from "@mds/common/redux/actionCreators/minespaceActionCreator";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import MajorMineApplicationReviewSubmit from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationReviewSubmit";
import ProjectOverviewTab from "./ProjectOverviewTab";
import InformationRequirementsTableEntryTab from "./InformationRequirementsTableEntryTab";
import MajorMineApplicationEntryTab from "./MajorMineApplicationEntryTab";
import { MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES } from "./MajorMineApplicationPage";
import ProjectDocumentsTab from "@mds/common/components/projects/ProjectDocumentsTab";
import ProjectDescriptionTab from "@mds/common/components/project/ProjectDescriptionTab";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import { Feature } from "@mds/common";
import { getProjectSummary } from "@mds/common/redux/reducers/projectReducer";

const tabs = [
  "overview",
  "project-description",
  "irt-entry",
  "toc",
  "major-mine-application",
  "documents",
];

const ProjectPage: FC = () => {
  const { tab, projectGuid } = useParams<{
    mineGuid: string;
    tab: string;
    activeTab: string;
    projectGuid: string;
  }>();
  const history = useHistory();
  const { isFeatureEnabled } = useFeatureFlag();

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState(tab ?? tabs[0]);
  const dispatch = useDispatch();
  const project: IProject = useSelector(getProject) ?? {};
  const projectSummary = useSelector(getProjectSummary) ?? {};
  const {
    mine_guid,
    project_title,
    information_requirements_table,
    major_mine_application,
    mrc_review_required,
    project_summary,
  } = project;

  const mine = useSelector((state) => getMineById(state, mine_guid)) ?? {};
  const { mine_name } = mine;
  const { status_code: irtStatus, irt_guid } = information_requirements_table ?? {};
  const { status_code: mmaStatus, major_mine_application_guid } = major_mine_application ?? {};

  const fetchArchivedDocuments = (currentTab = activeTab) => {
    let filters: any = { project_guid: projectGuid, is_archived: true };
    if (currentTab === "major-mine-application") {
      if (major_mine_application_guid) {
        filters = { major_mine_application_guid, is_archived: true };
      }
    }
    dispatch(fetchMineDocuments(mine_guid, filters));
  };

  const navigateFromProjectStagesTable = (source, status) => {
    switch (source) {
      case "DES": {
        const projectDescriptionTab = document.querySelector('[id*="project-description"]');
        if (!projectDescriptionTab) {
          return null;
        }

        // @ts-ignore
        return projectDescriptionTab.click();
      }
      case "IRT": {
        if (status === "APV") {
          return history.push({
            pathname: router.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
              projectGuid,
              irt_guid
            ),
            state: { current: 2 },
          });
        }
        const irtTab = document.querySelector('[id*="irt-entry"]');
        if (!irtTab) {
          return null;
        }
        // @ts-ignore
        return irtTab.click();
      }
      case "MMA":
        if (MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(status)) {
          return history.push({
            pathname: router.REVIEW_MAJOR_MINE_APPLICATION.dynamicRoute(
              projectGuid,
              major_mine_application_guid
            ),
            state: { current: 2, applicationSubmitted: true },
          });
        }
        break;
      case "DFT":
      case "CHR":
        return history.push({
          pathname: router.EDIT_MAJOR_MINE_APPLICATION.dynamicRoute(
            projectGuid,
            major_mine_application_guid
          ),
          state: { current: 1 },
        });
      default: {
        // equiv of !status?
        const mmaTab = document.querySelector('[id*="major-mine-application"]');
        if (!mmaTab) {
          return null;
        }
        // @ts-ignore
        return mmaTab.click();
      }
    }
  };

  const handleFetchData = async (includeArchivedDocuments = false) => {
    if (
      (projectGuid && project?.project_guid !== projectGuid) ||
      !projectSummary?.project_summary_guid
    ) {
      await dispatch(fetchProjectById(projectGuid));
    }
    if (project?.mine_guid && project?.mine_guid !== mine?.mine_guid) {
      await dispatch(fetchMineRecordById(project.mine_guid));
    }
    if (mine?.mine_region && project?.project_guid === projectGuid) {
      await dispatch(fetchEMLIContactsByRegion(mine.mine_region, mine.major_mine_ind));
      setIsLoaded(true);
    }
    if (includeArchivedDocuments) {
      fetchArchivedDocuments();
    }
  };

  const handleTabChange = (newActiveTab) => {
    setActiveTab(newActiveTab);
    fetchArchivedDocuments(newActiveTab);

    let url: string;
    switch (newActiveTab) {
      case "documents":
      case "project-description":
      case "overview":
        url = router.EDIT_PROJECT.dynamicRoute(projectGuid, newActiveTab);
        return history.push(url);
      case "irt-entry": {
        url =
          irtStatus === "APV"
            ? router.REVIEW_INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(
                projectGuid,
                project?.information_requirements_table?.irt_guid
              )
            : `/projects/${projectGuid}/information-requirements-table/entry`;
        const urlState = irtStatus == "APV" ? { state: { current: 2 } } : {};
        return history.push({ pathname: url, ...urlState });
      }
      case "major-mine-application":
        url = `/projects/${projectGuid}/major-mine-application/entry`;
        return history.push(url);

      default:
        return null;
    }
  };

  useEffect(() => {
    handleFetchData();
  }, [project, mine, projectSummary]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const majorMineApplicationTabContent = MAJOR_MINE_APPLICATION_SUBMISSION_STATUSES.includes(
    mmaStatus
  ) ? (
    <MajorMineApplicationReviewSubmit
      project={project}
      applicationSubmitted
      tabbedView
      refreshData={handleFetchData}
    />
  ) : (
    <MajorMineApplicationEntryTab mma={major_mine_application} />
  );

  const pageClass = "padding-lg--top";

  const tabItems = [
    {
      label: "Overview",
      key: "overview",
      children: (
        <div className={pageClass}>
          <ProjectOverviewTab navigateForward={navigateFromProjectStagesTable} />
        </div>
      ),
    },
    isFeatureEnabled(Feature.AMS_AGENT) && {
      label: "Project Description",
      key: "project-description",
      children: (
        <div className={pageClass}>
          <ProjectDescriptionTab />
        </div>
      ),
    },
    {
      label: "IRT",
      key: "irt-entry",
      children: (
        <div className={pageClass}>
          <InformationRequirementsTableEntryTab
            irt={information_requirements_table}
            mrcReviewRequired={mrc_review_required}
          />
        </div>
      ),
    },
    {
      label: "Application",
      key: "major-mine-application",
      children: <div className={pageClass}>{majorMineApplicationTabContent}</div>,
    },
    {
      label: "Documents",
      key: "documents",
      children: <ProjectDocumentsTab project={project} />,
    },
  ];

  return isLoaded ? (
    <div className="fixed-tabs-container">
      <div className="view--header">
        <Row>
          <Col span={24}>
            <Typography.Title>{project_title}</Typography.Title>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Link to={router.MINE_DASHBOARD.dynamicRoute(mine_guid, "applications")}>
              <ArrowLeftOutlined className="padding-sm-right" />
              Back to: {mine_name} Mine Projects
            </Link>
          </Col>
        </Row>
      </div>
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Tabs
            defaultActiveKey={activeTab}
            onChange={handleTabChange}
            className="core-tabs fixed-tabs-tabs"
            items={tabItems}
          />
        </Col>
      </Row>
    </div>
  ) : (
    <Loading />
  );
};
export default ProjectPage;
