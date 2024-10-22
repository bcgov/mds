import React, { FC, ReactNode } from "react";
import { Table } from "antd";
import { IProjectStage } from "@mds/common/interfaces/projects/projectStage.interface";
import { ColumnsType } from "antd/es/table";

interface TableProjectStage extends IProjectStage {
  link?: Element | ReactNode;
}
interface ProjectStagesTableProps {
  projectStages: TableProjectStage[];
}

export const ProjectStagesTable: FC<ProjectStagesTableProps> = ({ projectStages }) => {
  const transformRowData = (stages) =>
    stages?.map((stage) => ({
      key: stage.key,
      project_stage: stage.title,
      stage_status: stage.status,
      stage_status_hash: stage.statusHash,
      link: stage.link,
      stage,
    }));

  const columns: ColumnsType<any> = [
    {
      title: "",
      dataIndex: "project_stage",
      render: (text, record) => (
        <div title="Project Stage">
          {!(record.stage.isOptional || record.stage.isTitle) ? (
            <b>{text}</b>
          ) : (
            <div className={record.stage.isOptional && !record.stage.isTitle ? "grey" : ""}>
              {text}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text, record) => {
        let label = "";
        if (text === "STATUS") {
          label = text;
        } else {
          label = "[Not submitted]";
          if (record.key && record.stage_status) {
            label = record.stage_status_hash[text] ? `[${record.stage_status_hash[text]}]` : "N/A";
          }
        }
        return (
          <div title="Stage Status">
            {!(record.stage.isOptional || record.stage.isTitle) ? (
              <b className="uppercase">{label}</b>
            ) : (
              <div className={record.stage.isOptional && !record.stage.isTitle ? "grey" : ""}>
                {label}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "link",
      align: "right",
      render: (text) => text,
    },
  ];

  return (
    <Table
      size="small"
      showHeader={false}
      pagination={false}
      columns={columns}
      dataSource={transformRowData(projectStages)}
      locale={{ emptyText: "This project has no stage data." }}
    />
  );
};

export default ProjectStagesTable;
