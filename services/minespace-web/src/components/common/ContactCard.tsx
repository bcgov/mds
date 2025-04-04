import React, { FC } from "react";
import { Row, Col, Card, Typography } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import * as Strings from "@/constants/strings";
import { CalendarOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { IPermitPartyRelationship } from "@mds/common/interfaces";

interface ContactCardRowProps {
  Icon: React.ComponentType<AntdIconProps>;
  label: string;
  value: string | JSX.Element;
}

const ContactCardRow: FC<ContactCardRowProps> = ({ Icon, label, value }) => (
  <Row className="contact-card-row">
    <Col span={24}>
      <Icon className="contact-card-row-icon" />
      <Typography.Paragraph className="contact-card-row-field">
        <Typography.Text strong className="contact-card-row-field-title">
          {label}
        </Typography.Text>
        <Typography.Text>{value}</Typography.Text>
      </Typography.Paragraph>
    </Col>
  </Row>
);

interface ContactCardProps {
  title: string;
  dateLabel: string;
  partyRelationship?: IPermitPartyRelationship;
}

export const ContactCard: FC<ContactCardProps> = ({ title, dateLabel, partyRelationship }) => (
  <Card title={title} className="contact-card">
    <ContactCardRow
      Icon={UserOutlined}
      label="Name"
      value={partyRelationship ? partyRelationship.party.name : Strings.UNKNOWN}
    />
    <ContactCardRow
      Icon={MailOutlined}
      label="Email"
      value={
        (partyRelationship && (
          <a href={`mailto:${partyRelationship.party.email}`}>{partyRelationship.party.email}</a>
        )) ||
        Strings.UNKNOWN
      }
    />
    <ContactCardRow
      Icon={PhoneOutlined}
      label="Phone"
      value={partyRelationship ? partyRelationship.party.phone_no : Strings.UNKNOWN}
    />
    <ContactCardRow
      Icon={CalendarOutlined}
      label={dateLabel}
      value={partyRelationship ? formatDate(partyRelationship.start_date) : Strings.UNKNOWN}
    />
  </Card>
);

export default ContactCard;
