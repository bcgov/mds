import ExplosivesPermitViewModal from "@mds/common/components/explosivespermits/ExplosivesPermitViewModal";
import { IExplosivesPermit, IExplosivesPermitAmendment, IMine } from "@mds/common";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { connect } from "react-redux";
import React, { FC, useEffect, useState } from "react";
import { getExplosivesPermits } from "@mds/common/redux/selectors/explosivesPermitSelectors";
import { Link, useParams } from "react-router-dom";
import { fetchExplosivesPermits } from "@mds/common/redux/actionCreators/explosivesPermitActionCreator";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import { Col, Row, Typography } from "antd";
import * as router from "@/constants/routes";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import { getMines } from "@mds/common/redux/selectors/mineSelectors";

interface ExplosivesPermitProps {
  handleOpenExplosivesPermitCloseModal: () => void;
  openModal?: () => void;
  closeModal?: () => void;
  explosivesPermits?: IExplosivesPermit[];
  fetchExplosivesPermits?: ActionCreator<typeof fetchExplosivesPermits>;
  mines?: IMine[];
}

const ExplosivesPermit: FC<ExplosivesPermitProps> = ({
  handleOpenExplosivesPermitCloseModal,
  explosivesPermits,
  mines,
  ...props
}) => {
  const [explosivesPermit, setExplosivesPermit] = useState<
    IExplosivesPermit | IExplosivesPermitAmendment
  >(null);
  const [parentPermit, setParentPermit] = useState<IExplosivesPermit>(null);

  const { mineGuid, explosivesPermitGuid, amendmentId } = useParams<{
    mineGuid: string;
    explosivesPermitGuid: string;
    amendmentId: string;
  }>();

  const mineName = mines[mineGuid]?.mine_name || "";

  useEffect(() => {
    if (explosivesPermits.length >= 0) {
      props.fetchExplosivesPermits(mineGuid);
    }
  }, []);

  useEffect(() => {
    if (explosivesPermits?.length > 0) {
      const currentPermit = explosivesPermits.find(
        ({ explosives_permit_guid }) => explosives_permit_guid === explosivesPermitGuid
      );
      const currentAmendment = amendmentId
        ? currentPermit?.explosives_permit_amendments.find(
            ({ explosives_permit_amendment_id }) =>
              explosives_permit_amendment_id === Number(amendmentId)
          )
        : currentPermit;

      setExplosivesPermit(currentAmendment);
      setParentPermit(currentPermit);
    }
  }, [explosivesPermits]);

  return (
    <div>
      <div className="margin-large--bottom">
        <Row>
          <Col span={24}>
            <Typography.Title>Explosives Storage and Use Permit</Typography.Title>
          </Col>
        </Row>
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Link to={router.MINE_DASHBOARD.dynamicRoute(mineGuid, "permits")}>
              <ArrowLeftOutlined className="padding-sm--right" />
              Back to: {mineName} Permits
            </Link>
          </Col>
        </Row>
      </div>
      {explosivesPermit && parentPermit && (
        <ExplosivesPermitViewModal
          explosivesPermit={explosivesPermit as IExplosivesPermitAmendment}
          parentPermit={parentPermit}
          closeModal={props.closeModal}
          handleOpenExplosivesPermitCloseModal={handleOpenExplosivesPermitCloseModal}
        />
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  explosivesPermits: getExplosivesPermits(state),
  mines: getMines(state),
});

const mapDispatchToProps = {
  openModal,
  closeModal,
  fetchExplosivesPermits,
};

export default connect(mapStateToProps, mapDispatchToProps)(ExplosivesPermit);
