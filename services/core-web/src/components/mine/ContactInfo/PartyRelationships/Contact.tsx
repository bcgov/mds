import React, { FC, useEffect, useState } from "react";
import { IMine, IPartyAppt, IPermit } from "@mds/common/interfaces";
import { Button, Card } from "antd";
import { Link } from "react-router-dom";
import * as router from "@/constants/routes";
import { EMPTY_FIELD } from "@mds/common/constants/strings";
import { formatDate } from "@common/utils/helpers";
import { DocumentLink } from "@mds/common/components/documents/DocumentLink";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";

interface ContactProps {
  partyRelationship: IPartyAppt;
  partyRelationshipTitle: string;
  partyRelationshipSubTitle?: string;
  handleChange?: (value: string) => void;
  mine: IMine;
  permits: IPermit[];
  openEditPartyRelationshipModal?: (
    partyRelationship: IPartyAppt,
    onSubmitEditPartyRelationship: (partyRelationship: IPartyAppt) => void,
    handleChange: any,
    mine: IMine
  ) => void;
  onSubmitEditPartyRelationship?: (partyRelationship: IPartyAppt) => void;
  otherDetails?: any;
  isEditable?: boolean;
  editPermission?: string;
  compact?: boolean;
}

const Contact: FC<ContactProps> = ({
  partyRelationship,
  partyRelationshipTitle,
  partyRelationshipSubTitle,
  handleChange,
  mine,
  permits,
  openEditPartyRelationshipModal,
  onSubmitEditPartyRelationship,
  otherDetails,
  isEditable,
  editPermission,
  compact,
}) => {
  const [title, setTitle] = useState(partyRelationshipTitle ?? "");
  const [subTitle, setSubTitle] = useState(partyRelationshipSubTitle ?? "");
  const canEdit = editPermission ? useAppSelector(userHasRole(editPermission)) : false;

  useEffect(() => {
    switch (partyRelationship.mine_party_appt_type_code) {
      case "TQP":
      case "EOR":
        const tsf = mine.mine_tailings_storage_facilities.find(
          ({ mine_tailings_storage_facility_guid }) =>
            mine_tailings_storage_facility_guid === partyRelationship.related_guid
        );
        setSubTitle(`${tsf && tsf.mine_tailings_storage_facility_name}`);
        break;
      case "URP":
        setTitle(partyRelationship.union_rep_company);
        break;
      case "PMT":
      case "THD":
      case "LDO":
      case "MOR":
        const permit =
          permits &&
          permits.find(({ permit_guid }) => permit_guid === partyRelationship.related_guid);
        setSubTitle(`${permit?.permit_no ?? "No permit assigned"}`);
        break;
      default:
        break;
    }
  }, []);

  return (
    <Card
      headStyle={{
        minHeight: "0px",
      }}
      bordered={false}
      title={
        <div>
          <div className="flex flex-between">
            <div className="flex items-center">
              <h4 className="margin-large--right">{title}</h4>
              {subTitle && <p>({subTitle})</p>}
            </div>
          </div>
          {!compact && (
            <div className="padding-md--top">
              <Link
                to={router.RELATIONSHIP_PROFILE.dynamicRoute(
                  mine.mine_guid,
                  partyRelationship.mine_party_appt_type_code
                )}
              >
                <Button className="margin-none">See History</Button>
              </Link>
            </div>
          )}
        </div>
      }
    >
      <div className="default-contact">
        <Link to={router.PARTY_PROFILE.dynamicRoute(partyRelationship.party.party_guid)}>
          <h4 className="link-colour">{partyRelationship.party.name}</h4>
        </Link>
        <div>
          <h6>Email Address</h6>
          {partyRelationship.party.email && partyRelationship.party.email !== "Unknown" ? (
            <a href={`mailto:${partyRelationship.party.email}`}>{partyRelationship.party.email}</a>
          ) : (
            <p>{EMPTY_FIELD}</p>
          )}
        </div>
        <div>
          <h6>Phone Number</h6>
          <p>
            {partyRelationship.party.phone_no ? partyRelationship.party.phone_no : EMPTY_FIELD}
            {partyRelationship.party.phone_ext ? `x${partyRelationship.party.phone_ext}` : null}
          </p>
        </div>
        {!compact && (
          <div>
            <h6>{partyRelationshipTitle} Since</h6>
            <span>
              {formatDate(partyRelationship.start_date) || "Unknown"}
              {partyRelationship.mine_party_appt_type_code === "MMG" &&
                partyRelationship.documents?.length > 0 && (
                  <span>
                    {" "}
                    -{" "}
                    <DocumentLink
                      documentManagerGuid={partyRelationship.documents[0].document_manager_guid}
                      documentName={partyRelationship.documents[0].document_name}
                      linkTitleOverride="Appointment Letter"
                    />
                  </span>
                )}
            </span>
          </div>
        )}
      </div>
      {otherDetails}
      <div className="right">
        {isEditable && !compact && canEdit && (
          <Button
            type="primary"
            onClick={() =>
              openEditPartyRelationshipModal(
                partyRelationship,
                onSubmitEditPartyRelationship,
                handleChange,
                mine
              )
            }
          >
            Update
          </Button>
        )}
      </div>
    </Card>
  );
};

export default Contact;
