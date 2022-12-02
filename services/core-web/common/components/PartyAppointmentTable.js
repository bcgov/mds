import React, { useContext, useState } from "react";
import { Col, Row, Table, Typography } from "antd";
import PropTypes from "prop-types";
import { Field, FieldArray, change } from "redux-form";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import {
  updatePartyRelationship,
  fetchPartyRelationships,
} from "@common/actionCreators/partiesActionCreator";
import { MINISTRY_ACKNOWLEDGED_STATUS, PARTY_APPOINTMENT_STATUS } from "@mds/common";
import TailingsContext from "./tailings/TailingsContext";
import DocumentLink from "@/components/common/DocumentLink";

const propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string),
  updatePartyRelationship: PropTypes.func.isRequired,
  fetchPartyRelationships: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
};

const defaultProps = {
  columns: [],
};

const PartyAppointmentTable = (props) => {
  const { columns } = props;

  const { renderConfig, isCore, tsfFormName, mineGuid, tsfGuid } = useContext(TailingsContext);

  const [loadingField, setLoadingField] = useState({});

  const ministryAcknowledgedColumns = Object.entries(
    MINISTRY_ACKNOWLEDGED_STATUS
  ).map(([value, label]) => ({ value, label }));
  const statusColumns = Object.entries(PARTY_APPOINTMENT_STATUS).map(([value, label]) => ({
    value,
    label,
  }));

  const partyAppointmentChanged = async (rowName, mine_party_appt_guid, key, value) => {
    const formPropName = `${rowName}.${key}`;

    setLoadingField({
      ...loadingField,
      [formPropName]: true,
    });

    props.change(tsfFormName, formPropName, value);

    try {
      await props.updatePartyRelationship(
        {
          mine_party_appt_guid,
          [key]: value,
        },
        "Successfully updated Engineer of Record"
      );

      await props.fetchPartyRelationships({
        mine_guid: mineGuid,
        relationships: "party",
        include_permit_contacts: "true",
        mine_tailings_storage_facility_guid: tsfGuid,
      });
    } finally {
      setLoadingField({
        ...loadingField,
        [formPropName]: undefined,
      });
    }
  };

  const columnDefinitions = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => <div title="name">{text}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => {
        if (isCore) {
          return (
            <Field
              id={`${record.rowName}.status`}
              name={`${record.rowName}.status`}
              component={renderConfig.SELECT}
              data={statusColumns}
              loading={loadingField[`${record.rowName}.status`]}
              onChange={(val) => partyAppointmentChanged(record.rowName, record.key, "status", val)}
            />
          );
        }

        return <div title="status">{PARTY_APPOINTMENT_STATUS[status]}</div>;
      },
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
      render: (ministryAcknowledged, record) => (
        <Field
          id={`${record.rowName}.mine_party_acknowledgement_status`}
          name={`${record.rowName}.mine_party_acknowledgement_status`}
          component={renderConfig.SELECT}
          data={ministryAcknowledgedColumns}
          loading={loadingField[`${record.rowName}.mine_party_acknowledgement_status`]}
          onChange={(val) =>
            partyAppointmentChanged(
              record.rowName,
              record.key,
              "mine_party_acknowledgement_status",
              val
            )
          }
        />
      ),
    },
  ];

  const columnsToDisplay = columnDefinitions.filter(
    (c) => !columns?.length || columns.includes(c.dataIndex)
  );

  const transformRowData = (rows) => {
    return rows.map((rowName, ind) => {
      const r = rows.get(ind);
      let endDate = r.end_date;

      if (!endDate && r.start_date) {
        endDate = "Present";
      } else if (!endDate) {
        endDate = "Unknown";
      }

      return {
        index: ind,
        rowName,
        key: r.mine_party_appt_guid,
        name: r.party?.name,
        startDate: r.start_date || "Unknown",
        endDate,
        letters: r.documents || [],
        status: r.status,
        ministryAcknowledged: r.mine_party_acknowledgement_status,
      };
    });
  };

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} className="margin-large--top">
          Historical Engineer of Record List
        </Typography.Title>

        <FieldArray
          name="engineers_of_record"
          component={({ fields }) => (
            <Table
              align="left"
              pagination={false}
              columns={columnsToDisplay}
              dataSource={transformRowData(fields || [])}
              locale={{ emptyText: "No Data Yet" }}
            />
          )}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  tsf: state.tsf,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updatePartyRelationship,
      fetchPartyRelationships,
      change,
    },
    dispatch
  );

PartyAppointmentTable.propTypes = propTypes;
PartyAppointmentTable.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PartyAppointmentTable);
