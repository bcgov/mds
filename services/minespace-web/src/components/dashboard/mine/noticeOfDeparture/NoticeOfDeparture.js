import React, { useEffect, useState } from "react";
import { Button, Col, Row, Typography } from "antd";
import { PlusCircleFilled } from "@ant-design/icons";
import { closeModal, openModal } from "@common/actions/modalActions";
import {
  addDocumentToNoticeOfDeparture,
  createNoticeOfDeparture,
  fetchNoticesOfDeparture,
} from "@common/actionCreators/noticeOfDepartureActionCreator";
import { getNoticesOfDeparture } from "@common/selectors/noticeOfDepartureSelectors";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import PropTypes from "prop-types";
import { getPermits } from "@common/selectors/permitSelectors";
import { fetchPermits } from "@common/actionCreators/permitActionCreator";
import NoticeOfDepartureTable from "@/components/dashboard/mine/noticeOfDeparture/NoticeOfDepartureTable";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

const propTypes = {
  mine: CustomPropTypes.mine.isRequired,
  nods: PropTypes.arrayOf(CustomPropTypes.noticeOfDeparture).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  createNoticeOfDeparture: PropTypes.func.isRequired,
  fetchNoticesOfDeparture: PropTypes.func.isRequired,
  addDocumentToNoticeOfDeparture: PropTypes.func.isRequired,
  fetchPermits: PropTypes.func.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

const defaultProps = {};

export const NoticeOfDeparture = (props) => {
  const { mine, nods, permits } = props;
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFetchPermits = () => {
    props.fetchPermits(mine.mine_guid).then(() => setIsLoaded(true));
  };

  const handleFetchNoticesOfDeparture = () => {
    props.fetchNoticesOfDeparture(mine.mine_guid).then(() => handleFetchPermits());
  };

  useEffect(() => {
    handleFetchNoticesOfDeparture();
  }, []);

  const handleAddDocuments = (documentArray, noticeOfDepartureGuid) =>
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

  const handleCreateNoticeOfDeparture = (permit_guid, values, documentArray) => {
    setIsLoaded(false);
    return props.createNoticeOfDeparture(mine.mine_guid, values).then(async (response) => {
      const { nod_guid } = response.data;
      await handleAddDocuments(documentArray, nod_guid);
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

  const openViewNoticeOfDepartureModal = (noticeOfDeparture) => {
    props.openModal({
      props: {
        noticeOfDeparture,
        title: "View Notice of Departure",
      },
      content: modalConfig.VIEW_NOTICE_OF_DEPARTURE,
    });
  };

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
          The below table displays all of the&nbsp; notices of departure and their associated
          permits &nbsp;associated with this mine.
        </Typography.Paragraph>
        <NoticeOfDepartureTable
          isLoaded={isLoaded}
          data={nods}
          openViewNoticeOfDepartureModal={openViewNoticeOfDepartureModal}
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
      fetchNoticesOfDeparture,
      addDocumentToNoticeOfDeparture,
      fetchPermits,
    },
    dispatch
  );

NoticeOfDeparture.propTypes = propTypes;
NoticeOfDeparture.defaultProps = defaultProps;

export default AuthorizationGuard(Permission.IN_TESTING)(
  connect(mapStateToProps, mapDispatchToProps)(NoticeOfDeparture)
);
