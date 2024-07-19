import React, { FC, ReactNode } from "react";
import { Row, Typography } from "antd";

interface TagProps {
  text: string;
  icon: ReactNode;
}

const CoreTag: FC<TagProps> = ({ text, icon }) => {
  return (
    <Row justify="space-between" align="middle" className="tag">
      {icon}
      <Typography.Text className="margin-medium--left">{text}</Typography.Text>
    </Row>
  );
};

export default CoreTag;
