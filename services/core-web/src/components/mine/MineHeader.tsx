import React, { FC } from "react";
import { Link } from "react-router-dom";
import { uniq } from "lodash";
import { Button, Divider, Dropdown, Menu, Popover, Tag } from "antd";
import { closeModal, openModal } from "@mds/common/redux/actions/modalActions";
import {
  createMineTypes,
  fetchMineRecordById,
  removeMineType,
  updateMineRecord,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import { formatDate } from "@common/utils/helpers";
import {
  getCommodityOptionHash,
  getDisturbanceOptionHash,
  getExemptionFeeStatusOptionsHash,
  getGovernmentAgencyHash,
  getMineRegionHash,
  getMineTenureTypesHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import {
  getCurrentMineTypes,
  getTransformedMineTypes,
} from "@mds/common/redux/selectors/mineSelectors";
import { getUserInfo, userHasRole } from "@mds/common/redux/selectors/authenticationSelectors";
import * as String from "@mds/common/constants/strings";
import MineHeaderMapLeaflet from "@/components/maps/MineHeaderMapLeaflet";
import { EDIT, EDIT_OUTLINE_VIOLET, OPEN_NEW_TAB } from "@/constants/assets";
import * as route from "@/constants/routes";
import * as ModalContent from "@/constants/modalContent";
import { modalConfig } from "@/components/modalContent/config";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import MineAlert from "@/components/mine/MineAlert";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { IMine } from "@mds/common/interfaces/mine.interface";
import { USER_ROLES } from "@mds/common/constants/environment";

const generateMinistryInspectionMapperUrl = (lat, lng) => {
  const formattedLat = parseFloat(lat);
  const formattedLng = parseFloat(lng);
  const coordinateString = encodeURIComponent(`${formattedLng},${formattedLat}`);
  return `${String.MINISTRY_INSPECTION_MAPPER_BASE_URL}&center=${coordinateString}&level=10`;
};

interface MineHeaderProps {
  mine: IMine;
}

export const MineHeader: FC<MineHeaderProps> = ({ mine }) => {
  const dispatch = useAppDispatch();

  const canEditMines = useAppSelector(userHasRole(USER_ROLES.role_edit_mines));

  const userInfo = useAppSelector(getUserInfo);
  const mineRegionHash = useAppSelector(getMineRegionHash);
  const mineTenureHash = useAppSelector(getMineTenureTypesHash);
  const mineCommodityOptionsHash = useAppSelector(getCommodityOptionHash);
  const mineDisturbanceOptionsHash = useAppSelector(getDisturbanceOptionHash);
  const currentMineTypes = useAppSelector(getCurrentMineTypes);
  const transformedMineTypes = useAppSelector(getTransformedMineTypes);
  const exemptionFeeStatusOptionsHash = useAppSelector(getExemptionFeeStatusOptionsHash);
  const governmentAgencyHash = useAppSelector(getGovernmentAgencyHash);

  const handleUpdateMineRecord = (value) => {
    const mineStatus = value.mine_status.join(",");
    return dispatch(
      updateMineRecord(
        mine.mine_guid,
        {
          ...value,
          mine_status: mineStatus,
        },
        value.mine_name
      )
    ).then(() => {
      dispatch(createMineTypes(mine.mine_guid, value.mine_types)).then(() => {
        dispatch(closeModal());
        dispatch(fetchMineRecordById(mine.mine_guid));
      });
    });
  };

  const handleDeleteMineType = (event, mineTypeCode) => {
    event.preventDefault();
    mine.mine_type.forEach((type) => {
      if (type.mine_tenure_type_code === mineTypeCode) {
        const tenure = mineTenureHash[mineTypeCode];
        dispatch(removeMineType(mine.mine_guid, type.mine_type_guid, tenure)).then(() => {
          dispatch(fetchMineRecordById(mine.mine_guid));
        });
      }
    });
  };

  const handleOpenModal = (event, onSubmit, handleDelete, title, mine) => {
    event.preventDefault();
    const initialValues = {
      mine_name: mine.mine_name,
      latitude: mine.mine_location ? mine.mine_location.latitude : null,
      longitude: mine.mine_location ? mine.mine_location.longitude : null,
      mine_status: mine.mine_status[0] ? mine.mine_status[0].status_values : null,
      status_date: mine.mine_status[0] ? mine.mine_status[0].status_date : null,
      major_mine_ind: mine.major_mine_ind ? mine.major_mine_ind : false,
      mine_region: mine.mine_region,
      mine_note: mine.mine_note,
      exemption_fee_status_code: mine.exemption_fee_status_code,
      exemption_fee_status_note: mine.exemption_fee_status_note,
      government_agency_type_code: mine.government_agency_type_code,
      number_of_mine_employees: mine.number_of_mine_employees ?? null,
      number_of_contractors: mine.number_of_contractors ?? null,
    };
    dispatch(
      openModal({
        props: {
          onSubmit,
          handleDelete,
          title,
          initialValues,
        },
        content: modalConfig.MINE_RECORD,
        clearOnSubmit: false,
      })
    );
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <button
          id="updateMine"
          type="button"
          className="full"
          onClick={(event) =>
            handleOpenModal(
              event,
              handleUpdateMineRecord,
              handleDeleteMineType,
              ModalContent.UPDATE_MINE_RECORD,
              mine
            )
          }
        >
          <img alt="pencil" className="padding-sm" src={EDIT_OUTLINE_VIOLET} />
          {ModalContent.UPDATE_MINE_RECORD}
        </button>
      </Menu.Item>
    </Menu>
  );

  const mapRoute = mine.mine_location
    ? route.MINE_HOME_PAGE.mapRoute({
        lat: mine.mine_location.latitude,
        long: mine.mine_location.longitude,
        zoom: String.HIGH_ZOOM,
        mineName: mine.mine_name,
      })
    : route.MINE_HOME_PAGE.mapRoute();

  return (
    <div className="dashboard__header--card">
      <div className="dashboard__header--card__content">
        <MineAlert mine={mine} />
        <br />
        <div className="inline-flex between horizontal-center">
          <h4>Mine Details</h4>
          <div>
            {canEditMines && (
              <Dropdown className="full-height" overlay={menu} placement="bottomLeft">
                <Button type="primary">
                  <div className="padding-sm">
                    <img className="padding-sm--right" src={EDIT} alt="Add/Edit" />
                    Add/Edit
                  </div>
                </Button>
              </Dropdown>
            )}
          </div>
        </div>
        <Divider style={{ margin: "0" }} />

        {mine.mine_status[0] && (
          <div>
            <div className="inline-flex padding-sm">
              <p className="field-title">Operating Status </p>
              {mine.mine_status[0] ? (
                <p>{mine.mine_status[0].status_labels.join(", ")}</p>
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
              {mine.mine_status[0] && (
                <CoreTooltip title={mine.mine_status[0].status_description} />
              )}
            </div>

            <div className="inline-flex padding-sm">
              <p className="field-title">Status Since </p>

              {mine.mine_status[0].status_date ? (
                formatDate(mine.mine_status[0].status_date)
              ) : (
                <p>{String.EMPTY_FIELD}</p>
              )}
            </div>
          </div>
        )}
        {!mine.mine_status[0] && (
          <div className="inline-flex padding-sm">
            <p className="field-title">Operating Status</p>
            <p>{String.EMPTY_FIELD}</p>
          </div>
        )}
        <div className="inline-flex padding-sm">
          <p className="field-title">Mine Class </p>
          <p>{mine.major_mine_ind ? String.MAJOR_MINE : String.REGIONAL_MINE}</p>
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">Tenure</p>
          <div>
            <p>
              {transformedMineTypes?.mine_tenure_type_code.length > 0
                ? uniq(transformedMineTypes.mine_tenure_type_code)
                    .map((tenure) => mineTenureHash[tenure])
                    .join(", ")
                : String.EMPTY_FIELD}
            </p>
          </div>
        </div>
        <div className="inline-flex padding-sm wrap">
          <p className="field-title">Commodity</p>
          {transformedMineTypes.mine_commodity_code.length > 0 ? (
            uniq(transformedMineTypes.mine_commodity_code).map((code) => (
              <Tag key={code}>{mineCommodityOptionsHash[code]}</Tag>
            ))
          ) : (
            <p>{String.EMPTY_FIELD}</p>
          )}
        </div>
        <div className="inline-flex padding-sm wrap">
          <p className="field-title">Disturbance</p>
          {transformedMineTypes.mine_disturbance_code.length > 0 ? (
            uniq(transformedMineTypes.mine_disturbance_code).map((code) => (
              <Tag key={code}>{mineDisturbanceOptionsHash[code]}</Tag>
            ))
          ) : (
            <p>{String.EMPTY_FIELD}</p>
          )}
        </div>
        <div className="inline-flex padding-sm">
          <p className="field-title">TSF</p>
          <p>
            {mine.mine_tailings_storage_facilities.length > 0 ? (
              <Link to={route.MINE_TAILINGS.dynamicRoute(mine.mine_guid)}>
                {mine.mine_tailings_storage_facilities.length}
              </Link>
            ) : (
              String.EMPTY_FIELD
            )}
          </p>
        </div>
        <div className="inline-flex padding-sm wrap">
          <p className="field-title">Notes</p>
          <div>
            {mine.mine_note ? (
              <Popover
                content={mine.mine_note}
                overlayStyle={{ width: "50%", padding: "20px" }}
                title="Mine Notes"
                trigger="click"
              >
                <Button type='ghost' style={{ padding: 0, paddingLeft: '8px', margin: 0, height: 0, border: 'none' }}>
                  View Notes
                </Button>
              </Popover>
            ) : (
              <p>{String.EMPTY_FIELD}</p>
            )}
          </div>
        </div>
        <div className="inline-flex padding-sm wrap">
          <p className="field-title">Legacy Alias</p>
          <p>{mine.mms_alias ? mine.mms_alias : String.EMPTY_FIELD}</p>
        </div>
        {mine.government_agency_type_code && (
          <>
            <div className="inline-flex padding-sm wrap">
              <p className="field-title">Exemption Status</p>
              <div>
                {mine.exemption_fee_status_code
                  ? exemptionFeeStatusOptionsHash[mine.exemption_fee_status_code]
                  : String.EMPTY_FIELD}
                {mine.exemption_fee_status_note && (
                  <CoreTooltip title={mine.exemption_fee_status_note} />
                )}
              </div>
            </div>

            <div className="inline-flex padding-sm wrap">
              <p className="field-title">Government Agency type</p>
              <div>{governmentAgencyHash[mine.government_agency_type_code]}</div>
            </div>
          </>
        )}
        <div className="inline-flex padding-sm wrap">
          <div className="field-title">Number of Mine Employees</div>
          <div>{mine.number_of_mine_employees || String.EMPTY_FIELD}</div>
          <CoreTooltip title="Approximate number of mine employees on site" />
        </div>
        <div className="inline-flex padding-sm wrap">
          <div className="field-title">Number of Contractors</div>
          <div>{mine.number_of_contractors || String.EMPTY_FIELD}</div>
          <CoreTooltip title="Approximate number of contractors on site" />
        </div>
        {mine.mine_location?.latitude && mine.mine_location?.longitude && (
          <div className="inline-flex padding-sm wrap">
            <div className="field-title">View on the MCM Inspection Mapper</div>
            <div>
              <a
                href={generateMinistryInspectionMapperUrl(
                  mine.mine_location?.latitude,
                  mine.mine_location?.longitude
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img alt="Open link in new window" src={OPEN_NEW_TAB} style={{ width: "1.25em" }} />
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="dashboard__header--card__map">
        <MineHeaderMapLeaflet mine={mine} />
        <div className="dashboard__header--card__map--footer">
          <div className="inline-flex between">
            <p className="p-white">
              Lat:&nbsp;
              {mine.mine_location && mine.mine_location.latitude
                ? mine.mine_location.latitude
                : String.EMPTY_FIELD}
            </p>
            <p className="p-white">
              Long:&nbsp;
              {mine.mine_location && mine.mine_location.longitude
                ? mine.mine_location.longitude
                : String.EMPTY_FIELD}
            </p>
          </div>
          <div className="inline-flex between">
            <p className="p-white">
              Region:&nbsp;
              {mine.mine_region ? mineRegionHash[mine.mine_region] : String.EMPTY_FIELD}
            </p>
            <Link className="link-on-dark" to={mapRoute} target="_blank">
              View In Full Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MineHeader;
