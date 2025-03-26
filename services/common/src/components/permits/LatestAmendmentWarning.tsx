import React, { FC } from "react";
import { Alert, Button, Col } from "antd";
import { IPermitAmendment } from "@mds/common/interfaces/permits";

interface Props {
    latestAmendment: IPermitAmendment;
    currentAmendment: IPermitAmendment;
    onViewAmendment: (e: React.MouseEvent) => void;
}

export const LatestAmendmentWarning: FC<Props> = ({
    latestAmendment,
    currentAmendment,
    onViewAmendment,
}) => {
    if (latestAmendment?.permit_amendment_guid === currentAmendment?.permit_amendment_guid) {
        return null;
    }

    return (
        <Col span={24}>
            {!latestAmendment?.conditions?.length ? (
                <Alert
                    message="Extract and review the latest permit amendment"
                    description="The current permit conditions reflect the last permit reviewed and verified. Minespace users are seeing the last reviewed version. Conditions not amended will remain unchanged."
                    type="warning"
                    action={<Button onClick={onViewAmendment}>Extract Permit Conditions</Button>}
                    showIcon
                />
            ) : (
                <Alert
                    message="Review and update the latest permit amendment conditions"
                    description="MineSpace users will continue to see the last reviewed and verified permit conditions until the new amendment completes review."
                    type="warning"
                    action={<Button onClick={onViewAmendment}>Review Permit Conditions</Button>}
                    showIcon
                />
            )}
        </Col>
    );
};
