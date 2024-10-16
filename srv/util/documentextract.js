const axios = require("axios");
const NodeCache = require("node-cache");
const { CLIENTID, CLIENTSECRET, TOKENURL, DOCUMENTEXTRACTBASEURL } = {
  CLIENTID:
    "sb-05b51e8f-24ac-4cb7-94ba-f702bc5b37bb!b264940|dox-xsuaa-std-production!b9505",
  CLIENTSECRET:
    "d218de85-9454-4a8f-a506-ea571b8b2399$vu5keV65ppfpBv7oHq7SMTi1HduAupH965OH7WWV5Ck=",
  TOKENURL:
    "https://development-oc58dg9d.authentication.us10.hana.ondemand.com/oauth/token",
  DOCUMENTEXTRACTBASEURL:
    "https://aiservices-dox.cfapps.us10.hana.ondemand.com",
};

const tokenCache = new NodeCache({ stdTTL: 3000 });

const documentExtractClient = axios.create({
  baseURL: `${DOCUMENTEXTRACTBASEURL}/document-information-extraction/v1/document`,
});

async function fetchDocumentExtractionAccessToken() {
  const urlParams = new URLSearchParams();
  urlParams.append("grant_type", "client_credentials");

  try {
    const response = await axios.post(TOKENURL, urlParams.toString(), {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${CLIENTID}:${CLIENTSECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token, expires_in } = response.data;

    const ttl = expires_in - 60;
    tokenCache.set("accessToken", access_token, ttl);

    return access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}

async function getAccessToken() {
  let token = tokenCache.get("accessToken");
  if (!token) {
    token = await fetchDocumentExtractionAccessToken();
  }
  return token;
}

documentExtractClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      config.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
    return config;
  },
  (error) => {
    console.error("Error intercepting request:", error);
    return Promise.reject(error);
  }
);

module.exports = documentExtractClient;
