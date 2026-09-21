from datetime import datetime
from flask import request
from flask_restx import Resource
from werkzeug.exceptions import BadRequest
from sqlalchemy import or_, and_
from pytz import utc

from app.extensions import api, getJwtManager
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.include.user_info import User as UserUtils
from app.api.utils.access_decorators import VIEW_ALL

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_document_xref import MinespaceUserDocumentXref
from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
# Import these models to ensure they're registered with SQLAlchemy (avoid circular import issues)
from app.api.users.minespace.models.minespace_user_role_xref import MinespaceUserRoleXref
from app.api.users.minespace.models.minespace_user_roles import MinespaceUserRole
from app.api.users.response_models import MINESPACE_USER_ACCESS_REQUEST, MINE_SEARCH_RESULT
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.services.document_manager_service import DocumentManagerService
from app.api.utils.custom_reqparser import CustomReqparser

class NewMinespaceUserResource(Resource, UserMixin):
    @api.doc(description="Get current user's access request")
    @api.marshal_with(MINESPACE_USER_ACCESS_REQUEST, code=200)
    def get(self):
        # Get user info from JWT token
        user_util = UserUtils()
        user_info = user_util.get_user_raw_info()
        
        if not user_info:
            raise BadRequest('User information not available')
        
        user_sub = user_info.get('sub')
        if not user_sub:
            raise BadRequest('User sub not found in token')
        
        # Find existing request
        user_request = MinespaceUserRequest.find_by_user_sub(user_sub)
        
        return user_request
    
    @api.doc(description='Submit new minespace user access request')
    @api.marshal_with(MINESPACE_USER_ACCESS_REQUEST, code=201)
    def post(self):
        parser = CustomReqparser()
        parser.add_argument('role_requested', type=str, required=False, location='json')
        parser.add_argument('business_name', type=str, required=False, location='json')
        parser.add_argument('mines', type=list, required=False, location='json')
        parser.add_argument('access_request_text', type=str, required=False, location='json')
        parser.add_argument('ministry_contact', type=str, required=False, location='json')
        parser.add_argument('permittee', type=dict, required=False, location='json')
        parser.add_argument('is_submitting', type=bool, required=False, location='json', default=False)
        parser.add_argument('documents', type=list, required=False, location='json')
        
        data = parser.parse_args()
        
        # Get user info from JWT token
        user_util = UserUtils()
        user_info = user_util.get_user_raw_info()
        
        if not user_info:
            raise BadRequest('User information not available')
        
        user_sub = user_info.get('sub')
        if not user_sub:
            raise BadRequest('User sub not found in token')
        
        # When submitting, validate required fields
        if data.get('is_submitting', False) and not data.get('role_requested'):
            raise BadRequest('Role/Position is a required field')
        
        # Check if request already exists to determine status code
        existing_request = MinespaceUserRequest.find_by_user_sub(user_sub)
        is_new = existing_request is None
        
        # Extract documents before filtering
        documents = data.pop('documents', [])
        
        # Extract mines before filtering
        mines = data.pop('mines', [])
        
        update_data = {k: v for k, v in data.items() if k != 'is_submitting' and v is not None}
        
        # Create or update the request
        user_request = MinespaceUserRequest.create_or_update_request(
            user_sub=user_sub,
            data=update_data,
            is_submitting=data.get('is_submitting', False)
        )
        
        # If submitting, create the user
        if data.get('is_submitting', False):
            # Find or create the MinespaceUser
            minespace_user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username=user_info.get('bceid_username'))
            
            if not minespace_user:
                bceid_username_data = user_info.get('bceid_username')
                if not bceid_username_data:
                    raise BadRequest('BCeID username not found in token')
                
                bceid_username = bceid_username_data + "@bceid"
                
                # Create a new user for the access request
                minespace_user = MinespaceUser.create_minespace_user(bceid_username, add_to_session=True)
                minespace_user.sub = user_sub
                minespace_user.email = user_info.get('email', '')
                minespace_user.given_name = user_info.get('given_name', '')
                minespace_user.family_name = user_info.get('family_name', '')
                minespace_user.display_name = user_info.get('display_name', '')
                minespace_user.identity_provider = user_info.get('identity_provider', '')
                minespace_user.bceid_user_guid = user_info.get('bceid_user_guid', '')
                minespace_user.last_logged_in = datetime.now(tz=utc)
                minespace_user.save()
            
            # Link the request to the user if not already linked
            if not user_request.minespace_user_id:
                user_request.link_to_user(minespace_user.user_id)
            
            # Create pending role xrefs for each requested mine
            # Skip role creation for NUL (General Public/Researcher)
            role_requested = data.get('role_requested')
            if mines and role_requested and role_requested != 'NUL':
                for mine_guid in mines:
                    # Check if this role xref already exists
                    existing_role = MinespaceUserRoleXref.query.filter_by(
                        minespace_user_id=minespace_user.user_id,
                        mine_guid=mine_guid,
                        minespace_user_role_code=role_requested
                    ).first()
                    
                    if not existing_role:
                        role_xref = MinespaceUserRoleXref(
                            minespace_user_id=minespace_user.user_id,
                            mine_guid=mine_guid,
                            minespace_user_role_code=role_requested,
                            is_pending=True
                        )
                        role_xref.save()
            
            # Create document xrefs for each document
            if documents:
                for doc in documents:
                    # Check if this document is already linked
                    existing_xref = MinespaceUserDocumentXref.query.filter_by(
                        minespace_user_id=minespace_user.user_id,
                        document_manager_guid=doc.get('document_manager_guid')
                    ).first()
                    
                    if not existing_xref:
                        document_xref = MinespaceUserDocumentXref(
                            minespace_user_id=minespace_user.user_id,
                            document_manager_guid=doc.get('document_manager_guid'),
                            document_name=doc.get('document_name')
                        )
                        document_xref.save()
        
        # Return with appropriate status code
        return user_request, 201 if is_new else 200

