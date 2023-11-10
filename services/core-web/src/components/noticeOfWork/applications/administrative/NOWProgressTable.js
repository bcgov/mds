import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import moment from "moment";
import { isNil, isEmpty, trim } from "lodash";
import { Descriptions, Badge, Row, Col, Steps, Popover, Button } from "antd";
import { connect } from "react-redux";
import {
  getNoticeOfWork,
  getNOWProgress,
  getApplicationDelaysWithDuration,
  getTotalApplicationDelayDuration,
  getApplicationDelays,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import {
  getDelayTypeOptionsHash,
  getDropdownNoticeOfWorkApplicationStatusCodes,
  getNoticeOfWorkApplicationProgressStatusCodeOptionsHash,
  getNoticeOfWorkApplicationStatusOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  updateNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplication,
  updateApplicationDelay,
  fetchApplicationDelay,
  fetchNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { formatDate, getDurationTextInDays } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import CoreTable from "@/components/common/CoreTable";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
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
  Withdrawn: COLOR.errorRed,
  Rejected: COLOR.errorRed,
  Approved: COLOR.successGreen,
  "No Permit Required": COLOR.errorRed,
};

const propTypes = {
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progress: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  progressStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWorkApplicationStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  progressStatusCodes: CustomPropTypes.options.isRequired,
  applicationDelays: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  totalApplicationDelayDuration: PropTypes.objectOf(PropTypes.string).isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplication: PropTypes.func.isRequired,
  updateApplicationDelay: PropTypes.func.isRequired,
  fetchApplicationDelay: PropTypes.func.isRequired,
  updateNoticeOfWorkApplicationProgress: PropTypes.func.isRequired,
  delays: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
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
      ...delay,
      key: delay.now_application_delay_guid,
      reason: delayTypeHash[delay.delay_type_code],
      duration: isEmpty(trim(delay.duration)) ? "0 Days" : delay.duration,
      recordType: "DEL",
      dates: `${formatDate(delay.start_date)} - ${dateMessage}`,
    };
  });

  return appDelays;
};

const transformProgressRowData = (
  progress,
  progressTypeHash,
  progressStatusCodes,
  noticeOfWork,
  noticeOfWorkApplicationStatusOptionsHash
) => {
  const isProcessed = ["AIA", "REJ", "WDN", "NPR"].includes(
    noticeOfWork.now_application_status_code
  );
  const applicationProgress = progressStatusCodes
    .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
    .filter(
      ({ application_progress_status_code }) =>
        APPLICATION_PROGRESS_TRACKING[noticeOfWork.application_type_code].includes(
          application_progress_status_code
        ) && progress[application_progress_status_code]?.start_date
    )
    .map((item) => {
      // const hasStarted = !isNil(progress[item.application_progress_status_code]?.start_date);
      const hasEnded = !isNil(progress[item.application_progress_status_code]?.end_date);
      const dateMessage = hasEnded
        ? formatDate(progress[item.application_progress_status_code].end_date)
        : "Present";
      return {
        key: item.application_progress_status_code,
        status_code: progressTypeHash[item.application_progress_status_code],
        duration: item.duration || "0 Days",
        dates: `${formatDate(
          progress[item.application_progress_status_code]?.start_date
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
    dates: formatDate(noticeOfWork.verified_by_user_date),
    verified_by_user_date: noticeOfWork.verified_by_user_date,
    recordType: "VER",
  };

  const decisionData = {
    key: noticeOfWork.now_application_status_code,
    status_code: "Application Decision",
    status: noticeOfWorkApplicationStatusOptionsHash[noticeOfWork.now_application_status_code],
    duration: "N/A",
    dates: formatDate(noticeOfWork.decision_by_user_date),
    decision_by_user_date: noticeOfWork.decision_by_user_date,
    recordType: "DEC",
  };

  applicationProgress.unshift(verificationData);
  if (isProcessed) {
    applicationProgress.push(decisionData);
  }

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
    // disabled EDIT_NOW_DATES until a crucial bug is fixed - delays cannot overlap, validation should be fixed to ensure that doesn't occur, if there are overlaps the duration does not calculate properly leading to poor timeline reporting.
    {
      title: "",
      dataIndex: "edit",
      render: (text, record, index) => {
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
                    delayCode,
                    record.recordType,
                    index
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
      render: (text) => <div title="Duration">{text || "O Days"}</div>,
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
                    record.recordType === "VER" || record.recordType === "DEC"
                      ? this.handleUpdateVerifiedDate
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
    const payload = {
      ...values,
      date_override: true,
      start_date: moment(values.start_date),
      end_date: values?.end_date ?? moment(values.end_date),
    };
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

  handleUpdateVerifiedDate = (values) => {
    const updateDate =
      values.recordType === "VER"
        ? { verified_by_user_date: values.verified_by_user_date }
        : { decision_by_user_date: values.decision_by_user_date };
    const message =
      values.recordType === "VER"
        ? "Successfully Updated verified date."
        : "Successfully Updated decision date.";
    const payload = { ...this.props.noticeOfWork, ...updateDate };
    this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.props.fetchNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  handleUpdateDelayDates = (values) => {
    const payload = {
      ...values,
      date_override: true,
      start_date: moment(values.start_date),
      end_date: values?.end_date ?? moment(values.end_date),
    };
    this.props
      .updateApplicationDelay(
        this.props.noticeOfWork.now_application_guid,
        values.now_application_delay_guid,
        payload
      )
      .then(() => {
        this.props.fetchApplicationDelay(this.props.noticeOfWork.now_application_guid);
        this.props.fetchNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid);
        this.props.closeModal();
      });
  };

  handleOpenDateModal = (event, record, onSubmit, title, type, recordType, index = null) => {
    event.preventDefault();
    const initialValues = {
      delays: this.props.delays,
      progress: this.props.noticeOfWork.application_progress,
      isProcessed: ["AIA", "REJ", "WDN", "NPR"].includes(
        this.props.noticeOfWork.now_application_status_code
      ),
      progressCodeHash: this.props.progressStatusCodeHash,
      verifiedDate: this.props.noticeOfWork.verified_by_user_date,
      decisionDate: this.props.noticeOfWork.decision_by_user_date,
      rowIndex: index,
      ...record,
    };
    return this.props.openModal({
      props: {
        title,
        onSubmit,
        initialValues,
        showCommentFields: type === delayCode,
        importedDate: this.props.noticeOfWork.verified_by_user_date,
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
    const hasImportMeta = this.props.noticeOfWork.verified_by_user_date;
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
                            {formatDate(this.props.noticeOfWork.verified_by_user_date) ||
                              noImportMeta}
                          </Descriptions.Item>
                          <Descriptions.Item label="Duration until Progress">
                            {getDuration(this.props.noticeOfWork.verified_by_user_date) ||
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
            this.props.noticeOfWork,
            this.props.noticeOfWorkApplicationStatusOptionsHash
          )}
          columns={this.progressColumns()}
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
  delays: getApplicationDelays(state),
  totalApplicationDelayDuration: getTotalApplicationDelayDuration(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
  noticeOfWorkApplicationStatusOptionsHash: getNoticeOfWorkApplicationStatusOptionsHash(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplicationProgress,
      updateNoticeOfWorkApplication,
      updateApplicationDelay,
      fetchApplicationDelay,
      fetchNoticeOfWorkApplication,
    },
    dispatch
  );

NOWProgressTable.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(NOWProgressTable);
