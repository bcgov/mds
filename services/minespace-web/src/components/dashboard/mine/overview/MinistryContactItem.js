import React from "react";
import PropTypes from "prop-types";
import { Typography } from "antd";
import * as Strings from "@/constants/strings";

const { Paragraph, Text } = Typography;

const propTypes = {
  contact: PropTypes.objectOf(PropTypes.any).isRequired,
};

export const MinistryContactItem = (props) => (
  <Paragraph className="ministry-contact-item">
    <Text strong className="ministry-contact-title">
      {props.contact.title || Strings.UNKNOWN}
      <br />
    </Text>
    {props.contact.name && (
      <Text>
        {props.contact.name}
        <br />
      </Text>
    )}
    {props.contact.phone && (
      <Text>
        {props.contact.phone}
        <br />
      </Text>
    )}
    {props.contact.email && (
      <Text>
        <a href={`mailto:${props.contact.email}`}>{props.contact.email}</a>
        <br />
      </Text>
    )}
  </Paragraph>
);

MinistryContactItem.propTypes = propTypes;

export default MinistryContactItem;
