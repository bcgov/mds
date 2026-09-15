import React, { FC } from "react";
import { Row, Col, Card, Tag, Typography } from "antd";
import { formatDate } from "@mds/common/redux/utils/helpers";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { IPermitPartyRelationship } from "@mds/common/interfaces";
import * as Strings from "@/constants/strings";

interface PermitteeContactCardRowProps {
  Icon: React.ComponentType<AntdIconProps>;
  label: string;
  value: string | JSX.Element;
  badge?: string;
}

const PermitteeContactCardRowBadge: FC<{ value?: string }> = ({ value }) =>
  value ? (
    <Tag color="green" className="permittee-contact-card-row-badge">
      <CheckCircleOutlined /> {value}
    </Tag>
  ) : null;

const PermitteeContactCardRow: FC<PermitteeContactCardRowProps> = ({
  Icon,
  label,
  value,
  badge,
}) => (
  <Row className="contact-card-row">
    <Col span={24}>
      <Icon className="contact-card-row-icon" />
      <Typography.Paragraph className="contact-card-row-field">
        <Typography.Text strong className="contact-card-row-field-title">
          {label}
        </Typography.Text>
        <Typography.Text>{value}</Typography.Text>
        <PermitteeContactCardRowBadge value={badge} />
      </Typography.Paragraph>
    </Col>
  </Row>
);

interface PermitteeContactCardProps {
  title: string;
  businessName?: string;
  partyRelationship?: IPermitPartyRelationship;
}

export const PermitteeContactCard: FC<PermitteeContactCardProps> = ({ partyRelationship }) => (
  <Card title="Permittee" className="contact-card">
    <PermitteeContactCardRow
      Icon={UserOutlined}
      label="Permittee Name"
      value={partyRelationship?.party.name || Strings.UNKNOWN}
    />
    <PermitteeContactCardRow
      Icon={IdcardOutlined}
      label="BC Registration #"
      value={partyRelationship?.party.party_orgbook_registration_id || Strings.UNKNOWN}
      badge={partyRelationship?.party.party_orgbook_registration_id ? "LINKED" : undefined}
    />
    <PermitteeContactCardRow
      Icon={MailOutlined}
      label="Email"
      value={
        partyRelationship?.party.email ? (
          <a href={`mailto:${partyRelationship.party.email}`}>{partyRelationship.party.email}</a>
        ) : (
          Strings.UNKNOWN
        )
      }
    />
    <PermitteeContactCardRow
      Icon={CalendarOutlined}
      label="Permittee Since"
      value={partyRelationship ? formatDate(partyRelationship.start_date) : Strings.UNKNOWN}
    />
  </Card>
);

export default PermitteeContactCard;
