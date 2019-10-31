import React from "react";
import { withRouter } from "react-router-dom";
import { PropTypes } from "prop-types";

import { Anchor } from "antd";

const { Link } = Anchor;

/**
 * @constant NOWSideMenu renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export const NOWSideMenu = (props) => {
  const onChange = (link) => {
    return props.history.push(link);
  };
  return (
    <div className="side-menu">
      <Anchor offsetTop={260} affix={false} onChange={onChange}>
        <Link href="#application-info" title="Application Info" />
        <Link href="#contacts" title="Contacts" />
        <Link href="#access" title="Access" />
        <Link href="#state-of-land" title="State of Land" />
        <Link href="#first-aid" title="First Aid" />
        <Link href="#equipment" title="Equipment" />
        <Link href="#reclamation" title="Summary of Reclamation" />
        <Link href="#documents" title="Documents" />
      </Anchor>
    </div>
  );
};

NOWSideMenu.propTypes = propTypes;

export default withRouter(NOWSideMenu);
