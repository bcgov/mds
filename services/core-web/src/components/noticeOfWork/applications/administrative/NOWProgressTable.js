import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import moment from "moment";
import { isNil } from "lodash";
import { Descriptions, Badge, Row, Col, Steps, Popover, Button } from "antd";
import { connect } from "react-redux";
import {
  getNoticeOfWork,
  getNOWProgress,
  getApplicationDelaysWithDuration,
  getTotalApplicationDelayDuration,
} from "@common/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationStatusCodes,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import {
  updateNoticeOfWorkApplicationProgress,
  updateApplicationDelay,
  fetchApplicationDelay,
  fetchNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { formatDate, getDurationTextInDays } from "@common/utils/helpers";
import CoreTable from "@/components/common/CoreTable";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import { APPLICATION_PROGRESS_TRACKING } from "@/constants/NOWConditions";

/**
 * @class NOWProgressTable- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const delayCode = "DEL";
const progressCode = "PRO";
const noImportMeta = "Information not captured at time of Import";
const clientDelayMessage = "Client delay exceeds time spent in progress.";

const badgeColor = {
  "In Progress": COLOR.blue,
  Complete: COLOR.successGreen,
  Verified: COLOR.successGreen,
  "Not Started": COLOR.mediumGrey,
  "Application Processed": COLOR.successGreen,
};
const propTypes = {
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progress: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  progressStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  progressStatusCodes: CustomPropTypes.options.isRequired,
  applicationDelays: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  totalApplicationDelayDuration: PropTypes.objectOf(PropTypes.string).isRequired,
};

const stepItem = (progress, progressStatus, delaysExist) => {
  if (!progress[progressStatus.application_progress_status_code])
    return (
      <Steps.Step
        title={progressStatus.description}
        icon={
          <Popover
            content={
              <Descriptions column={1} title={progressStatus.description}>
                <Descriptions.Item label="Status">Not Started</Descriptions.Item>
              </Descriptions>
            }
          >
            <StopOutlined className="icon-lg--lightgrey" />
          </Popover>
        }
        description="Not Started"
      />
    );
  if (progress[progressStatus.application_progress_status_code].end_date)
    return (
      <Steps.Step
        title={progressStatus.description}
        icon={
          <Popover
            content={
              <Descriptions column={1} title={progressStatus.description}>
                <Descriptions.Item label="Status">Complete</Descriptions.Item>
                <Descriptions.Item label="Started by">
                  {progress[progressStatus.application_progress_status_code].created_by}
                </Descriptions.Item>
                <Descriptions.Item label="Updated by">
                  {progress[progressStatus.application_progress_status_code].last_updated_by}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {formatDate(progress[progressStatus.application_progress_status_code].start_date)}{" "}
                  - {formatDate(progress[progressStatus.application_progress_status_code].end_date)}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {progress[progressStatus.application_progress_status_code].duration}
                </Descriptions.Item>
                {delaysExist && (
                  <Descriptions.Item label="Duration Minus Delays">
                    {progress[progressStatus.application_progress_status_code]
                      .durationWithoutDelays === "N/A"
                      ? clientDelayMessage
                      : progress[progressStatus.application_progress_status_code]
                          .durationWithoutDelays}
                  </Descriptions.Item>
                )}
              </Descriptions>
            }
          >
            <CheckCircleOutlined className="icon-lg--green" />
          </Popover>
        }
        description="Complete"
      />
    );
  return (
    <Steps.Step
      icon={
        <Popover
          content={
            <Descriptions column={1} title={progressStatus.description}>
              <Descriptions.Item label="Status">In Progress</Descriptions.Item>
              <Descriptions.Item label="Started by">
                {progress[progressStatus.application_progress_status_code].created_by}
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(progress[progressStatus.application_progress_status_code].start_date)} -
                Present
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {progress[progressStatus.application_progress_status_code].duration}
              </Descriptions.Item>
              {delaysExist && (
                <Descriptions.Item label="Duration Minus Delays">
                  {progress[progressStatus.application_progress_status_code]
                    .durationWithoutDelays === "N/A"
                    ? clientDelayMessage
                    : progress[progressStatus.application_progress_status_code]
                        .durationWithoutDelays}
                </Descriptions.Item>
              )}
            </Descriptions>
          }
        >
          <ClockCircleOutlined className="icon-lg" />
        </Popover>
      }
      title={progressStatus.description}
      description="In Progress"
    />
  );
};

const transformRowData = (delays, delayTypeHash) => {
  const appDelays = delays.map((delay) => {
    const hasEnded = delay.end_date !== null;
    const dateMessage = hasEnded ? formatDate(delay.end_date) : "Present";
    return {
      key: delay.now_application_delay_guid,
      reason: delayTypeHash[delay.delay_type_code],
      duration: delay.duration || "0 Minutes",
      dates: `${formatDate(delay.start_date)} - ${dateMessage}`,
      ...delay,
    };
  });

  return appDelays;
};

const transformProgressRowData = (
  progress,
  progressTypeHash,
  progressStatusCodes,
  noticeOfWork
) => {
  const applicationProgress = progressStatusCodes
    .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
    .filter(({ application_progress_status_code }) =>
      APPLICATION_PROGRESS_TRACKING[noticeOfWork.application_type_code].includes(
        application_progress_status_code
      )
    )
    .map((item) => {
      const hasEnded = !isNil(progress[item.application_progress_status_code].end_date);
      const dateMessage = hasEnded
        ? formatDate(progress[item.application_progress_status_code].end_date)
        : "Present";
      return {
        key: item.application_progress_status_code,
        status_code: progressTypeHash[item.application_progress_status_code],
        duration: item.duration || "0 Minutes",
        dates: `${formatDate(
          progress[item.application_progress_status_code].start_date
        )} - ${dateMessage}`,
        recordType: "PRO",
        ...item,
        ...progress[item.application_progress_status_code],
      };
    });

  const verificationData = {
    key: noticeOfWork.now_application_guid,
    status_code: "Imported to Core",
    status: "Verified",
    duration: "N/A",
    dates: formatDate(noticeOfWork.imported_date),
    recordType: "VER",
  };

  applicationProgress.unshift(verificationData);
  return applicationProgress;
};

// eslint-disable-next-line react/prefer-stateless-function
export class NOWProgressTable extends Component {
  delayColumns = () => [
    {
      title: "Reason for Delay",
      dataIndex: "reason",
      render: (text) => <div title="Reason for Delay">{text}</div>,
    },
    {
      title: "Start Comment",
      dataIndex: "start_comment",
      render: (text) => <div title="Start Comment">{text}</div>,
    },
    {
      title: "Date",
      dataIndex: "dates",
      render: (text) => <div title="Date">{text}</div>,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (text) => <div title="Duration">{text}</div>,
    },
    {
      title: "End Comment",
      dataIndex: "end_comment",
      render: (text) => <div title="End Comment">{text || "N/A"}</div>,
    },
    {
      title: "",
      dataIndex: "edit",
      render: (text, record) => {
        return (
          <div title="" align="right">
            <AuthorizationWrapper permission={Permission.EDIT_NOW_DATES}>
              <Button
                type="secondary"
                ghost
                onClick={(event) =>
                  this.handleOpenDateModal(
                    event,
                    record,
                    this.handleUpdateDelayDates,
                    `Update Dates for delay - ${record.reason}`,
                    delayCode
                  )
                }
              >
                <img
                  src={EDIT_OUTLINE_VIOLET}
                  title="Edit"
                  alt="Edit"
                  className="padding-md--right"
                />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  progressColumns = () => [
    {
      title: "Progress Stage",
      dataIndex: "status_code",
      render: (text) => <div title="Stage">{text}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <div title="Status">
          <Badge color={badgeColor[text]} className="padding-sm--left progress-status" />
          {text}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "dates",
      render: (text) => <div title="Date">{text}</div>,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (text) => <div title="Duration">{text}</div>,
    },
    {
      title: "",
      dataIndex: "edit",
      render: (text, record) => {
        return (
          <div title="" align="right">
            <AuthorizationWrapper permission={Permission.EDIT_NOW_DATES}>
              <Button
                type="secondary"
                ghost
                onClick={(event) =>
                  this.handleOpenDateModal(
                    event,
                    record,
                    record.recordType === "VER"
                      ? console.log("use different onsubmit")
                      : this.handleUpdateProgressDates,
                    `Update Dates for ${record.status_code}`,
                    progressCode,
                    record.recordType
                  )
                }
              >
                <img
                  src={EDIT_OUTLINE_VIOLET}
                  title="Edit"
                  alt="Edit"
                  className="padding-md--right"
                />
              </Button>
            </AuthorizationWrapper>
          </div>
        );
      },
    },
  ];

  handleUpdateProgressDates = (values) => {
    const payload = { ...values, date_override: true };
    this.props
      .updateNoticeOfWorkApplicationProgress(
        this.props.noticeOfWork.now_application_guid,
        values.application_progress_status_code,
        payload,
        `Successfully Updated dates for the ${values.status_code} Process.`
      )
      .then(() => {
        this.props.fetchNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  handleUpdateDelayDates = (values) => {
    const payload = {
      ...values,
    };
    this.props
      .updateApplicationDelay(
        this.props.noticeOfWork.now_application_guid,
        values.now_application_delay_guid,
        payload
      )
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  // handleUpdateNoWDates = (values) => {
  //   console.log(values)
  // }

  handleOpenDateModal = (event, record, onSubmit, title, type, recordType = null) => {
    console.log(record);
    event.preventDefault();
    return this.props.openModal({
      props: {
        title,
        onSubmit,
        initialValues: record,
        showCommentFields: type === delayCode,
        importedDate: this.props.noticeOfWork.imported_date,
        recordType,
      },
      content: modalConfig.UPDATE_NOW_DATE_MODAL,
    });
  };

  render() {
    const firstProgress =
      this.props.noticeOfWork.application_progress.length > 0
        ? this.props.noticeOfWork.application_progress[0]
        : { start_date: "", application_progress_status_code: "" };
    const hasImportMeta = this.props.noticeOfWork.imported_date;
    const getDuration = (date) =>
      firstProgress?.start_date && hasImportMeta
        ? getDurationTextInDays(
            moment.duration(moment(firstProgress.start_date).diff(moment(date)))
          )
        : Strings.EMPTY_FIELD;
    const delaysExist = this.props.applicationDelays.length > 0;
    return (
      <div>
        <Row gutter={16} justify="left">
          <Col span={24}>
            <Steps current={5} className="progress-steps">
              {this.props.noticeOfWork.application_type_code === "NOW" ? (
                <Steps.Step
                  direction="vertical"
                  title="Imported to Core"
                  icon={
                    <Popover
                      content={
                        <Descriptions column={1} title="Imported to Core">
                          <Descriptions.Item label="Status">Verified</Descriptions.Item>
                          <Descriptions.Item label="Imported by">
                            {this.props.noticeOfWork.imported_by || noImportMeta}
                          </Descriptions.Item>
                          <Descriptions.Item label="Import Date">
                            {formatDate(this.props.noticeOfWork.imported_date) || noImportMeta}
                          </Descriptions.Item>
                          <Descriptions.Item label="Duration until Progress">
                            {getDuration(this.props.noticeOfWork.imported_date) ||
                              Strings.EMPTY_FIELD}
                          </Descriptions.Item>
                          <Descriptions.Item label="First stage In Progress">
                            {this.props.progressStatusCodeHash[
                              firstProgress.application_progress_status_code
                            ] || Strings.EMPTY_FIELD}
                          </Descriptions.Item>
                        </Descriptions>
                      }
                    >
                      <CheckCircleOutlined className="icon-lg--green" />
                    </Popover>
                  }
                  description="Verified"
                />
              ) : (
                <Steps.Step
                  direction="vertical"
                  title="Application Initiated"
                  icon={
                    <Popover
                      content={
                        <Descriptions column={1} title="Application Initiated">
                          <Descriptions.Item label="Status">Created</Descriptions.Item>
                          <Descriptions.Item label="Received Date">
                            {formatDate(this.props.noticeOfWork.received_date)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Duration until Progress">
                            {getDuration(this.props.noticeOfWork.received_date) ||
                              Strings.EMPTY_FIELD}
                          </Descriptions.Item>
                          <Descriptions.Item label="First stage In Progress">
                            {this.props.progressStatusCodeHash[
                              firstProgress.application_progress_status_code
                            ] || Strings.EMPTY_FIELD}
                          </Descriptions.Item>
                        </Descriptions>
                      }
                    >
                      <CheckCircleOutlined className="icon-lg--green" />
                    </Popover>
                  }
                  description="Created"
                />
              )}
              {this.props.progressStatusCodes
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .filter(({ application_progress_status_code }) =>
                  APPLICATION_PROGRESS_TRACKING[
                    this.props.noticeOfWork.application_type_code
                  ].includes(application_progress_status_code)
                )
                .map((progressStatus) =>
                  stepItem(this.props.progress, progressStatus, delaysExist)
                )}
            </Steps>
          </Col>
        </Row>
        <br />
        <br />
        <h4>Application Progress</h4>
        <CoreTable
          condition
          dataSource={transformProgressRowData(
            this.props.progress,
            this.props.progressStatusCodeHash,
            this.props.progressStatusCodes,
            this.props.noticeOfWork
          )}
          columns={this.progressColumns()}
          tableProps={{
            pagination: false,
          }}
        />
        <br />
        <br />
        <h4>Application Delays</h4>
        <CoreTable
          condition
          dataSource={transformRowData(
            this.props.applicationDelays,
            this.props.delayTypeOptionsHash
          )}
          columns={this.delayColumns()}
          tableProps={{
            pagination: false,
          }}
        />
        <br />

        <Descriptions column={1}>
          <>
            <Descriptions.Item label="Total Time in Delay">
              <Badge color={COLOR.yellow} className="padding-sm--left" />
              {delaysExist
                ? this.props.totalApplicationDelayDuration.duration
                : Strings.EMPTY_FIELD}
            </Descriptions.Item>
          </>
        </Descriptions>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  progress: getNOWProgress(state),
  progressStatusCodeHash: getNoticeOfWorkApplicationProgressStatusCodeOptionsHash(state),
  progressStatusCodes: getDropdownNoticeOfWorkApplicationStatusCodes(state),
  applicationDelays: getApplicationDelaysWithDuration(state),
  totalApplicationDelayDuration: getTotalApplicationDelayDuration(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplicationProgress,
      updateApplicationDelay,
      fetchApplicationDelay,
      fetchNoticeOfWorkApplication,
    },
    dispatch
  );

NOWProgressTable.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWProgressTable);
