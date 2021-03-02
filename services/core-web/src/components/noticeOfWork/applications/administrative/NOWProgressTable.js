import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Descriptions, Badge, Row, Col, Steps, Popover } from "antd";
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
import { ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { formatDate, getDurationTextInDays } from "@common/utils/helpers";
import CoreTable from "@/components/common/CoreTable";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import * as Strings from "@common/constants/strings";

/**
 * @class NOWProgressTable- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */
const noImportMeta = "Information not captured at time of Import";
const clientDelayMessage = "Client delay exceeds time spent in progress.";
const propTypes = {
  delayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  progress: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  progressStatusCodeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  progressStatusCodes: CustomPropTypes.options.isRequired,
  applicationDelays: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  totalApplicationDelayDuration: PropTypes.objectOf(PropTypes.string).isRequired,
};

const columns = [
  {
    title: "Reason for Delay",
    dataIndex: "reason",
    render: (text) => <div title="Reason for Delay">{text}</div>,
  },
  {
    title: "Comment",
    dataIndex: "start_comment",
    render: (text) => <div title="Last Verified On">{text}</div>,
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
    render: (text) => <div title="Comment">{text || "N/A"}</div>,
  },
];

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

// eslint-disable-next-line react/prefer-stateless-function
export class NOWProgressTable extends Component {
  render() {
    const firstProgress =
      this.props.noticeOfWork.application_progress.length > 0
        ? this.props.noticeOfWork.application_progress[0]
        : { start_date: "", application_progress_status_code: "" };
    const hasImportMeta = this.props.noticeOfWork.imported_date;
    const duration =
      firstProgress?.start_date && hasImportMeta
        ? getDurationTextInDays(
            moment.duration(
              moment(firstProgress.start_date).diff(moment(this.props.noticeOfWork.imported_date))
            )
          )
        : noImportMeta;
    const delaysExist = this.props.applicationDelays.length > 0;
    return (
      <div>
        <Row gutter={16} justify="left">
          <Col span={24}>
            <Steps current={5} className="progress-steps">
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
                          {duration || Strings.EMPTY_FIELD}
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
              {this.props.progressStatusCodes
                .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                .map((progressStatus) =>
                  stepItem(this.props.progress, progressStatus, delaysExist)
                )}
            </Steps>
          </Col>
        </Row>
        <br />
        <br />
        <CoreTable
          condition
          dataSource={transformRowData(
            this.props.applicationDelays,
            this.props.delayTypeOptionsHash
          )}
          columns={columns}
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

NOWProgressTable.propTypes = propTypes;

export default connect(mapStateToProps, null)(NOWProgressTable);
