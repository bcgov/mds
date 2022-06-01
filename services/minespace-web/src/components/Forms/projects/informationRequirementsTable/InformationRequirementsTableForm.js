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
    this.mergedRequirements = this.mergeById(
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
  mergeById = (r1, r2) =>
    r1.map((item) => {
      item.sub_requirements = item.sub_requirements.map((sub_item) => ({
        ...sub_item,
        ...r2.find((r2_item) => r2_item.requirement_guid === sub_item.requirement_guid),
      }));

      return item;
    });

  render() {
    const renderTabComponent = (tab, tabIndex, requirements) =>
      ({
        "intro-project-overview": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "baseline-information": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "mine-plan": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "reclamation-closure-plan": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "modelling-mitigation-discharges": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "environmental-assessment-predictions": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "environmental-monitoring": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "health-safety": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
        "management-plan": (
          <ReviewSubmitInformationRequirementsTable requirements={requirements[tabIndex]} />
        ),
      }[tab]);

    return (
      <Form layout="vertical">
        <Row gutter={16}>
          <Col>
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
                    {renderTabComponent(
                      tabs[this.state.tabIndex],
                      this.state.tabIndex,
                      this.mergedRequirements
                    )}
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
