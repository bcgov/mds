import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { MAJOR_MINE_APPLICATION_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@/constants/fileTypes";
import { Button, Modal } from "antd";
import { YELLOW_HAZARD } from "@/constants/assets";
const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  projectGuid: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
};

export const MajorMineApplicationDocumentUpload = (props) => {
  const [uploadResponse, setUploadResponse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleFileLoad = (file, response) => {
    // Handle the API response here
    setUploadResponse(response);
    // Call the onFileLoad callback if provided
    if (props.onFileLoad) {
      props.onFileLoad(file);
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Form.Item>
        <Field
          id="fileUpload"
          name="fileUpload"
          component={FileUpload} //TODO pass a param to disable the notification
          uploadUrl={MAJOR_MINE_APPLICATION_DOCUMENTS(props.projectGuid)}
          acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL }}
          onFileLoad={handleFileLoad}
          onRemoveFile={props.onRemoveFile}
          allowRevert
          allowMultiple={props.allowMultiple}
          onError={(filename, e) => {
            let message = `An archived file named ${filename} already exists. If you would like to restore it, download the archived file and upload it again with a different file name.`;
            setModalMessage(message);
            setIsModalVisible(true);
          }}
          onWaiting={() => {}}
        />
      </Form.Item>
      <Modal visible={isModalVisible} onCancel={handleCloseModal} footer={null}>
        <div className="display: flex">
          <div className="image">
            <img alt="hazard" className="padding-sm" src={YELLOW_HAZARD} width="30" />
          </div>
          <div className="text">
            <h4>File name already exists</h4>
          </div>
        </div>
        <div>
          <p>{modalMessage}</p>
        </div>
        <Button type="primary" onClick={handleCloseModal}>
          Close
        </Button>
      </Modal>
    </>
  );
};

MajorMineApplicationDocumentUpload.propTypes = propTypes;

export default MajorMineApplicationDocumentUpload;
