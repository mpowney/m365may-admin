import * as React from "react";

import { Nav, INavLink } from "office-ui-fabric-react/lib/Nav";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";
import { LogFactory } from "../common/utils/InitLogger";
export interface INavigationProps {
}
export interface INavigationState {
    minimised: boolean;
}

export class Navigation extends React.Component<INavigationProps, INavigationState> {

    constructor(props: INavigationProps) {
        super(props);
        this.itemClick = this.itemClick.bind(this);
    }

    private itemClick(ev?: React.MouseEvent<HTMLElement, MouseEvent>, item?: INavLink): void {
        const log = LogFactory.getLogger("Navigation.tsx");

        log.debug(`itemClick() executed with event ${ev && ev.target}`);

        // if (item) { item.url && this.props.history.push(item.url); }
        // if (ev) { 
        //     ev.preventDefault(); 
        // }
    }

    render() {

        const styles = require("../assets/styles/components/Navigation.module.scss");

        const linkGroups = [
            {
                links: [{ key: "Home", name: "Home", url: "/", icon: "Home" }]
            },
            {
                links: [
                    { key: "Sessions", name: "Sessions", url: "/sessions", icon: "Group" },
                ]
            },
            {
                links: [
                    { key: "Nodes", name: "Nodes", url: "/nodes", icon: "World" },
                ]
            }
        ]

        const menuItems: IContextualMenuItem[] = [];
        linkGroups.forEach(group => { group.links.forEach(link => { menuItems.push({ key: link.key, text: link.name, href: link.url, iconName: link.icon })})});

        return (
            <div className={styles.navigation}>
                <Nav onLinkClick={this.itemClick}
                    className={styles.nav}
                    styles={{ root: { width: 280 }, groupContent: { marginBottom: 0 } }}
                    groups={linkGroups}
                />
                <DefaultButton iconProps={{iconName: 'GlobalNavButton'}} className={styles.menu} menuProps={{
                    shouldFocusOnMount: true,
                    items: menuItems,
                    isBeakVisible: false
                    }} />
            </div>
        );
    }
}

export default Navigation;
