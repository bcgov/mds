const axios = require("axios"); // Make sure to install axios via npm or yarn

const clientId = "X";
const clientSecret = "X";

const getToken = async () => {
  const data = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  };
  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const response = await axios.post(
    "https://loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token",
    new URLSearchParams(data),
    config
  );
  return response.data.access_token;
};

const addRoles = async (accessToken, userId) => {
  const data = [{ name: "c_mds_minespace_proponent" }];
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };
  const url = `https://api.loginproxy.gov.bc.ca/api/v1/integrations/4414/prod/users/${userId}/roles`;
  const response = await axios.post(url, data, config);
  return response.data;
};

const runForUserIds = async (userIds) => {
  let total = 0;
  let success = 0;
  let failure = 0;
  try {
    let accessToken = await getToken();
    for (const userId of userIds) {
      try {
        const result = await addRoles(accessToken, userId);
        console.log(`Added roles for user ${userId} - count ${success}}`);
        success++;
        total++;
        if (total % 30 === 0) {
          accessToken = await getToken();
        }
      } catch (error) {
        console.error(error); // log any errors
        console.log(`Failed to add roles for user ${userId}`);
        failure++;
        total++;
      }
    }
  } catch (error) {
    console.error(error); // log any errors while getting the access token
  }
  console.log(`Total: ${total}, Success: ${success}, Failure: ${failure}`);
};

const userIds = [];
runForUserIds(userIds);
