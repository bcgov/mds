import React, { useEffect } from "react";
import { Button, Col, Row, Typography } from "antd";
import { Link, useParams } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { MINE_DASHBOARD, MINE_TAILINGS } from "@/constants/routes";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { ITailingsStorageFacility } from "@mds/common/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/pro-regular-svg-icons";
import { COLOR } from "@mds/common/constants/styles";
import {
  fetchMineRecordById,
  fetchTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";

const { Title, Paragraph } = Typography;

const TailingsSubmitSuccess = () => {
  const dispatch = useAppDispatch();

  const { mineGuid, tailingsStorageFacilityGuid } = useParams<{
    mineGuid: string;
    tailingsStorageFacilityGuid: string;
  }>();

  const mine = useAppSelector(getMineById(mineGuid));
  const tsf: ITailingsStorageFacility = useAppSelector(getTsf);

  useEffect(() => {
    if (!tsf?.mine_tailings_storage_facility_name) {
      dispatch(fetchTailingsStorageFacility(mineGuid, tailingsStorageFacilityGuid));
    }
  }, [tsf?.mine_tailings_storage_facility_name]);

  useEffect(() => {
    if (!mine) {
      dispatch(fetchMineRecordById(mineGuid));
    }
  }, [mine]);

  return (
    <div>
      <Row className="margin-large--top">
        <Col>
          <Title level={1}>{tsf?.mine_tailings_storage_facility_name}</Title>
        </Col>
        <Col span={24}>
          <Link to={MINE_TAILINGS.dynamicRoute(mineGuid)}>
            <ArrowLeftOutlined className="padding-sm--right" />
            {`Back to: ${mine?.mine_name} Tailings`}
          </Link>
        </Col>
      </Row>
      <Row
        style={{ maxWidth: "648px", margin: "0 auto" }}
        justify="center"
        align="middle"
        className="margin-large--top"
        gutter={[16, 16]}
      >
        <Col span={24} className="center">
          <FontAwesomeIcon icon={faCircleCheck} color={COLOR.successGreen} size="5x" />
        </Col>
        <Col span={24}>
          <Paragraph strong>
            Thank you, your Tailings Storage Facility has been updated successfully!
          </Paragraph>
          <Paragraph>
            As Per{" "}
            <a
              href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/health-safety/health-safety-and-reclamation-code-for-mines-in-british-columbia"
              target="_blank"
            >
              Health, Safety and Reclamation Code
            </a>
            , if an Engineer of Record or Qualified Person has been assigned, written acknowledgment
            is required within 72 hours of designation. Please submit the acknowledgment as
            requested in the Reports page.
          </Paragraph>
        </Col>
        <Col span={24} className="center">
          <Button type="primary" href={MINE_TAILINGS.dynamicRoute(mineGuid)}>
            Back to Tailings and Dams
          </Button>
        </Col>
        <Col span={24} className="center">
          <Button type="default" href={MINE_DASHBOARD.dynamicRoute(mineGuid, "reports")}>
            Submit Written Acknowledgement in Reports
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default TailingsSubmitSuccess;
