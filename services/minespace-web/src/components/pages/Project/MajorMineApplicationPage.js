import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { change, submit, getFormSyncErrors, reset, touch } from "redux-form";
import { Row, Col, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import customPropTypes from "@/customPropTypes";
import { flattenObject, cleanFilePondFile } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { EDIT_PROJECT } from "@/constants/routes";
import { getProject } from "@common/reducers/projectReducer";
import { getMines } from "@common/selectors/mineSelectors";
import {
  fetchProjectById,
  createMajorMineApplication,
} from "@common/actionCreators/projectActionCreator";
import { clearMajorMinesApplication } from "@common/actions/projectActions";
import MajorMineApplicationForm from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationForm";
import { getMajorMinesApplicationDocumentTypesHash } from "@common/selectors/staticContentSelectors";

const propTypes = {
  mines: PropTypes.arrayOf(customPropTypes.mine).isRequired,
  project: customPropTypes.project.isRequired,
  clearMajorMinesApplication: PropTypes.func.isRequired,
  createMajorMineApplication: PropTypes.func.isRequired,
  fetchProjectById: PropTypes.func.isRequired,
  majorMinesApplicationDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape({
    params: {
      projectGuid: PropTypes.string,
    },
  }).isRequired,
  touch: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  formErrors: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
  formErrors: {},
};

export class MajorMineApplicationPage extends Component {
  componentDidMount() {
    this.handleFetchData();
  }

  componentWillUnmount() {
    this.props.clearMajorMinesApplication();
  }

  handleFetchData = () => {
    const { projectGuid } = this.props.match?.params;
    return this.props.fetchProjectById(projectGuid);
  };

  handleCreateMajorMineApplication = (values, message) => {
    return this.props
      .createMajorMineApplication(
        { projectGuid: this.props.match.params?.projectGuid },
        values,
        message
      )
      .then(() => {
        cleanFilePondFile();
      });
  };

  clearDocuments = (url) => {
    const a = document.createElement("a");
    a.href = url.url;
  };

  handleSaveData = (e, values, message) => {
    e.preventDefault();
    this.props.submit(FORM.ADD_MINE_MAJOR_APPLICATION);
    this.props.touch(FORM.ADD_MINE_MAJOR_APPLICATION);
    const errors = Object.keys(flattenObject(this.props.formErrors));
    if (errors.length === 0) {
      return this.handleCreateMajorMineApplication(values, message);
    }
    return null;
  };

  render() {
    const mineGuid = this.props.project?.mine_guid;
    const mineName = this.props.mines[mineGuid]?.mine_name || "";
    const title = `New major mine application for ${mineName}`;
    return (
      <>
        <Row>
          <Col span={24}>
            <Typography.Title>{title}</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Link to={EDIT_PROJECT.dynamicRoute(this.props.project?.project_guid)}>
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {this.props.project.project_title} Project Overview page
            </Link>
          </Col>
        </Row>
        <br />
        <MajorMineApplicationForm
          handleSaveData={this.handleSaveData}
          initialValues={this.props.project?.major_mine_application}
          projectGuid={this.props.project?.project_guid}
          majorMinesApplicationDocumentTypesHash={this.props.majorMinesApplicationDocumentTypesHash}
        />
      </>
    );
  }
}

MajorMineApplicationPage.propTypes = propTypes;
MajorMineApplicationPage.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  anyTouched: state.form[FORM.ADD_MINE_MAJOR_APPLICATION]?.anyTouched || false,
  fieldsTouched: state.form[FORM.ADD_MINE_MAJOR_APPLICATION]?.fields || {},
  project: getProject(state),
  majorMinesApplicationDocumentTypesHash: getMajorMinesApplicationDocumentTypesHash(state),
  mines: getMines(state),
  formErrors: getFormSyncErrors(FORM.ADD_MINE_MAJOR_APPLICATION)(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createMajorMineApplication,
      fetchProjectById,
      clearMajorMinesApplication,
      submit,
      reset,
      touch,
      change,
    },
    dispatch
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MajorMineApplicationPage));
