import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Table } from "antd";
import * as routes from "@/constants/routes";
import { ColumnsType } from "antd/es/table";
import { getProjectSummary } from "@mds/common/redux/reducers/projectReducer";
import { IProjectStage } from "@mds/common";

interface ProjectStagesTableProps {
  projectStages: IProjectStage[];
}

export const ProjectStagesTable: FC<ProjectStagesTableProps> = ({ projectStages }) => {
  const projectSummary = useSelector(getProjectSummary);
  const isProjectSummarySubmitted = Boolean(projectSummary?.submission_date);

  const transformRowData = (stages: IProjectStage[]) =>
    stages?.map((stage) => ({
      key: stage.key,
      project_stage: stage.title,
      stage_status: stage.status === "ASG" ? "SUB" : stage.status,
      stage_status_hash: stage.statusHash,
      stage_required: stage.required,
      navigate_forward: stage.navigateForward,
      stage,
    }));

  const columns: ColumnsType<any> = [
    {
      title: "",
      dataIndex: "project_stage",
      render: (text) => (
        <div title="Project Stage">
          <b>{text}</b>
        </div>
      ),
    },
    {
      title: "",
      dataIndex: "stage_status",
      render: (text, record) => {
        const status =
          record.stage_status === undefined ? "Not Started" : record.stage_status_hash[text];
        return (
          <div title="Stage Status">
            <b>{status || "N/A"}</b>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "stage_required",
      render: (text, record) => {
        const label = record.stage_required ? "Required" : "Optional";
        return record.stage_required !== null ? (
          <div title="Stage Required">
            <b>{label || "N/A"}</b>
          </div>
        ) : null;
      },
    },
    {
      title: "",
      dataIndex: "stage",
      align: "right",
      render: (text, record) => {
        let link;
        if (record.project_stage === "Project description") {
          const payload = record.stage?.payload;
          if (payload?.submission_date) {
            link = (
              <Button
                className="full-mobile margin-small"
                onClick={() => record?.navigate_forward()}
              >
                View
              </Button>
            );
          } else {
            link = (
              <Link
                to={routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
                  payload?.project_guid,
                  payload?.project_summary_guid
                )}
              >
                <Button className="full-mobile margin-small">Resume</Button>
              </Link>
            );
          }
        }
        if (record.project_stage === "IRT") {
          let buttonLabel: string;
          let disableButton = Boolean(record.stage_status);
          if (!record.stage_status) {
            buttonLabel = "Start";
            disableButton = !isProjectSummarySubmitted;
          } else if (record.stage_status === "APV") {
            buttonLabel = "View";
          } else {
            buttonLabel = "Resume";
          }

          link = (
            <Button
              className="full-mobile margin-small"
              onClick={() => record?.navigate_forward()}
              disabled={disableButton}
            >
              {buttonLabel}
            </Button>
          );
        }
        if (record.project_stage === "Application") {
          let buttonLabel: string;
          let disableButton = Boolean(record.stage_status);
          if (!record.stage_status) {
            buttonLabel = "Start";
            disableButton = !isProjectSummarySubmitted;
          } else if (["SUB", "UNR", "APV"].includes(record.stage_status)) {
            buttonLabel = "View";
          } else {
            buttonLabel = "Resume";
          }

          link = (
            <Button
              className="full-mobile margin-small"
              onClick={() => record?.navigate_forward()}
              disabled={disableButton}
            >
              {buttonLabel}
            </Button>
          );
        }
        return link;
      },
    },
  ];

  return (
    <Table
      loading={!projectSummary.project_summary_guid}
      size="small"
      showHeader={false}
      pagination={false}
      columns={columns}
      rowKey="project_stage"
      dataSource={transformRowData(projectStages)}
      locale={{ emptyText: "This project has no stage data." }}
    />
  );
};

export default ProjectStagesTable;
