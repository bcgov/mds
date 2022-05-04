import React from "react";
import { Descriptions, Divider, Typography } from "antd";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  noticeOfDeparture: CustomPropTypes.noticeOfDeparture.isRequired,
};

export const NoticeOfDepartureDetails = (props) => {
  const { noticeOfDeparture } = props;
  const { nod_title, permit, nod_guid, nod_description } = noticeOfDeparture;

  return (
    <div>
      <Typography.Title level={4}>Basic Information</Typography.Title>
      <Descriptions colon={false} layout="vertical" column={1} size="middle">
        <Descriptions.Item label="Departure Project Title">{nod_title}</Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} layout="vertical" column={2} size="middle">
        <Descriptions.Item label="Permit #">{permit.permit_no}</Descriptions.Item>
        <Descriptions.Item label="NOD #">{nod_guid}</Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} layout="vertical" column={1} size="middle">
        <Descriptions.Item label="Depature Summary">{nod_description}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Typography.Title level={4}>Self-Assessment Form</Typography.Title>
      <Descriptions colon={false} layout="vertical" column={1} size="middle">
        <Descriptions.Item label="Uploaded File(s)">Document Map</Descriptions.Item>
      </Descriptions>
    </div>
  );
};

NoticeOfDepartureDetails.propTypes = propTypes;

export default NoticeOfDepartureDetails;
