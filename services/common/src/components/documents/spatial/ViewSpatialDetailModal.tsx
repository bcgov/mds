import React, { FC } from "react";
import { Button, Row, Typography } from "antd";
import { useDispatch } from "react-redux";
import ViewSpatialDetail, { ViewSpatialDetailProps } from "./ViewSpatialDetail";
import { closeModal } from "@mds/common/redux/actions/modalActions";

const ViewSpatialDetailModal: FC<ViewSpatialDetailProps> = ({ spatialDocuments }) => {
  const dispatch = useDispatch();

  return (
    <>
      <Typography.Title level={3}>View Spatial Data</Typography.Title>
      <ViewSpatialDetail spatialDocuments={spatialDocuments} />
      <Row justify="end">
        <Button type="primary" onClick={() => dispatch(closeModal())}>
          Close
        </Button>
      </Row>
    </>
  );
};

export default ViewSpatialDetailModal;
