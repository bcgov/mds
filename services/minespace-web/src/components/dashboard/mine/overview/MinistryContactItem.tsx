import React from "react";
import { connect } from "react-redux";
import { Typography } from "antd";
import { getEMLIContactTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";

interface MinistryContactItemProps {
  contact: {
    emli_contact_type_code: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
  };
  EMLIContactTypesHash: {
    [key: string]: string;
  };
}

export const MinistryContactItem: React.FC<MinistryContactItemProps> = (props) => (
  <Typography.Paragraph className="ministry-contact-item">
    <Typography.Text strong className="ministry-contact-title">
      {props.EMLIContactTypesHash[props.contact.emli_contact_type_code] || Strings.UNKNOWN}
      <br />
    </Typography.Text>
    {props.contact.first_name && props.contact.last_name && (
      <Typography.Text>
        {props.contact.first_name} {props.contact.last_name}
        <br />
      </Typography.Text>
    )}
    {props.contact.phone_number && (
      <Typography.Text>
        {props.contact.phone_number}
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

const mapStateToProps = (state) => ({
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

export default connect(mapStateToProps)(MinistryContactItem);
