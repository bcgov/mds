import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Row, Col } from "antd";
import { find } from "lodash";

import { getMine } from "@/selectors/userMineInfoSelector";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import {
  fetchMineRecordById,
  updateExpectedDocument,
} from "@/actionCreators/userDashboardActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import MineInfoList from "@/components/dashboard/mineInfo/MineInfoList";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  match: PropTypes.shape({
    params: {
      mineId: PropTypes.string,
    },
  }).isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  updateExpectedDocument: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class MineInfo extends Component {
  state = { isLoaded: false, selectedDocument: {} };

  componentDidMount() {
    const { mineId } = this.props.match.params;
    this.props.fetchMineRecordById(mineId).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReportSubmit = () => {
    // Get state of document before latest upload/edits
    const updatedDocument = this.state.selectedDocument;
    // Get document latest version
    const updatedMineDocument = find(
      this.props.mine.mine_expected_documents,
      ({ exp_document_guid }) => exp_document_guid === updatedDocument.exp_document_guid
    );

    // Set status to received/pending review
    updatedDocument.exp_document_status.exp_document_status_code = "PRE";

    // Only set received_date when going from 0 to 1 uploaded documents
    if (
      updatedDocument.related_documents.length === 0 &&
      updatedMineDocument.related_documents.length === 1
    ) {
      updatedDocument.received_date = moment();
    }

    // Reset received state when all documents deleted
    if (updatedMineDocument.related_documents.length === 0) {
      updatedDocument.exp_document_status.exp_document_status_code = "MIA";
      updatedDocument.received_date = null;
    }
    this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, { document: updatedDocument })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
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
              <Col xs={1} sm={1} md={2} lg={4} />
              <Col xs={22} sm={22} md={14} lg={12}>
                <h1 className="mine-title">{this.props.mine.mine_name}</h1>
                <p>Mine No. {this.props.mine.mine_no}</p>
              </Col>
              <Col xs={22} sm={22} md={6} lg={4}>
                <QuestionSidebar />
              </Col>
              <Col xs={1} sm={1} md={2} lg={4} />
            </Row>
            <Row>
              <Col xs={1} sm={1} md={2} lg={4} />
              <Col xs={22} sm={22} md={20} lg={16}>
                <h2>2018 Reports</h2>
                <br />
                <MineInfoList
                  mine={this.props.mine}
                  openEditReportModal={this.openEditReportModal}
                  handleEditReportSubmit={this.handleEditReportSubmit}
                />
              </Col>
              <Col xs={1} sm={1} md={2} lg={4} />
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

MineInfo.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineInfo);
