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
  match: PropTypes.shape({
    params: {
      id: PropTypes.string,
    },
  }).isRequired,
  route: PropTypes.shape({ route: PropTypes.string, hashRoute: PropTypes.func }).isRequired,
};

export const NOWSideMenu = (props) => {
  const onChange = (link) => {
    const { id } = props.match.params;
    return props.history.push(props.route.hashRoute(id, link));
  };

  return (
    <div>
      <Anchor affix={false} offsetTop={195} onChange={onChange}>
        <Link href="#application-info" title="Application Info" />
        <Link href="#contacts" title="Contacts" />
        <Link href="#access" title="Access" />
        <Link href="#state-of-land" title="State of Land" />
        <Link href="#first-aid" title="First Aid" />
        <Link href="#reclamation" title="Summary of Reclamation" />
        <Link href="#access-roads" title="Access Roads, Trails, Helipads, Air Strips, Boat Ramps" />
        <Link href="#blasting" title="Blasting" />
        <Link href="#camps" title="Camps, Buildings, Staging Areas, Fuel/Lubricant Storage" />
        <Link
          href="#cut-lines-polarization-survey"
          title="Cut Lines and Induced Polarization Survey"
        />
        <Link href="#surface-drilling" title="Exploration Surface Drilling" />
        <Link href="#mechanical-trenching" title="Mechanical Trenching / Test Pits" />
        <Link href="#settling-ponds" title="Settling Ponds" />
        <Link href="#surface-bulk-samples" title="Surface Bulk Sample" />
        <Link href="#underground-exploration" title="Underground Exploration" />
        <Link href="#sand-gravel-quarry-operations" title="Sand and Gravel / Quarry Operations" />
        <Link href="#placer-operations" title="Placer Operations" />
        <Link href="#water-supply" title="Water Supply" />
        <Link href="#documents" title="Documents" />
      </Anchor>
    </div>
  );
};

NOWSideMenu.propTypes = propTypes;

export default withRouter(NOWSideMenu);
