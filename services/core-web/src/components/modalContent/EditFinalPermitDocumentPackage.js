import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Popconfirm } from "antd";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  finalDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const EditFinalPermitDocumentPackage = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState(props.finalDocuments);
  return (
    <div>
      <NOWDocuments
        now_application_guid={props.noticeOfWorkGuid}
        mine_guid={props.mineGuid}
        documents={props.documents}
        isViewMode
        selectedRows={{ selectedCoreRows, setSelectedCoreRows }}
      />
      <br />
      <div className="right center-mobile padding-md--top">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile">Cancel</Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          type="primary"
          onClick={() => props.onSubmit(selectedCoreRows)}
        >
          <Icon type="download" theme="outlined" className="padding-small--right icon-sm" />
          Save Application Package
        </Button>
      </div>
    </div>
  );
};

EditFinalPermitDocumentPackage.propTypes = propTypes;
export default EditFinalPermitDocumentPackage;
