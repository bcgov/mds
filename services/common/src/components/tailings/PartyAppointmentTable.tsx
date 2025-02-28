import React, { FC, useState } from "react";
import { Col, Row, Typography } from "antd";
import { Field, FieldArray, change } from "@mds/common/components/forms/form";
import {
    updatePartyRelationship,
    fetchPartyRelationships,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import DocumentLink from "../documents/DocumentLink";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
    MINISTRY_ACKNOWLEDGED_STATUS,
    PARTY_APPOINTMENT_STATUS,
} from "@mds/common/constants/strings";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "@mds/common/constants/forms";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getIsCore } from "@mds/common/redux/reducers/authenticationReducer";
import { useParams } from "react-router-dom";


interface PartyAppointmentTableProps {
    canEditTSF: boolean;
}

const PartyAppointmentTable: FC<PartyAppointmentTableProps> = (props) => {
    const { canEditTSF } = props;
    const dispatch = useAppDispatch();
    const tsfFormName = FORM.ADD_TAILINGS_STORAGE_FACILITY;
    const isCore = useAppSelector(getIsCore);
    const commonColumns = ["name", "status", "dates", "letters"];
    const columns = isCore ? [...commonColumns, "ministryAcknowledged"] : commonColumns;

    const { mineGuid, tsfGuid } = useParams<{ mineGuid: string, tsfGuid: string }>();

    const [loadingField, setLoadingField] = useState({});

    const ministryAcknowledgedColumns = Object.entries(MINISTRY_ACKNOWLEDGED_STATUS).map(
        ([value, label]) => ({ value, label })
    );
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
            await dispatch(updatePartyRelationship(
                {
                    mine_party_appt_guid,
                    [key]: value,
                },
                "Successfully updated Engineer of Record"
            ));

            await dispatch(fetchPartyRelationships({
                mine_guid: mineGuid,
                relationships: "party",
                include_permit_contacts: "true",
                mine_tailings_storage_facility_guid: tsfGuid,
            }));
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

                return <div title="status">{PARTY_APPOINTMENT_STATUS[status]}</div>;
            },
        },
        {
            title: "Date",
            key: "dates",
            render: (record) => (
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
                        key={d.document_manager_guid}
                        openDocument
                        documentManagerGuid={d.document_manager_guid}
                        documentName={d.document_name}
                        linkTitleOverride="Acceptance"
                    />
                )),
        },
        {
            title: "Ministry Acknowledged",
            key: "ministryAcknowledged",
            render: (record) => {
                return (
                    <Field
                        id={`${record.rowName}.mine_party_acknowledgement_status`}
                        name={`${record.rowName}.mine_party_acknowledgement_status`}
                        component={RenderSelect}
                        props={{ allowClear: false }}
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
                );
            },
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
