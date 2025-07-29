import React, { FC, ReactNode } from "react";
import * as String from "@mds/common/constants/strings";
import { NO_MINE, MINER_TWO, PERMIT, GROUP_MINERS } from "@/constants/assets";

/**
 * @constant NullScreen is a reusable view for when there is no data to display, add more views when required.
 */

type NullScreenType =
  | "generic"
  | "epic-authorizations"
  | "compliance"
  | "unauthorized"
  | "contacts"
  | "unauthorized-page"
  | "now-contacts"
  | "add-now-activity"
  | "merged-contacts"
  | "no-permittee"
  | "draft-permit"
  | "merged-contact"
  | "permit-conditions";

interface NullScreenProps {
  message?: string | ReactNode;
  type?: NullScreenType;
}

const NullScreen: FC<NullScreenProps> = ({
  message = "",
  type = "generic"
}) => (
  <div className="null-screen fade-in">
    {type === "generic" && (
      <div>
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.NO_DATA}</h3>
      </div>
    )}
    {type === "compliance" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_NRIS_INSPECTIONS}</h3>
      </div>
    )}
    {type === "epic-authorizations" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>{String.NO_EPIC_INFORMATION}</h3>
      </div>
    )}
    {type === "unauthorized" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.UNAUTHORIZED}</h3>
        <p>{String.CONTACT_ADMIN}</p>
      </div>
    )}
    {type === "unauthorized-page" && (
      <div className="no-nav-bar">
        <img alt="mine_img" src={NO_MINE} />
        <h3>{String.UNAUTHORIZED_PAGE}</h3>
      </div>
    )}
    {type === "contacts" && (
      <div>
        <img alt="mine_img" src={MINER_TWO} />
        <h3>No contacts found</h3>
        <p>Create a contact using the menu above</p>
      </div>
    )}
    {type === "no-permittee" && (
      <div>
        <img alt="mine_img" src={MINER_TWO} />
        <h3>No permittee</h3>
        <p>There must be a permittee in order to draft a permit</p>
      </div>
    )}
    {type === "now-contacts" && (
      <div>
        <img alt="mine_img" src={GROUP_MINERS} />
        <h3>No contacts associated with this Application</h3>
      </div>
    )}
    {type === "merged-contacts" && (
      <div>
        <img alt="mine_img" src={GROUP_MINERS} />
        <h3>No contacts selected</h3>
        <p>Search and select contacts to begin merge.</p>
      </div>
    )}
    {type === "add-now-activity" && (
      <div>
        <p>
          This application does not contain any information on <i>{message}</i>.
          <br />
          Enable edit mode to add this Activity.
        </p>
      </div>
    )}
    {type === "draft-permit" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>A draft permit has not been created.</h3>
        <p>{message}</p>
      </div>
    )}
    {type === "permit-conditions" && (
      <div>
        <img alt="mine_img" src={PERMIT} />
        <h3>No Permit Conditions</h3>
        <p>This permit was not generated in Core, and does not contain any digital conditions.</p>
      </div>
    )}
  </div>
);

export default NullScreen;
