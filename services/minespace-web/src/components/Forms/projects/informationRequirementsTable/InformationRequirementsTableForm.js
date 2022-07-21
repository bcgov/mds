import React, { Component } from "react";
import CustomPropTypes from "@/customPropTypes";
import PropTypes from "prop-types";
import { formatUrlToUpperCaseString } from "@common/utils/helpers";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col, Tabs } from "antd";
import ReviewSubmitInformationRequirementsTable from "@/components/Forms/projects/informationRequirementsTable/ReviewSubmitInformationRequirementsTable";

const propTypes = {
  informationRequirementsTable: CustomPropTypes.informationRequirementsTable.isRequired,
  requirements: CustomPropTypes.requirements.isRequired,
  tab: PropTypes.string.isRequired,
  handleTabChange: PropTypes.func.isRequired,
  sideMenuOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export class InformationRequirementsTableForm extends Component {
  state = {
    tabIndex: 0,
    activeTab: this.props.sideMenuOptions ? this.props.sideMenuOptions[0] : null,
  };

  mergedRequirements = [];

  componentDidMount() {
    this.mergedRequirements = this.deepMergeById(
      this.props.requirements,
      this.props.informationRequirementsTable?.requirements.filter(
        ({ deleted_ind }) => deleted_ind === false
      )
    );
    this.setState({ tabIndex: this.props.sideMenuOptions.indexOf(this.props.tab) });
  }

  componentWillUpdate(nextProps) {
    const tabChanged = nextProps.tab !== this.props.tab;
    if (tabChanged) {
      // eslint-disable-next-line react/no-will-update-set-state
      this.setState({ tabIndex: this.props.sideMenuOptions.indexOf(nextProps.tab) });
    }
  }

  /* eslint-disable no-param-reassign */
  deepMergeById = (r1, r2) =>
    r1.map(({ requirement_guid, sub_requirements, ...rest }) => ({
      requirement_guid,
      ...rest,
      ...r2?.find((i) => i.requirement_guid === requirement_guid),
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
              defaultActiveKey={this.props.sideMenuOptions[0]}
              onChange={(tab) => this.props.handleTabChange(tab)}
              className="vertical-tabs"
            >
              {this.props.sideMenuOptions.map((tab) => {
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
