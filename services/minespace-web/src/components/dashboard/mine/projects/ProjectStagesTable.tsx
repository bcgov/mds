import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Table } from "antd";
import * as routes from "@/constants/routes";
import { ColumnsType } from "antd/es/table";
import { getProjectSummary } from "@mds/common/redux/reducers/projectReducer";
import { areDocumentFieldsDisabled } from "@mds/common/components/projects/projectUtils";
import { IProjectStage } from "@mds/common/interfaces/projects/projectStage.interface";
import { SystemFlagEnum } from "@mds/common/constants/enums";

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
      payload: stage.payload,
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
        const status = text === undefined ? "Not Started" : record.stage_status_hash[text];
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
      render: (text) => {
        const label = text ? "Required" : "Optional";
        return text !== null ? (
          <div title="Stage Required">
            <b>{label || "N/A"}</b>
          </div>
        ) : null;
      },
    },
    {
      title: "",
      dataIndex: "payload",
      align: "right",
      render: (payload, record) => {
        let link;
        switch (record.project_stage) {
          case "Project description": {
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
            break;
          }
          case "IRT":
          case "Application": {
            let buttonLabel: string;
            let enableButton = true;
            const docsDisabled = areDocumentFieldsDisabled(SystemFlagEnum.ms, record.stage_status);
            if (!record.stage_status) {
              buttonLabel = "Start";
              enableButton = isProjectSummarySubmitted;
            } else if (docsDisabled) {
              buttonLabel = "View";
            } else {
              buttonLabel = "Resume";
            }

            link = (
              <Button
                className="full-mobile margin-small"
                onClick={() => record?.navigate_forward()}
                disabled={!enableButton}
              >
                {buttonLabel}
              </Button>
            );
          }
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
