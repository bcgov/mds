import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Tabs, Tag } from "antd";
import "@ant-design/compatible/assets/index.css";
import PropTypes from "prop-types";
import { formatDate } from "@common/utils/helpers";
import {
  fetchRequirements,
  fetchProjectById,
  updateInformationRequirementsTable,
} from "@common/actionCreators/projectActionCreator";
import { getInformationRequirementsTableStatusCodesHash } from "@common/selectors/staticContentSelectors";
import {
  getProject,
  getInformationRequirementsTable,
  getRequirements,
} from "@common/selectors/projectSelectors";
import { ArrowLeftOutlined, EnvironmentOutlined } from "@ant-design/icons";
import ReviewInformationRequirementsTable from "@/components/mine/Projects/ReviewInformationRequirementsTable";
import UpdateInformationRequirementsTableForm from "@/components/Forms/informationRequirementsTable/UpdateInformationRequirementsTableForm";
import CustomPropTypes from "@/customPropTypes";
import * as routes from "@/constants/routes";

const propTypes = {
  project: CustomPropTypes.project.isRequired,
  requirements: PropTypes.arrayOf(CustomPropTypes.requirements).isRequired,
  informationRequirementsTable: CustomPropTypes.informationRequirementsTable.isRequired,
  informationRequirementsTableStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      projectGuid: PropTypes.string,
      irtGuid: PropTypes.string,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  fetchRequirements: PropTypes.func.isRequired,
  updateInformationRequirementsTable: PropTypes.func.isRequired,
};

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

export class InformationRequirementsTableTab extends Component {
  mergedRequirements = [];

  constructor(props) {
    super(props);
    this.state = {
      fixedTop: false,
      activeTab: "intro-project-overview",
    };
  }

  componentDidMount() {
    this.handleFetchData();
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  /* eslint-disable no-param-reassign */
  deepMergeById = (r1, r2) =>
    r1.map(({ requirement_guid, sub_requirements, ...rest }) => ({
      requirement_guid,
      ...rest,
      ...r2.find((i) => i.requirement_guid === requirement_guid),
      sub_requirements: this.deepMergeById(sub_requirements, r2),
    }));

  handleScroll = () => {
    if (window.pageYOffset > 170 && !this.state.fixedTop) {
      this.setState({ fixedTop: true });
    } else if (window.pageYOffset <= 170 && this.state.fixedTop) {
      this.setState({ fixedTop: false });
    }
  };

  handleTabChange = (activeTab) => {
    const { projectGuid, irtGuid } = this.props.match.params;
    const url = routes.INFORMATION_REQUIREMENTS_TABLE.dynamicRoute(projectGuid, irtGuid, activeTab);
    this.props.history.push(url);
    this.setState({ activeTab });
  };

  handleFetchData = () => {
    const { projectGuid } = this.props.match.params;
    if (projectGuid) {
      return this.props
        .fetchProjectById(projectGuid)
        .then(() => this.props.fetchRequirements())
        .then(() => this.setState({ isLoaded: true }))
        .catch(() => this.setState({ isLoaded: false }));
    }
    return null;
  };

  handleUpdateIRT = (event, values) => {
    event.preventDefault();
    const { projectGuid, irtGuid } = this.props.match.params;
    return this.props
      .updateInformationRequirementsTable(
        {
          projectGuid,
          informationRequirementsTableGuid: irtGuid,
        },
        values
      )
      .then(() => this.handleFetchData());
  };

  render() {
    const {
      project_title,
      mine_name,
      mine_guid,
      project_guid,
      information_requirements_table,
    } = this.props.project;
    const updateUser = information_requirements_table?.update_user;
    const updateDate = formatDate(information_requirements_table?.update_timestamp);
    const statusCode = information_requirements_table?.status_code;

    this.mergedRequirements = this.deepMergeById(
      this.props.requirements,
      this.props.informationRequirementsTable?.requirements?.filter(
        ({ deleted_ind }) => deleted_ind === false
      )
    );

    return (
      <div className="page">
        <div
          className={
            this.state.fixedTop
              ? "padding-lg view--header fixed-scroll"
              : " padding-lg view--header"
          }
        >
          <h1>
            {project_title}
            <span className="padding-sm--left">
              <Tag title={`Mine: ${mine_name}`}>
                <Link
                  style={{ textDecoration: "none" }}
                  to={routes.MINE_GENERAL.dynamicRoute(mine_guid)}
                  disabled={!mine_guid}
                >
                  <EnvironmentOutlined className="padding-sm--right" />
                  {mine_name}
                </Link>
              </Tag>
            </span>
          </h1>
          <Link to={routes.PROJECTS.dynamicRoute(project_guid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            Back to: {mine_name} Project overview
          </Link>
          <Tabs
            size="large"
            animated={{ inkBar: true, tabPane: false }}
            className="now-tabs"
            style={{ margin: "0" }}
            centered
          >
            <Tabs.TabPane tab="IRT" key="irt">
              <></>
            </Tabs.TabPane>
          </Tabs>
        </div>
        <div>
          <Tabs
            size="large"
            activeKey={this.state.activeTab}
            className="now-tabs vertical-tabs"
            tabPosition="left"
            animated={{ inkBar: true, tabPane: false }}
            onChange={(tab) => this.handleTabChange(tab)}
          >
            {sideMenuOptions.map((tab, idx) => (
              <Tabs.TabPane tab={tab.title} key={tab.href} className="vertical-tabs--tabpane">
                <div>
                  <UpdateInformationRequirementsTableForm
                    initialValues={{
                      status_code: statusCode,
                    }}
                    displayValues={{
                      statusCode,
                      updateUser,
                      updateDate,
                      informationRequirementsTableStatusCodesHash: this.props
                        .informationRequirementsTableStatusCodesHash,
                    }}
                    handleSubmit={this.handleUpdateIRT}
                  />
                  <ReviewInformationRequirementsTable
                    requirements={this.mergedRequirements[idx]}
                    isLoaded={this.state.isLoaded}
                  />
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  project: getProject(state),
  informationRequirementsTable: getInformationRequirementsTable(state),
  requirements: getRequirements(state),
  informationRequirementsTableStatusCodesHash: getInformationRequirementsTableStatusCodesHash(
    state
  ),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchProjectById,
      fetchRequirements,
      updateInformationRequirementsTable,
    },
    dispatch
  );

InformationRequirementsTableTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(InformationRequirementsTableTab);
