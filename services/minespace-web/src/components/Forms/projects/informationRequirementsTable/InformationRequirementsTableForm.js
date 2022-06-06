import React, { Component } from "react";
import PropTypes from "prop-types";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col, Tabs } from "antd";
import CustomPropTypes from "@/customPropTypes";
import ReviewSubmitInformationRequirementsTable from "@/components/Forms/projects/informationRequirementsTable/ReviewSubmitInformationRequirementsTable";

const propTypes = {
  informationRequirementsTable: CustomPropTypes.informationRequirementsTable.isRequired,
  requirements: CustomPropTypes.requirements.isRequired,
  tab: PropTypes.string.isRequired,
  handleTabChange: PropTypes.func.isRequired,
};

const tabs = [
  "intro-project-overview",
  "baseline-information",
  "mine-plan",
  "reclamation-closure-plan",
  "modelling-mitigation-discharges",
  "environmental-assessment-predictions",
  "environmental-monitoring",
  "health-safety",
  "management-plan",
];

export class InformationRequirementsTableForm extends Component {
  state = {
    tabIndex: 0,
    activeTab: tabs[0],
  };

  mergedRequirements = [];

  componentDidMount() {
    this.mergedRequirements = this.deepMergeById(
      this.props.requirements,
      this.props.informationRequirementsTable.requirements
    );
    this.setState({ tabIndex: tabs.indexOf(this.props.tab) });
  }

  componentWillUpdate(nextProps) {
    const tabChanged = nextProps.tab !== this.props.tab;
    if (tabChanged) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({ tabIndex: tabs.indexOf(nextProps.tab) });
    }
  }

  /* eslint-disable no-param-reassign */
  deepMergeById = (r1, r2) =>
    r1.map(({ requirement_guid, sub_requirements, ...rest }) => ({
      requirement_guid,
      ...rest,
      ...r2.find((i) => i.requirement_guid === requirement_guid),
      sub_requirements: this.deepMergeById(sub_requirements, r2),
    }));

  render() {
    const renderTabComponent = (requirements, tabIndex) => (
      <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
    );

    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Tabs
              tabPosition="left"
              activeKey={this.state.activeTab}
              defaultActiveKey={tabs[0]}
              onChange={(tab) => this.props.handleTabChange(tab)}
              className="vertical-tabs"
            >
              {tabs.map((tab) => {
                return (
                  <Tabs.TabPane
                    tab={formatUrlToUpperCaseString(tab)}
                    key={tab}
                    className="vertical-tabs--tabpane"
                  >
                    {renderTabComponent(this.mergedRequirements, this.state.tabIndex)}
                  </Tabs.TabPane>
                );
              })}
            </Tabs>
          </Col>
        </Row>
      </Form>
    );
  }
}

InformationRequirementsTableForm.propTypes = propTypes;

export default InformationRequirementsTableForm;
