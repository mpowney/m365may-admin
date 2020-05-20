import * as React from "react";
import { IconButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
import { Panel } from "office-ui-fabric-react/lib/Panel";

import { LogFactory } from "../common/utils/InitLogger";
import { IUser, PACKAGE_NAME } from "../App";

const log = LogFactory.getLogger("TopBar.tsx");

interface ITopBarProps {
    userLoggedIn: boolean;
    user: IUser | null;
    loginHandler: any;
    logoutHandler: any;
}
interface ITopBarState {
    expanded: boolean;
}

export class TopBar extends React.Component<ITopBarProps, ITopBarState> {
    static STORE_CLASSES = [];

    constructor(props: ITopBarProps) {
        super(props);

        this.userButtonClick = this.userButtonClick.bind(this);
        this.dismissPanelClick = this.dismissPanelClick.bind(this);
        this.startLogin = this.startLogin.bind(this);
        this.logout = this.logout.bind(this);

        this.state = {
            expanded: false
        };

    }

    private userButtonClick() {
        log.debug(`userButtonClick() executing`);
        this.setState({
            expanded: true
        });
    }

    private dismissPanelClick() {
        log.debug(`dismissPanelClick() executing`);
        this.setState({
            expanded: false
        });
    }

    private startLogin() {
        log.debug(`startLogin() executing`);
        this.props.loginHandler();

    }

    private logout() {
        log.debug(`logout() executing`);
        this.props.logoutHandler();

    }

    render() {
        const styles = require("../assets/styles/components/TopBar.module.scss");

        log.debug(`render() executing: ${JSON.stringify(styles)}}`);

        return (
            <div className={`${styles.topBar}`}>
                <div className={`${styles.accountButton}`}>
                    <IconButton
                        onClick={this.userButtonClick}
                        iconProps={{ iconName: this.props.userLoggedIn ? `UserFollowed` : `UserOptional` }}
                        styles={{ root: { width: 50, height: 50, color: "#fff" }, icon: { fontSize: 24 } }} />

                    <Panel
                        headerText={this.props.userLoggedIn ? `Signed in to ${PACKAGE_NAME}` : `Sign in to ${PACKAGE_NAME}`}
                        isOpen={this.state.expanded}
                        onDismiss={this.dismissPanelClick}
                        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
                        closeButtonAriaLabel="Close">

                        {this.props.userLoggedIn && this.props.user ?
                            <>
                                <p>
                                    {this.props.user.displayName}<br/>
                                    {this.props.user.loginName}<br/>
                                </p>
                                <PrimaryButton
                                    text={`Sign out`}
                                    onClick={this.logout} />
                            </>
                        :
                            <>
                                <p>To continue, please login to {PACKAGE_NAME}</p>
                                <PrimaryButton
                                    text={`Sign in`}
                                    onClick={this.startLogin} />
                            </>
                        }

                    </Panel>

                </div>
            </div>
        );
    }
}

export default TopBar;
