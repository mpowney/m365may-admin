import * as Msal from "msal";
import axios from "axios";

import Config from "./Config";
import { LogFactory } from "./InitLogger";

const log = LogFactory.getLogger("ApiHelper.ts");

export default class ApiHelper {

    private accessTokenTimeout: number = 0;
    private msalConfig: any;
    private static msalLoginRequest: any = {
        // scopes: ['User.ReadWrite.All'] // optional Array<string>
        // scopes: ['openid', 'profile', 'email']
        scopes: [`${process.env.REACT_APP_API_BASE}/user_impersonation`]
    };

;
    private msalInstance: Msal.UserAgentApplication | undefined = undefined;

    public constructor() {
        this.init();
    }

    public async init() {

        const config = new Config();

        this.msalConfig = {
            auth: {
                clientId: `${await config.get(`AAD Application Client ID`)}`,
                authority: `https://login.windows.net/${await config.get(`AAD Tenant ID`)}`,
                postLogoutRedirectUri: `${window.location.protocol}//${window.location.host}`,
                // redirectUri: `https://redirect-api-ause.azurewebsites.net/_api/v1/test`,
                // redirectUri: `${window.location.href}`,
                redirectUri: `${window.location.protocol}//${window.location.host}`,
                // validateAuthority: false
            }
        };

        if (!this.msalInstance) {
            if ((window as any).apiMsalInstance) {
                this.msalInstance = (window as any).apiMsalInstance;
            }
            else {
                this.msalInstance = new Msal.UserAgentApplication(this.msalConfig);
                (window as any).apiMsalInstance = this.msalInstance;
            }
        }

        if (this.msalInstance) {

            this.msalInstance.handleRedirectCallback((error: any, response: any) => {
                // handle redirect response or error
                if (error) {
                    log.error(error.errorMessage);
                } else if (response) {
                    log.debug(`Response from MSAL: ${response.account}`);
                }
            });
        
        }
    }

    public static async acquireTokenSilent() {
        if (ApiHelper.msalInstance) {
            return ApiHelper.msalInstance().acquireTokenSilent(ApiHelper.msalLoginRequest);
        }
        return undefined;
    }

    public static msalInstance(): Msal.UserAgentApplication {
        return (window as any).apiMsalInstance;
    }

    public static renewAccessToken() {
        (window as any).apiMsalTokenTimeout = null;
        ApiHelper.ensureRefresh();
    }

    public async getAccount(): Promise<Msal.Account | undefined> {
        if (!this.msalInstance) {
            await this.init();
        }
        if (this.msalInstance) {
            return await this.msalInstance.getAccount();
        }
        return undefined;
    }

    public async loginPopup() {
        if (!this.msalInstance) {
            this.init();
        }
        if (this.msalInstance) {
            return this.msalInstance.loginPopup(ApiHelper.msalLoginRequest);
        }
        return undefined;
    }

    public async logout() {
        if (this.msalInstance) {

            this.msalInstance.logout();

        }
    }

    public static async ensureRefresh() {

        if (ApiHelper.msalInstance().getAccount()) {
            const { DateTime } = require("luxon");
            const diffDuration = DateTime.fromJSDate((await ApiHelper.acquireTokenSilent())?.expiresOn).diff(DateTime.local(), "seconds");
            log.debug(`render() accessTokenExpires diff ${JSON.stringify(diffDuration.seconds)}`);
            window.clearTimeout((window as any).apiMsalTokenTimeout);
            (window as any).apiMsalTokenTimeout = window.setTimeout(ApiHelper.renewAccessToken, diffDuration.seconds * 1000);
        }

    }


    public static async get(api: string, withAuthentication: boolean): Promise<any> {

        let accessToken: string | null = null;
        if (withAuthentication) {
            accessToken = (await ApiHelper.acquireTokenSilent())?.accessToken || null
            
        }

        log.info(`Calling API ${api}${accessToken && ` with bearer token`}`);

        const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
        const response = await axios.get(`${process.env.REACT_APP_API_BASE}${api}`, config);
        return response.data;

    }

    public static async post(api: string, payload: any, withAuthentication: boolean): Promise<any> {

        let accessToken: string | null = null;
        if (withAuthentication) {
            accessToken = (await ApiHelper.acquireTokenSilent())?.accessToken || null
            
        }

        log.info(`Calling API ${api}${accessToken && ` with bearer token`}`);

        const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
        await axios.post(`${process.env.REACT_APP_API_BASE}${api}`, payload, config);
        return true;

    }

    public static async patch(api: string, payload: any, withAuthentication: boolean): Promise<any> {

        let accessToken: string | null = null;
        if (withAuthentication) {
            accessToken = (await ApiHelper.acquireTokenSilent())?.accessToken || null
            
        }

        log.info(`Calling API ${api}${accessToken && ` with bearer token`}`);

        const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
        await axios.patch(`${process.env.REACT_APP_API_BASE}${api}`, payload, config);
        return true;

    }

    public static async delete(api: string, withAuthentication: boolean): Promise<any> {

        let accessToken: string | null = null;
        if (withAuthentication) {
            accessToken = (await ApiHelper.acquireTokenSilent())?.accessToken || null
            
        }

        log.info(`Calling API ${api}${accessToken && ` with bearer token`}`);

        const config = accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
        await axios.delete(`${process.env.REACT_APP_API_BASE}${api}`, config);
        return true;

    }

    // public static async executeWithAuth(promise: Promise<any>): Promise< any> {
    //     return promise.catch(err => {
    //         if (err.status === 401) {

    //         }
    //     });
    // }


}