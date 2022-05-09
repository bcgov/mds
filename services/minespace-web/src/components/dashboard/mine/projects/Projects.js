/**
 * TODO: We have disabled the "Start a new application" button after 1 project summary has been created under a project.
 * This is meant to prevent future bad data and will remain intact until the update Project UI/workflow has been deployed to Prod.
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button, Tooltip } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import { fetchProjectsByMine } from "@common/actionCreators/projectActionCreator";
import { getProjects } from "@common/selectors/projectSelectors";
import CustomPropTypes from "@/customPropTypes";
import ProjectTable from "@/components/dashboard/mine/projects/ProjectsTable";
import * as routes from "@/constants/routes";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  fetchProjectsByMine: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(CustomPropTypes.project).isRequired,
};

const defaultProps = {
  mines: {},
};

export class Projects extends Component {
  state = { isLoaded: false, mine: {} };

  componentDidMount() {
    const { id } = this.props.project.params;
    this.handleFetchData(id);
  }

  handleFetchData = (id) => {
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchProjectsByMine({ mineGuid: id }).then(() => {
        this.setState({
          isLoaded: true,
          mine: this.props.mines[id],
        });
      });
    });
  };

  handleDeleteDraft = (e, projectSummaryGuid) => {
    const { id } = this.props.match.params;
    e.preventDefault();
    this.props.deleteProjectSummary(id, projectSummaryGuid).then(() => {
      this.handleFetchData(id);
    });
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>All Projects</Typography.Title>
          <Typography.Paragraph>
            The first step in applying for a new or amending an existing production mineral or coal
            mining permit issued under the Mines Act is to submit a project description. A{" "}
            <Typography.Text className="color-primary" strong>
              project description&nbsp;
            </Typography.Text>{" "}
            is a high level overview of a production mining project used for assessment.{" "}
          </Typography.Paragraph>
          <Typography.Paragraph>
            If you are proposing induced polarization surveys or exploration drilling within the
            permit mine area of an operating production mineral or coal mine (
            <a
              href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/health-and-safety/code-review/health_safety_and_reclamation_code_apr2021.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              HSRC
            </a>
            &nbsp;10.1.2), please submit a&nbsp;
            <a
              href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/mines-act-deemed-authorizations"
              target="_blank"
              rel="noopener noreferrer"
            >
              Notification of Deemed Authorization
            </a>
            &nbsp;application through&nbsp;
            <a
              href="https://portal.nrs.gov.bc.ca/web/client/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              FrontCounter BC
            </a>
            .
          </Typography.Paragraph>
          <Typography.Paragraph>
            If you are proposing exploration work (
            <a
              href="https://www2.gov.bc.ca/assets/gov/farming-natural-resources-and-industry/mineral-exploration-mining/documents/health-and-safety/code-review/health_safety_and_reclamation_code_apr2021.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              HSRC
            </a>
            &nbsp;9.1.1) outside of the permit mine area of an operating production mineral or coal
            mine that does not consist of an expansion to the production mining area, please submit
            a Notice of Work application through{" "}
            <a
              href="https://portal.nrs.gov.bc.ca/web/client/home"
              target="_blank"
              rel="noopener noreferrer"
            >
              FrontCounter BC
            </a>
            &nbsp;to amend your MX or CX permit.
          </Typography.Paragraph>
          <Typography.Paragraph>
            If you are unsure how to proceed, please email the Major Mines Office at&nbsp;
            <a href="mailto:permrecl@gov.bc.ca">permrecl@gov.bc.ca</a>&nbsp;or contact the&nbsp;
            <a
              href=" https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/further-information/office-chief-inspector"
              target="_blank"
              rel="noopener noreferrer"
            >
              Regional Mines Office
            </a>
            &nbsp;closest to your project location.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <AuthorizationWrapper>
              <Link to={routes.ADD_PROJECT_SUMMARY.dynamicRoute(this.state.mine.mine_guid)}>
                <Button type="primary">
                  <PlusCircleFilled />
                  Create New Project
                </Button>
              </Link>
            </AuthorizationWrapper>
          </Typography.Paragraph>
          <ProjectTable
            projects={this.props.projects}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  projects: getProjects(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchProjectsByMine,
    },
    dispatch
  );

Projects.propTypes = propTypes;
Projects.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
