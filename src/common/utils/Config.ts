import { LogFactory } from "./InitLogger";
import { TENANT_ID, CLIENT_ID, TENANT_NAME } from "../../App";

const log = LogFactory.getLogger("Config.ts");

export default class Config {

    constructor(appUrl?: string) {

        if (!appUrl && window) {
            appUrl = `${window.location.protocol}//${window.location.hostname}`;
        }

        if (!appUrl) {
            log.error(`App url not provided, config not available`);
        }

    }

    public async get(setting: string): Promise<string | null> {

        // Temporary implementation until a config store is developed
        switch (setting.toLowerCase()) {
            case 'aad tenant name': return `${TENANT_NAME}`;
            case 'aad tenant id': return `${TENANT_ID}`;
            case 'aad application client id': return `${CLIENT_ID}`;
        }

        return null;

    }

}