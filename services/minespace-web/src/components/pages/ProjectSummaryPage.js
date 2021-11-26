import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { getFormValues } from "redux-form";
import { Row, Col, Typography } from "antd";
import { CaretLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { getProjectSummary } from "@common/selectors/projectSummarySelectors";
import { getProjectSummaryDocumentTypesHash } from "@common/selectors/staticContentSelectors";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  updateProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import { EDIT_PROJECT_SUMMARY, MINE_DASHBOARD } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/AddEditProjectSummaryForm";

const propTypes = {
  formValues: PropTypes.shape({
    project_summary_date: PropTypes.string,
    project_summary_description: PropTypes.string,
    documents: PropTypes.arrayOf(PropTypes.object),
  }),
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      mineGuid: PropTypes.string,
    },
  }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

const defaultProps = {
  projectSummary: {},
  formValues: {},
};

export class ProjectSummaryPage extends Component {
  state = {
    isLoaded: false,
    isEditMode: false,
  };

  componentDidMount() {
    const { mineGuid, projectSummaryGuid } = this.props.match?.params;
    if (mineGuid && projectSummaryGuid) {
      return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid).then(() => {
        this.setState({ isLoaded: true, isEditMode: true });
      });
    }
    return this.setState({ isLoaded: true });
  }

  handleSubmit = (values) => {
    if (!this.state.isEditMode) {
      return this.handleCreateProjectSummary(values);
    }
    return this.handleUpdateProjectSummary(values);
  };

  handleCreateProjectSummary(values) {
    return this.props
      .createProjectSummary(
        {
          mineGuid: this.props.match.params?.mineGuid,
        },
        values
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.history.push(EDIT_PROJECT_SUMMARY.dynamicRoute(mine_guid, project_summary_guid));
        window.location.reload();
      });
  }

  handleUpdateProjectSummary(values) {
    const { mine_guid: mineGuid, project_summary_guid: projectSummaryGuid } = values;
    return this.props
      .updateProjectSummary(
        {
          mineGuid,
          projectSummaryGuid,
        },
        values
      )
      .then(({ data: { mine_guid, project_summary_guid } }) => {
        this.props.fetchProjectSummaryById(mine_guid, project_summary_guid);
      });
  }

  render() {
    const title = this.state.isEditMode
      ? `Edit Project Summary #${this.props.projectSummary?.project_summary_id}`
      : "Create new Project Summary";
    const { mineGuid } = this.props.match?.params;
    return (
      (this.state.isLoaded && (
        <Row>
          <Col span={24}>
            <Typography.Title>
              <Link to={MINE_DASHBOARD.dynamicRoute(mineGuid, "projectSummaries")}>
                <CaretLeftOutlined />
              </Link>
              {title}
            </Typography.Title>
          </Col>
          <Col span={24}>
            <ProjectSummaryForm
              initialValues={this.state.isEditMode ? this.props.projectSummary : {}}
              mineGuid={mineGuid}
              isEditMode={this.state.isEditMode}
              onSubmit={this.handleSubmit}
              projectSummaryDocumentTypesHash={this.props.projectSummaryDocumentTypesHash}
            />
          </Col>
        </Row>
      )) || <Loading />
    );
  }
}

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state) || {},
  projectSummary: getProjectSummary(state),
  projectSummaryDocumentTypesHash: getProjectSummaryDocumentTypesHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createProjectSummary,
      fetchProjectSummaryById,
      updateProjectSummary,
    },
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
