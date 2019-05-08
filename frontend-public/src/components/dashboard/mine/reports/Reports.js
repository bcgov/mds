import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { find } from "lodash";

import { getMine } from "@/selectors/userMineSelectors";
import CustomPropTypes from "@/customPropTypes";
import Loading from "@/components/common/Loading";
import {
  fetchMineRecordById,
  updateExpectedDocument,
} from "@/actionCreators/userDashboardActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import MineReportTable from "@/components/dashboard/mine/reports/MineReportTable";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateExpectedDocument: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class Reports extends Component {
  state = { isLoaded: false, selectedDocument: {} };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.fetchMineRecordById(id).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReportSubmit = () => {
    this.props.fetchMineRecordById(this.props.mine.mine_guid).then(() => {
      const expDoc = find(
        this.props.mine.mine_expected_documents,
        ({ exp_document_guid }) =>
          exp_document_guid === this.state.selectedDocument.exp_document_guid
      );

      expDoc.expected_document_status.exp_document_status_code = "PRE";

      // Set received_date for first set of documents
      if (!expDoc.received_date && expDoc.related_documents.length > 0) {
        expDoc.received_date = moment();
      }

      // Reset received state when all documents deleted
      if (expDoc.related_documents.length === 0) {
        expDoc.expected_document_status.exp_document_status_code = "MIA";
        expDoc.received_date = null;
      }

      this.props.updateExpectedDocument(expDoc.exp_document_guid, expDoc).then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.mine_guid);
      });
    });
  };

  openEditReportModal = (event, onSubmit, title, doc) => {
    this.setState({
      selectedDocument: doc,
    });
    event.preventDefault();

    this.props.openModal({
      props: { onSubmit, title, selectedDocument: doc },
      content: modalConfig.EDIT_REPORT,
    });
  };

  render() {
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    return (
      <div className="mine-info-padding">
        {this.props.mine && (
          <div>
            <Row>
              <Col xs={22} sm={22} md={14} lg={12}>
                <h1 className="mine-title">{this.props.mine.mine_name}</h1>
                <p>Mine No. {this.props.mine.mine_no}</p>
              </Col>
            </Row>
            <Row>
              <Col xs={22} sm={22} md={20} lg={16}>
                <h2>2018 Reports</h2>
                <br />
                <MineReportTable
                  mine={this.props.mine}
                  openEditReportModal={this.openEditReportModal}
                  handleEditReportSubmit={this.handleEditReportSubmit}
                />
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  mine: getMine(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineRecordById,
      openModal,
      closeModal,
      updateExpectedDocument,
    },
    dispatch
  );

Reports.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
