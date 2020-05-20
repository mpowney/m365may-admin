exports.IS_NODE =
    typeof global !== "undefined" && {}.toString.call(global) === "[object global]";

exports.IS_PROD = window.location.hostname === "redirectapiaustraliase.z26.web.core.windows.net" || window.location.hostname === "admin.pown.ee"; // process.env.NODE_ENV === "production";

// CDN or Local assets url
exports.PUBLIC_ASSETS_URL = exports.IS_PROD ? "/assets/" : "/assets/";
exports.API_BASE = exports.IS_PROD ? "https://redirect-api-australiasoutheast.azurewebsites.net" : "https://redirect-api-australiasoutheast.azurewebsites.net";
exports.DEV_HOST = "localhost";

exports.DEV_PORT = 7000;
