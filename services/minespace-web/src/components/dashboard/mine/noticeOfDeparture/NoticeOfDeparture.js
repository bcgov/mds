import React, { useEffect, useState } from "react";
import { Button, Col, Row, Typography } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { closeModal, openModal } from "@common/actions/modalActions";
import {
  addDocumentToNoticeOfDeparture,
  createNoticeOfDeparture,
  fetchDetailedNoticeOfDeparture,
  fetchNoticesOfDeparture,
  updateNoticeOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import { getPermits } from "@common/selectors/permitSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import {
  NOTICE_OF_DEPARTURE_TYPE_VALUES,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
} from "@common/constants/strings";
import NoticeOfDepartureTable from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfDeparture: PropTypes.func.isRequired,
  updateNoticeOfDeparture: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  fetchDetailedNoticeOfDeparture: PropTypes.func.isRequired,
  addDocumentToNoticeOfDeparture: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {};

export const NoticeOfDeparture = (props) => {
  const { mine, nods, permits } = props;
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

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

  const handleAddDocuments = (documentArray, noticeOfDepartureGuid) => {
    Promise.all(
      documentArray.forEach((document) =>
        props.addDocumentToNoticeOfDeparture(
          { mineGuid: mine.mine_guid, noticeOfDepartureGuid },
          {
            document_type: document.document_type,
            document_name: document.document_name,
            document_manager_guid: document.document_manager_guid,
          }
        )
      )
    );
  };

  const handleCreateNoticeOfDeparture = (permit_guid, values, documentArray) => {
    setIsLoaded(false);
    const nod_status =
      values.nod_type === NOTICE_OF_DEPARTURE_TYPE_VALUES.non_substantial
        ? NOTICE_OF_DEPARTURE_STATUS_VALUES.self_determined_non_substantial
        : NOTICE_OF_DEPARTURE_STATUS_VALUES.pending_review;
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
        { mineGuid: mine.mine_guid, nodGuid },
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
    const nod = new URLSearchParams(location.search).get("nod");
    if (nod) {
      (async () => {
        await openViewNoticeOfDepartureModal({ nod_guid: nod });
      })();
    }
  }, [location.search]);

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

NoticeOfDeparture.propTypes = propTypes;
NoticeOfDeparture.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(NoticeOfDeparture);
