import * as React from "react";
import { TextField } from "office-ui-fabric-react/lib/TextField";

import { ISession } from "./Sessions";
import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
import ApiHelper from "../common/utils/ApiHelper";
import { IUser } from "../App";
import { LogFactory } from "../common/utils/InitLogger";

const log = LogFactory.getLogger("Session.tsx");

// const styles = require("../assets/styles/entries/Session.module.scss");
// const meta = {
//     title: "Session",
//     description: "",
//     meta: {
//         charset: "utf-8",
//         name: {
//             keywords: "Session"
//         }
//     }
// };

interface ISessionProps {
    user: IUser;
    Session: ISession | undefined;
}
interface ISessionState {
    editMode: boolean;
    Session: ISession | undefined;
    originalSession: ISession | undefined;
}

export default class UserEntry extends React.Component<ISessionProps, ISessionState> {
    static STORE_CLASSES = [];

    constructor(props: ISessionProps) {
        super(props);

        this.state = {
            editMode: false,
            Session: this.props.Session,
            originalSession: this.props.Session ? JSON.parse(JSON.stringify(this.props.Session)) : undefined
        };

        this.editButtonClick = this.editButtonClick.bind(this);
        this.saveButtonClick = this.saveButtonClick.bind(this);
        this.cancelButtonClick = this.cancelButtonClick.bind(this);
    }

    editButtonClick() {
        this.setState({
            editMode: true
        });
    }

    async saveButtonClick() {
        log.debug(`User logged in, calling API`);
        await ApiHelper.patch(`/_api/v1/redirect`, this.state.Session, true);
        this.setState({
            originalSession: JSON.parse(JSON.stringify(this.state.Session)),
            editMode: false
        });
    }

    cancelButtonClick() {
        this.setState({
            Session: JSON.parse(JSON.stringify(this.state.originalSession))
        });
    }

    updateState(event: React.FormEvent, variable: string, value?: string) {
        log.info(
            `updateState() executing from element [${event.target}] with variable [${variable}]`
        );
        const updateState: any = { Session: this.state.Session };
        updateState.Session[variable] = value || "";
        this.setState(updateState);
    }

    render() {
        return (
            this.state.Session &&
            <>
                <TextField label="Short name" defaultValue={this.state.Session.rowKey} readOnly={true} />
                <TextField label="Redirect to" 
                        onChange={(event: React.FormEvent, value?: string) =>
                            this.updateState(event, `redirectTo`, value)
                        }
                        defaultValue={this.state.Session.redirectTo} 
                        readOnly={!this.state.editMode} />

                {!this.state.editMode ? <DefaultButton text={`Edit`} onClick={this.editButtonClick} />
                : <>
                    <PrimaryButton text={`Save`} onClick={this.saveButtonClick} />
                    <DefaultButton text={`Cancel`} onClick={this.cancelButtonClick} />
                </>}
            </>
        );
    }
}
