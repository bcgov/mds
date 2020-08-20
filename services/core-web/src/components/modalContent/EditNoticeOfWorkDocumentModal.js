import React from "react";
import PropTypes from "prop-types";
import EditNoticeOfWorkDocumentForm from "@/components/Forms/noticeOfWork/EditNoticeOfWorkDocumentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  now_application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string.isRequired,
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  title: "",
  categoriesToShow: [],
};

export const EditNoticeOfWorkDocumentModal = (props) => (
  <div>
    <EditNoticeOfWorkDocumentForm
      {...props}
      initialValues={{
        now_application_guid: props.now_application_guid,
        mine_guid: props.mine_guid,
      }}
    />
  </div>
);

EditNoticeOfWorkDocumentModal.propTypes = propTypes;
EditNoticeOfWorkDocumentModal.defaultProps = defaultProps;

export default EditNoticeOfWorkDocumentModal;
