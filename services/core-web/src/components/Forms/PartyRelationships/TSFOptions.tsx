import React, { FC } from "react";
import { Field } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import { notnone } from "@mds/common/redux/utils/Validate";
import { createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import { IMine } from "@mds/common/interfaces";

interface TSFOptionsProps {
  mine: IMine;
}

export const TSFOptions: FC<TSFOptionsProps> = ({ mine }) => {
  const tsfDropdown = createDropDownList(
    mine.mine_tailings_storage_facilities,
    "mine_tailings_storage_facility_name",
    "mine_tailings_storage_facility_guid"
  );

  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Field
          id="related_guid"
          name="related_guid"
          label="TSF"
          placeholder="Select a TSF"
          doNotPinDropdown
          component={renderConfig.SELECT}
          data={tsfDropdown}
          required
          validate={[notnone]}
        />
      </Col>
    </Row>
  );
};

export default TSFOptions;
