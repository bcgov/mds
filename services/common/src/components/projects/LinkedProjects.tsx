import React, { FC } from "react";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { connect } from "react-redux";
import { IProject } from "@mds/common/interfaces";
import { RootState } from "@mds/common/redux/rootState";


interface LinkedProjectsProps {
    project: IProject;
}

export const LinkedProjects: FC<LinkedProjectsProps> = (props) => {
    console.log("LinkedProjects props", props);

    return (
        <>
            {"Testing Linked Projects"}
        </>
    );
};

const mapStateToProps = (state: RootState) => ({
    project: getProject(state),
});

export default connect(mapStateToProps)(LinkedProjects);
