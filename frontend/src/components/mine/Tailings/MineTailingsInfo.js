import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Row, Col, Divider } from "antd";
import CustomPropTypes from "@/customPropTypes";
import { modalConfig } from "@/components/modalContent/config";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import {
  createMineExpectedDocument,
  removeExpectedDocument,
  updateExpectedDocument,
  fetchMineRecordById,
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
import AddButton from "@/components/common/AddButton";
import { getMines, getMineGuid } from "@/selectors/mineSelectors";
import { openModal, closeModal } from "@/actions/modalActions";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
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
      .createMineExpectedDocument(this.props.mineGuid, newRequiredReport)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mineGuid);
      });
  };

  handleEditReportSubmit = (value) => {
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.exp_document_name = value.tsf_report_name;
    updatedDocument.due_date = value.tsf_report_due_date;
    updatedDocument.received_date = value.tsf_report_received_date;
    updatedDocument.exp_document_status_code = value.tsf_report_status;

    return this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, updatedDocument)
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mineGuid);
      });
  };

  removeReport = (event, exp_doc_guid) => {
    event.preventDefault();
    this.props.removeExpectedDocument(exp_doc_guid).then(() => {
      this.props.fetchMineRecordById(this.props.mineGuid);
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
        tsf_report_due_date: doc.due_date === "None" ? null : doc.due_date,
        tsf_report_received_date: doc.received_date,
        tsf_report_status: doc.expected_document_status.exp_document_status_code,
      };
      const statusOptions = createDropDownList(
        this.props.expectedDocumentStatusOptions,
        "description",
        "exp_document_status_code"
      );
      this.props.openModal({
        props: {
          onSubmit,
          title: `${title}: ${doc.exp_document_name}`,
          statusOptions,
          initialValues,
          selectedDocument: doc,
        },
        content: modalConfig.EDIT_TAILINGS_REPORT,
      });
    }
  };

  render() {
    const mine = this.props.mines[this.props.mineGuid];
    return (
      <div className="tab__content">
        <div>
          <h2>Tailings</h2>
          <Divider />
        </div>
        {mine.mine_tailings_storage_facilities.map((facility) => (
          <Row
            key={facility.mine_tailings_storage_facility_guid}
            gutter={16}
            style={{ marginBottom: "10px" }}
          >
            <Col span={6}>
              <h3>{facility.mine_tailings_storage_facility_name}</h3>
              <p>No TSF registry data available</p>
            </Col>
          </Row>
        ))}
        <br />
        <br />
        <div>
          <div>
            <div className="inline-flex between">
              <div>
                <h3>Reports</h3>
              </div>
              <div className="inline-flex between">
                <AuthorizationWrapper
                  permission={Permission.EDIT_MINES}
                  isMajorMine={mine.major_mine_ind}
                >
                  <AddButton
                    onClick={(event) =>
                      this.openAddReportModal(
                        event,
                        this.handleAddReportSubmit,
                        ModalContent.ADD_TAILINGS_REPORT,
                        this.props.mineTSFRequiredReports
                      )
                    }
                  >
                    {ModalContent.ADD_TAILINGS_REPORT}
                  </AddButton>
                </AuthorizationWrapper>
              </div>
            </div>
          </div>
          <br />
          <MineTailingsTable
            mine={mine}
            openAddReportModal={this.openAddReportModal}
            handleAddReportSubmit={this.handleAddReportSubmit}
            mineTSFRequiredReports={this.props.mineTSFRequiredReports}
            openEditReportModal={this.openEditReportModal}
            removeReport={this.removeReport}
            handleEditReportSubmit={this.handleEditReportSubmit}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
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
      fetchMineRecordById,
      openModal,
      closeModal,
    },
    dispatch
  );

MineTailingsInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
