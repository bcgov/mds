import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Col, Row, Typography } from "antd";

import { IPermit } from "@mds/common/interfaces/permits/permit.interface";
import { IMine } from "@mds/common/interfaces/mine.interface";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import {
  getPermitConditionCategoryOptions,
  getPermitConditionTypeOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";

const { Title } = Typography;

const ViewPermitConditions = () => {
  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));
  const permitConditionCategoryOptions = useSelector(getPermitConditionCategoryOptions);
  const permitConditiontypeOptions = useSelector(getPermitConditionTypeOptions);

  const latestAmendment = useMemo(() => {
    if (!permit) return undefined;
    return permit.permit_amendments[permit.permit_amendments.length - 1];
  }, [permit]);

  const permitConditions = latestAmendment?.conditions;

  console.log(permitConditions);
  console.log("permitConditionCategoryOptions", permitConditionCategoryOptions);
  console.log("permitConditiontypeOptions", permitConditiontypeOptions);

  return (
    <div className="view-permits-content">
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Title className="margin-none padding-lg--top padding-lg--bottom" level={2}>
            Permit Conditions
          </Title>
        </Col>
        {/* <Col>
          <Button type="primary">Edit Permit</Button>
        </Col> */}
      </Row>
      <Row gutter={[16, 16]}></Row>
    </div>
  );
};

export default ViewPermitConditions;
