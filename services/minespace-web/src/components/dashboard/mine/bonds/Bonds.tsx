import React, { FC, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Typography } from "antd";
import { fetchMineBonds } from "@mds/common/redux/actionCreators/securitiesActionCreator";
import { getBonds } from "@mds/common/redux/selectors/securitiesSelectors";
import BondsTable from "@/components/dashboard/mine/bonds/BondsTable";
import { SidebarContext } from "@mds/common/components/common/SidebarWrapper";
import { IMine } from "@mds/common/interfaces";

export const Bonds: FC = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const { mine } = useContext<{ mine: IMine }>(SidebarContext);
  const bonds = useSelector(getBonds);

  useEffect(() => {
    dispatch(fetchMineBonds(mine.mine_guid)).then(() => {
      setIsLoaded(true);
    });
  }, []);

  return (
    <Row>
      <Typography.Title level={1}>Bonds</Typography.Title>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Typography.Paragraph>
              This table shows&nbsp;
              <Typography.Text className="color-primary" strong>
                bonds
              </Typography.Text>
              &nbsp;for your mine.
            </Typography.Paragraph>
            <br />
          </Col>
        </Row>
        <Row gutter={[16, 32]}>
          <Col span={24}>
            <BondsTable bonds={bonds} isLoaded={isLoaded} />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Bonds;
