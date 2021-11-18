import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Link } from "react-router-dom";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import { Row, Col, Typography } from "antd";
import { CaretLeftOutlined } from "@ant-design/icons";
import { required, maxLength } from "@common/utils/Validate";
import PropTypes from "prop-types";
import * as FORM from "@/constants/forms";
import Loading from "@/components/common/Loading";
import { renderConfig } from "@/components/common/config";
import { MINE_PROJECT_SUMMARIES } from "@/constants/routes";
import CustomPropTypes from "@/customPropTypes";
import ProjectSummaryForm from "@/components/Forms/projectSummaries/AddEditProjectSummaryForm";
import { getProjectSummary } from "@common/selectors/projectSummarySelectors";
import {
  getProjectSummaryDocumentTypesHash,
  getProjectSummaryStatusCodesHash,
} from "@common/selectors/staticContentSelectors";
import { 
  createProjectSummary, fetchProjectSummaryById, updateProjectSummary, addDocumentToProjectSummary
} from "@common/actionCreators/projectSummaryActionCreator";

const propTypes = {
  formValues : PropTypes.shape({
    project_summary_date: PropTypes.string,
    project_summary_description: PropTypes.string,
    documents: PropTypes.array,
  }),
  projectSummary: CustomPropTypes.projectSummary,
  fetchProjectSummaryById: PropTypes.func.isRequired,
  createProjectSummary: PropTypes.func.isRequired,
  updateProjectSummary: PropTypes.func.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  projectSummary: {},
};

export class ProjectSummaryPage extends Component {
  state = { 
    isLoaded: false,
    initialValues: {},
    isEditMode: false,
    mineGuid: null,
    projectSummaryGuid: null,
  };

  componentDidMount() {
    const { mineGuid, projectSummaryGuid } = this.props.match?.params
    this.setState({ mineGuid, projectSummaryGuid })
    if (mineGuid && projectSummaryGuid) {
      return this.props.fetchProjectSummaryById(mineGuid, projectSummaryGuid)
        .then(() => { 
          this.setState({ isLoaded: true, isEditMode: true });
        });
    }
    this.setState({ isLoaded: true, mineGuid });
  };

  handleAddDocuments = (files, projectSummaryGuid) =>
    Promise.all(
      Object.entries(files).map(([document_manager_guid, document_name]) =>
        this.props.addDocumentToProjectSummary(
          { mineGuid: this.state.mineGuid, projectSummaryGuid },
          {
            project_summary_document_category_code: "GEN",
            document_manager_guid,
            document_name,
          }
        )
      )
    );

  handleSubmit = (form) => {
    console.log('FORM: ', form)
    if (!this.state.isEditMode) {
      return this.handleCreateProjectSummary(form);
    }
    return this.handleUpdateProjectSummary(form);
  };

  handleCreateProjectSummary(form) {
    return this.props
      .createProjectSummary(
        { 
          mineGuid: this.props.match.params?.mineGuid
        }, 
        form
      )
    .then(async ({ data: { project_summary_guid } }) => {
      await this.handleAddDocuments(files, project_summary_guid);
    })
    // .then(this.props.history.push(MINE_PROJECT_SUMMARIES.dynamicRoute(this.state.mineGuid)));
  };

  handleUpdateProjectSummary(form) {
    const {
      mine_guid,
      project_summary_guid,
    } = form;
    return this.props
      .updateProjectSummary(
        {
          mineGuid: mine_guid,
          projectSummaryGuid: project_summary_guid,
        },
        form
      )
    .then(async ({ data: { project_summary_guid } }) => {
      await this.handleAddDocuments(files, project_summary_guid);
    })
    // .then(this.props.history.push(MINE_PROJECT_SUMMARIES.dynamicRoute(this.state.mineGuid)));
  };

  render() {
    const title = this.state.isEditMode ? "Edit Project Summary" : "Create new Project Summary";
    return (
      (this.state.isLoaded && (
        <Row>
          <Col span={24}>
            <Typography.Title>
              <Link to={MINE_PROJECT_SUMMARIES.dynamicRoute(this.state.mineGuid)}><CaretLeftOutlined /></Link>
              {title}
            </Typography.Title>
          </Col>
          <Col span={24}>
            <ProjectSummaryForm
              initialValues={this.props.projectSummary}
              mineGuid={this.state.mineGuid}
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
      addDocumentToProjectSummary,
    }, 
    dispatch
  );

ProjectSummaryPage.propTypes = propTypes;
ProjectSummaryPage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryPage);
