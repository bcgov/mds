import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import {
  fetchProjectSummariesByMine,
  deleteProjectSummary,
  importIrtSpreadsheet,
} from "@common/actionCreators/projectSummaryActionCreator";
import { getProjectSummaryAliasStatusCodesHash } from "@common/selectors/staticContentSelectors";
import { getProjectSummaries } from "@common/selectors/projectSummarySelectors";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummariesTable from "@/components/dashboard/mine/projectSummaries/ProjectSummariesTable";
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
  deleteProjectSummary: PropTypes.func.isRequired,
  fetchProjectSummariesByMine: PropTypes.func.isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
};

const defaultProps = {
  mines: {},
};

export class ProjectSummaries extends Component {
  state = { isLoaded: false, mine: {} };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.handleFetchData(id);
  }

  handleFetchData = (id) => {
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchProjectSummariesByMine({ mineGuid: id }).then(() => {
        this.setState({ isLoaded: true, mine: this.props.mines[id] });
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

  handleImportIrt = async () => {
    let fileHandle;
    [fileHandle] = await window?.showOpenFilePicker();
    console.log("Filehandle: ", fileHandle);
    const file = await fileHandle.getFile();
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>Application Submissions</Typography.Title>
          <Typography.Paragraph>
            A&nbsp;
            <Typography.Text className="color-primary" strong>
              project description&nbsp;
            </Typography.Text>
            is a high level overview of a production mining project used for assessment prior to
            applying for a new or amending an existing production mineral or coal mining permit
            issued under the Mines Act.
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
                  Start a new application
                </Button>
              </Link>
            </AuthorizationWrapper>
          </Typography.Paragraph>
          <Button onClick={this.handleImportIrt}>IRT Spreadsheet Import</Button>
          <ProjectSummariesTable
            projectSummaries={this.props.projectSummaries}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
            projectSummaryStatusCodesHash={this.props.projectSummaryStatusCodesHash}
            handleDeleteDraft={this.handleDeleteDraft}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  projectSummaries: getProjectSummaries(state),
  projectSummaryStatusCodesHash: getProjectSummaryAliasStatusCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      fetchProjectSummariesByMine,
      deleteProjectSummary,
      importIrtSpreadsheet,
    },
    dispatch
  );

ProjectSummaries.propTypes = propTypes;
ProjectSummaries.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaries);
