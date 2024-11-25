import React, { FC, ReactElement } from "react";
import { CALLOUT_SEVERITY, MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES, PROJECT_STATUS_CODES, PROJECT_SUMMARY_STATUS_CODES, SystemFlagEnum } from "@mds/common/constants";
import Callout from "../common/Callout";
import { Alert, Col, Row } from "antd";
import { useSelector } from "react-redux";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";

export const statusTextHash = {
    "DFT": { severity: CALLOUT_SEVERITY.warning, message: "This project step has not been formally submitted by the proponent through MineSpace. MineSpace users can update text fields and add documents." },
    "WDN": { severity: CALLOUT_SEVERITY.danger, message: "MineSpace users cannot update text fields or update documents. Contact the Ministry to change this status." },
    "COM": { severity: CALLOUT_SEVERITY.success, message: "The review of this project is completed. MineSpace users cannot update text fields or update documents." },
    "OHD": { severity: CALLOUT_SEVERITY.danger, message: "This project is on hold. MineSpace users cannot update text fields or update documents. Contact the Ministry to change this status." },
    "SUB": { severity: CALLOUT_SEVERITY.success, message: "This project has been formally submitted by the proponent through MineSpace. MineSpace users can update documents only." },
    "UNR": { severity: CALLOUT_SEVERITY.warning, message: "This project is being actively reviewed. MineSpace users cannot update text fields or update documents." },
    "CHR": { severity: CALLOUT_SEVERITY.warning, message: "This project requires changes by the mine. MineSpace users can update text fields and update documents. Note: when the MineSpace user resubmits at this step the project status will be changed to under review." },
    "ASG": { severity: CALLOUT_SEVERITY.success, message: "This project has been formally submitted by the proponent through MineSpace. MineSpace users can update documents only." }
}

interface ProjectCalloutProps {
    status_code: PROJECT_STATUS_CODES | MAJOR_MINE_APPLICATION_AND_IRT_STATUS_CODE_CODES;
    formField?: ReactElement;
}

const ProjectCallout: FC<ProjectCalloutProps> = ({
    status_code,
    formField }) => {

    const systemFlag = useSelector(getSystemFlag);
    const isCore = systemFlag === SystemFlagEnum.core;
    const calloutParams = statusTextHash[status_code ?? "DFT"];
    let title = PROJECT_SUMMARY_STATUS_CODES[status_code ?? "DFT"];
    const hasFormField = Boolean(formField);
    const colProps = hasFormField ? { xs: 24, md: 18 } : { span: 24 };

    if (status_code === PROJECT_STATUS_CODES.ASG && !isCore) {
        title = PROJECT_SUMMARY_STATUS_CODES.SUB;
    }

    return (
        isCore ?
            <Alert
                message={title}
                description={
                    <Row justify="space-between">
                        <Col {...colProps}>
                            {calloutParams.message}
                        </Col>
                        {hasFormField &&
                            <Col xs={24} md={6}>
                                {formField}
                            </Col>
                        }
                    </Row>
                }
                showIcon
                type="warning"
                className="margin-large--bottom"
            />
            : <Callout
                message={calloutParams.message}
                title={title}
                severity={calloutParams.severity}

            />);
};

export default ProjectCallout;