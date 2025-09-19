# Mines Digital Services (MDS) - GitHub Copilot Instructions

**CRITICAL: Always follow these instructions first and only search for additional context if information here is incomplete or found to be in error.**

## Overview

MDS is a full-stack mining regulatory application for British Columbia with multiple services:
- **Frontend**: Core Web (ministry interface), Minespace Web (proponent interface), Common (shared components)
- **Backend**: Core API (Python Flask), Document Manager, NRIS API, Permits service
- **Database**: PostgreSQL with Flyway migrations
- **Infrastructure**: Docker containers orchestrated with Docker Compose and Make

## Working Effectively

### Prerequisites Validation
Always run `make valid` first to check your environment. This validates:
- Node.js v20.16.0 (exact version required)
- Yarn 3.2.4
- Docker and Docker Compose v2
- OpenShift CLI access (for production environments)

### Initial Setup Commands (Run Once)
**CRITICAL TIMING**: Never cancel these commands. Set timeouts appropriately:

1. **Environment Setup**: `make env` - Creates .env files from templates
   - **Timeout: 5+ minutes** - May prompt for external service access
   - **NEVER CANCEL**: Wait for completion even if appears slow

2. **Dependencies**: `yarn install` 
   - **Timeout: 10+ minutes** - Downloads all workspace dependencies
   - **NEVER CANCEL**: Large monorepo with multiple services
   - **CRITICAL LIMITATION**: Will fail in sandboxed environments due to artifacts.developer.gov.bc.ca network restrictions
   - **Expected Failure**: "getaddrinfo EAI_AGAIN artifacts.developer.gov.bc.ca" errors are normal in restricted environments

3. **Backend Services**: `make be` / `make lite`
   - **Timeout: 15+ minutes** - Builds and starts all Docker containers
   - **NEVER CANCEL**: Database migrations, image building, service startup
   - **CRITICAL LIMITATION**: Will fail in sandboxed environments due to yarn install failures in Docker builds
   - **Expected**: Multiple container builds including PostgreSQL, Redis, Python services (when network access available)

4. **Database Seeding**: `make seeddb`
   - **Timeout: 5+ minutes** - Creates test data
   - **NEVER CANCEL**: Generates factory data for development

### Development Workflow

#### Starting Services
Run these commands in separate terminals:

1. **Backend**: `make be` (if not already running)
2. **Common Watcher**: `cd services/common && yarn watch`
3. **Core Web**: `cd services/core-web && yarn serve` (runs on localhost:3000)
4. **Minespace Web**: `cd services/minespace-web && yarn serve` (runs on localhost:3020)

**Alternative for Codespaces**: `make restart` runs all services as background processes

#### Stopping Services
- **Frontend**: Ctrl+C in terminal running yarn commands
- **Backend**: `make stop`

### Build Commands

#### Full Builds
- **All Services**: `make all` 
  - **Timeout: 60+ minutes** - Builds all Docker containers
  - **NEVER CANCEL**: Complete infrastructure build

- **Frontend Only**: `cd services/core-web && yarn build`
  - **Timeout: 10+ minutes** - Webpack production build
  - **NEVER CANCEL**: TypeScript compilation, bundling, optimization

- **Backend Rebuild**: `make be-rebuild`
  - **Timeout: 30+ minutes** - Forces backend container rebuild
  - **NEVER CANCEL**: Python dependencies, application setup

### Testing Commands

#### Frontend Tests
- **Core Web Unit Tests**: `yarn workspace @mds/core-web run ci-test`
  - **Timeout: 15+ minutes** - Jest, coverage reports
  - **NEVER CANCEL**: Complete test suite with coverage

- **Minespace Unit Tests**: `yarn workspace @mds/minespace-web run test`
  - **Timeout: 10+ minutes** - Jest test suite
  - **NEVER CANCEL**: Full component and utility testing

#### Backend Tests
- **Core API Tests**: `make testbe`
  - **Timeout: 20+ minutes** - Pytest with database integration
  - **NEVER CANCEL**: Database setup, migration tests, API integration

- **Specific Test Folder**: `make testbe_folder f=folder_name`
  - **Timeout: 5+ minutes** - Focused test execution

#### End-to-End Tests
- **Cypress Core**: `make run-cypress-core` or `yarn workspace @mds/core-web cypress run`
  - **Timeout: 30+ minutes** - Full user scenarios
  - **NEVER CANCEL**: Browser automation, database interactions

- **Functional Tests**: `cd tests/functional-tests && ./run_tests.sh`
  - **Timeout: 45+ minutes** - Gradle-based Geb/Spock tests
  - **NEVER CANCEL**: Complete end-to-end validation

### Validation Requirements

#### Pre-commit Validation
**ALWAYS run these before committing** (when dependencies are available):
1. **Linting**: 
   - Frontend: `yarn workspace @mds/core-web lint`
   - Root: `yarn lint` (runs across all workspaces)
2. **Formatting**: `prettier --write --config .prettierrc.json <files>`
3. **Type Checking**: Automatic via TypeScript compilation

**Note**: In environments without full dependencies, focus on manual code review and structural validation.

#### Manual Testing Scenarios
**CRITICAL**: After making changes, ALWAYS test these user flows:

