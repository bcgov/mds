import { BaseInputProps } from "@mds/common/components/forms/BaseInput";
import RenderDate from "@mds/common/components/forms/RenderDate";
import React, { FC } from "react";

/**
 * 
 * @deprecated - use RenderDate directly
 */
const RenderYear: FC<BaseInputProps> = (props) => {
    return (
        <RenderDate {...props} yearMode />
    )
}

export default RenderYear;
