import React, { useEffect, useState } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Divider } from "antd";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  updateNoticeOfDeparture,
} from "@mds/common/redux/actionCreators/noticeOfDepartureActionCreator";
import { getMineGuid, getMines } from "@mds/common/redux/selectors/mineSelectors";
import { getNoticesOfDeparture } from "@mds/common/redux/selectors/noticeOfDepartureSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { useLocation } from "react-router-dom";
import { IMine, INoticeOfDeparture, USER_ROLES } from "@mds/common";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { modalConfig } from "@/components/modalContent/config";
import { MINE_NOTICES_OF_DEPARTURE } from "@/constants/routes";
import MineNoticeOfDepartureTable from "./MineNoticeOfDepartureTable";
import * as Permission from "@mds/common/constants/permissions";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

interface IMineNoticeOfDepartureProps {
  mines: IMine[];
  mineGuid: string;
  nods: INoticeOfDeparture[];
  openModal: typeof openModal;
  fetchPermits: ActionCreator<typeof fetchPermits>;
  fetchNoticesOfDeparture: ActionCreator<typeof fetchNoticesOfDeparture>;
  fetchDetailedNoticeOfDeparture: ActionCreator<typeof fetchDetailedNoticeOfDeparture>;
  userRoles: string[];
}

export const MineNoticeOfDeparture: React.FC<IMineNoticeOfDepartureProps> = (props) => {
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

  const openNoticeOfDepartureModal = async (
    event,
    selectedNoticeOfDeparture: { nod_guid: string }
  ) => {
    if (event) {
      event.preventDefault();
    }
    const detailedNoticeOfDeparture = await props.fetchDetailedNoticeOfDeparture(
      selectedNoticeOfDeparture.nod_guid
    );
    const title = props.userRoles.includes(USER_ROLES[Permission.EDIT_PERMITS])
      ? "Edit Notice of Departure"
      : "View Notice of Departure";
    props.openModal({
      props: {
        noticeOfDeparture: detailedNoticeOfDeparture.data,
        title,
        clearOnSubmit: true,
        mine,
      },
      width: "50vw",
      content: modalConfig.NOTICE_OF_DEPARTURE_MODAL,
    });
  };

  useEffect(() => {
    const nod = new URLSearchParams(location.search).get("nod");
    if (nod) {
      (async () => {
        window.history.replaceState(
          {},
          document.title,
          `${MINE_NOTICES_OF_DEPARTURE.dynamicRoute(mineGuid)}`
        );
        await openNoticeOfDepartureModal(null, { nod_guid: nod });
      })();
    }
  }, [location]);

  const renderNoticeOfDepartureTables = (selectedMine: IMine) => (
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
  userRoles: getUserAccessData(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(MineNoticeOfDeparture);
