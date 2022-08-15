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
import CustomPropTypes from "@/customPropTypes";
import { useLocation } from "react-router-dom";
import MineNoticeOfDepartureTable from "./MineNoticeOfDepartureTable";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineGuid: PropTypes.string.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  fetchDetailedNoticeOfDeparture: PropTypes.func.isRequired,
};

export const MineNoticeOfDeparture = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { mines, mineGuid, nods } = props;
  const mine = mines[mineGuid];
  const location = useLocation();

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
    if (event) {
      event.preventDefault();
    }
    const detailedNoticeOfDeparture = await props.fetchDetailedNoticeOfDeparture(
      selectedNoticeOfDeparture.nod_guid
    );
    const title = "View Notice of Departure";
    props.openModal({
      props: {
        noticeOfDeparture: detailedNoticeOfDeparture.data,
        title,
        clearOnSubmit: true,
        mine,
      },
      width: "50vw",
      content: modalConfig.VIEW_NOTICE_OF_DEPARTURE_MODAL,
    });
  };

  useEffect(() => {
    const nod = new URLSearchParams(location.search).get("nod");
    if (nod) {
      (async () => {
        await openNoticeOfDepartureModal(null, { nod_guid: nod });
      })();
    }
  }, [location]);

  const renderNoticeOfDepartureTables = (selectedMine) => (
    <div>
      <br />
      <h4 className="uppercase">Notices of Departure</h4>
      <br />
      <MineNoticeOfDepartureTable
        isLoaded={isLoaded}
        nods={nods}
        mine={selectedMine}
        openViewNodModal={openNoticeOfDepartureModal}
        updateNoticeOfDeparture={updateNoticeOfDeparture}
        fetchNoticesOfDeparture={fetchNoticesOfDeparture}
        fetchDetailedNoticeOfDeparture={fetchDetailedNoticeOfDeparture}
      />
      <br />
    </div>
  );

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

export default connect(mapStateToProps, mapDispatchToProps)(MineNoticeOfDeparture);
