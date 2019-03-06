import React, { Component } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { Table, Row, Col, Icon, Button } from "antd";

import { getMine } from "@/selectors/userMineInfoSelector";
import CustomPropTypes from "@/customPropTypes";
import QuestionSidebar from "@/components/common/QuestionsSidebar";
import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import {
  fetchMineRecordById,
  updateExpectedDocument,
} from "@/actionCreators/userDashboardActionCreator";
import { RED_CLOCK } from "@/constants/assets";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { openModal, closeModal } from "@/actions/modalActions";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";
import { COLOR } from "@/constants/styles";

const { errorRed } = COLOR;

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

const columns = [
  {
    title: "",
    dataIndex: "overdue",
    render: (text, record) =>
      record.isOverdue ? (
        <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
      ) : (
        ""
      ),
  },
  {
    title: "Name",
    dataIndex: "name",
    // TODO: Generalize this style in a better way
    render: (text, record) => (
      <h6 style={record.isOverdue ? { color: errorRed } : {}}>{record.doc.exp_document_name}</h6>
    ),
  },
  {
    title: "Due",
    dataIndex: "due",
    render: (text, record) => (
      <h6 style={record.isOverdue ? { color: errorRed } : {}}>
        {record.doc.due_date === "None" ? "-" : record.doc.due_date}
      </h6>
    ),
  },
  {
    title: "Received Date",
    dataIndex: "receivedDate",
    render: (text, record) => (
      <h6>{record.doc.received_date === "None" ? "-" : record.doc.received_date}</h6>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (test, record) => (
      <h6 style={record.isOverdue ? { color: errorRed } : {}}>
        {record.doc ? record.doc.exp_document_status.description : String.LOADING}
      </h6>
    ),
  },
  {
    title: "Documents",
    dataIndex: "documents",
    render: (text, record) =>
      !record.doc.related_documents || record.doc.related_documents.length === 0
        ? "-"
        : record.doc.related_documents.map((file) => (
            <div key={file.mine_document_guid}>
              <a
                role="link"
                onClick={() =>
                  downloadFileFromDocumentManager(file.document_manager_guid, file.document_name)
                }
                // Accessibility: Event listener
                onKeyPress={() =>
                  downloadFileFromDocumentManager(file.document_manager_guid, file.document_name)
                }
                // Accessibility: Focusable element
                tabIndex="0"
              >
                {file.document_name}
              </a>
            </div>
          )),
  },
  {
    title: "",
    dataIndex: "upload",
    render: (text, record) => (
      <Button
        className="full-mobile"
        type="primary"
        ghost
        onClick={(event) =>
          record.openEditReportModal(
            event,
            record.handleEditReportSubmit,
            ModalContent.EDIT_REPORT(
              record.doc.exp_document_name,
              moment()
                .subtract(1, "year")
                .year()
            ),
            record.doc
          )
        }
      >
        <Icon type="file-add" /> Upload/Edit
      </Button>
    ),
  },
];

const byDate = (doc1, doc2) => {
  // TODO: Refactor this
  if (!(Date.parse(doc1.due_date) === Date.parse(doc2.due_date)))
    return Date.parse(doc1.due_date) > Date.parse(doc2.due_date) ? 1 : -1;
  return doc1.exp_document_name > doc2.exp_document_name ? 1 : -1;
};

const transformRowData = (expectedDocuments, actions) =>
  expectedDocuments.sort(byDate).map((doc, id) => ({
    key: doc.exp_document_guid,
    id, // TODO: Can I remove this??
    doc,
    isOverdue:
      Date.parse(doc.due_date) < new Date() &&
      doc.exp_document_status.exp_document_status_code === "MIA",
    ...actions,
  }));

export class MineInfo extends Component {
  state = { isLoaded: false, selectedDocument: {} };

  componentDidMount() {
    const { mineId } = this.props.match.params;
    this.props.fetchMineRecordById(mineId).then(() => {
      this.setState({ isLoaded: true });
    });
  }

  handleEditReportSubmit = () => {
    const updatedDocument = this.state.selectedDocument;
    updatedDocument.received_date = moment();
    this.props
      .updateExpectedDocument(updatedDocument.exp_document_guid, { document: updatedDocument })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  openEditReportModal(event, onSubmit, title, doc) {
    this.setState({
      selectedDocument: doc,
    });
    event.preventDefault();

    this.props.openModal({
      props: { onSubmit, title, selectedDocument: doc },
      content: modalConfig.EDIT_REPORT,
    });
  }

  render() {
    // TODO: Fix these this-aware references
    const openEditReportModal2 = this.openEditReportModal;
    const handleEditReportSubmit2 = this.handleEditReportSubmit;
    if (!this.state.isLoaded) {
      return <Loading />;
    }

    // FIXME: The rest of the page (around the table) should be refactored
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
                <Table
                  align="left"
                  pagination={false}
                  columns={columns}
                  dataSource={transformRowData(this.props.mine.mine_expected_documents, {
                    openEditReportModal: openEditReportModal2.bind(this),
                    handleEditReportSubmit: handleEditReportSubmit2.bind(this),
                  })}
                  locale={{ emptyText: <NullScreen type="no-results" /> }}
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
