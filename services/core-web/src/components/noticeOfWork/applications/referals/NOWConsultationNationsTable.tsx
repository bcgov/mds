import React from "react";
import { Modal, Table } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { formatDate, getLatestEvent } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import CoreTable from "@mds/common/components/common/CoreTable";
import { INoticeOfWorkApplicationNation, INoticeOfWorkApplicationNationEvent } from "@mds/common/interfaces";
import { ColumnsType } from "antd/lib/table";
import {
    ITableAction,
    renderActionsColumn,
    renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import { CONSULTATION_TAB_CODE } from "@/constants/NOWConditions";
import AddButton from "@/components/common/buttons/AddButton";

/**
 * @class  NOWConsultationNationsTable - displays a table of nations and their events
 */

interface NOWConsultationNationsTableProps {
    nations?: INoticeOfWorkApplicationNation[];
    isLoaded: boolean;
    expandedRowKeys: string[];
    onExpand: (arg1: any, arg2: any) => any;
    openAddNationEventModal: any;
    handleDeleteNation: (nationGuid: string) => void;
    userCanManageConsultationAdvisor?: boolean;
}

interface NationRow {
    key: string;
    nation: INoticeOfWorkApplicationNation;
    nationName: string;
    consultationStartedByClient?: string;
    dueDate?: string;
    status?: string;
    with?: string;
    daysElapsed?: number;
}

interface NationEventRow {
    key: string;
    event?: INoticeOfWorkApplicationNationEvent;
    nation: INoticeOfWorkApplicationNation;
    eventAction: string;
    from: string;
    to: string;
    startDate: string;
    endDate?: string;

}

interface NationEventsExpandedRowProps {
    record: NationRow;
    childColumns: ColumnsType<NationEventRow>;
    nationEvents: (record: NationRow) => NationEventRow[];
    userCanManageConsultationAdvisor?: boolean;
    openAddNationEventModal: any;
}

const NationEventsExpandedRow: React.FC<NationEventsExpandedRowProps> = ({
    record,
    childColumns,
    nationEvents,
    userCanManageConsultationAdvisor,
    openAddNationEventModal,
}) => (
    <Table
        columns={childColumns}
        dataSource={nationEvents(record)}
        locale={{ emptyText: "No Data Yet" }}
        pagination={false}
        size="small"
        className="now-events-table nested-table"
        rowClassName="now-events-table expanded-row fade-in"
        rowKey="key"
        footer={
            userCanManageConsultationAdvisor ?
                () => (
                    <NOWActionWrapper
                        permission={Permission.EDIT_PERMITS}
                        tab={CONSULTATION_TAB_CODE}
                        ignoreDelay
                    >
                        <div className="right center-mobile">
                            <AddButton
                                onClick={(event) => openAddNationEventModal(event, record.nation)}
                            >
                                Add event
                            </AddButton>
                        </div>
                    </NOWActionWrapper>
                )
                : undefined
        }
    />
);

export const NOWConsultationNationsTable: React.FC<NOWConsultationNationsTableProps> = ({
    nations,
    isLoaded,
    expandedRowKeys,
    onExpand,
    openAddNationEventModal,
    handleDeleteNation,
    userCanManageConsultationAdvisor,
}) => {
    const transformRowData = (nation: INoticeOfWorkApplicationNation) => {
        const events = nation?.events ?? [];
        const latestEvent = getLatestEvent(events);

        return {
            key: nation?.now_application_nation_guid,
            nation,
            nationName: nation?.contact_organization_name,
            consultationStartedByClient: nation?.consultation_started_by_client ? "Yes" : "No",
            dueDate: nation?.due_date ? formatDate(nation.due_date) : Strings.EMPTY_FIELD,
            status: nation?.status || Strings.EMPTY_FIELD,
            with: latestEvent?.event_to || Strings.EMPTY_FIELD,
            daysElapsed: 0,
        };
    };

    const transformChildRowData = (
        event: INoticeOfWorkApplicationNationEvent,
        nation: INoticeOfWorkApplicationNation
    ): NationEventRow => ({
        key: event?.now_application_nation_event_guid,
        event,
        nation,
        eventAction: event?.event_name,
        from: event?.event_from,
        to: event?.event_to,
        startDate: event?.start_date ? formatDate(event.start_date) : Strings.EMPTY_FIELD,
        endDate: event?.end_date ? formatDate(event.end_date) : Strings.EMPTY_FIELD,
    });

    const actions: ITableAction[] = [
        {
            key: "edit-dates",
            label: "Edit Dates",
            clickFunction: (_, record) => { },
            icon: <EditOutlined />,
            disabled: true,
        },
        {
            key: "mark-consultation",
            label: "Mark Consultation Complete / Resume Consultation",
            clickFunction: (_, record) => { },
            icon: <EditOutlined />,
            disabled: true,
        },
        {
            key: "delete-nation",
            label: "Delete Nation",
            clickFunction: (_, record: NationRow) => {
                Modal.confirm({
                    title: "Confirm Deletion",
                    content: (
                        <>
                            Are you sure you want to delete this nation consultation reviewer?
                            This will also delete its associated events.
                        </>
                    ),
                    okText: "Delete",
                    cancelText: "Cancel",
                    onOk: () => handleDeleteNation(record.nation.now_application_nation_guid),
                });
            },
            icon: <DeleteOutlined />,
        }
    ];

    const actionsMenu = renderActionsColumn({ actions });

    const columns: ColumnsType<NationRow> = [
        {
            title: "Nation/Consultation Stream",
            dataIndex: "nationName",
            key: "nationName",
            render: (record) => <div title="Nation/Consultation Stream">{record}</div>,
            width: "160px"
        },
        {
            ...renderTextColumn("consultationStartedByClient", "Consultation Started By Client"),
            width: "160px"
        },
        {
            ...renderTextColumn("dueDate", "Due Date"),
            width: "120px"
        },
        {
            ...renderTextColumn("status", "Status"),
            width: "140px"
        },
        {
            ...renderTextColumn("with", "With"),
            width: "140px"
        },
        {
            ...renderTextColumn("daysElapsed", "Days Elapsed Since Consultation Start"),
            width: "180px"
        },
        userCanManageConsultationAdvisor
            ? {
                ...actionsMenu,
                width: "90px",
                render: (record) => (
                    <NOWActionWrapper
                        permission={Permission.EDIT_PERMITS}
                        tab={CONSULTATION_TAB_CODE}
                        ignoreDelay
                    >
                        {actionsMenu.render?.(record)}
                    </NOWActionWrapper>
                )
            }
            : undefined,
    ].filter(Boolean);

    const childColumns: ColumnsType<NationEventRow> = [
        {
            title: "Event/Action",
            dataIndex: "eventAction",
            key: "eventAction",
            render: (text) => <div title="Event/Action">{text}</div>,
        },
        {
            ...renderTextColumn("from", "From"),
        },
        { ...renderTextColumn("to", "To") },
        { ...renderTextColumn("startDate", "Start Date") },
        { ...renderTextColumn("endDate", "End Date") }
    ];

    const nationColumns = [...columns];

    const nationEvents = (record: NationRow) =>
        record.nation?.events?.map((event) => transformChildRowData(event, record.nation)) ?? [];

    const rowData = nations?.map((nation) => transformRowData(nation));

    const renderNationEventsExpandedRow = (record: NationRow) => (
        <NationEventsExpandedRow
            record={record}
            childColumns={childColumns}
            nationEvents={nationEvents}
            userCanManageConsultationAdvisor={userCanManageConsultationAdvisor}
            openAddNationEventModal={openAddNationEventModal}
        />
    );

    return (
        <div>
            <CoreTable
                condition={isLoaded}
                dataSource={rowData}
                columns={nationColumns}
                classPrefix="permits"
                expandProps={{
                    rowKey: "key",
                    recordDescription: "nation events",
                    expandedRowKeys,
                    onExpand,
                    rowExpandable: () => true,
                    expandedRowRender: renderNationEventsExpandedRow,
                }}
            />
        </div>
    );
};

export default NOWConsultationNationsTable;
