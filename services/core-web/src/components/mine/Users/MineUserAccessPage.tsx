import React, { FC } from "react";
import { useParams } from "react-router-dom";
import MineUserAccess from "@mds/common/components/mine/MineUserAccess";

const MineUserAccessPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    return (
        <div className="tab__content">
            <MineUserAccess mineGuid={id} />
        </div>
    );
};

export default MineUserAccessPage;