import React, { FC, useEffect, useState } from "react";
import { Col, Row, Tabs, Form } from "antd";
import ReviewSubmitInformationRequirementsTable from "@/components/Forms/projects/informationRequirementsTable/ReviewSubmitInformationRequirementsTable";
import { IInformationRequirementsTable, IRequirement } from "@mds/common";

interface InformationRequirementsTableFormProps {
  informationRequirementsTable: IInformationRequirementsTable;
  requirements: IRequirement[];
  tab: string;
  handleTabChange: (tab: string) => void;
  sideMenuOptions: string[];
}

export const InformationRequirementsTableForm: FC<InformationRequirementsTableFormProps> = ({
  requirements,
  informationRequirementsTable,
  tab,
  handleTabChange,
  sideMenuOptions,
}) => {
  const activeTab = tab ?? sideMenuOptions[0];
  const [mergedRequirements, setMergedRequirements] = useState([]);

  const deepMergeById = (r1, r2) =>
    r1.map(({ requirement_guid, sub_requirements, ...rest }) => ({
      requirement_guid,
      ...rest,
      ...r2?.find((i) => i.requirement_guid === requirement_guid),
      sub_requirements: deepMergeById(sub_requirements, r2),
    }));

  useEffect(() => {
    setMergedRequirements(
      deepMergeById(
        requirements,
        informationRequirementsTable?.requirements.filter(
          ({ deleted_ind }) => deleted_ind === false
        )
      )
    );
  }, []);

  const renderTabComponent = (requirements, tabIndex) => (
    <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
  );

  const onTabChange = (tab) => {
    handleTabChange(tab);
  };

  const tabItems = sideMenuOptions.map((tab, index) => ({
    label: tab,
    key: tab,
    children: renderTabComponent(mergedRequirements, index),
  }));

  return (
    <Form layout="vertical">
      <Row gutter={16}>
        <Col span={24}>
          <Tabs
            tabPosition="left"
            activeKey={activeTab}
            defaultActiveKey={sideMenuOptions[0]}
            onChange={onTabChange}
            className="vertical-tabs"
            items={tabItems}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default InformationRequirementsTableForm;
