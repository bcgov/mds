import React from "react";
import { Col, Row, Table, Typography } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import DocumentLink from "@/components/common/DocumentLink";

const propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  partyRelationships: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
  columns: [],
};

const PartyAppointmentTable = (props) => {
  const { columns } = props;

  const columnDefinitions = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <div title="name">{text}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => <div title="status">{text}</div>,
    },
    {
      title: "Date",
      dataIndex: "dates",
      render: (text, record) => (
        <div title="Dates">
          {record.startDate} - {record.endDate}
        </div>
      ),
    },
    {
      title: "Letters",
      dataIndex: "letters",
      render: (documents) =>
        documents.map((d) => (
          <DocumentLink
            openDocument
            documentManagerGuid={d.document_manager_guid}
            documentName={d.document_name}
            linkTitleOverride="Acceptance"
          />
        )),
    },
    {
      title: "Ministry Acknowledged",
      dataIndex: "ministryAcknowledged",
      render: (text) => <div title="ministryAcknowledged">{text}</div>,
    },
  ];

  const columnsToDisplay = columnDefinitions.filter(
    (c) => !columns?.length || columns.includes(c.dataIndex)
  );

  const transformRowData = (partyRelationships) =>
    partyRelationships.map((r, ind) => {
      let endDate = r.end_date;

      if (!endDate && r.start_date) {
        endDate = "Present";
      } else if (!endDate) {
        endDate = "Unknown";
      }

      return {
        key: r.mine_party_appt_guid,
        name: r.party.name,
        startDate: r.start_date || "Unknown",
        endDate,
        letters: r.documents || [],
        status: ind === 0? "Active": "Inactive",
        ministryAcknowledged: "N/A",
      };
    });

  const sortedRelationships = props.partyRelationships.sort((a, b) => {
      return moment(a.start_date || '1970-01-01', "YYYY-MM-DD").isAfter(moment(b.start_date || '1970-01-01', "YYYY-MM-DD")) ? -1 : 1
    }
  );  

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} className="margin-large--top">
          Historical Engineer of Record List
        </Typography.Title>

        <Table
          align="left"
          pagination={false}
          columns={columnsToDisplay}
          dataSource={transformRowData(sortedRelationships || [])}
          locale={{ emptyText: "No Data Yet" }}
        />
      </Col>
    </Row>
  );
};

PartyAppointmentTable.propTypes = propTypes;
PartyAppointmentTable.defaultProps = defaultProps;

export default PartyAppointmentTable;
