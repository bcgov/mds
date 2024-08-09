import React, { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row, Tabs, TabsProps, Typography } from "antd";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CoreTag from "./CoreTag";

import CompanyIcon from "@mds/common/assets/icons/CompanyIcon";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";

interface BreadCrumb {
  route: string;
  text: string;
}

interface CorePageHeaderProps {
  entityLabel: string;
  entityType: string;
  mineGuid: string;
  current_permittee: string; // would be ideal to get this from the mine
  breadCrumbs?: BreadCrumb[];
  tabProps?: TabsProps;
}

const { Title, Text } = Typography;

const CorePageHeader: FC<CorePageHeaderProps> = ({
  mineGuid,
  current_permittee,
  entityLabel,
  entityType,
  breadCrumbs,
  tabProps,
}) => {
  const mine = useSelector((state) => getMineById(state, mineGuid));
  const dispatch = useDispatch();

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, [mineGuid]);

  return (
    <div className="core-page">
      <div className="view--header padding-lg--top padding-lg--sides core-page-header">
        <Row>
          <Col>
            {breadCrumbs.map((crumb) => {
              return (
                <React.Fragment key={crumb.route}>
                  <Link to={crumb.route} className="faded-text">
                    {crumb.text}
                  </Link>{" "}
                  /{" "}
                </React.Fragment>
              );
            })}
            <Text>
              {entityType} {entityLabel}
            </Text>
          </Col>
        </Row>
        <Row align="middle" gutter={16}>
          <Col>
            <Title level={1} className="margin-none">
              {entityType} {entityLabel}
            </Title>
          </Col>
          <Col>
            <CoreTag
              icon={<FontAwesomeIcon icon={faLocationDot} />}
              text={mine?.mine_name}
              link={GLOBAL_ROUTES?.MINE_DASHBOARD.dynamicRoute(mineGuid)}
            />
          </Col>
          <Col>
            <CoreTag icon={<CompanyIcon />} text={current_permittee} />
          </Col>
        </Row>
      </div>
      {tabProps && (
        <Tabs
          className="core-tabs fixed-tabs-tabs padding-md--top"
          {...tabProps}
          tabBarStyle={{ paddingLeft: 20, paddingRight: 20 }}
        />
      )}
    </div>
  );
};

export default CorePageHeader;
