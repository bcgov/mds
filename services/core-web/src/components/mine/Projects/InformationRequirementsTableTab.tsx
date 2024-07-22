import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Tabs } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import {
  fetchRequirements,
  fetchProjectById,
  updateInformationRequirementsTable,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { getInformationRequirementsTableStatusCodesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getProject,
  getInformationRequirementsTable,
  getRequirements,
} from "@mds/common/redux/selectors/projectSelectors";
import ReviewInformationRequirementsTable from "@/components/mine/Projects/ReviewInformationRequirementsTable";
import UpdateInformationRequirementsTableForm from "@/components/Forms/informationRequirementsTable/UpdateInformationRequirementsTableForm";

const sideMenuOptions = [
  {
    href: "intro-project-overview",
    title: "Introduction and Project Overview",
  },
  {
    href: "baseline-information",
    title: "Baseline Information",
  },
  {
    href: "mine-plan",
    title: "Mine Plan",
  },
  {
    href: "reclamation-closure-plan",
    title: "Reclamation Closure Plan",
  },
  {
    href: "modelling-mitigation-discharges",
    title: "Modelling Mitigation Discharges",
  },
  {
    href: "environmental-assessment-predictions",
    title: "Environmental Assessment Predictions",
  },
  {
    href: "environmental-monitoring",
    title: "Environmental Monitory",
  },
  {
    href: "health-safety",
    title: "Health Safety",
  },
  {
    href: "management-plan",
    title: "Management Plan",
  },
];

const InformationRequirementsTableTab = () => {
  const { projectGuid } = useParams<{ projectGuid: string }>();
  const dispatch = useDispatch();

  const project = useSelector(getProject);
  const requirements = useSelector(getRequirements);
  const informationRequirementsTable = useSelector(getInformationRequirementsTable);
  const informationRequirementsTableStatusCodesHash = useSelector(
    getInformationRequirementsTableStatusCodesHash
  );

  const [isLoaded, setIsLoaded] = useState(false);

  const handleFetchData = () => {
    dispatch(fetchProjectById(projectGuid))
      .then(() => dispatch(fetchRequirements()))
      .catch(setIsLoaded(false));
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  useEffect(() => {
    if (
      projectGuid &&
      project.project_guid === projectGuid &&
      informationRequirementsTable?.project_guid === projectGuid
    ) {
      setIsLoaded(true);
    }
  }, [project, informationRequirementsTable]);

  const deepMergeById = (r1, r2) =>
    r1.map(({ requirement_guid, sub_requirements, ...rest }) => ({
      requirement_guid,
      ...rest,
      ...r2.find((i) => i.requirement_guid === requirement_guid),
      sub_requirements: deepMergeById(sub_requirements, r2),
    }));

  const handleUpdateIRT = (event, values) => {
    event.preventDefault();
    dispatch(
      updateInformationRequirementsTable(
        { projectGuid, informationRequirementsTableGuid: informationRequirementsTable.irt_guid },
        values
      )
    ).then(() => handleFetchData());
  };

  const { information_requirements_table } = project;
  const updateUser = information_requirements_table?.update_user;
  const updateDate = formatDate(information_requirements_table?.update_timestamp);
  const statusCode = information_requirements_table?.status_code;

  const mergedRequirements = deepMergeById(
    requirements,
    informationRequirementsTable?.requirements?.filter(({ deleted_ind }) => deleted_ind === false)
  );

  return (
    <div>
      <Tabs
        size="large"
        defaultActiveKey={sideMenuOptions[0].href}
        className="now-tabs vertical-tabs"
        tabPosition="left"
        animated={{ inkBar: true, tabPane: false }}
        items={sideMenuOptions.map((tab, idx) => ({
          key: tab.href,
          label: tab.title,
          children: (
            <div>
              <UpdateInformationRequirementsTableForm
                initialValues={{
                  status_code: statusCode,
                }}
                displayValues={{
                  statusCode,
                  updateUser,
                  updateDate,
                  informationRequirementsTableStatusCodesHash: informationRequirementsTableStatusCodesHash,
                }}
                handleSubmit={handleUpdateIRT}
              />
              <ReviewInformationRequirementsTable
                requirements={mergedRequirements[idx]}
                isLoaded={isLoaded}
              />
            </div>
          ),
        }))}
      />
    </div>
  );
};
export default InformationRequirementsTableTab;
