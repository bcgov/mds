import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Icon, Divider, Popconfirm, Button } from "antd";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import CustomPropTypes from "@/customPropTypes";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import { BRAND_PENCIL, RED_CLOCK } from "@/constants/assets";
import { formatDate } from "@/utils/helpers";
import downloadFileFromDocumentManager from "@/utils/actionlessNetworkCalls";
import * as String from "@/constants/strings";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  openAddReportModal: PropTypes.func.isRequired,
  handleAddReportSubmit: PropTypes.func.isRequired,
  mineTSFRequiredReports: PropTypes.arrayOf(PropTypes.any).isRequired,
  openEditReportModal: PropTypes.func.isRequired,
  removeReport: PropTypes.func.isRequired,
  handleEditReportSubmit: PropTypes.func.isRequired,
};

const MineTailingsTable = (props) => (
  <div>
    {props.mine.mine_tailings_storage_facility.map((facility) => (
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
      <h3>Reports</h3>
      <br />
      <Row gutter={16} justify="center" align="top">
        <Col span={1} />
        <Col span={8}>
          <h5>Name</h5>
        </Col>
        <Col span={2}>
          <h5>Due</h5>
        </Col>
        <Col span={2}>
          <h5>Received</h5>
        </Col>
        <Col span={4}>
          <h5>Status</h5>
        </Col>
        <Col span={3}>
          <h5>Documents</h5>
        </Col>
        <Col span={4} />
      </Row>
      <Divider type="horizontal" className="thick-divider" />
      {props.mine.mine_expected_documents
        .sort((doc1, doc2) => {
          if (!(Date.parse(doc1.due_date) === Date.parse(doc2.due_date)))
            return Date.parse(doc1.due_date) > Date.parse(doc2.due_date) ? 1 : -1;
          return doc1.exp_document_name > doc2.exp_document_name ? 1 : -1;
        })
        .map((doc, id) => {
          const isOverdue =
            Date.parse(doc.due_date) < new Date() &&
            doc.exp_document_status.exp_document_status_code === "MIA";
          return (
            <div key={doc.exp_document_guid}>
              <Row gutter={16} justify="center" align="top">
                <Col span={1}>
                  {isOverdue ? (
                    <img className="padding-small" src={RED_CLOCK} alt="Edit TSF Report" />
                  ) : (
                    ""
                  )}
                </Col>
                <Col id={`name-${id}`} span={8}>
                  <h6>{doc.exp_document_name}</h6>
                </Col>
                <Col id={`due-date-${id}`} span={2}>
                  <h6>{formatDate(doc.due_date) || "-"}</h6>
                </Col>
                <Col span={2}>
                  <h6>{formatDate(doc.received_date) || "-"}</h6>
                </Col>
                <Col id={`status-${id}`} span={4}>
                  <h6 className={isOverdue ? "bold" : null}>
                    {doc ? doc.exp_document_status.description : String.LOADING}
                  </h6>
                </Col>
                <Col span={3}>
                  {!doc.related_documents
                    ? "-"
                    : doc.related_documents.map((file) => (
                        <div>
                          <a
                            role="link"
                            key={file.mine_document_guid}
                            onClick={() =>
                              downloadFileFromDocumentManager(
                                file.document_manager_guid,
                                file.document_name
                              )
                            }
                            // Accessibility: Event listener
                            onKeyPress={() =>
                              downloadFileFromDocumentManager(
                                file.document_manager_guid,
                                file.document_name
                              )
                            }
                            // Accessibility: Focusable element
                            tabIndex="0"
                          >
                            {file.document_name}
                          </a>
                        </div>
                      ))}
                </Col>
                <Col span={4} align="right">
                  <AuthorizationWrapper
                    permission={Permission.CREATE}
                    isMajorMine={props.mine.major_mine_ind}
                  >
                    <div className="inline-flex">
                      <Button
                        className="full-mobile"
                        type="primary"
                        ghost
                        onClick={(event) =>
                          props.openEditReportModal(
                            event,
                            props.handleEditReportSubmit,
                            ModalContent.EDIT_TAILINGS_REPORT,
                            doc
                          )
                        }
                      >
                        <img src={BRAND_PENCIL} alt="Edit TSF Report" />
                      </Button>
                      <Popconfirm
                        placement="topLeft"
                        title={`Are you sure you want to delete ${doc.exp_document_name}?`}
                        onConfirm={(event) => props.removeReport(event, doc.exp_document_guid)}
                        okText="Delete"
                        cancelText="Cancel"
                      >
                        <Button className="full-mobile" ghost type="primary">
                          <Icon type="minus-circle" theme="outlined" />
                        </Button>
                      </Popconfirm>
                    </div>
                  </AuthorizationWrapper>
                </Col>
              </Row>
              <Divider type="horizontal" />
            </div>
          );
        })}
      <div key="0">
        <Row gutter={16} justify="center" align="top">
          <Col span={8} align="left">
            <AuthorizationWrapper
              permission={Permission.CREATE}
              isMajorMine={props.mine.major_mine_ind}
            >
              <Button
                type="secondary"
                ghost
                onClick={(event) =>
                  props.openAddReportModal(
                    event,
                    props.handleAddReportSubmit,
                    ModalContent.ADD_TAILINGS_REPORT,
                    props.mineTSFRequiredReports
                  )
                }
              >
                {`+ ${ModalContent.ADD_TAILINGS_REPORT}`}
              </Button>
            </AuthorizationWrapper>
          </Col>
          <Col span={12} />
          <Col span={4} align="right" />
        </Row>
      </div>
    </div>
  </div>
);

MineTailingsTable.propTypes = propTypes;

export default MineTailingsTable;
