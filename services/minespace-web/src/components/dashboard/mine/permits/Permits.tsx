import React, { FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Typography } from "antd";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { fetchExplosivesPermits } from "@mds/common/redux/actionCreators/explosivesPermitActionCreator";
import { openModal } from "@mds/common/redux/actions/modalActions";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import PermitsTable from "@/components/dashboard/mine/permits/PermitsTable";
import { IExplosivesPermit, IMine, IPermit } from "@mds/common";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

interface PermitsProps {
  mine: IMine;
  permits: IPermit[];
  explosivesPermits: IExplosivesPermit[];
  fetchPermits: ActionCreator<typeof fetchPermits>;
  fetchExplosivesPermits: ActionCreator<typeof fetchExplosivesPermits>;
  openModal: (payload) => any;
}
export const Permits: FC<PermitsProps> = ({ mine, permits, explosivesPermits, ...props }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded) {
      Promise.all([props.fetchExplosivesPermits(mine.mine_guid)]).then(() => {
        setIsLoaded(true);
      });
    }
  }, []);

  return (
    <Row>
      <Col span={24}>
        <Typography.Paragraph>
          The below table displays all of the <strong>permit applications</strong> associated with
          this mine.
        </Typography.Paragraph>
        <PermitsTable
          isLoaded={isLoaded}
          permits={permits}
          explosivesPermits={explosivesPermits}
          majorMineInd={mine.major_mine_ind}
          mineGuid={mine.mine_guid}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  explosivesPermits: getExplosivesPermits(state),
});

const mapDispatchToProps = {
  fetchPermits,
  fetchExplosivesPermits,
  openModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(Permits);
