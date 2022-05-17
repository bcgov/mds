import React from "react";
import PropTypes from "prop-types";
import { Button, Col, Popconfirm, Row, Select } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  EMPTY_FIELD,
  NOTICE_OF_DEPARTURE_DOCUMENT_TYPE,
  NOTICE_OF_DEPARTURE_STATUS,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
  NOTICE_OF_DEPARTURE_TYPE,
} from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import { TRASHCAN } from "@/constants/assets";
import LinkButton from "@/components/common/buttons/LinkButton";
import { downloadFileFromDocumentManager } from "@common/utils/actionlessNetworkCalls";
import { formatDate } from "@common/utils/helpers";
import {
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  removeFileFromDocumentManager,
  updateNoticeOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getNoticeOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
  fetchDetailedNoticeOfDeparture: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  updateNoticeOfDeparture: PropTypes.func.isRequired,
  mine: CustomPropTypes.mine.isRequired,
};

export const ViewNoticeOfDepartureModal = (props) => {
  const { noticeOfDeparture, mine } = props;
  const { nod_guid } = noticeOfDeparture;

  const checklist = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type === NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );
  const otherDocuments = noticeOfDeparture.documents.filter(
    (doc) => doc.document_type !== NOTICE_OF_DEPARTURE_DOCUMENT_TYPE.CHECKLIST
  );

  const handleDeleteANoticeOfDepartureDocument = async (document) => {
    await removeFileFromDocumentManager(document);

    await props.fetchDetailedNoticeOfDeparture(mine.mine_guid, nod_guid);
  };

  const statuses = (() => {
    const { self_authorized, ...coreStatuses } = NOTICE_OF_DEPARTURE_STATUS_VALUES;
    return Object.values(coreStatuses);
  })();

  // eslint-disable-next-line no-return-assign
  const handleChangeNodStatus = ({ value }) => (props.noticeOfDeparture.nod_status = value);

  const updateNoticeOfDepartureStatus = async () => {
    await props.updateNoticeOfDeparture(
      { mineGuid: mine.mine_guid, nodGuid: nod_guid },
      noticeOfDeparture
    );
    await props.fetchNoticesOfDeparture(mine.mine_guid);
    props.closeModal();
  };

  const fileColumns = (isSortable) => {
    return [
      {
        title: "Name",
        dataIndex: "document_name",
        sortField: "document_name",
        sorter: isSortable ? (a, b) => a.document_name.localeCompare(b.document_name) : false,
        render: (text) => (
          <div className="nod-table-link">
            {text ? (
              <LinkButton
                onClick={() => downloadFileFromDocumentManager(checklist[0])}
                title="Download"
              >
                {text}
              </LinkButton>
            ) : (
              <div>{EMPTY_FIELD}</div>
            )}
          </div>
        ),
      },
      {
        title: "Category",
        dataIndex: "document_category",
        sortField: "document_category",
        sorter: isSortable
          ? (a, b) => a.document_category.localeCompare(b.document_category)
          : false,
        render: (text) => <div title="Id">{text || EMPTY_FIELD}</div>,
      },
      {
        title: "Uploaded",
        dataIndex: "create_timestamp",
        sortField: "create_timestamp",
        sorter: isSortable ? (a, b) => a.create_timestamp.localeCompare(b.create_timestamp) : false,
        render: (text) => <div title="Type">{formatDate(text) || EMPTY_FIELD}</div>,
      },
      {
        dataIndex: "actions",
        render: () => (
          <div className="btn--middle flex">
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to delete this file?"
              onConfirm={() =>
                handleDeleteANoticeOfDepartureDocument({
                  mine_guid: mine.mine_guid,
                  nod_guid,
                  ...checklist[0],
                })
              }
              okText="Yes"
              cancelText="No"
            >
              <button type="button">
                <img name="remove" src={TRASHCAN} alt="Remove Document" />
              </button>
            </Popconfirm>
          </div>
        ),
      },
    ];
  };

  return (
    <div>
      <div>
        <h4 className="nod-modal-section-header">Basic Information</h4>
        <div className="content--light-grey nod-section-padding">
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Departure Project Title</p>
            <p>{noticeOfDeparture.nod_title || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Departure Summary</p>
            <p>{noticeOfDeparture.nod_description || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Permit #</p>
            <p>{noticeOfDeparture?.permit.permit_no || EMPTY_FIELD}</p>
          </div>
          <div>
            <div className="inline-flex padding-sm">
              <p className="field-title margin-large--right">NOD #</p>
              <p>{noticeOfDeparture.nod_guid || EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-sm">
              <p className="field-title margin-large--right">Declared Type</p>
              <p>{NOTICE_OF_DEPARTURE_TYPE[noticeOfDeparture.nod_type] || EMPTY_FIELD}</p>
            </div>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Mine Manager</p>
            <p>{formatDate(noticeOfDeparture.mine_manager_name) || EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-sm">
            <p className="field-title margin-large--right">Submitted</p>
            <p>{formatDate(noticeOfDeparture.submission_timestamp) || EMPTY_FIELD}</p>
          </div>
        </div>
        <h4 className="nod-modal-section-header padding-md--top">Self-Assessment Form</h4>
        <CoreTable
          condition
          columns={fileColumns(false)}
          dataSource={checklist}
          tableProps={{ pagination: false }}
        />
        <h4 className="nod-modal-section-header padding-md--top">Application Documentation</h4>
        <CoreTable
          condition
          columns={fileColumns(true)}
          dataSource={otherDocuments}
          tableProps={{ pagination: false }}
        />
        <Row justify="space-between" className="padding-md--top" gutter={24}>
          <Col span={12}>
            <p className="field-title">Technical Operations Director</p>
            <p className="content--light-grey padding-md">{EMPTY_FIELD}</p>
          </Col>
          <Col span={12}>
            <p className="field-title">NOD Review Status</p>
            <p className="content--light-grey padding-md">
              <Select
                virtual={false}
                labelInValue
                onChange={handleChangeNodStatus}
                defaultValue={{
                  value:
                    noticeOfDeparture.nod_status !==
                    NOTICE_OF_DEPARTURE_STATUS_VALUES.self_authorized
                      ? noticeOfDeparture.nod_status
                      : NOTICE_OF_DEPARTURE_STATUS.self_authorized,
                }}
                style={{ width: "100%" }}
              >
                {statuses.map((value) => (
                  <Select.Option key={value}>{NOTICE_OF_DEPARTURE_STATUS[value]}</Select.Option>
                ))}
              </Select>
            </p>
          </Col>
        </Row>
        <Row justify="space-between" className="padding-md--top">
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Created By</p>
              <p>{noticeOfDeparture.created_by || EMPTY_FIELD}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Updated By</p>
              <p>{noticeOfDeparture.updated_by || EMPTY_FIELD}</p>
            </div>
          </Col>
          <Col span={8}>
            <div className="inline-flex padding-sm">
              <p className="field-title">Updated Date</p>
              <p>{formatDate(noticeOfDeparture.update_timestamp) || EMPTY_FIELD}</p>
            </div>
          </Col>
        </Row>
      </div>

      <div className="right center-mobile">
        <Button
          className="full-mobile nod-update-button"
          type="primary"
          onClick={updateNoticeOfDepartureStatus}
        >
          Update
        </Button>
        <Button
          className="full-mobile nod-cancel-button"
          type="secondary"
          onClick={props.closeModal}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

ViewNoticeOfDepartureModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  noticeOfDeparture: getNoticeOfDeparture(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchDetailedNoticeOfDeparture,
      updateNoticeOfDeparture,
      fetchNoticesOfDeparture,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ViewNoticeOfDepartureModal);
