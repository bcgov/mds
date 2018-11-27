import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Card, Row, Col, Button } from "antd";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { GREEN_PENCIL } from "@/constants/assets";
import { fetchExpectedDocumentStatusOptions } from "@/actionCreators/mineActionCreator";
import { getExpectedDocumentStatusOptions } from "@/selectors/mineSelectors";

/**
 * @class  MineTailingsInfo - all tenure information related to the mine.
 */

const propTypes = {
  mine: PropTypes.object.isRequired,
  updateMineRecord: PropTypes.func.isRequired,
  createTailingsStorageFacility: PropTypes.func.isRequired,
  fetchMineRecordById: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  fetchExpectedDocumentStatusOptions: PropTypes.func.isRequired,
  expectedDocumentStatusOptions: PropTypes.array.isRequired,
};

const defaultProps = {
  mine: {},
  expectedDocumentStatusOptions: [],
};

class MineTailingsInfo extends Component {
  handleAddTailingsSubmit = (value) => {
    this.props
      .createTailingsStorageFacility({
        ...value,
        mine_guid: this.props.mine.guid,
      })
      .then(() => {
        this.props.closeModal();
        this.props.fetchMineRecordById(this.props.mine.guid);
      });
  };

  componentDidMount() {
    this.props.fetchExpectedDocumentStatusOptions();
  }

  openAddTailingsModal(event, onSubmit, title) {
    event.preventDefault();
    this.props.openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  }

  handleEditReportSubmit = (value) => {
    //this.props.updateReport().then(() => {
    this.props.closeModal();
    this.props.fetchMineRecordById(this.props.mine.guid);
    //})
  };

  openEditReportModal(event, onSubmit, title, statusOptions, doc) {
    event.preventDefault();

    alert(doc.received_date);

    const initialValues = {
      "tsf_report_name": doc ? doc.exp_document_name : null,
      "tsf_report_due_date": doc ? doc.due_date : null,
      "tsf_report_received_date": doc ? doc.received_date : null,
      "tsf_report_status": doc ? doc.exp_document_status_guid : null,
    };

    this.props.openModal({
      props: { onSubmit, title, statusOptions, initialValues },
      content: modalConfig.EDIT_TAILINGS_REPORT,
    });
  }

  render() {
    const { mine } = this.props;
    return (
      <div>
        <div>
          <br />
          <br />
          {mine.mine_tailings_storage_facility.map((facility, id) => {
            return (
              <Row key={id} gutter={16}>
                <Col span={6}>
                  <h3>{facility.mine_tailings_storage_facility_name}</h3>
                </Col>
                <Col span={6}>
                  <h3 />
                </Col>
              </Row>
            );
          })}
          <div className="center">
            <Button
              className="full-mobile"
              type="primary"
              onClick={(event) =>
                this.openAddTailingsModal(
                  event,
                  this.handleAddTailingsSubmit,
                  ModalContent.ADD_TAILINGS
                )
              }
            >
              {ModalContent.ADD_TAILINGS}
            </Button>
          </div>
        </div>
        <br />
        <br />
        <div>
          <h3>Reports</h3>
          <br />
          <Row gutter={16} justify="center" align="top">
            <Col span={8}>
              <h5>Name</h5>
            </Col>
            <Col span={4}>
              <h5>Due</h5>
            </Col>
            <Col span={4}>
              <h5>Recieved</h5>
            </Col>
            <Col span={5}>
              <h5>Status</h5>
            </Col>
            <Col span={2} />
          </Row>
          <hr style={{ borderTop: "2px solid #c4cdd5" }} />
          {mine.mine_expected_documents.map((doc, id) => {
            return (
              <div key={id}>
                <Row gutter={16} justify="center" align="top">
                  <Col id={"name-" + id} span={8}>
                    <h6>{doc.exp_document_name}</h6>
                  </Col>
                  <Col id={"due-date-" + id} span={4}>
                    <h6>{doc.due_date}</h6>
                  </Col>
                  <Col span={4}>
                    <h6 />
                  </Col>
                  <Col id={"status-" + id} span={5}>
                    <h6>{doc.status}</h6>
                  </Col>
                  <Col span={2}>
                    <Button
                      ghost
                      type="primary"
                      onClick={(event) =>
                        this.openEditReportModal(
                          event,
                          this.handleEditReportSubmit,
                          ModalContent.EDIT_TAILINGS_REPORT,
                          this.props.expectedDocumentStatusOptions,
                          doc
                        )
                      }
                    >
                      <img style={{ padding: "5px" }} src={GREEN_PENCIL} />
                    </Button>
                  </Col>
                </Row>
                <hr />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expectedDocumentStatusOptions: getExpectedDocumentStatusOptions(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      fetchExpectedDocumentStatusOptions,
    },
    dispatch
  );
};

MineTailingsInfo.propTypes = propTypes;
MineTailingsInfo.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MineTailingsInfo);