class NewMinespaceUserDocumentResource(Resource, UserMixin):
    @api.doc(description='Initialize document upload for new minespace user access request')
    def post(self):
        """Initialize file upload with document manager"""
        # Get user info from JWT token - must be authenticated with BCeID
        user_util = UserUtils()
        user_info = user_util.get_user_raw_info()
        
        if not user_info:
            raise BadRequest('User information not available')
        
        # Verify BCeID authentication
        identity_provider = user_info.get('identity_provider', '')
        if 'bceid' not in identity_provider.lower():
            raise BadRequest('Must be authenticated with BCeID to upload documents for access request')
        
        bceid_username = user_info.get('bceid_username')
        if not bceid_username:
            raise BadRequest('BCeID username not found in token')
        
        return DocumentManagerService.initialize_upload_for_minespace_access_request(request, bceid_username)

class NewMinespaceUserDataResource(Resource, UserMixin):
    
    @api.doc(
        description='Search for mines by name, mine number, or permit number. Returns minimal mine information for new user registration.',
        params={
            'search': 'Search term to match against mine name, mine number, or permit number (minimum 3 characters)',
        }
    )
    @api.marshal_with(MINE_SEARCH_RESULT, code=200, as_list=True, envelope='mines')
    def get(self):
        search_term = request.args.get('search', type=str)
        
        if not search_term:
            raise BadRequest('Search term is required')
        
        search_term = search_term.strip()
        
        if len(search_term) < 3:
            raise BadRequest('Search term must be at least 3 characters')
        
        # Check if the request is from core (has VIEW_ALL role)
        # Minespace users during signup won't have any roles yet
        is_core_user = getJwtManager().validate_roles([VIEW_ALL])
        
        # Search for mines by name or mine number
        mine_search = Mine.query.filter(
            and_(
                Mine.deleted_ind == False,
                or_(
                    Mine.mine_name.ilike(f'%{search_term}%'),
                    Mine.mine_no.ilike(f'%{search_term}%')
                )
            )
        ).limit(50).all()
        
        # Search for permits by permit number
        permit_search = Permit.query.filter(
            Permit.permit_no.ilike(f'%{search_term}%')
        ).limit(50).all()
        
        # Build results list with mine and permit information
        results = []
        mine_guids_added = set()
        
        # Add mines from direct mine search
        for mine in mine_search:
            mine_guids_added.add(str(mine.mine_guid))
            # Get the first permit if available
            permit = mine.mine_permit[0] if mine.mine_permit else None
            
            if is_core_user:
                # Return full data for core users
                results.append({
                    'mine_guid': str(mine.mine_guid),
                    'mine_name': mine.mine_name,
                    'mine_no': mine.mine_no,
                    'permit_guid': str(permit.permit_guid) if permit else None,
                    'permit_no': permit.permit_no if permit else None,
                })
            else:
                # Return only mine_guid and mine_no for minespace users (empty fields for others)
                results.append({
                    'mine_guid': str(mine.mine_guid),
                    'mine_name': None,
                    'mine_no': mine.mine_no,
                    'permit_guid': None,
                    'permit_no': None,
                })
        
        # Add mines from permit search (only if not already added)
        for permit in permit_search:
            # Use _all_mines relationship to avoid _context_mine requirement
            if permit._all_mines:
                mine = permit._all_mines[0]
                if not mine.deleted_ind and str(mine.mine_guid) not in mine_guids_added:
                    mine_guids_added.add(str(mine.mine_guid))
                    
                    if is_core_user:
                        # Return full data for core users
                        results.append({
                            'mine_guid': str(mine.mine_guid),
                            'mine_name': mine.mine_name,
                            'mine_no': mine.mine_no,
                            'permit_guid': str(permit.permit_guid),
                            'permit_no': permit.permit_no,
                        })
                    else:
                        # Return only mine_guid and mine_no for minespace users (empty fields for others)
                        results.append({
                            'mine_guid': str(mine.mine_guid),
                            'mine_name': None,
                            'mine_no': mine.mine_no,
                            'permit_guid': None,
                            'permit_no': None,
                        })
        
        # Sort results by mine_no
        results.sort(key=lambda x: x['mine_no'].lower() if x['mine_no'] else '')
        
        return results