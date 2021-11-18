import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Row, Col, Typography, Button } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getMines } from "@common/selectors/mineSelectors";
import { openModal, closeModal } from "@common/actions/modalActions";
import { fetchMineRecordById } from "@common/actionCreators/mineActionCreator";
import {
  fetchProjectSummariesByMine,
  createProjectSummary,
  addDocumentToProjectSummary,
  updateProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
import {
  getProjectSummaryStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { getProjectSummaries } from "@common/selectors/projectSummarySelectors";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummariesTable from "@/components/dashboard/mine/projectSummaries/ProjectSummariesTable";
import * as routes from "@/constants/routes";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine),
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  fetchProjectSummariesByMine: PropTypes.func.isRequired,
  projectSummaryStatusCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectSummaries: PropTypes.arrayOf(CustomPropTypes.variance).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  addDocumentToProjectSummary: PropTypes.func.isRequired,
};

const defaultProps = {
  mines: {},
};

export class ProjectSummaries extends Component {
  state = { isLoaded: false, mine: {} };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.props.fetchProjectSummariesByMine({ mineGuid: id }).then(() => {
        this.setState({ isLoaded: true, mine: this.props.mines[id] });
      });
    });
  };

  render() {
    return (
      <Row>
        <Col span={24}>
          <Link to={routes.ADD_PROJECT_SUMMARY.dynamicRoute(this.state.mine.mine_guid)}>
            <Button
              style={{ display: "inline", float: "right" }}
              type="primary"
            >
              <PlusCircleFilled />
              Create a new Project Summary
            </Button>
          </Link>
          <Typography.Title level={4}>Project Summaries</Typography.Title>
          <Typography.Paragraph>
            This table displays all of the&nbsp;
            <Typography.Text className="color-primary" strong>
              project summaries&nbsp;
            </Typography.Text>
            associated with this mine.
          </Typography.Paragraph>
          <ProjectSummariesTable
            projectSummaries={this.props.projectSummaries}
            mine={this.state.mine}
            isLoaded={this.state.isLoaded}
            projectSummaryStatusCodesHash={this.props.projectSummaryStatusCodesHash}
          />
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  projectSummaries: getProjectSummaries(state),
  projectSummaryStatusCodesHash: getProjectSummaryStatusCodesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      openModal,
      closeModal,
      fetchProjectSummariesByMine,
      createProjectSummary,
      updateProjectSummary,
      addDocumentToProjectSummary,
    },
    dispatch
  );

ProjectSummaries.propTypes = propTypes;
ProjectSummaries.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaries);
