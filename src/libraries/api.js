import Configuration from "@db/Configuration";

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout en ${label}`)), ms)
    ),
  ]);

export async function getApiConfig() {
  const data = await withTimeout(Configuration.getConfigAPI(), 5000, "getApiConfig");

  const API_URI = data.find((item) => item.key == "API_URI");
  const ALFA_ACCOUNT = data.find((item) => item.key == "ALFA_ACCOUNT");
  const PASSWORD_SYNC = data.find((item) => item.key == "PASSWORD_SYNC");
  const USERNAME_SYNC = data.find((item) => item.key == "USERNAME_SYNC");
  const ALFA_DATABASE_ID = data.find((item) => item.key == "ALFA_DATABASE_ID");

  const config = [
    API_URI?.value || "",
    ALFA_ACCOUNT?.value || "",
    PASSWORD_SYNC?.value || "",
    USERNAME_SYNC?.value || "",
    ALFA_DATABASE_ID?.value || "",
  ];
  if (!config[0]) {
    console.log("[API] API_URI vacio en getApiConfig");
  }
  return config;
}

export const setDataToApi = async (endpoint, payload) => {
  let TOKEN = await Configuration.getConfigValue("TOKEN");

  if (TOKEN == "") {
    //Obtener el token para sincronizar
    const dataToken = await getToken();
    if (dataToken.status_code == 200) {
      TOKEN = dataToken.token;
    } else {
      return dataToken; //ES ERROR RESPONSE
    }
  }

  let data = await Post(endpoint, payload, TOKEN);

  //EL TOKEN SE VENCIO
  if (data.status_code == 401) {
    const dataToken = await getToken();
    if (dataToken.status_code == 200) {
      TOKEN = dataToken.token;
    } else {
      return dataToken; //ES ERROR RESPONSE
    }
    //REPITO LA PETICION

    data = await Post(endpoint, payload, TOKEN);

    if (data.status_code == 401) {
      return errorResponse("No se pudo obtener el token. Intente nuevamente");
    }
  }

  return data;
};

export const getDataFromAPI = async (endpoint, payload = null, method = "GET") => {
  console.log("[API] getDataFromAPI", method, endpoint);
  let TOKEN;
  try {
    TOKEN = await withTimeout(Configuration.getConfigValue("TOKEN"), 5000, "getConfigValue(TOKEN)");
  } catch (e) {
    return errorResponse(e?.message || "Error al leer TOKEN.");
  }

  if (TOKEN == "") {
    console.log("[API] token vacio, solicitando token");
    //Obtener el token para sincronizar
    const dataToken = await getToken();
    if (dataToken.status_code == 200) {
      TOKEN = dataToken.token;
    } else {
      return dataToken; //ES ERROR RESPONSE
    }
  }

  let data;
  if (method == "GET") {
    data = await Get(endpoint, TOKEN);
  } else {
    data = await Post(endpoint, payload, TOKEN);
  }

  //EL TOKEN SE VENCIO
  if (data.status_code == 401) {
    const dataToken = await getToken();
    if (dataToken.status_code == 200) {
      TOKEN = dataToken.token;
    } else {
      return dataToken; //ES ERROR RESPONSE
    }
    //REPITO LA PETICION
    if (method == "GET") {
      data = await Get(endpoint, TOKEN);
    } else {
      data = await Post(endpoint, payload, TOKEN);
    }
    if (data.status_code == 401) {
      return errorResponse("No se pudo obtener el token. Intente nuevamente");
    }
  }

  return data;
};

const getToken = async () => {
  const [API_URI, ALFA_ACCOUNT, PASSWORD_SYNC, USERNAME_SYNC, ALFA_DATABASE_ID] = await getApiConfig();

  const payload = {
    type: "s",
    username: USERNAME_SYNC.trim(), //"Administrador",
    alfaCustomerId: ALFA_ACCOUNT.trim(), //"112010001",
    databaseId: ALFA_DATABASE_ID, //1,
    password: PASSWORD_SYNC.trim(), //"1",
  };
  const dataToken = await Post("login", JSON.stringify(payload));
  if (dataToken.token != "" && dataToken.token != null && dataToken.token != undefined) {
    await Configuration.setConfigValue("TOKEN", dataToken.token.trim());
    return { status_code: 200, token: dataToken.token.trim() };
  } else {
    return errorResponse("Verifique los datos de conexión.");
  }
};

const buildUrl = (base, uri) => {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedUri = uri.startsWith("/") ? uri.slice(1) : uri;
  return `${normalizedBase}${normalizedUri}`;
};

const normalizeEndpoint = (uri) => {
  if (!uri) return "";
  return uri.startsWith("/") ? uri.slice(1) : uri;
};

const toggleTrailingSlash = (uri) => {
  if (!uri) return uri;
  return uri.endsWith("/") ? uri.slice(0, -1) : `${uri}/`;
};

export const Get = async (uri, token = "") => {
  const [API_URI] = await getApiConfig();

  try {
    let headers = {};
    if (token != "") {
      headers = {
        Authorization: `Bearer ${token}`,
      };
    } else {
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    }

    const endpoint = normalizeEndpoint(uri);
    const url = buildUrl(API_URI, endpoint);
    console.log("[API][GET]", url);
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    if (response.status === 404) {
      const alt = toggleTrailingSlash(endpoint);
      if (alt !== endpoint) {
        const altUrl = buildUrl(API_URI, alt);
        console.log("[API][GET][retry]", altUrl);
        const retry = await fetch(altUrl, { method: "GET", headers });
        const retryData = await retry.json();
        return retryData;
      }
    }

    return await response.json();
  } catch (error) {
    // console.log("ESTE ES EL ERROR " + error);
    return errorResponse(error);
  }
};

export const Post = async (uri, payload, token = "") => {
  const [API_URI] = await getApiConfig();

  try {
    let headers = {};

    if (token != "") {
      headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };
    } else {
      headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
    }

    const url = buildUrl(API_URI, uri);
    console.log("[API][POST]", url);
    const response = await fetch(url, {
      method: "POST",
      body: payload,
      headers: headers,
    });

    let data = await response.json();
    return data;
  } catch (error) {
    // console.log("ESTE ES EL ERROR POST : " + error);
    return errorResponse(error);
  }
};

const errorResponse = (message) => {
  return {
    error: true,
    status_code: 404,
    message: `Error : ${message}`,
    data: [],
  };
};
