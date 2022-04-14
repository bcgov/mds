import React from "react";
import { Descriptions, Typography } from "antd";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const NoticeOfDepartureDetails = (props) => {
  return (
    <div>
      <Typography.Title level={4}>Basic Information</Typography.Title>
      <Descriptions colon={false} layout="vertical" column={1} size="middle">
        <Descriptions.Item label="Departure Project Title">
          {props.noticeOfDeparture.nod_title}
        </Descriptions.Item>
        <Descriptions.Item label="Permit #">
          {props.noticeOfDeparture.permit.permit_no}
        </Descriptions.Item>
        <Descriptions.Item label="NOD #">{props.noticeOfDeparture.nod_guid}</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

NoticeOfDepartureDetails.propTypes = propTypes;

export default NoticeOfDepartureDetails;
