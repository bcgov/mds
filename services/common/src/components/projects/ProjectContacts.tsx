import React, { FC } from "react";
import { Typography, Card } from "antd";
import * as Strings from "@mds/common/constants/strings";
import { IProjectContact } from "@mds/common/interfaces";
import { useAppSelector } from "@mds/common/redux/rootState";
import { getMinistryContactTypesHash } from "@mds/common/redux/selectors/staticContentSelectors";

interface IProjectContactDisplay extends IProjectContact {
    is_project_lead_contact?: boolean;
    phone_no?: string;
    emli_contact_type_code?: string;
}
interface ProjectContactsProps {
    title: string;
    contacts: IProjectContactDisplay[];
}

const ProjectContacts: FC<ProjectContactsProps> = ({ title, contacts }) => {
    const ministryContactTypesHash = useAppSelector(getMinistryContactTypesHash);
    return <Card title={title} headStyle={{ minHeight: "unset" }}>
        {contacts.map((c) => {
            const isPrimary = c.is_primary;
            const hasJobTitle = c.job_title;
            const isProjectLeadContact = c.is_project_lead_contact;
            const name = [c?.first_name, c?.last_name].join(" ").trim();
            let jobTitle = ministryContactTypesHash[c.emli_contact_type_code];
            const phone = c.phone_no ?? c.phone_number;

            if (isProjectLeadContact) {
                jobTitle = "MCM Project Lead";
            } else if (isPrimary) {
                jobTitle = "Primary Contact";
            } else if (hasJobTitle) {
                jobTitle = c.job_title;
            }
            return (
                <Typography.Paragraph className="ministry-contact-item" key={c.project_contact_guid}>
                    {jobTitle && (
                        <Typography.Text strong className="ministry-contact-title taratest4">
                            {jobTitle}
                        </Typography.Text>
                    )}
                    <br />
                    {c.is_project_lead_contact && !c.first_name ? (
                        <Typography.Text>Project Lead has not been assigned</Typography.Text>
                    ) : (
                        <>
                            {name.length > 0 && <><Typography.Text className="taratest1">{name ?? Strings.EMPTY_FIELD}</Typography.Text>
                                <br /></>}
                            {phone && <><Typography.Text className="taratest2">{phone}</Typography.Text>
                                <br /></>}

                            {c.email && (
                                <Typography.Text className="taratest3">
                                    <a href={`mailto:${c.email}`}>{c.email}</a>
                                </Typography.Text>
                            )}
                        </>
                    )}
                </Typography.Paragraph>
            );
        })}
    </Card>
};

export default ProjectContacts