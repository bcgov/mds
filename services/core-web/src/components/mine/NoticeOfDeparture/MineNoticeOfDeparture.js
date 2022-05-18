import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { closeModal, openModal } from "@common/actions/modalActions";
import {
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  updateNoticeOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getMineGuid, getMines } from "@common/selectors/mineSelectors";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import { modalConfig } from "@/components/modalContent/config";
import * as Permission from "@/constants/permissions";
import CustomPropTypes from "@/customPropTypes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import MineNoticeOfDepartureTable from "./MineNoticeOfDepartureTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  fetchDetailedNoticeOfDeparture: PropTypes.func.isRequired,
  updateNoticeOfDeparture: PropTypes.func.isRequired,
};

export const MineNoticeOfDeparture = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { mines, mineGuid, nods } = props;

  const handleFetchPermits = () => {
    props.fetchPermits(mineGuid).then(() => setIsLoaded(true));
  };

  const handleFetchNoticesOfDeparture = () => {
    props.fetchNoticesOfDeparture(mineGuid).then(() => handleFetchPermits());
  };

  useEffect(() => {
    handleFetchNoticesOfDeparture();
  }, []);

  const openNoticeOfDepartureModal = async (event, selectedNoticeOfDeparture) => {
    event.preventDefault();
    const detailedNoticeOfDeparture = await props.fetchDetailedNoticeOfDeparture(
      mineGuid,
      selectedNoticeOfDeparture.nod_id
    );
    const title = "View Notice of Departure";
    props.openModal({
      props: {
        noticeOfDeparture: detailedNoticeOfDeparture.data,
        title,
        clearOnSubmit: true,
        mine
      },
      width: "50vw",
      content: modalConfig.VIEW_NOTICE_OF_DEPARTURE_MODAL,
    });
  };

  const renderNoticeOfDepartureTables = (mine) => (
    <div>
      <br />
      <h4 className="uppercase">Notices of Departure</h4>
      <br />
      <MineNoticeOfDepartureTable
        isLoaded={isLoaded}
        nods={nods}
        mine={mine}
        openViewNodModal={openNoticeOfDepartureModal}
        updateNoticeOfDeparture={updateNoticeOfDeparture}
        fetchNoticesOfDeparture={fetchNoticesOfDeparture}
        fetchDetailedNoticeOfDeparture={fetchDetailedNoticeOfDeparture}
      />
      <br />
    </div>
  );

  const mine = mines[mineGuid];
  return (
    <div className="tab__content">
      <div>
        <h2>Notices Of Departure</h2>
        <Divider />
      </div>
      {renderNoticeOfDepartureTables(mine)}
    </div>
  );
};

const mapStateToProps = (state) => ({
  mines: getMines(state),
  mineGuid: getMineGuid(state),
  nods: getNoticesOfDeparture(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNoticesOfDeparture,
      fetchDetailedNoticeOfDeparture,
      updateNoticeOfDeparture,
      openModal,
      closeModal,
      fetchPermits,
    },
    dispatch
  );

MineNoticeOfDeparture.propTypes = propTypes;

export default AuthorizationGuard(Permission.IN_TESTING)(
  connect(mapStateToProps, mapDispatchToProps)(MineNoticeOfDeparture)
);
