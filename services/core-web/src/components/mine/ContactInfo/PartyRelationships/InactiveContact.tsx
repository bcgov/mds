import React, { FC, useEffect, useState } from "react";
import { Button, Card } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Redirect } from "react-router-dom";
import * as router from "@/constants/routes";
import { IMine } from "@mds/common/interfaces";

interface InactiveContactProps {
  partyRelationshipTypeCode: string;
  partyRelationshipTitle: string;
  mine: IMine;
}

export const InactiveContact: FC<InactiveContactProps> = ({
  partyRelationshipTypeCode,
  partyRelationshipTitle,
  mine,
}) => {
  const [redirectToProfile, setRedirectToProfile] = useState(false);

  useEffect(() => {
    if (redirectToProfile) {
      return (
        <Redirect
          to={router.RELATIONSHIP_PROFILE.dynamicRoute(mine.mine_guid, partyRelationshipTypeCode)}
          push
        />
      );
    }
  }, []);

  return (
    <Card
      bordered={false}
      bodyStyle={{
        borderTop: "1px solid #CCCCCC",
        borderBottom: "4px solid #CCCCCC",
        borderRight: "1px solid #CCCCCC",
        borderLeft: "1px solid #CCCCCC",
        background: "#EEEEEE",
      }}
    >
      <div className="inline-flex between wrap">
        <div>
          <h3>{partyRelationshipTitle}</h3>
          <p>
            <ClockCircleOutlined />
            &nbsp;&nbsp;None Active
          </p>
        </div>
        <div className="right">
          <Button
            style={{ marginRight: "0" }}
            onClick={() => {
              setRedirectToProfile(true);
            }}
          >
            See History
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InactiveContact;
