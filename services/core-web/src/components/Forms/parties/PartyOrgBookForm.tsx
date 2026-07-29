import React, { FC, useState } from "react";
import { Button, Col, Row } from "antd";
import { BookOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  createPartyOrgBookEntity,
  deletePartyOrgBookEntity,
  fetchPartyById,
} from "@mds/common/redux/slices/partiesSlice";
import { ORGBOOK_ENTITY_URL } from "@/constants/routes";
import { IParty } from "@mds/common/interfaces";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import { useAppSelector } from "@mds/common/redux/rootState";
import { userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common/constants/environment";

interface PartyOrgBookFormProps {
  party: IParty;
}

export const PartyOrgBookForm: FC<PartyOrgBookFormProps> = ({ party }) => {
  const [isAssociating, setIsAssociating] = useState(false);
  const dispatch = useDispatch();
  const [registrationId, setRegistrationId] = useState<string | null>(
    party.party_bc_registration?.registration_id ?? null
  );
  const [businessName, setBusinessName] = useState(null);
  const [currentParty, setCurrentParty] = useState(party.party_bc_registration?.name_text);
  const [isAssociated, setIsAssociated] = useState(!!party.party_bc_registration?.name_text);

  const canManageOrgbook = useAppSelector(userHasRole(USER_ROLES.role_manage_orgbook));

  const handleAssociateButtonClick = async () => {
    setIsAssociating(true);
    await dispatch(
      createPartyOrgBookEntity({
        partyGuid: party.party_guid,
        data: {
          registration_id: registrationId,
          business_name: businessName
        },
      })
    );
    await dispatch(fetchPartyById(party.party_guid));

    setIsAssociating(false);
    setIsAssociated(true);
  };

  const handleDisassociateButtonClick = async () => {
    setIsAssociating(true);

    await dispatch(deletePartyOrgBookEntity(party.party_guid));
    await dispatch(fetchPartyById(party.party_guid));
    setIsAssociating(false);
    setCurrentParty("");
    setIsAssociated(false);
  };


  return (
    <Row>
      <Col span={24}>
        <OrgBookSearch
          isDisabled={isAssociated}
          setRegistrationId={setRegistrationId}
          setBusinessName={setBusinessName}
          current_party={currentParty}
        />
      </Col>
      <Col span={24}>
        <Button
          className="full-mobile"
          href={ORGBOOK_ENTITY_URL(registrationId)}
          disabled={!registrationId}
          target="_blank"
        >
          <span>
            <BookOutlined className="padding-sm--right" />
            View on OrgBook
          </span>
        </Button>
        {canManageOrgbook && (
          <Button
            type="primary"
            className="full-mobile"
            onClick={!isAssociated ? handleAssociateButtonClick : handleDisassociateButtonClick}
            loading={isAssociating}
            danger={isAssociated}
          >
            <span>
              <CheckCircleOutlined className="padding-sm--right" />
              {!isAssociated ? "Associate" : "Disassociate"}
            </span>
          </Button>
        )}
      </Col>
    </Row >
  );
};

export default PartyOrgBookForm;
