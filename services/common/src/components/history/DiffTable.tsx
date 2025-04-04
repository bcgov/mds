import React, { FC } from "react";
import { DiffColumnValueMapper, IDiffColumn, IDiffEntry } from "./DiffColumn.interface";
import CoreTable from "../common/CoreTable";
import DiffColumn from "./DiffColumn";
import { renderDateColumn } from "../common/CoreTableCommonColumns";
import { ColumnsType } from "antd/lib/table";

interface DiffTableProps {
    history: IDiffEntry[];
    loading?: boolean;
    valueMapper?: DiffColumnValueMapper;
    columns?: ColumnsType;
}

const DiffTable: FC<DiffTableProps> = ({ history, valueMapper, columns = [], loading = false }) => {

    const commonColumns = [
        {
            title: "Updated by",
            dataIndex: "updated_by"
        },
        { ...renderDateColumn("updated_at", "Date", true), defaultSortOrder: "descend" },
        {
            title: "Changes",
            dataIndex: "changeset",
            render: (differences: IDiffColumn[]) => <DiffColumn differences={differences} valueMapper={valueMapper} />
        }
    ];

    return <CoreTable
        className="diff-table"
        rowClassName="diff-table-row"
        rowKey="updated_at"
        columns={[...columns, ...commonColumns]}
        dataSource={history ?? []}
        loading={loading}
    />
};

export default DiffTable;