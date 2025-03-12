import React, { FC, useState } from "react";
import { Badge, Col, Row, Typography } from "antd";
import { Field, FieldArray, change } from "@mds/common/components/forms/form";
import {
  updatePartyRelationship,
  fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  PARTY_APPOINTMENT_STATUS,
} from "@mds/common/constants/strings";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { useParams } from "react-router-dom";
import { formatDate } from "@mds/common/redux/utils/helpers";

interface PartyAppointmentTableProps {
  canEditTSF: boolean;
}

const PartyAppointmentTable: FC<PartyAppointmentTableProps> = (props) => {
  const { canEditTSF } = props;
  const dispatch = useAppDispatch();
  const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
  const isCore = useAppSelector(getIsCore);
  const commonColumns = ["name", "status", "term"];
  const columns = isCore ? [...commonColumns, "ministryAcknowledged"] : commonColumns;

  const statusMapping = (status) => {
    switch (status) {
      case PARTY_APPOINTMENT_STATUS.active:
        return "success";
      case PARTY_APPOINTMENT_STATUS.pending:
        return "processing";
      case PARTY_APPOINTMENT_STATUS.inactive:
        return "warning";
      default:
        return "processing";
    }
  };

  const { mineGuid, tsfGuid } = useParams<{ mineGuid: string; tsfGuid: string }>();

  const [loadingField, setLoadingField] = useState({});

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

    dispatch(change(tsfFormName, formPropName, value));

    try {
      await dispatch(
        updatePartyRelationship(
          {
            mine_party_appt_guid,
            [key]: value,
          },
          "Successfully updated Engineer of Record"
        )
      );

      await dispatch(
        fetchPartyRelationships({
          mine_guid: mineGuid,
          relationships: "party",
          include_permit_contacts: "true",
          mine_tailings_storage_facility_guid: tsfGuid,
        })
      );
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
              component={RenderSelect}
              props={{ allowClear: false }}
              data={statusColumns}
              loading={loadingField[`${record.rowName}.status`]}
              onChange={(val) => partyAppointmentChanged(record.rowName, record.key, "status", val)}
              disabled={!canEditTSF}
            />
          );
        }

        const displayStatus = PARTY_APPOINTMENT_STATUS[status];
        return <Badge status={statusMapping(displayStatus)} text={displayStatus} />;
      },
    },
    {
      title: "Term",
      key: "term",
      dataIndex: "term",
    },
  ];

  const columnsToDisplay = columnDefinitions.filter(
    (c) => !columns?.length || columns.includes(c.dataIndex)
  );

  const transformRowData = (rows) => {
    return rows.map((rowName, ind) => {
      const r = rows.get(ind);

      const term = `${formatDate(r.start_date)} - ${r.end_date ? formatDate(r.end_date) : "Present"}`;

      return {
        index: ind,
        rowName,
        key: r.mine_party_appt_guid,
        name: r.party?.name,
        term: term,
        status: r.status,
        ministryAcknowledged: r.mine_party_acknowledgement_status,
      };
    });
  };

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={4} className="margin-large--top">
          Historical Engineer of Record List
        </Typography.Title>

        <FieldArray
          name="engineers_of_record"
          props={{}}
          component={({ fields }) => (
            <CoreTable
              pagination={false}
              columns={columnsToDisplay}
              dataSource={transformRowData(fields || [])}
            />
          )}
        />
      </Col>
    </Row>
  );
};

export default PartyAppointmentTable;
