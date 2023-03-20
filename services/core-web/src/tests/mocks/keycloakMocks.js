export const getKeycloakMock = (
  mockInitialized = true,
  mockAuthenticated = true,
  mockClient_roles = ["role_view"]
) => {
  jest.mock("@react-keycloak/web", () => ({
    useKeycloak: () => ({
      keycloak: {
        authenticated: mockInitialized && mockAuthenticated,
        login: jest.fn(),
        tokenParsed: {
          client_roles: mockInitialized && mockAuthenticated ? mockClient_roles : [],
        },
      },
      initialized: mockInitialized,
    }),
  }));
};
