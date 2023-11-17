import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Typography } from "antd";
import { getEMLIContactTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";
import * as Strings from "@/constants/strings";

const propTypes = {
  contact: PropTypes.objectOf(PropTypes.any).isRequired,
  EMLIContactTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const MinistryContactItem = (props) => (
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

MinistryContactItem.propTypes = propTypes;

const mapStateToProps = (state) => ({
  EMLIContactTypesHash: getEMLIContactTypesHash(state),
});

export default connect(mapStateToProps)(MinistryContactItem);
