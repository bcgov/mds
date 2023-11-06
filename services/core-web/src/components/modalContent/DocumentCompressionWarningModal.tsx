import React, { FC } from "react";
import { Modal, Typography } from "antd";

interface DocumentCompressionWarningModalProps {
  isModalVisible: boolean;
  filesCompression: () => void;
  setModalVisible: (arg1: boolean) => void;
}

export const DocumentCompressionWarningModal: FC<DocumentCompressionWarningModalProps> = (
  props
) => (
  <Modal
    title=""
    open={props.isModalVisible}
    onOk={props.filesCompression}
    onCancel={() => props.setModalVisible(false)}
    okText="Continue"
    cancelText="Cancel"
    width={500}
    style={{ padding: "40px" }}
  >
    <Typography.Paragraph strong>Download selected documents</Typography.Paragraph>
    <Typography.Paragraph style={{ fontSize: "90%" }}>
      Archived files and previous versions will not be downloaded. To download them you must go to
      the archived documents view or download them individually.
    </Typography.Paragraph>
  </Modal>
);

export default DocumentCompressionWarningModal;
