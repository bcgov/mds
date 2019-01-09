from flask_restplus import Namespace

from ..mine.resources.mine import MineResource, MineListByName
from ..mine.resources.mine_type import MineTypeResource
from ..mine.resources.mine_type_detail import MineTypeDetailResource
from ..mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from ..mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from ..mine.resources.mine_commodity_code import MineCommodityCodeResource
from ..location.resources.location import MineLocationResource
from ..status.resources.status import MineStatusResource
from ..region.resources.region import MineRegionResource
from ..tailings.resources.tailings import MineTailingsStorageFacilityResource
from ..compliance.resources.compliance import MineComplianceResource
from ..mine.resources.mine_basicinfo import MineBasicInfoResource

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '', '/<string:mine_no_or_guid>')
api.add_resource(MineListByName, '/names')
api.add_resource(MineTenureTypeCodeResource, '/mine-tenure-type-codes')
api.add_resource(MineDisturbanceCodeResource, '/disturbance-codes')
api.add_resource(MineCommodityCodeResource, '/commodity-codes')
api.add_resource(MineLocationResource, '/location', '/location/<string:mine_location_guid>')
api.add_resource(MineStatusResource, '/status', '/status/<string:mine_status_guid>')
api.add_resource(MineRegionResource, '/region', '/region/<string:mine_region_guid>')
api.add_resource(MineTailingsStorageFacilityResource, '/tailings',
                 '/tailings/<string:mine_tailings_storage_facility_guid>')
api.add_resource(MineComplianceResource, '/compliance', '/compliance/<string:mine_no>')
api.add_resource(MineTypeResource, '/mine-types', '/mine-types/<string:mine_type_guid>')
api.add_resource(MineTypeDetailResource, '/mine-types/details',
                 '/mine-types/details/<string:mine_type_detail_xref_guid>')
api.add_resource(MineBasicInfoResource, '/basicinfo')
