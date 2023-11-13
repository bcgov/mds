import React, { FC, useEffect, useState } from "react";
import { Button, Col, Row, Typography } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
  addDocumentToNoticeOfDeparture,
  createNoticeOfDeparture,
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  updateNoticeOfDeparture,
} from "@mds/common/redux/actionCreators/noticeOfDepartureActionCreator";
import { getNoticesOfDeparture } from "@mds/common/redux/selectors/noticeOfDepartureSelectors";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useLocation, useParams } from "react-router-dom";
import {
  IMine,
  INodDocumentPayload,
  INoticeOfDeparture,
  INoDPermit,
  NodStatusSaveEnum,
} from "@mds/common";

import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import {
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
  NOTICE_OF_DEPARTURE_TYPE_VALUES,
} from "@mds/common/constants/strings";
import NoticeOfDepartureTable from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureTable";
import { modalConfig } from "@/components/modalContent/config";
import { MINE_DASHBOARD } from "@/constants/routes";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";

interface NoticeOfDepartureProps {
  mine: IMine;
  nods: INoticeOfDeparture[];
  permits: INoDPermit[];
  openModal: typeof openModal;
  closeModal: typeof closeModal;
  createNoticeOfDeparture: ActionCreator<typeof createNoticeOfDeparture>;
  updateNoticeOfDeparture: ActionCreator<typeof updateNoticeOfDeparture>;
  fetchNoticesOfDeparture: ActionCreator<typeof fetchNoticesOfDeparture>;
  fetchDetailedNoticeOfDeparture: ActionCreator<typeof fetchDetailedNoticeOfDeparture>;
  addDocumentToNoticeOfDeparture: ActionCreator<typeof addDocumentToNoticeOfDeparture>;
  fetchPermits: ActionCreator<typeof fetchPermits>;
}

export const NoticeOfDeparture: FC<NoticeOfDepartureProps> = (props) => {
  const { mine, nods, permits } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();
  const url: { activeTab: string } = useParams();

  const handleFetchPermits = async () => {
    await props.fetchPermits(mine.mine_guid);
    await setIsLoaded(true);
  };

  const handleFetchNoticesOfDeparture = async () => {
    await props.fetchNoticesOfDeparture(mine.mine_guid);
    await handleFetchPermits();
  };

  useEffect(() => {
    handleFetchNoticesOfDeparture();
  }, []);

  const handleAddDocuments = (
    documentArray: INodDocumentPayload[],
    noticeOfDepartureGuid: string
  ) => {
    for (const document of documentArray) {
      props.addDocumentToNoticeOfDeparture(
        { noticeOfDepartureGuid },
        {
          document_type: document.document_type,
          document_name: document.document_name,
          document_manager_guid: document.document_manager_guid,
        }
      );
    }
  };

  const handleCreateNoticeOfDeparture = (
    permit_guid,
    values,
    documentArray: INodDocumentPayload[]
  ) => {
    setIsLoaded(false);
    const nod_status =
      values.nod_type === "non_substantial"
        ? NodStatusSaveEnum.self_determined_non_substantial
        : NodStatusSaveEnum.pending_review;
    return props
      .createNoticeOfDeparture({ ...values, nod_status, mine_guid: mine.mine_guid })
      .then(async (response) => {
        const { nod_guid } = response.data;
        await handleAddDocuments(documentArray, nod_guid);
        props.closeModal();
        handleFetchNoticesOfDeparture();
      });
  };

  const handleUpdateNoticeOfDeparture = (nodGuid, values, documentArray) => {
    setIsLoaded(false);

    let nod_status = null;
    if (values.nod_status !== NOTICE_OF_DEPARTURE_STATUS_VALUES.withdrawn) {
      nod_status =
        values.nod_type === NOTICE_OF_DEPARTURE_TYPE_VALUES.non_substantial
          ? NOTICE_OF_DEPARTURE_STATUS_VALUES.self_determined_non_substantial
          : NOTICE_OF_DEPARTURE_STATUS_VALUES.pending_review;
    }

    return props
      .updateNoticeOfDeparture(
        { nodGuid },
        { ...values, nod_status: nod_status || values.nod_status }
      )
      .then(async (response) => {
        const { nod_guid } = response.data;
        if (documentArray.length > 0) {
          await handleAddDocuments(documentArray, nod_guid);
        }
        props.closeModal();
        handleFetchNoticesOfDeparture();
      });
  };

  const openCreateNODModal = (event) => {
    event.preventDefault();
    props.openModal({
      props: {
        onSubmit: handleCreateNoticeOfDeparture,
        title: "Create a Notice of Departure",
        mineGuid: mine.mine_guid,
        permits,
      },
      content: modalConfig.ADD_NOTICE_OF_DEPARTURE,
    });
  };

  const openViewNoticeOfDepartureModal = async (selectedNoticeOfDeparture) => {
    const { data: detailedNod } = await props.fetchDetailedNoticeOfDeparture(
      selectedNoticeOfDeparture.nod_guid
    );
    props.openModal({
      props: {
        noticeOfDeparture: detailedNod,
        title: "View Notice of Departure",
      },
      content: modalConfig.VIEW_NOTICE_OF_DEPARTURE,
    });
  };

  const openEditNoticeOfDepartureModal = async (selectedNoticeOfDeparture) => {
    const { data: detailedNod } = await props.fetchDetailedNoticeOfDeparture(
      selectedNoticeOfDeparture.nod_guid
    );
    props.openModal({
      props: {
        mineGuid: mine.mine_guid,
        onSubmit: handleUpdateNoticeOfDeparture,
        noticeOfDeparture: detailedNod,
        title: "Edit Notice of Departure",
      },
      content: modalConfig.EDIT_NOTICE_OF_DEPARTURE,
    });
  };

  useEffect(() => {
    const nod = new URLSearchParams(url.activeTab.split("?")[1]).get("nod");
    if (nod) {
      (async () => {
        window.history.replaceState(
          {},
          document.title,
          `${MINE_DASHBOARD.dynamicRoute(mine.mine_guid, "nods")}`
        );
        await openViewNoticeOfDepartureModal({ nod_guid: nod });
      })();
    }
  }, [location]);

  return (
    <Row>
      <Col span={24}>
        <Button
          style={{ display: "inline", float: "right" }}
          type="primary"
          onClick={(event) => openCreateNODModal(event)}
        >
          <PlusCircleFilled />
          Create a Notice of Departure
        </Button>
        <Typography.Title level={4}>Notices of Departure</Typography.Title>
        <Typography.Paragraph>
          The below table displays all of the&nbsp; Notices of Departure and their associated
          permits &nbsp;associated with this mine.
        </Typography.Paragraph>
        <NoticeOfDepartureTable
          isLoaded={isLoaded}
          data={nods}
          openViewNoticeOfDepartureModal={openViewNoticeOfDepartureModal}
          openEditNoticeOfDepartureModal={openEditNoticeOfDepartureModal}
        />
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => ({
  nods: getNoticesOfDeparture(state),
  permits: getPermits(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      createNoticeOfDeparture,
      updateNoticeOfDeparture,
      fetchNoticesOfDeparture,
      fetchDetailedNoticeOfDeparture,
      addDocumentToNoticeOfDeparture,
      fetchPermits,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfDeparture);