**Core Web (Ministry Interface)**:
1. Login with IDIR credentials
2. Navigate to Mine Dashboard
3. Create/edit a mine record
4. Upload a document
5. Generate a report

**Minespace Web (Proponent Interface)**:
1. Login with BCeID credentials  
2. Access "My Mines" dashboard
3. Submit a permit application
4. Upload required documents
5. Track application status

**API Integration**:
1. Test API endpoints with valid/invalid data
2. Verify authentication token handling
3. Check database transaction rollback on errors

### Common Development Tasks

#### Environment Issues
- **Docker Problems**: `make clean` then `make be` (removes all containers/volumes)
- **Node Version**: `nvm use` (uses .nvmrc file)
- **Dependency Issues**: Delete `node_modules`, run `yarn install`
- **Database Reset**: `make cleandb` (destroys and recreates database)

#### Architecture Navigation
- **Frontend Routes**: `services/core-web/src/routes/` and `services/minespace-web/src/routes/`
- **API Endpoints**: `services/core-api/app/api/`
- **Database Migrations**: `migrations/sql/`
- **Shared Components**: `services/common/src/`

#### Key File Locations
- **Configuration**: Look for `.env`, `webpack.config.js`, `package.json` in service directories
- **Tests**: `tests/` folders in each service, `cypress/` for E2E
- **Documentation**: `README.md` files in each service directory

### Known Issues and Workarounds

#### Network Dependencies (CRITICAL LIMITATIONS)
- **FontAwesome Pro**: Requires ARTIFACTORY_TOKEN for private BC Gov registry (artifacts.developer.gov.bc.ca)
- **BC Gov Artifacts**: External registry unreachable in sandboxed environments (EAI_AGAIN errors)
- **Yarn Install Failures**: External dependencies cause `yarn install` and Docker builds to fail
- **Docker Build Failures**: `make lite`, `make be`, and `make all` will fail due to network restrictions

#### Workarounds for Limited Environments
1. **Manual .env Setup**: Copy .env-example files to .env instead of using `make env`
2. **Skip Yarn Install**: Document the failure, note that full dependency installation is not possible
3. **Document Build Failures**: Note that Docker-based development requires network access to BC Gov services
4. **Use Local Development**: Focus on code analysis, documentation, and structure understanding

#### Alternative Validation in Restricted Environments
When full builds are not possible:
1. **Code Structure Analysis**: Use file system exploration and search to understand architecture
2. **Manual Code Review**: Check TypeScript/JavaScript syntax, Python imports, and API structure  
3. **Documentation Review**: Examine README files, inline comments, and test files
4. **Static Analysis**: Look for linting configurations (.eslintrc, .flake8) and follow their rules
5. **Configuration Validation**: Verify .env-example files have required variables

#### Platform-Specific
- **M1 Mac**: Use `docker-compose -f docker-compose.M1.yaml` or let Makefile auto-detect
- **Windows**: Use WSL2 or Linux containers, path compatibility issues with native Windows

#### CodeSpaces
- **Special Commands**: `make init` and `make restart` designed for CodeSpaces
- **Desktop Access**: Use remote desktop on port 6080 for Cypress GUI testing

### Critical Warnings

1. **NEVER CANCEL BUILDS**: All build commands can take 30+ minutes
2. **SET PROPER TIMEOUTS**: Minimum 60 minutes for full builds, 30 minutes for tests
3. **VALIDATE MANUALLY**: Always test user scenarios after code changes
4. **CHECK CI REQUIREMENTS**: Run linting and formatting before commits
5. **MONITOR DOCKER RESOURCES**: Large build processes require adequate disk space

### Quick Reference Commands

```bash
# Essential workflow
make valid           # Validate environment (1 min)
make env            # Setup environment (5+ min, NEVER CANCEL)
yarn install        # Install dependencies (10+ min, NEVER CANCEL)  
make be             # Start backend (15+ min, NEVER CANCEL)
make seeddb         # Seed database (5+ min, NEVER CANCEL)

# Development
make stop           # Stop all services
make clean          # Full cleanup
make rebuild        # Rebuild containers (30+ min, NEVER CANCEL)

# Testing
make testbe         # Backend tests (20+ min, NEVER CANCEL)
yarn workspace @mds/core-web run ci-test  # Frontend tests (15+ min, NEVER CANCEL)

# Manual validation required after changes
yarn lint           # Code linting
prettier --write    # Code formatting
```

### Repository Structure Summary
```
/
├── services/
│   ├── core-web/          # Ministry frontend (React/TypeScript)
│   ├── minespace-web/     # Proponent frontend (React/TypeScript)  
│   ├── common/            # Shared frontend components
│   ├── core-api/          # Main backend API (Python Flask)
│   ├── document-manager/  # Document storage service
│   └── ...               # Additional microservices
├── migrations/            # Database schema migrations
├── tests/                # Integration and functional tests
├── bin/                  # Build and utility scripts
├── Makefile              # Main automation commands
└── docker-compose.yaml   # Container orchestration
```

**Remember**: This codebase requires patience with build times and careful manual validation of changes. The CI/CD pipeline expects all formatting, linting, and testing standards to be met.