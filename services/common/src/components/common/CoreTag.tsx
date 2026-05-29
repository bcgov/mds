import React, { FC, ReactNode } from "react";
import { Row, Typography } from "antd";
import { Link } from "react-router-dom";

interface TagProps {
  text: string;
  icon: ReactNode;
  link?: string;
  suffix?: ReactNode;
}

const CoreTag: FC<TagProps> = ({ text, icon, link, suffix }) => {
  const getText = () => {
    return link ? (
      <Link style={{ textDecoration: "none", color: "inherit" }} to={link}>
        {text}
      </Link>
    ) : (
      text
    );
  };

  return (
    <Row justify="space-between" align="middle" className="tag">
      {icon}
      <Typography.Text className="margin-medium--left">{getText()}</Typography.Text>
      {suffix && <span style={{ marginLeft: 8 }}>{suffix}</span>}
    </Row>
  );
};

export default CoreTag;
