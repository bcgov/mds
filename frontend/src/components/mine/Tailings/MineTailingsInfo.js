import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import {
  createMineExpectedDocument,
  removeExpectedDocument,
  updateExpectedDocument,
} from "@/actionCreators/mineActionCreator";
import {
  fetchExpectedDocumentStatusOptions,
  fetchMineTailingsRequiredDocuments,
} from "@/actionCreators/staticContentActionCreator";
import {
  getExpectedDocumentStatusOptions,
  getMineTSFRequiredReports,
} from "@/selectors/staticContentSelectors";
import { createDropDownList } from "@/utils/helpers";
import MineTailingsTable from "@/components/mine/Tailings/MineTailingsTable";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  expectedDocumentStatusOptions: PropTypes.arrayOf(CustomPropTypes.mineExpectedDocumentStatus)
    .isRequired,
  updateExpectedDocument: PropTypes.func.isRequired,
  removeExpectedDocument: PropTypes.func.isRequired,
  mineTSFRequiredReports: PropTypes.arrayOf(PropTypes.any).isRequired,
  fetchMineTailingsRequiredDocuments: PropTypes.func.isRequired,
  createMineExpectedDocument: PropTypes.func.isRequired,
};

export class MineTailingsInfo extends Component {
  state = { selectedDocument: {} };

  componentDidMount() {
    this.props.fetchExpectedDocumentStatusOptions();
    this.props.fetchMineTailingsRequiredDocuments();
  }

  handleAddReportSubmit = (value) => {
    const requiredReport = this.props.mineTSFRequiredReports.find(
      ({ req_document_guid }) => req_document_guid === value.req_document_guid
    );
    const newRequiredReport = {
      document_name: requiredReport.req_document_name,
      req_document_guid: requiredReport.req_document_guid,
    };
    return this.props
      .createMineExpectedDocument(this.props.mine.guid, newRequiredReport)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  handleEditReportSubmit = (value) => {
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.exp_document_name = value.tsf_report_name;
    updatedDocument.due_date = value.tsf_report_due_date;
    updatedDocument.received_date = value.tsf_report_received_date;
    updatedDocument.exp_document_status = this.props.expectedDocumentStatusOptions.find(
      ({ exp_document_status_code }) => exp_document_status_code === value.tsf_report_status
    );
    return this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, { document: updatedDocument })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  removeReport = (event, exp_doc_guid) => {
    event.preventDefault();
    this.props.removeExpectedDocument(exp_doc_guid).then(() => {
      this.props.fetchMineRecordById(this.props.mine.guid);
    });
  };

  openAddReportModal = (event, onSubmit, title, mineTSFRequiredReports) => {
    event.preventDefault();
    const mineTSFRequiredReportsDropDown = createDropDownList(
      mineTSFRequiredReports,
      "req_document_name",
      "req_document_guid"
    );
    this.props.openModal({
      props: { onSubmit, title, mineTSFRequiredReportsDropDown },
      content: modalConfig.ADD_TAILINGS_REPORT,
    });
  };

  openEditReportModal = (event, onSubmit, title, doc) => {
    this.setState({
      selectedDocument: doc,
    });
    event.preventDefault();

    if (doc) {
      const initialValues = {
        tsf_report_name: doc.exp_document_name === "None" ? null : doc.exp_document_name,
        tsf_report_due_date: doc.due_date === "None" ? null : doc.due_date,
        tsf_report_received_date: doc.received_date,
        tsf_report_status: doc.exp_document_status.exp_document_status_code,
      };
      const statusOptions = createDropDownList(
        this.props.expectedDocumentStatusOptions,
        "description",
        "exp_document_status_code"
      );
      this.props.openModal({
        props: { onSubmit, title, statusOptions, initialValues, selectedDocument: doc },
        content: modalConfig.EDIT_TAILINGS_REPORT,
      });
    }
  };

  render() {
    return (
      <MineTailingsTable
        mine={this.props.mine}
        openAddReportModal={this.openAddReportModal}
        handleAddReportSubmit={this.handleAddReportSubmit}
        mineTSFRequiredReports={this.props.mineTSFRequiredReports}
        openEditReportModal={this.openEditReportModal}
        removeReport={this.removeReport}
        handleEditReportSubmit={this.handleEditReportSubmit}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
  mineTSFRequiredReports: getMineTSFRequiredReports(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchExpectedDocumentStatusOptions,
      updateExpectedDocument,
      fetchMineTailingsRequiredDocuments,
      removeExpectedDocument,
      createMineExpectedDocument,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
