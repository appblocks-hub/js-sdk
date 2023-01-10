import qs from "query-string";

const base = window.location.origin;
let clientId = null;
const authorizationEndpoint =
  process && process.env && process.env.SHIELD_AUTH_URL
    ? process.env.SHIELD_AUTH_URL
    : "https://shield.appblocks.com/";

const getCodeInUrl = function () {
  const parsedQuery = qs.parseUrl(window.location.href);
  const code = parsedQuery.query.code;
  return code;
};

class TokenStore {
  constructor() {
    if (!getCodeInUrl()) {
      this.initRefreshCycle();
    }
  }
  get clientId() {
    return this._client_id;
  }
  set clientId(id) {
    if (id) {
      this._client_id = id;
    }
  }

  t;
  rt;
  te;
  _client_id = null;
  sendRefreshBefore = 10000;
  timeoutHandle;
  setToken(token) {
    this.t = token;
    localStorage.setItem("_ab_t", token);
  }
  initRefreshCycle() {
    clearTimeout(this.timeoutHandle);
    let expiresIn = this.getExpiry();
    console.log("expires in = ", expiresIn);
    if (!expiresIn) return false;
    expiresIn *= 1000;

    let timer = expiresIn - new Date().getTime();
    if (!timer || timer < this.sendRefreshBefore || isNaN(timer)) {
      if (!timer) console.log("!timer");
      if (timer < this.sendRefreshBefore)
        console.log("less than", this.sendRefreshBefore);
      if (isNaN(timer)) console.log("isNan");
      console.log(
        "invalid expiry time ",
        new Date().getTime(),
        expiresIn,
        timer
      );
      return null;
    }
    timer = parseInt(timer) - this.sendRefreshBefore;
    console.log("valid expiry time ", new Date().getTime(), expiresIn, timer);
    this.timeoutHandle = setTimeout(() => {
      refreshAccessToken();
    }, timer);
  }
  setExpiry(timestamp) {
    this.te = timestamp;
    localStorage.setItem("_ab_t_e", timestamp);
  }
  getExpiry() {
    return this.te || localStorage.getItem("_ab_t_e");
  }
  removeToken(token) {
    this.t = token;
    localStorage.removeItem("_ab_t");
  }
  setRefreshToken(token) {
    this.rt = token;
    localStorage.setItem("_ab_rt", token);
  }
  removeRefreshToken(token) {
    this.rt = token;
    localStorage.removeItem("_ab_rt");
  }
  getToken() {
    return this.t || localStorage.getItem("_ab_t");
  }
  getRefreshToken() {
    return this.rt || localStorage.getItem("_ab_rt");
  }
  clearTokens() {
    this.removeRefreshToken();
    this.removeToken();
  }
}

const tokenStore = new TokenStore();

const refreshAccessToken = async () => {
  console.log("calling refresh access token");
  const server = `${authorizationEndpoint}refresh-token`;
  try {
    const res = await fetch(server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStore.getToken()} ${tokenStore.getRefreshToken()}`,
      },
    });
    const data = await res.json();
    if (data && data.data.AccessToken) {
      console.log("data is ", data.data);
      tokenStore.setToken(data.data.AccessToken);
      tokenStore.setExpiry(data.data.AtExpires);
      tokenStore.setRefreshToken(data.data.RefreshToken);
      tokenStore.initRefreshCycle();
    } else if (data.status === 401) {
      console.log("expired token");
      tokenStore.clearTokens();
      await verifyLogin();
      // await logout()
      // verifyLogin();
    }
  } catch (error) {
    console.log("error in refreshing = ", error);
    // await logout()
    // verifyLogin();
  }
};

export const logout = async () => {
  await _logout();

  await verifyLogin();
};
export const logoutWithoutRedirect = async () => {
  await _logout();
};
const _logout = async () => {
  await shieldLogout();
  tokenStore.clearTokens();
};
export const verifyLogin = async (mode = "login") => {
  const isValidToken = await initValidation(mode);
  if (!isValidToken) {
    tokenStore.clearTokens();
    const authorizationUrl = getAuthUrl(mode);
    window.location = authorizationUrl;
  }
  return isValidToken;
};
export const verifyLoginWithoutRedirect = async () => {
  const isVaidToken = await initValidation();
  if (!isVaidToken) {
    tokenStore.clearTokens();
  }
  return isVaidToken;
};
const initValidation = async () => {
  let token = tokenStore.getToken();
  let isValid = token;
  if (token) {
    isValid = await validateAccessToken();
  }
  return !!isValid;
};
const validateAccessToken = async () => {
  const server = `${authorizationEndpoint}verify-appblocks-acess-token`;
  try {
    const res = await fetch(server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStore.getToken()}`,
        "Client-Id": tokenStore.clientId,
      },
    });
    const data = await res.json(); // access token set to appblocks io cookie

    return data.data && data.data === "valid";
  } catch (error) {
    console.log(error);
  }
};
const shieldLogout = async () => {
  const server = `${authorizationEndpoint}logout`;
  try {
    const res = await fetch(server, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenStore.getToken()}`,
      },
    });
    const data = await res.json(); // access token set to appblocks io cookie

    return data;
  } catch (error) {
    console.log(error);
  }
};
const getAuthUrl = (mode) => {
  const oAuthQueryParams = {
    response_type: "code",
    scope: "user private_repo",
    redirect_uri: base,
    client_id: tokenStore.clientId,
    state: "state123",
  };

  const query = qs.stringify(oAuthQueryParams);

  const authorizationUrl = `${authorizationEndpoint}${mode}?${query}`;
  return authorizationUrl;
};

export const init = async function (id) {
  tokenStore.clientId = id;
  const code = getCodeInUrl();
  // var cookie;
  if (code) {
    const tokenData = await sendCodeToServer(code);
    if (tokenData.success && tokenData.data) {
      tokenStore.setToken(tokenData.data.ab_at);
      tokenStore.setExpiry(tokenData.data.expires_in);
      tokenStore.setRefreshToken(tokenData.data.ab_rt);
      tokenStore.initRefreshCycle();
    }
  }
};

async function sendCodeToServer(code) {
  const server = `${authorizationEndpoint}auth/get-token?grant_type=authorization_code&code=${code}&redirect_uri=${base}`;
  try {
    const res = await fetch(server, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json(); // access token set to appblocks io cookie
    if (location.href.includes("?")) {
      const queryArr = location.href.split("?");
      let paramArr = queryArr[1].split("&");
      paramArr = paramArr.filter((param) => !param.includes("code="));
      const url = `${queryArr[0]}?${paramArr.join("&")}`;
      history.pushState({}, null, url);
    }
    console.log("🚀  file: index.js  line 50  sendCodeToServer  data", data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

export const shield = {
  init,
  verifyLogin,
  tokenStore,
  getAuthUrl,
  logout,
  logoutWithoutRedirect,
  validateAccessToken,
  verifyLoginWithoutRedirect,
};
