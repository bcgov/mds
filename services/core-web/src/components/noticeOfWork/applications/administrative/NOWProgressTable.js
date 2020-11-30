/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Popconfirm, Descriptions, Badge, Timeline, Row, Col } from "antd";
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
} from "@common/selectors/staticContentSelectors";
import { ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { formatDate, getDurationText } from "@common/utils/helpers";
import CoreTable from "@/components/common/CoreTable";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import * as router from "@/constants/routes";

/**
 * @class NOWProgressTable- contains all information relating to the Securities/Bond tracking on a Notice of Work Application.
 */

const propTypes = {
  getDelayTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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

const TimelineItem = (progress, progressStatus, delaysExist) => {
  if (!progress[progressStatus.application_progress_status_code])
    return (
      <Timeline.Item dot={<StopOutlined className="icon-lg--grey" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        <Descriptions column={1}>
          <Descriptions.Item label="Status"> Not Started</Descriptions.Item>
        </Descriptions>
      </Timeline.Item>
    );
  if (progress[progressStatus.application_progress_status_code].end_date)
    return (
      <Timeline.Item dot={<CheckCircleOutlined className="icon-lg--green" />}>
        <span className="field-title">{progressStatus.description}</span>
        <br />
        <Descriptions column={1}>
          <Descriptions.Item label="Status">Complete</Descriptions.Item>
          <Descriptions.Item label="Started by">
            {progress[progressStatus.application_progress_status_code].created_by}
          </Descriptions.Item>
          <Descriptions.Item label="Updated by">
            {progress[progressStatus.application_progress_status_code].last_updated_by}
          </Descriptions.Item>
          <Descriptions.Item label="Date">
            {formatDate(progress[progressStatus.application_progress_status_code].start_date)} -{" "}
            {formatDate(progress[progressStatus.application_progress_status_code].end_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Duration">
            {progress[progressStatus.application_progress_status_code].duration}
          </Descriptions.Item>
          {delaysExist && (
            <Descriptions.Item label="Duration Minus Delays">
              {progress[progressStatus.application_progress_status_code].durationWithoutDelays}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Timeline.Item>
    );
  return (
    <Timeline.Item dot={<ClockCircleOutlined className="icon-lg" />}>
      <span className="field-title">{progressStatus.description}</span>
      <br />
      <Descriptions column={1}>
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
            {progress[progressStatus.application_progress_status_code].durationWithoutDelays ||
              "0 Days"}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Timeline.Item>
  );
};

const transformRowData = (delays, delayTypeHash) => {
  const appDelays = delays.map((delay) => {
    const hasEnded = delay.end_date !== null;
    const dateMessage = hasEnded ? formatDate(delay.end_date) : "Present";
    return {
      key: delay.now_application_delay_guid,
      reason: delayTypeHash[delay.delay_type_code],
      duration: delay.duration,
      dates: `${formatDate(delay.start_date)} - ${dateMessage}`,
      ...delay,
    };
  });

  return appDelays;
};

export class NOWProgressTable extends Component {
  render() {
    const delaysExist = this.props.applicationDelays.length > 0;
    return (
      <div>
        <div className="padding-large">
          <Row gutter={16} justify="left">
            <Col span={12}>
              <Timeline mode="left">
                <Timeline.Item dot={<CheckCircleOutlined className="icon-lg--green" />}>
                  <span className="field-title">Imported to CORE</span>
                  <br />
                  <Descriptions column={1}>
                    <Descriptions.Item label="Status">Verified</Descriptions.Item>
                    <Descriptions.Item label="Import Date">Sept 11-10</Descriptions.Item>
                    <Descriptions.Item label="Duration until Review">
                      11 months 10 days
                    </Descriptions.Item>
                  </Descriptions>
                </Timeline.Item>
                {this.props.progressStatusCodes
                  .sort((a, b) => (a.display_order > b.display_order ? 1 : -1))
                  .map((progressStatus) =>
                    TimelineItem(this.props.progress, progressStatus, delaysExist)
                  )}
              </Timeline>
            </Col>
            <Col span={12} />
          </Row>
        </div>
        <br />
        <CoreTable
          condition
          dataSource={transformRowData(
            this.props.applicationDelays,
            this.props.delayTypeOptionsHash
          )}
          columns={columns}
          tableProps={{
            align: "center",
            pagination: false,
            scroll: { y: 500 },
          }}
        />
        <br />
        <Descriptions column={1}>
          <>
            <Descriptions.Item label="Total Time in Delay">
              <Badge color={COLOR.yellow} className="padding-small--left" />
              {this.props.totalApplicationDelayDuration.duration}
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
  progressStatusCodes: getDropdownNoticeOfWorkApplicationStatusCodes(state),
  applicationDelays: getApplicationDelaysWithDuration(state),
  totalApplicationDelayDuration: getTotalApplicationDelayDuration(state),
  delayTypeOptionsHash: getDelayTypeOptionsHash(state),
});

NOWProgressTable.propTypes = propTypes;

export default connect(mapStateToProps, null)(NOWProgressTable);
