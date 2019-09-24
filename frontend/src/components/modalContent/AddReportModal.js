import React, { useState } from "react";
import PropTypes from "prop-types";

import AddReportForm from "@/components/Forms/reports/AddReportForm";
import ReportHistory from "@/components/Forms/reports/ReportHistory";
import { SlidingForms } from "@/components/common/SlidingForms";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { initialValues: {} };

export const AddReportModal = (props) => {
  const [selectedForm, setSelectedForm] = useState(0);
  const toggleReportHistory = () => setSelectedForm(selectedForm === 0 ? 1 : 0);
  return (
    <div>
      <SlidingForms
        selectedForm={selectedForm}
        formContent={[
          <AddReportForm
            onSubmit={props.onSubmit}
            closeModal={props.closeModal}
            title={props.title}
            mineGuid={props.mineGuid}
            initialValues={props.initialValues}
            toggleReportHistory={toggleReportHistory}
          />,
          <ReportHistory toggleReportHistory={toggleReportHistory} />,
        ]}
      ></SlidingForms>
    </div>
  );
};

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default AddReportModal;
