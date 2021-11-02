import React from "react";
import PropTypes from "prop-types";
import { Typography } from "antd";
import * as Strings from "@/constants/strings";

const propTypes = {
  contact: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const MinistryContactItem = (props) => (
  <Typography.Paragraph className="ministry-contact-item">
    <Typography.Text strong className="ministry-contact-title">
      {props.contact.title || Strings.UNKNOWN}
      <br />
    </Typography.Text>
    {props.contact.name && (
      <Typography.Text>
        {props.contact.name}
        <br />
      </Typography.Text>
    )}
    {props.contact.phone && (
      <Typography.Text>
        {props.contact.phone}
        <br />
      </Typography.Text>
    )}
    {props.contact.email && (
      <Typography.Text>
        <a href={`mailto:${props.contact.email}`}>{props.contact.email}</a>
        <br />
      </Typography.Text>
    )}
  </Typography.Paragraph>
);

MinistryContactItem.propTypes = propTypes;

export default MinistryContactItem;
