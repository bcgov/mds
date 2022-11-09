import React from "react";
import { Col, Row, Table, Typography } from "antd";
import moment from "moment";
import DocumentLink from "@/components/common/DocumentLink";

const PartyAppointmentTable = (props) => {
    const { columns } = props;


    const columnDefinitions = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => (
              <div title="name">
                {text}
              </div>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text) => (
              <div title="status">
                {text}
              </div>
            ),
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
            render: (documents) => (
              documents.map(d => (
                <DocumentLink
                  openDocument
                  documentManagerGuid={d.document_manager_guid}
                  documentName={d.document_name}
                  linkTitleOverride="Acceptance"
                />
              ))
            ),
        },
        {
            title: "Ministry Acknowledged",
            dataIndex: "ministryAcknowledged",
            render: (text) => (
              <div title="ministryAcknowledged">
                {text}
              </div>
            ),
        },
    ];

    const columnsToDisplay = columnDefinitions.filter(c => !columns?.length || columns.includes(c.dataIndex))

    const transformRowData = (partyRelationships) => partyRelationships.map(r => ({
        key: r.mine_party_appt_guid,
        name: r.party.name,
        startDate: r.start_date || 'Unknown',
        endDate: r.end_date || 'Present',
        letters: r.documents || [],
        status: moment(r.end_date).isBefore(moment())? 'Inactive': 'Active',
        ministryAcknowledged: 'N/A',
    }));

    const sortedRelationships = props.partyRelationships
      .sort((a, b) =>
        moment(a.start_date, "YYYY-MM-DD") >= moment(b.start_date, "YYYY-MM-DD") ? -1 : 1
      )

    return (
      <Row>
        <Col span={24}>
          <Typography.Title level={3} className="margin-large--top">Historical Engineer of Record List</Typography.Title>

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
}

export default PartyAppointmentTable;
