import React, { FC, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Col, Row, Typography } from "antd";
import { getPermitConditionCategoryOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import PermitConditionLayer from "./PermitConditionLayer";
import { IPermitAmendment, IPermitCondition } from "@mds/common";
import { VIEW_MINE_PERMIT } from "@/constants/routes";
import ScrollSidePageWrapper from "@mds/common/components/common/ScrollSidePageWrapper";

const { Title } = Typography;

interface PermitConditionProps {
  latestAmendment: IPermitAmendment;
}

const PermitConditions: FC<PermitConditionProps> = ({ latestAmendment }) => {
  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const [isExpanded, setIsExpanded] = useState(false);
  const permitConditionCategoryOptions = useSelector(getPermitConditionCategoryOptions);

  const permitConditions = latestAmendment?.conditions;
  console.log(permitConditions);
  console.log("isExpanded", isExpanded);
  const permitConditionCategories = permitConditionCategoryOptions
    .map((cat) => {
      const conditions =
        permitConditions?.filter(
          (c) => c.condition_category_code === cat.condition_category_code
        ) ?? [];
      return conditions.length > 0
        ? { href: cat.condition_category_code.toLowerCase(), title: cat.description, conditions }
        : false;
    })
    .filter(Boolean);

  const scrollSideMenuProps = {
    menuOptions: permitConditionCategories,
    featureUrlRoute: VIEW_MINE_PERMIT.hashRoute,
    featureUrlRouteArguments: [id, permitGuid, "conditions"],
  };

  const topOffset = 109 + 49; // header + tab nav

  const handleUpdateCondition = (condition: IPermitCondition) => {
    console.log("not implemented", condition);
    return Promise.resolve();
  };

  const handleAddCondition = (newCondition: Partial<IPermitCondition>) => {
    console.log("not implemented", newCondition);
    return Promise.resolve();
  };

  return (
    <ScrollSidePageWrapper
      header={null}
      headerHeight={topOffset}
      menuProps={scrollSideMenuProps}
      content={
        <Row align="middle" justify="space-between" gutter={[10, 16]}>
          <Col span={24}>
            <Title className="margin-none" level={2}>
              Permit Conditions
            </Title>
          </Col>

          <Col>
            <Row gutter={10}>
              <Col>
                <Button type="ghost" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? "Collapse" : "Expand"} All Conditions
                </Button>
              </Col>
              <Col>
                <Button type="ghost">Open Permit in Document Viewer</Button>
              </Col>
            </Row>
          </Col>

          <Col>
            <Button type="ghost">Reorder</Button>
          </Col>
          <Col span={24}>
            <div className="core-page-content">
              <Row gutter={[16, 16]}>
                {permitConditionCategories.map((category) => {
                  return (
                    <>
                      <Col span={24} key={category.href}>
                        <Title level={3} className="margin-none">
                          {category.title} ({category.conditions.length})
                        </Title>
                      </Col>
                      {category.conditions.map((sc) => (
                        <Col span={24} key={sc.permit_condition_id}>
                          <PermitConditionLayer
                            condition={sc}
                            handleUpdateCondition={handleUpdateCondition}
                            isExpanded={isExpanded}
                          />
                        </Col>
                      ))}
                    </>
                  );
                })}
              </Row>
            </div>
          </Col>
        </Row>
      }
    />
  );
};

export default PermitConditions;
