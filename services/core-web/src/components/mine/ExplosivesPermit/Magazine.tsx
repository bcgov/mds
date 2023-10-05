import React, { FC } from "react";
import { Col, Collapse, Row, Typography } from "antd";
import { IExplosivesPermitMagazine } from "@mds/common";

interface IMagazineProps {
  label: string;
  magazine: IExplosivesPermitMagazine;
}

const Magazine: FC<IMagazineProps> = (props) => {
  const { label, magazine } = props;
  return (
    <Collapse className="magazine-collapse margin-large--bottom">
      <Collapse.Panel
        className="magazine-collapse"
        header={
          <Typography.Text strong className="purple">
            {label}
          </Typography.Text>
        }
        key={label}
      >
        <div>
          <Row>
            <Col span={12}>
              <Typography.Paragraph strong>Type No. </Typography.Paragraph>
              <Typography.Paragraph>{magazine.type_no} </Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Tag No.</Typography.Paragraph>
              <Typography.Paragraph>{magazine.tag_no} </Typography.Paragraph>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Typography.Paragraph strong>Construction</Typography.Paragraph>
              <Typography.Paragraph>{magazine.construction} </Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Quantity (Kg)</Typography.Paragraph>
              <Typography.Paragraph>{magazine.quantity} </Typography.Paragraph>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Typography.Paragraph strong>Latitude</Typography.Paragraph>
              <Typography.Paragraph>{magazine.latitude} </Typography.Paragraph>
            </Col>
            <Col span={12}>
              <Typography.Paragraph strong>Longitude</Typography.Paragraph>
              <Typography.Paragraph>{magazine.longitude} </Typography.Paragraph>
            </Col>
          </Row>
          <Typography.Paragraph strong>Distance from road or work aread (m)</Typography.Paragraph>
          <Typography.Paragraph>{magazine.distance_road} </Typography.Paragraph>
          <Typography.Paragraph strong>
            Distance from dwelling or flammable material storage area (m)
          </Typography.Paragraph>
          <Typography.Paragraph>{magazine.distance_dwelling} </Typography.Paragraph>
          <Row>
            <Col span={8}>
              <Typography.Paragraph strong>Length (m)</Typography.Paragraph>
              <Typography.Paragraph>{magazine.length} </Typography.Paragraph>
            </Col>
            <Col span={8}>
              <Typography.Paragraph strong>Width (m)</Typography.Paragraph>
              <Typography.Paragraph>{magazine.width} </Typography.Paragraph>
            </Col>
            <Col span={8}>
              <Typography.Paragraph strong>Height (m)</Typography.Paragraph>
              <Typography.Paragraph>{magazine.height} </Typography.Paragraph>
            </Col>
          </Row>
        </div>
      </Collapse.Panel>
    </Collapse>
  );
};

export default Magazine;
