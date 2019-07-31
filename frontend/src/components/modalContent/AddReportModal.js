import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { concat, reject } from "lodash";
import { getFormValues } from "redux-form";
import * as FORM from "@/constants/forms";
import AddReportForm from "@/components/Forms/reports/AddReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  addReportFormValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  addReportFormValues: {},
  initialValues: {},
};

export class AddReportModal extends Component {
  state = {
    uploadedFiles:
      this.props.initialValues && this.props.initialValues.mine_report_submissions.documents
        ? [...this.props.initialValues.mine_report_submissions.documents]
        : [],
  };

  handleReportSubmit = () => {
    this.props.onSubmit({
      ...this.props.addReportFormValues,
      updated_documents: this.state.uploadedFiles,
    });
    // TODO: Catch error
    this.close();
  };

  close = () => {
    this.props.closeModal();
  };

  onFileLoad = (document_name, document_manager_guid) =>
    this.setState((prevState) => ({
      uploadedFiles: concat(prevState.uploadedFiles, {
        document_name,
        document_manager_guid,
      }),
    }));

  onRemoveFile = (file) => {
    this.setState((prevState) => ({
      uploadedFiles: reject(
        prevState.uploadedFiles,
        (uploadedFile) => file.document_manager_guid === uploadedFile.document_manager_guid
      ),
    }));
  };

  render = () => {
    return (
      <div>
        <AddReportForm
          onSubmit={this.props.onSubmit}
          closeModal={this.props.closeModal}
          title={this.props.title}
          mineGuid={this.props.mineGuid}
          uploadedFiles={this.state.uploadedFiles}
          onFileLoad={this.onFileLoad}
          onRemoveFile={this.onRemoveFile}
          handleReportSubmit={this.handleReportSubmit}
          initialValues={this.props.initialValues}
        />
      </div>
    );
  };
}

const mapStateToProps = (state) => ({
  addReportFormValues: getFormValues(FORM.ADD_REPORT)(state) || {},
});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);
AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddReportModal);
