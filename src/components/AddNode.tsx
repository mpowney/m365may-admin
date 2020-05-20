import * as React from "react";

import { LogFactory } from "../common/utils/InitLogger";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";

import ApiHelper from "../common/utils/ApiHelper";
import { IUser } from "../App";
import { IDomain } from "../entries/Nodes";

const styles = require("../assets/styles/components/AddNode.module.scss");
const log = LogFactory.getLogger("AddNode.tsx");

interface IAddDomainProps {
    user: IUser;
    dismissClick: any;
    refreshCallback: any;
    rowKey?: string;
}
interface IAddDomainState {
    domain?: IDomain;
    domainName: string;
    isLoading: boolean;
    editMode: boolean;
}

export class AddDomain extends React.Component<IAddDomainProps, IAddDomainState> {

    constructor(props: IAddDomainProps) {
        super(props);

        this.state = {
            domainName: '',
            isLoading: false,
            editMode: false
        }

        this.addClick = this.addClick.bind(this);
        this.cancelClick = this.cancelClick.bind(this);
        // this.saveClick = this.saveClick.bind(this);

    }

    componentDidMount() {
        this.init();
    }

    async init() {
        if (this.props.rowKey) {
            this.setState({
                isLoading: true
            });
            const response = await ApiHelper.get(`/_api/v1/domain/${this.props.rowKey}`, true);
            log.debug(`init() response from api get ${JSON.stringify(response)}`)
            this.setState({
                domain: response,
                domainName: response.rowKey,
                editMode: true,
                isLoading: false
            });
        }
        
    }

    updateState(event: React.FormEvent, variable: string, value?: string) {
        log.info(
            `updateState() executing from element [${event.target}] with variable [${variable}]`
        );
        const updateState: any = { };
        updateState[variable] = value || "";
        this.setState(updateState);
    }

    async addClick() {

        log.info(`addClick() executing`);

        this.setState({
            isLoading: true
        });
        
        let domainExists: boolean = false;
        try {
            const existingDomain = await ApiHelper.get(`/_api/v1/domain/${this.state.domainName}`, true).catch();
            if (existingDomain) domainExists = true;
        }
        catch {}

        if (domainExists) {
            this.setState({
                isLoading: false
            });
        }
        else {

            try {

                await ApiHelper.post(`/_api/v1/domain`, {
                    rowKey: this.state.domainName
                }, true);
                await this.props.refreshCallback();

            }
            catch {

                this.setState({
                    isLoading: false
                });
            }

            this.setState({
                isLoading: false
            })
        }

    }

    // async saveClick() {

    //     await ApiHelper.patch(`/_api/v1/domain/${this.state.domainName}`, {
    //         configured: this.state.
    //     }, true);
    //     this.setState({
    //         hasGenerated: true
    //     });
    //     await this.props.refreshCallback();
    //     this.props.dismissClick();

    // }

    cancelClick() {
        log.info(`cancelClick() executing`);
        this.props.dismissClick();
    }

    render() {

        return (
            <div className={styles.addDomain}>
            
                <h2 id={`modalHeader`}>{this.state.isLoading ? `Loading...` : this.state.editMode ? `Edit a domain` : `Add a domain`}</h2>
                <TextField value={this.state.domainName} label={`Domain`} disabled={this.state.isLoading} placeholder={`Enter the domain host name`} className={styles.DomainField} onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => this.updateState(event, `domainName`, value) } />

                <div className={styles.buttonContainer}>
                    <PrimaryButton text={`Add`} onClick={this.addClick} className={styles.addButton} />
                    {/* { this.state.editMode ? 
                        <PrimaryButton text={`Save`} onClick={this.saveClick} className={styles.generateButton} disabled={!generateButtonActive} />
                        :
                        <PrimaryButton text={`Add`} onClick={this.addClick} className={styles.generateButton} disabled={!generateButtonActive} />
                    } */}
                    <DefaultButton text={`Cancel`} onClick={this.cancelClick} className={styles.cancelButton} />
                </div>
            </div>
        );
    }
}
