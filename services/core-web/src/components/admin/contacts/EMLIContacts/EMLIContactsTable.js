import React from "react";
import { Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import { nullableStringSorter } from "@common/utils/helpers";
import * as Strings from "@mds/common/constants/strings";
import { TRASHCAN, EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import CoreTable from "@/components/common/CoreTable";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as Permission from "@/constants/permissions";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import { renderTextColumn } from "@/components/common/CoreTableCommonColumns";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  isOffice: PropTypes.bool,
  openEditModal: PropTypes.func.isRequired,
  handleDeleteContact: PropTypes.func.isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  EMLIContactTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

const defaultProps = { isOffice: false };

const hideColumn = (condition) => (condition ? "column-hide" : "");
const columns = (
  regionHash,
  openEditModal,
  handleDeleteContact,
  isOffice,
  EMLIContactTypesHash
) => [
  {
    title: "Region",
    dataIndex: "mine_region_code",
    sorter: nullableStringSorter("mine_region_code"),
    render: (text) => <div title="Region">{regionHash[text] || Strings.EMPTY_FIELD}</div>,
  },
  {
    title: "Major or Regional Contact",
    dataIndex: "is_major_mine",
    sorter: (a, b) => (a.is_major_mine > b.is_major_mine ? -1 : 1),
    render: (text) => (
      <div title="Major or Regional Contact">{text ? "Major Mine" : "Regional Mine"}</div>
    ),
  },
  {
    title: (
      <span>
        General Contact
        <CoreTooltip title="General Contacts will be shown on MineSpace in addition to the Regional Contacts." />
      </span>
    ),
    dataIndex: "is_general_contact",
    render: (text) => <div title="General Contact">{text ? "Yes" : "No"}</div>,
  },
  {
    title: "Contact Type",
    dataIndex: "emli_contact_type_code",
    sorter: nullableStringSorter("emli_contact_type_code"),
    render: (text) => <div title="Contact Type">{EMLIContactTypesHash[text]}</div>,
  },
  {
    title: "Name",
    dataIndex: "name",
    className: hideColumn(isOffice),
    render: (text) => (
      <div title="Name" className={hideColumn(isOffice)}>
        {text}
      </div>
    ),
  },
  renderTextColumn("email", "Email", true),
  renderTextColumn("phone_number", "Phone Number", false, Strings.EMPTY_FIELD),
  {
    title: "Fax Number",
    dataIndex: "fax_number",
    className: hideColumn(!isOffice),
    render: (text) => (
      <div title="Fax Number" className={hideColumn(!isOffice)}>
        {text || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Address",
    dataIndex: "mailing_address_line_1",
    className: hideColumn(!isOffice),
    render: (text, record) => (
      <div title="Address line 1" className={hideColumn(!isOffice)}>
        {text}
        <br />
        {record.mailing_address_line_2}
      </div>
    ),
  },
  {
    title: "",
    dataIndex: "delete",
    render: (text, record) => (
      <div title="">
        <AuthorizationWrapper
          permission={isOffice ? Permission.ADMIN : Permission.EDIT_EMLI_CONTACTS}
        >
          <Button ghost className="no-margin" onClick={() => openEditModal(true, record)}>
            <img alt="pencil" src={EDIT_OUTLINE_VIOLET} />
          </Button>
        </AuthorizationWrapper>
        {!isOffice && (
          <AuthorizationWrapper permission={Permission.ADMIN}>
            <Popconfirm
              placement="topRight"
              title={`Are you sure you want to delete ${record.name}?`}
              onConfirm={() => handleDeleteContact(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" ghost type="primary">
                <img name="remove" src={TRASHCAN} alt="Remove Contact" />
              </Button>
            </Popconfirm>
          </AuthorizationWrapper>
        )}
      </div>
    ),
  },
];

const transformRowData = (contacts) =>
  contacts &&
  contacts.map((contact) => ({
    key: contact.contact_guid,
    name: contact.first_name ? `${contact.first_name} ${contact.last_name}` : "N/A",
    ...contact,
  }));

export const EMLIContactsTable = (props) => {
  return (
    <CoreTable
      condition={props.isLoaded}
      columns={columns(
        props.mineRegionHash,
        props.openEditModal,
        props.handleDeleteContact,
        props.isOffice,
        props.EMLIContactTypesHash
      )}
      dataSource={transformRowData(props.contacts)}
    />
  );
};

EMLIContactsTable.propTypes = propTypes;
EMLIContactsTable.defaultProps = defaultProps;

export default EMLIContactsTable;
