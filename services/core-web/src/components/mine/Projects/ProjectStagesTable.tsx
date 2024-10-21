import React, { FC } from "react";
import { Table } from "antd";
import { IProjectStage } from "@mds/common/interfaces/projects/projectStage.interface";
import { ColumnsType } from "antd/es/table";

interface ProjectStagesTableProps {
  projectStages: IProjectStage[];
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
  console.log(transformRowData(projectStages));
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
          label =
            record.key && record.stage_status
              ? `[${record.stage_status_hash[text]}]` || "N/A"
              : "[Not submitted]";
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
      dataIndex: "stage",
      align: "right",
      render: (text, record) => record?.link,
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
