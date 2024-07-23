import React, { useEffect } from "react";
import { Col, Row, Tabs, Typography } from "antd";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPermitByGuid } from "@mds/common/redux/selectors/permitSelectors";
import { IMine, IPermit } from "@mds/common";
import { faLocationDot } from "@fortawesome/pro-light-svg-icons";
import CoreTag from "@mds/common/components/common/CoreTag";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CompanyIcon from "@mds/common/assets/icons/CompanyIcon";
import ViewPermitOverview from "@/components/mine/Permit/ViewPermitOverview";
import ViewPermitConditions from "@/components/mine/Permit/ViewPermitConditions";
import ViewPermitReports from "@/components/mine/Permit/ViewPermitReports";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import * as routes from "@/constants/routes";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";

const { Title, Text } = Typography;

const ViewPermit = () => {
  const dispatch = useDispatch();

  const { id, permitGuid } = useParams<{ id: string; permitGuid: string }>();
  const permit: IPermit = useSelector(getPermitByGuid(permitGuid));
  const mine: IMine = useSelector((state) => getMineById(state, id));

  useEffect(() => {
    if (!permit?.permit_id) {
      dispatch(fetchPermits(id));
    }
  }, [permit]);

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(id));
    }
  }, [mine]);

  const tabItems = [
    {
      key: "1",
      label: "Permit Overview",
      children: <ViewPermitOverview />,
    },
    {
      key: "2",
      label: "Permit Conditions",
      children: <ViewPermitConditions />,
    },
    {
      key: "3",
      label: "Reports",
      children: <ViewPermitReports />,
    },
  ];

  return (
    <div className="view-permits margin-large--top padding-lg--left padding-lg--right">
      <Row className="margin-large--bottom">
        <Col>
          <Link to={routes.MINE_PERMITS.dynamicRoute(id)} className="faded-text">
            All Permits
          </Link>
          <Text> / Permit {permit?.permit_no ?? ""}</Text>
        </Col>
      </Row>
      <Row align="middle" gutter={16}>
        <Col>
          <Title level={1} className="padding-lg--right margin-none">
            Permit {permit?.permit_no ?? ""}
          </Title>
        </Col>
        <Col>
          <CoreTag icon={<FontAwesomeIcon icon={faLocationDot} />} text={mine?.mine_name} />
        </Col>
        <Col>
          <CoreTag icon={<CompanyIcon />} text={permit?.current_permittee} />
        </Col>
      </Row>
      <Tabs items={tabItems} />
    </div>
  );
};

export default ViewPermit;
