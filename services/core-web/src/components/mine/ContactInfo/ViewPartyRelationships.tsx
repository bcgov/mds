import {
  addDocumentToRelationship,
  addPartyRelationship,
  fetchParties,
  fetchPartyRelationships,
  removePartyRelationship,
  updatePartyRelationship,
} from "@mds/common/redux/slices/partiesSlice";
import { getPartyRelationships } from "@mds/common/redux/slices/partiesSlice";
import {
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { createTailingsStorageFacility } from "@mds/common/redux/slices/tailingsSlice";
import { Col, Divider, Dropdown, Menu, Popconfirm, Row } from "antd";
import { debounce, uniq, uniqBy } from "lodash";
import moment from "moment";
import React, { FC } from "react";

import Loading from "@/components/common/Loading";
import NullScreen from "@/components/common/NullScreen";
import AddButton from "@/components/common/buttons/AddButton";
import { Contact } from "@/components/mine/ContactInfo/PartyRelationships/Contact";
import { InactiveContact } from "@/components/mine/ContactInfo/PartyRelationships/InactiveContact";
import { modalConfig } from "@/components/modalContent/config";
import * as ModalContent from "@/constants/modalContent";
import * as Permission from "@/constants/permissions";
import * as router from "@/constants/routes";
import { MinePartyAppointmentTypeCodeEnum } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import {
  IAddPartyAppointment,
  IMine,
  IOption,
  IPartyAppt,
  IPartyRelationshipType,
  ITailingsStorageFacility,
} from "@mds/common/interfaces";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import {
  getUserAccessData,
  userHasRole,
} from "@mds/common/redux/selectors/authenticationSelectors";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { useHistory } from "react-router-dom";

interface ViewPartyRelationshipsProps {
  mine: IMine;
}

export const ViewPartyRelationships: FC<ViewPartyRelationshipsProps> = ({ mine }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();

  const canEditMines = useAppSelector(userHasRole(USER_ROLES.role_edit_mines));

  const partyRelationshipTypesList: IOption[] = useAppSelector(getPartyRelationshipTypesList);
  const partyRelationshipTypes: IPartyRelationshipType[] =
    useAppSelector(getPartyRelationshipTypes);
  const partyRelationships = useAppSelector(getPartyRelationships);
  const userRoles = useAppSelector(getUserAccessData);
  const permits = useAppSelector(getPermits);

  const RoleConfirmation = React.createRef<any>();
  const [selectedPartyRelationshipType, setSelectedPartyRelationshipType] =
    React.useState<MinePartyAppointmentTypeCodeEnum>();
  const [selectedPartyRelationship, setSelectedPartyRelationship] = React.useState({});
  const [uploadedFiles, setUploadedFiles] = React.useState([]);

  const onFileLoad = (documentName: string, document_manager_guid: string) => {
    setUploadedFiles([[document_manager_guid, documentName], ...uploadedFiles]);
  };

  const onRemoveFile = (_: any, fileItem: any) => {
    setUploadedFiles(uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId));
  };

  const onSubmitAddPartyRelationship = async (values: Partial<IPartyAppt>) => {
    const payload: IAddPartyAppointment = formatValuesEndCurrent({
      mine_guid: mine.mine_guid,
      mine_party_appt_type_code: values.mine_party_appt_type_code,
      party_guid: values.party_guid,
      related_guid: values.related_guid,
      start_date: values.start_date,
      end_date: values.end_date,
      end_current: values.end_current,
      union_rep_company: values.union_rep_company,
    });

    return dispatch(addPartyRelationship({ data: payload })).then(
      async (action: any) => {
        const { mine_party_appt_guid } = action.payload;
        await Promise.all(
          uploadedFiles.map(([document_manager_guid, document_name]) =>
            dispatch(
              addDocumentToRelationship({
                mineGuid: mine.mine_guid,
                minePartyApptGuid: mine_party_appt_guid,
                data: {
                  document_manager_guid,
                  document_name,
                },
              })
            )
          )
        );
        setUploadedFiles([]);
        dispatch(closeModal());
        dispatch(
          fetchPartyRelationships({
            mine_guid: mine.mine_guid,
            relationships: "party",
            include_permit_contacts: "true",
          })
        );
      }
    );
  };

  const openAddPartyRelationshipModal = ({ value }) => {
    if (!partyRelationshipTypesList) return;

    if (
      value.mine_party_appt_type_code === "PMT" &&
      !userRoles.includes(USER_ROLES[Permission.CONTACT_ADMIN])
    ) {
      RoleConfirmation.current.click();
      return;
    }

    if (value.mine_party_appt_type_code === "EOR") {
      if (mine.mine_tailings_storage_facilities.length === 0) {
        RoleConfirmation.current.click();
        return;
      }
    }

    dispatch(
      openModal({
        props: {
          onSubmit: onSubmitAddPartyRelationship,
          title: `${ModalContent.ADD_CONTACT}: ${value.description}`,
          mine_party_appt_type_code: value.mine_party_appt_type_code,
          mine: mine,
          minePermits: permits,
          onFileLoad: onFileLoad,
          onRemoveFile: onRemoveFile,
        },
        content: modalConfig.ADD_PARTY_RELATIONSHIP,
      })
    );
  };

  const handleAddTailings = (values: ITailingsStorageFacility) =>
    dispatch(createTailingsStorageFacility({ mine_guid: mine.mine_guid, ...values })).then(() => {
      dispatch(closeModal());
      dispatch(fetchMineRecordById(mine.mine_guid));
    });

  const openEditPartyRelationshipModal = (
    partyRelationship: IPartyAppt,
    onSubmit: any,
    handleChange: any,
    mine: IMine
  ) => {
    if (!partyRelationshipTypesList) return;
    setSelectedPartyRelationship(partyRelationship);

    dispatch(
      openModal({
        props: {
          onSubmit,
          handleChange,
          title: `Update ${
            partyRelationshipTypesList.find(
              ({ value }) => value === partyRelationship.mine_party_appt_type_code
            ).label
          }: ${partyRelationship.party.name}`,
          partyRelationships: partyRelationships,
          partyRelationship: JSON.parse(JSON.stringify(partyRelationship)),
          partyRelationshipType: partyRelationshipTypes.find(
            ({ mine_party_appt_type_code }) =>
              mine_party_appt_type_code === partyRelationship.mine_party_appt_type_code
          ),
          minePermits: permits,
          mine,
        },
        content: modalConfig.EDIT_PARTY_RELATIONSHIP,
      })
    );
  };

  const formatValuesEndCurrent = (values: Partial<IAddPartyAppointment>): IAddPartyAppointment => {
    let end_current = values.end_current ?? true;
    if (values.end_date) {
      const endDate = new Date(values.end_date);
      endDate.setTime(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
      end_current = endDate >= new Date();
    }
    return { ...values, end_current } as IAddPartyAppointment;
  };

  const onSubmitEditPartyRelationship = async (values: IPartyAppt) => {
    let payload: Partial<IPartyAppt> = { ...selectedPartyRelationship, ...values };

    payload = formatValuesEndCurrent(payload as IPartyAppt);

    return dispatch(updatePartyRelationship({ data: payload })).then(() => {
      dispatch(
        fetchPartyRelationships({
          mine_guid: mine.mine_guid,
          relationships: "party",
          include_permit_contacts: "true",
        })
      );
      dispatch(closeModal());
    });
  };

  const handleRemovePartyRelationship = (
    event: React.MouseEvent<HTMLButtonElement>,
    mine_party_appt_guid: string
  ) => {
    event.preventDefault();
    dispatch(removePartyRelationship(mine_party_appt_guid)).then(() => {
      dispatch(
        fetchPartyRelationships({
          mine_guid: mine.mine_guid,
          relationships: "party",
          include_permit_contacts: "true",
        })
      );
    });
  };

  // Since the end date is stored at yyyy-mm-dd, comparing current Date() to
  // the the start of the next day ensures appointments ending today are displayed.
  const renderInactiveRelationships = (partyRelationships: IPartyAppt[]) => {
    const activeRelationships = partyRelationships.filter(
      (x) =>
        (!x.end_date || moment(x.end_date).add(1, "days") > moment(new Date())) &&
        (!x.start_date || moment(Date.parse(x.start_date)) <= moment(new Date()))
    );
    const inactiveRelationships = partyRelationships.filter(
      (x) => !activeRelationships.includes(x)
    );

    const activePartyRelationshipTypes = uniqBy(
      activeRelationships,
      "mine_party_appt_type_code"
    ).map((x) => x.mine_party_appt_type_code);

    const inactivePartyRelationshipTypes = uniqBy(
      inactiveRelationships,
      "mine_party_appt_type_code"
    ).map((x) => x.mine_party_appt_type_code);

    return inactivePartyRelationshipTypes
      .filter((x) => !activePartyRelationshipTypes.includes(x))
      .map((typeCode) => (
        <Col xs={24} sm={24} md={12} lg={12} xl={8} xxl={6} key={typeCode}>
          <InactiveContact
            partyRelationshipTypeCode={typeCode}
            partyRelationshipTitle={
              partyRelationshipTypesList.find((x) => x.value === typeCode).label
            }
            mine={mine}
          />
        </Col>
      ));
  };

  const getGroupTitle = (group: number) => {
    switch (group) {
      case 4:
        return "EXPIRED CONTACTS";
      case 3:
        return "MAIN CONTACTS";
      case 2:
        return "SPECIALISTS";
      default:
        return "OTHER CONTACTS";
    }
  };

  const renderMenu = (partyRelationshipGroupingLevels: string[], isAbandonedMines: boolean) => {
    return (
      <Menu
        items={partyRelationshipGroupingLevels.flatMap((group) => {
          const menuItems = partyRelationshipTypes
            .filter((x) => x.grouping_level === group)
            .filter((x) => !["EOR", "TQP", "AGT"].includes(x.mine_party_appt_type_code))
            .filter(
              (x) =>
                isAbandonedMines ||
                (x.mine_party_appt_type_code !== "DAM" && x.mine_party_appt_type_code !== "CCS")
            )
            .map((value) => ({
              key: value.mine_party_appt_type_code,
              label: (
                <button
                  className="full"
                  type="button"
                  onClick={() => {
                    setSelectedPartyRelationshipType(
                      MinePartyAppointmentTypeCodeEnum[value.mine_party_appt_type_code]
                    );
                    openAddPartyRelationshipModal({
                      value,
                    });
                  }}
                >
                  {`${value.description}`}
                </button>
              ),
            }));

          return menuItems.length > 0
            ? [...menuItems, { type: "divider", key: `divider-${group}` }]
            : [];
        })}
      />
    );
  };

  const handleChange = (value: string) => {
    debounce(() => dispatch(fetchParties({ name_search: value })));
  };

  const renderPartyRelationship = (partyRelationship: IPartyAppt) => {
    if (partyRelationshipTypesList.length <= 0 || partyRelationshipTypes.length <= 0)
      return <div />;

    const partyRelationshipTitle =
      partyRelationshipTypesList.find(
        ({ value }) => value === partyRelationship.mine_party_appt_type_code
      )?.label ?? "";

    return (
      <Col
        key={partyRelationship.mine_party_appt_guid}
        xs={24}
        sm={24}
        md={12}
        lg={12}
        xl={8}
        xxl={6}
      >
        <Contact
          partyRelationship={partyRelationship}
          partyRelationshipTitle={partyRelationshipTitle}
          handleChange={handleChange}
          mine={mine}
          permits={permits}
          openEditPartyRelationshipModal={openEditPartyRelationshipModal}
          onSubmitEditPartyRelationship={onSubmitEditPartyRelationship}
          removePartyRelationship={handleRemovePartyRelationship}
          isEditable
        />
      </Col>
    );
  };

  const renderPartyRelationshipGroup = (partyRelationships: IPartyAppt[], group: string) => {
    const expiredOnly = group === "4";
    const now = moment(new Date());

    const isActive = (x: IPartyAppt) =>
      (!x.end_date || moment(x.end_date).add(1, "days") > now) &&
      (!x.start_date || moment(Date.parse(x.start_date)) <= now);

    const isExpired = (x: IPartyAppt) => !!x.end_date && moment(x.end_date).add(1, "days") <= now;

    let partyRelationshipsInGroup: IPartyAppt[] = [];

    if (expiredOnly) {
      // Show only expired relationships regardless of their original grouping level
      partyRelationshipsInGroup = partyRelationships.filter(isExpired);
      partyRelationshipsInGroup.sort((a, b) => {
        const ae = a.end_date ? new Date(a.end_date).getTime() : 0;
        const be = b.end_date ? new Date(b.end_date).getTime() : 0;
        return be - ae;
      });
    } else {
      const filteredPartyRelationships = partyRelationships
        .filter(isActive)
        .filter((partyRelationship) => partyRelationship.mine_party_appt_type_code !== "PMT")
        .concat(
          permits
            .map(
              (permit) =>
                partyRelationships
                  .filter(isActive)
                  .filter(
                    (partyRelationship) =>
                      partyRelationship.mine_party_appt_type_code === "PMT" &&
                      permit.permit_guid === partyRelationship.related_guid
                  )
                  .sort(
                    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                  )[0]
            )
            .filter((x) => x)
        );

      const partyRelationshipTypesInGroup = partyRelationshipTypes.filter(
        (x) => x.grouping_level === group
      );

      partyRelationshipsInGroup = filteredPartyRelationships.filter((x) =>
        partyRelationshipTypesInGroup.some(
          (y) => y.mine_party_appt_type_code === x.mine_party_appt_type_code
        )
      );
    }

    return (
      partyRelationshipsInGroup.length !== 0 && [
        <Row gutter={16} key="0">
          <Col span={24}>
            <h4>{getGroupTitle(parseInt(group))}</h4>
            <Divider />
          </Col>
        </Row>,

        <Row gutter={16} key="1">
          {partyRelationshipsInGroup.map((partyRelationship) =>
            renderPartyRelationship(partyRelationship)
          )}
          {!expiredOnly && renderInactiveRelationships(partyRelationshipsInGroup)}
        </Row>,
        <div key="2">
          <br />
          <br />
        </div>,
      ]
    );
  };

  const confirmationProps = (selectedPartyRelationshipType: MinePartyAppointmentTypeCodeEnum) =>
    ({
      EOR: {
        title:
          "There are currently no tailings storage facilities for this mine. Would you like to create one?",
        okText: "Yes",
        cancelText: "No",
        onConfirm: (event: React.MouseEvent<HTMLButtonElement>) =>
          openTailingsModal(event, handleAddTailings, ModalContent.ADD_TAILINGS),
      },
      PMT: {
        title:
          'Please add the permit or permit amendment under the "Permit" tab to change the permittee. Would you like to go there now?',
        okText: "Ok",
        cancelText: "Cancel",
        onConfirm: () => history.push(router.MINE_DASHBOARD.dynamicRoute(mine.mine_guid)),
      },
    })[selectedPartyRelationshipType];

  const openTailingsModal = (
    event: React.MouseEvent<HTMLButtonElement>,
    onSubmit: any,
    title: string
  ) => {
    event.preventDefault();
    openModal({
      props: { onSubmit, title },
      content: modalConfig.ADD_TAILINGS,
    });
  };

  if (partyRelationshipTypesList.length <= 0 || partyRelationshipTypes.length <= 0)
    return <Loading />;

  const partyRelationshipGroupingLevels = [
    ...uniq(partyRelationshipTypes.map(({ grouping_level }) => grouping_level)),
    "4",
  ];
  const isAbandonedMines = userRoles.includes(USER_ROLES[Permission.ABANDONED_MINES]);
  return (
    <div>
      <div className="inline-flex between">
        <div />
        <div className="inline-flex between">
          <Popconfirm placement="topRight" {...confirmationProps(selectedPartyRelationshipType)}>
            <button type="button" ref={RoleConfirmation} style={{ width: "1px", height: "1px" }} />
          </Popconfirm>
          {canEditMines && (
            <Dropdown
              className="full-height"
              overlay={renderMenu(partyRelationshipGroupingLevels, isAbandonedMines)}
              placement="bottomLeft"
            >
              <div>
                <AddButton>Add New Contact</AddButton>
              </div>
            </Dropdown>
          )}
        </div>
      </div>
      <div>
        {partyRelationshipGroupingLevels.map((group) =>
          renderPartyRelationshipGroup(partyRelationships, group)
        )}
        {partyRelationships.length === 0 && (
          <div>
            <Divider />
            <br />
            <br />
            <NullScreen type="contacts" />
            <br />
            <br />
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPartyRelationships;
