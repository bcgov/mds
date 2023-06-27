import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { connect } from "react-redux";
import { formatDate, formatMoney } from "@common/utils/helpers";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
  getBondDocumentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import DocumentTable from "@/components/common/DocumentTable";
import CustomPropTypes from "@/customPropTypes";
import Address from "@/components/common/Address";

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  bondTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bondDocumentTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  bond: CustomPropTypes.bond.isRequired,
};

export const ViewBondModal = (props) => {
  const address = {
    address_line_1: props.bond.institution_street,
    city: props.bond.institution_city,
    sub_division_code: props.bond.institution_province,
    post_code: props.bond.institution_postal_code,
  };

  const documentTableRecords = (props.bond.documents || []).reduce(
    (docs, doc) => [
      {
        key: doc.mine_document_guid,
        mine_document_guid: doc.mine_document_guid,
        document_manager_guid: doc.document_manager_guid,
        document_name: doc.document_name,
        dated: doc.document_date,
        category: props.bondDocumentTypeOptionsHash[doc.bond_document_type_code],
        upload_date: doc.upload_date,
      },
      ...docs,
    ],
    []
  );

  const isBondClosed =
    props.bond.bond_status_code === "REL" || props.bond.bond_status_code === "CON";
  const bondStatusDescription = props.bondStatusOptionsHash[props.bond.bond_status_code];

  return (
    <div>
      <div className="inline-flex between block-tablet">
        <div className="flex-tablet">
          <p className="field-title">Amount</p>
          <p>{formatMoney(props.bond.amount) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="flex-tablet">
          <p className="field-title">Status</p>
          <p>{bondStatusDescription || Strings.EMPTY_FIELD}</p>
        </div>
      </div>
      <br />
      <div className="content--light-grey padding-sm">
        <div className="inline-flex padding-sm">
          <p className="field-title">Payment Type</p>
          <p>{props.bondTypeOptionsHash[props.bond.bond_type_code] || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Issue Date</p>
          <p>{formatDate(props.bond.issue_date) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Payer</p>
          <p>{props.bond.payer.name || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Reference Number</p>
          <p>{props.bond.reference_number || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Project ID</p>
          <p>{props.bond.project_id || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Institution Name</p>
          <p>{props.bond.institution_name || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Institution Location</p>
          <Address address={address} />
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Notes</p>
          <p>{props.bond.note || Strings.EMPTY_FIELD}</p>
        </div>
        {isBondClosed && (
          <>
            <div className="inline-flex padding-sm">
              <p className="field-title">{`${bondStatusDescription} Date`}</p>
              <p>{formatDate(props.bond.closed_date) || Strings.EMPTY_FIELD}</p>
            </div>
            <div className="inline-flex padding-sm">
              <p className="field-title">{`${bondStatusDescription} Notes`}</p>
              <p>{props.bond.closed_note || Strings.EMPTY_FIELD}</p>
            </div>
          </>
        )}
      </div>
      <br />
      <div className="between block-tablet">
        <div className="flex-tablet">
          <p className="field-title">Documents</p>
          <DocumentTable documents={documentTableRecords} isViewOnly />
        </div>
      </div>
      <br />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

ViewBondModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
  bondStatusOptionsHash: getBondStatusOptionsHash(state),
  bondDocumentTypeOptionsHash: getBondDocumentTypeOptionsHash(state),
});

export default connect(mapStateToProps)(ViewBondModal);
