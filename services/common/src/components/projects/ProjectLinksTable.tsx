import React from "react";
import { Row, Col } from "antd";

import { IProject } from "@mds/common";
import { dateSorter, formatDate } from "@mds/common/redux/utils/helpers";
import CoreTable from "@mds/components/common/CoreTable";


interface IProjectLinksTableProps {
    mine_guid: string;
    project: IProject;
    isLoaded: boolean;
}

interface ILinkedProject {
    key: string;
    project_title: string;
    proponent_project_id: string;
    status_code: string;
    mine_guid: string;
    primary_contact: string;
    update_timestamp: string;
}


const ProjectsTable: React.FC<IProjectLinksTableProps> = ({ mine_guid, project, isLoaded }) => {
    const transformProjectData = (data: IProject): ILinkedProject[] => {
        return data.project_links.flatMap((link) => {
            const isSameProject = link.project.project_guid === data.project_guid;
            const isSameRelatedProject = link.related_project.project_guid === data.project_guid;

            const transformProject = (res) => ({
                key: res.project_guid,
                project_title: res.project_title,
                proponent_project_id: project.proponent_project_id,
                status_code: project.project_summary.status_code,
                mine_guid: mine_guid,
                primary_contact: project.contacts.find((c: any) => c.name)?.name || "",
                update_timestamp: formatDate(project.update_timestamp),
            });

            return [
                !isSameProject ? transformProject(link.project) : null,
                !isSameRelatedProject ? transformProject(link.related_project) : null,
            ].filter(Boolean) as ILinkedProject[];
        });
    };

    const columns = () => [
        {
            title: "Project Title",
            dataIndex: "project_title",
            sorter: (a: any, b: any) => (a.project_title > b.project_title ? -1 : 1),
            render: (text: string) => <div title="Project Name">{text}</div>,
        },
        {
            title: "Project #",
            dataIndex: "proponent_project_id",
            sorter: (a: any, b: any) => (a.proponent_project_id > b.proponent_project_id ? -1 : 1),
            render: (text: string) => <div title="Project #">{text || "N/A"}</div>,
        },
        {
            title: "Status",
            dataIndex: "status_code",
            sorter: (a: any, b: any) => (a.status_code > b.status_code ? -1 : 1),
            render: (text: string) => <div title="Status">{text || "N/A"}</div>,
        },
        {
            title: "Contact",
            dataIndex: "primary_contact",
            sorter: (a: any, b: any) => (a.primary_contact > b.primary_contact ? -1 : 1),
            render: (text: string) => <div title="Contact">{text}</div>,
        },
        {
            title: "Last Updated",
            dataIndex: "update_timestamp",
            sorter: dateSorter("update_timestamp"),
            render: (text: string) => <div title="Last Updated">{text}</div>,
        },
        {
            title: "",
            dataIndex: "project",
            render: (text: string, record: any) => (
                <div title="">
                    <Row gutter={1}>
                        <Col span={12}>
                            {/* <Link to={routes.EDIT_PROJECT.dynamicRoute(record.project.project_guid)}>
                                <img src={EDIT_PENCIL} alt="Edit" />
                            </Link> */}
                        </Col>
                    </Row>
                </div>
            ),
        },
    ];

    return (
        <CoreTable
            loading={!isLoaded}
            columns={columns()}
            dataSource={transformProjectData(project)}
            emptyText="This project has no related projects."
        />
    );
};

export default ProjectsTable;
