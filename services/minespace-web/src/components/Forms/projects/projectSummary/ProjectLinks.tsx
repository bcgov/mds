import React, { FC } from "react";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { useSelector } from "react-redux";
import ProjectLinksTable from "@mds/common/components/projects/ProjectLinksTable";


const ProjectLinks = () => {
    const projectData = useSelector(getProject);

    return (
        <>
            {<ProjectLinksTable project={projectData} />}
        </>
    );
};

// const mapStateToProps = (state: RootState) => ({
//     project: getProject(state),
// });

export default ProjectLinks;
