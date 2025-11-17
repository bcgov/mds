import React, { FC, useEffect, useState } from "react";
import moment from "moment";
import { Link, useParams } from "react-router-dom";
import { Col, Row, Tabs } from "antd";
import { debounce, isEmpty } from "lodash";
import {
  fetchParties,
  fetchPartyRelationships,
  updatePartyRelationship,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { fetchPermits } from "@mds/common/redux/actionCreators/permitActionCreator";
import { fetchMineRecordById } from "@mds/common/redux/actionCreators/mineActionCreator";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getPartyRelationships } from "@mds/common/redux/selectors/partiesSelectors";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";

import { getMineById } from "@mds/common/redux/selectors/mineSelectors";
import { formatDate } from "@common/utils/helpers";
import * as String from "@mds/common/constants/strings";
import Loading from "@/components/common/Loading";
import * as router from "@/constants/routes";
import CoreTable from "@mds/common/components/common/CoreTable";
import {
  useAppDispatch,
  useAppSelector as useSelector,
  useAppSelector,
} from "@mds/common/redux/rootState";
import { IOption, IPartyAppt, IPermit, ITailingsStorageFacility } from "@mds/common/interfaces";
import { renderTextColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import CoreButton from "@mds/common/components/common/CoreButton";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import { ColumnsType } from "antd/es/table";
import EditPartyRelationshipModal from "@/components/modalContent/EditPartyRelationshipModal";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

interface ITransformedValues {
  key: string;
  contact: string;
  partyGuid: string;
  partyRelationship: IPartyAppt;
  role: string;
  permit: IPermit;
  tailingsStorageFacility: ITailingsStorageFacility;
  endDate: string;
  startDate: string;
}

const mapPermitGuidToNumber = (permits: IPermit[]) =>
  permits.reduce((acc, { permit_guid, permit_no }) => {
    acc[permit_guid] = permit_no;
    return acc;
  }, {});

const mapTSFGuidToName = (tailings: ITailingsStorageFacility[]) =>
  tailings.reduce(
    (acc, { mine_tailings_storage_facility_guid, mine_tailings_storage_facility_name }) => {
      acc[mine_tailings_storage_facility_guid] = mine_tailings_storage_facility_name;
      return acc;
    },
    {}
  );

const getPartyRelationshipTitle = (partyRelationshipTypes: IOption[], typeCode: string) => {
  const partyRelationshipType = partyRelationshipTypes.find(({ value }) => value === typeCode);
  return (partyRelationshipType && partyRelationshipType.label) || String.EMPTY;
};

export const RelationshipProfile: FC = () => {
  const dispatch = useAppDispatch();
  const { id, typeCode } = useParams<{ id: string; typeCode: string }>();

  const mine = useAppSelector(getMineById(id));
  const partyRelationshipTypes: IOption[] = useAppSelector(getPartyRelationshipTypesList);
  const partyRelationships: IPartyAppt[] = useSelector((state) => getPartyRelationships(state));
  const minePermits: IPermit[] = useAppSelector(getPermits);
  const canEdit = useAppSelector(userHasRole(USER_ROLES.role_edit_parties));

  const [partyRelationshipTitle, setPartyRelationshipTitle] = useState("");
  const [permitsMapping, setPermitsMapping] = useState({});
  const [TSFMapping, setTSFMapping] = useState({});

  const isPermittee = typeCode === "PMT";
  const isEOR = typeCode === "EOR";
  const isTQP = typeCode === "TQP";

  const isLoaded = partyRelationshipTypes.length > 0 && partyRelationships.length > 0 && mine;

  useEffect(() => {
    if (isEmpty(partyRelationships)) {
      dispatch(
        fetchPartyRelationships({
          mine_guid: id,
          types: typeCode,
          relationships: "party",
          include_permit_contacts: "true",
          active_only: "false",
        })
      );
    }
    if (!isEmpty(partyRelationships) && isEmpty(partyRelationshipTitle)) {
      setPartyRelationshipTitle(getPartyRelationshipTitle(partyRelationshipTypes, typeCode));
    }
    if (!mine) {
      dispatch(fetchMineRecordById(id));
    }
    if (!minePermits) {
      dispatch(fetchPermits(id));
    }
    if (mine && minePermits) {
      const permitsMappingLength = Object.keys(permitsMapping).length;
      if (permitsMappingLength === 0 || permitsMappingLength !== minePermits.length) {
        setPermitsMapping(mapPermitGuidToNumber(minePermits));
      }
      const tsfMappingLength = Object.keys(TSFMapping).length;
      if (
        tsfMappingLength === 0 ||
        tsfMappingLength !== mine.mine_tailings_storage_facilities.length
      ) {
        setTSFMapping(mapTSFGuidToName(mine.mine_tailings_storage_facilities));
      }
    }
  }, [partyRelationships, minePermits, mine]);

  const handleChange = (value: string) => {
    debounce(() => dispatch(fetchParties({ name_search: value })));
  };

  const formatValuesEndCurrent = (values: IPartyAppt) => {
    let end_current = values.end_current ?? true;
    if (values.end_date) {
      const endDate = new Date(values.end_date);
      endDate.setTime(endDate.getTime() + endDate.getTimezoneOffset() * 60000);
      end_current = endDate >= new Date();
    }
    return { ...values, end_current };
  };

  const onSubmitEditPartyRelationship = async (values: IPartyAppt) => {
    let payload = partyRelationships.find(
      (relationship) => relationship.mine_party_appt_guid === values.mine_party_appt_guid
    );

    payload.start_date = values.start_date;
    payload.end_date = values.end_date;
    payload.union_rep_company = values.union_rep_company;
    payload.related_guid = values.related_guid || payload.related_guid;

    payload = formatValuesEndCurrent(payload);

    await dispatch(updatePartyRelationship(payload));
    dispatch(
      fetchPartyRelationships({
        mine_guid: mine.mine_guid,
        relationships: "party",
        include_permit_contacts: "true",
      })
    );
    dispatch(closeModal());
  };

  const handleOpenEditPartyRelationshipModal = (record: ITransformedValues) => {
    const partyRelationshipType = partyRelationshipTypes.find(
      (r) => r.value === record.partyRelationship.mine_party_appt_type_code
    ).label;
    const title = `Update ${partyRelationshipType}: ${record.partyRelationship.party.name}`;
    dispatch(
      openModal({
        props: {
          onSubmit: onSubmitEditPartyRelationship,
          handleChange,
          title,
          partyRelationships,
          partyRelationship: JSON.parse(JSON.stringify(record.partyRelationship)),
          partyRelationshipType,
          minePermits: minePermits,
          mine,
        },
        content: EditPartyRelationshipModal,
      })
    );
  };

  const permitColumn = isPermittee ? [renderTextColumn("permit", "Permit")] : [];

  const EORColumn =
    isEOR || isTQP
      ? [renderTextColumn("tailingsStorageFacility", "Tailings Storage Facility")]
      : [];

  const columns: ColumnsType<ITransformedValues> = [
    {
      title: "Contact",
      dataIndex: "contact",
      render: (text, record) => (
        <div title="Contact">
          <Link to={router.PARTY_PROFILE.dynamicRoute(record.partyGuid)}>{text}</Link>
        </div>
      ),
    },
    renderTextColumn("role", "Role"),
    ...permitColumn,
    ...EORColumn,
    {
      title: "Dates",
      dataIndex: "dates",
      render: (text, record) => (
        <Row title="Dates" align="middle" justify="space-between">
          <Col>
            {record.startDate} - {record.endDate}
          </Col>
          {canEdit && (
            <Col>
              <CoreButton type="text" onClick={() => handleOpenEditPartyRelationshipModal(record)}>
                Edit
              </CoreButton>
            </Col>
          )}
        </Row>
      ),
    },
  ];

  const transformRowData = (historyRelationships: IPartyAppt[]): ITransformedValues[] =>
    historyRelationships.map((relationship) => {
      const partyRelationshipType = partyRelationshipTypes.find(
        (r) => r.value === relationship.mine_party_appt_type_code
      ).label;
      const partyRelationshipTitle = `Update ${partyRelationshipType}: ${relationship.party.name}`;
      return {
        key: relationship.mine_party_appt_guid,
        contact: relationship.party.name,
        partyGuid: relationship.party.party_guid,
        partyRelationship: relationship,
        role: partyRelationshipTitle,
        permit: permitsMapping[relationship.related_guid],
        tailingsStorageFacility: TSFMapping[relationship.related_guid],
        endDate: formatDate(relationship.end_date) || "Present",
        startDate: formatDate(relationship.start_date) || "Unknown",
      };
    });

  const filteredRelationships: IPartyAppt[] = partyRelationships
    .sort((a, b) =>
      moment(a.start_date, "YYYY-MM-DD") >= moment(b.start_date, "YYYY-MM-DD") ? -1 : 1
    )
    .filter(({ mine_party_appt_type_code }) => mine_party_appt_type_code === typeCode);

  if (isLoaded) {
    return (
      <div className="profile">
        <div className="profile__header">
          <div className="inline-flex between">
            <h1 className="bold">{partyRelationshipTitle} History</h1>
          </div>
          <div className="inline-flex between">
            <div className="inline-flex">
              <p>
                <Link to={router.MINE_CONTACTS.dynamicRoute(mine.mine_guid)}>
                  {mine && mine.mine_name}
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="profile__content">
          <Tabs
            activeKey="history"
            size="large"
            animated={{ inkBar: true, tabPane: false }}
            centered
            items={[
              {
                label: "History",
                key: "history",
                children: (
                  <div className="tab__content">
                    <CoreTable
                      columns={columns}
                      dataSource={transformRowData(filteredRelationships)}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }
  return <Loading />;
};

export default RelationshipProfile;
