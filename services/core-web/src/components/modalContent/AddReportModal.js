import React, { useState } from "react";
import PropTypes from "prop-types";

import { Icon } from "antd";
import AddReportForm from "@/components/Forms/reports/AddReportForm";
import ReportHistory from "@/components/Forms/reports/ReportHistory";
import { SlidingForms } from "@/components/common/SlidingForms";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  disableAddReport: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  mineGuid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  changeModalTitle: PropTypes.func.isRequired,
};

const defaultProps = { initialValues: {}, disableAddReport: false };

export const AddReportModal = (props) => {
  const [selectedForm, setSelectedForm] = useState(0);
  const hideReportHistory = () => {
    document.getElementsByClassName("ant-modal-wrap")[0].scrollTo(0, 0);
    setSelectedForm(0);
    props.changeModalTitle(
      `Edit ${props.initialValues.submission_year} ${props.initialValues.report_name}`
    );
  };
  const showReportHistory = () => {
    document.getElementsByClassName("ant-modal-wrap")[0].scrollTo(0, 0);
    props.changeModalTitle(
      <div className="ant-modal-title">
        {`File History for ${props.initialValues.submission_year} ${props.initialValues.report_name}`}
        <br />
        <LinkButton onClick={hideReportHistory}>
          <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
          Back to Report
        </LinkButton>
      </div>
    );
    setSelectedForm(1);
  };
  return (
    <div>
      <SlidingForms
        selectedForm={selectedForm}
        formContent={[
          <AddReportForm
            disableAddReport={props.disableAddReport}
            onSubmit={props.onSubmit}
            closeModal={props.closeModal}
            title={props.title}
            mineGuid={props.mineGuid}
            initialValues={props.initialValues}
            showReportHistory={showReportHistory}
          />,
          props.initialValues.mine_report_submissions && (
            <ReportHistory
              hideReportHistory={hideReportHistory}
              mineReportSubmissions={props.initialValues.mine_report_submissions}
              submissionYear={props.initialValues.submission_year}
              mineReportDefinitionGuid={props.initialValues.mine_report_definition_guid}
            />
          ),
        ]}
      />
    </div>
  );
};

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;

export default AddReportModal;
