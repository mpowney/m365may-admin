import * as React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import "office-ui-fabric-core/dist/css/fabric.min.css";

import ApiHelper from "./common/utils/ApiHelper";
import routes from "./routes";

import theme from "./assets/styles/theme";
import TopBar from "./components/TopBar";
import { Customizations } from "@uifabric/utilities";
import { LogFactory } from "./common/utils/InitLogger";
import { Modal } from "office-ui-fabric-react/lib/Modal";
import { PrimaryButton } from "office-ui-fabric-react/lib/Button";

require("./assets/styles/global.scss");

const styles = require("./assets/styles/app.module.scss");
const log = LogFactory.getLogger("app.tsx");

export const PACKAGE_NAME = "M365 May Live Sessions";
export const TENANT_NAME = process.env.REACT_APP_API_TENANT_NAME;
export const TENANT_ID = process.env.REACT_APP_API_TENANT_ID;
export const CLIENT_ID = process.env.REACT_APP_API_CLIENT_ID;

export const Routes = routes;

export interface IUser {
    loginName: string;
    displayName: string;
}

export interface IAppProps {}
export interface IAppState {
    userLoggedIn: boolean;
    loginModalOpen: boolean;
    loginModalRecover: boolean;
    user: IUser | null;
}

// Browser App entry
export default class App extends React.Component<IAppProps, IAppState> {

    private apiHelper: ApiHelper;

    constructor(props: IAppProps) {

        super(props);

        this.state = {
            userLoggedIn: false,
            loginModalOpen: false,
            loginModalRecover: false,
            user: null
        };
        
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.hideLoginModal = this.hideLoginModal.bind(this);
        this.renewAccessToken = this.renewAccessToken.bind(this);

        this.init().then(() => {
            this.initLogin();
        });

        this.apiHelper = new ApiHelper();

    }

    public async init() {

        if (!!!this.apiHelper?.getAccount()) {
            this.setState({
                loginModalOpen: true
            });
        }

    }

    public async handleLogin() {

        log.debug(`handleLogin() executing`);

        try {
            if (this.apiHelper.getAccount() == null || this.state.loginModalRecover) {
                const loginResponse = await this.apiHelper.loginPopup();
                log.debug(`loginResponse: ${JSON.stringify(loginResponse)}`);
            }

            await this.initLogin();

        } catch (err) {
            log.error(`Error occurred during loginPopup: ${err}`);
        }
    
    }

    public async initLogin() {

        if (await this.apiHelper.getAccount()) {

            this.setState({
                userLoggedIn: true,
                user: { 
                    loginName: (await this.apiHelper.getAccount())?.userName || '', 
                    displayName: (await this.apiHelper.getAccount())?.name || '',
                },
                loginModalOpen: false,
                loginModalRecover: false
            });

        }
        else {
            this.setState({
                loginModalRecover: true
            });
        }
    }

    public renewAccessToken() {
        this.initLogin();
    }

    public async handleLogout() {
        this.apiHelper.logout();
    }

    public hideLoginModal() {
        this.setState({
            loginModalOpen: false,
            loginModalRecover: false
        })
    }

    render() {
        Customizations.applySettings({ theme: theme });
        initializeIcons();

        const renderMergedProps = (component: any, ...rest: any[]) => {
            const finalProps = Object.assign({}, ...rest, { user: this.state.user });
            return React.createElement(component, finalProps);
        };

        const PropsRoute = ({ component, ...rest }: any) => {
            return (
                <Route
                    {...rest}
                    render={(routeProps: any) => {
                        return renderMergedProps(component, routeProps, rest);
                    }}
                />
            );
        };

        return (
            <>
                <TopBar userLoggedIn={this.state.userLoggedIn} user={this.state.user} loginHandler={this.handleLogin} logoutHandler={this.handleLogout} />
                <div id={`appContainer`} className={styles.appContainer}>
                    <BrowserRouter>
                        <Switch>
                            {routes.map((route: any, index: any) =>
                                route.redirect ? (
                                    <Route key={index} exact={!!route.exact} path={route.path}>
                                        <Redirect key={index} from={route.path} to={route.redirect} />
                                    </Route>
                                ) : (
                                    <PropsRoute
                                        key={index}
                                        exact={!!route.exact}
                                        path={route.path}
                                        component={route.component}
                                    />
                                )
                            )}
                        </Switch>
                    </BrowserRouter>
                </div>
                <Modal
                    isOpen={this.state.loginModalOpen || this.state.loginModalRecover}
                    onDismiss={this.hideLoginModal}
                    isBlocking={true}>
                        <div className={styles.loginModalContainer}>
                            <h1>Sign in to {PACKAGE_NAME}</h1>
                            <p>To use this service you must first sign in</p>
                            <PrimaryButton text={`Sign in`} onClick={this.handleLogin} />
                        </div>
                </Modal>

            </>
        );
    }
}
