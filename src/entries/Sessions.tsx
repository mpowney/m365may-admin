import * as React from "react";
import DocumentMeta from "react-document-meta";

import { CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { Modal, IDragOptions } from "office-ui-fabric-react/lib/Modal";
import { IColumn, SelectionMode, DetailsListLayoutMode, DetailsList, Selection } from "office-ui-fabric-react/lib/DetailsList";
import { IconButton } from "office-ui-fabric-react/lib/Button";
import { ContextualMenu } from "office-ui-fabric-react/lib/ContextualMenu";
import { MarqueeSelection } from "office-ui-fabric-react/lib/MarqueeSelection";

import ReactShortcut from 'react-shortcut';

import Navigation from "../components/Navigation";
import Header from "../components/Header";
import { LogFactory } from "../common/utils/InitLogger";
import SessionsColumns from "../components/SessionsColumns";
import ISortingInformation from "../common/utils/ISortingInformation";
import { IUser } from "../App";
import ApiHelper from "../common/utils/ApiHelper";
import { AddSession } from "../components/AddSession";

const log = LogFactory.getLogger("Sessions.tsx");
const styles = require("../assets/styles/entries/Sessions.module.scss");
const meta = {
    title: "Sessions",
    description: "",
    meta: {
        charset: "utf-8",
        name: {
            keywords: "Sessions"
        }
    }
};

export interface ISession {
    timestamp?: Date;
    partitionKey?: string;
    title: string;
    description: string;
    speakers: any[];
    rowKey: string;
    redirectTo?: string;
    videoLink?: string;
    startRedirectingMinutes?: number;
    clickCount?: number;
    geoCount?: any;
    startsAt?: Date;
    endsAt?: Date;
    calendarClickCount?: number;
    videoClickCount?: number;
}

interface ISessionsProps {
    user: IUser;
}
interface ISessionsPersistedState {
    SessionsSorting: ISortingInformation[];
    SessionsSearch: string;
}
interface ISessionsState extends ISessionsPersistedState {
    SessionsLoading: boolean;
    showSession?: ISession;
    RedirectsSourceData: ISession[];
    SessionsSourceData: ISession[];
    SessionsSearchData?: ISession[];
    isSessionModalOpen: boolean;
    numberOfSessionsSelected: number;
    filterText: string;
}

const dummySession: ISession = {
    timestamp: new Date(),
    partitionKey: "dummy",
    rowKey: "dummy",
    redirectTo: "dummy",
    title: "dummy",
    description: "dummy",
    speakers: [],
    startsAt: new Date(),
    endsAt: new Date()
};

export default class SessionsEntry extends React.Component<ISessionsProps, ISessionsState> {
    static STORE_CLASSES = [];
    private _selection: Selection;
    
    constructor(props: ISessionsProps) {
        super(props);

        this.sessionsColumnClick = this.sessionsColumnClick.bind(this);
        this.dismissSessionPanel = this.dismissSessionPanel.bind(this);
        this.sessionClick = this.sessionClick.bind(this);
        this.sessionActive = this.sessionActive.bind(this);
        this.closeAddModalClick = this.closeAddModalClick.bind(this);
        this.addButtonClick = this.addButtonClick.bind(this);
        this.refreshButtonClick = this.refreshButtonClick.bind(this);
        this.initSessions = this.initSessions.bind(this);
        this.deleteSessions = this.deleteSessions.bind(this);
        this.restoreSessions = this.restoreSessions.bind(this);
        this.searchBoxChange = this.searchBoxChange.bind(this);

        this.state = {
            isSessionModalOpen: false,
            numberOfSessionsSelected: 0,
            SessionsSorting: [ { fieldName: 'startsAt', isSorted: true, isSortedDescending: false } ],
            SessionsLoading: true,
            SessionsSearch: '',
            filterText: '',
            showSession: undefined,
            SessionsSourceData: [
                { ...dummySession, rowKey: 'dummy1' }, { ...dummySession, rowKey: 'dummy2' }, { ...dummySession, rowKey: 'dummy3' }, { ...dummySession, rowKey: 'dummy4' }, { ...dummySession, rowKey: 'dummy5' }
            ],
            RedirectsSourceData: [
                { ...dummySession, rowKey: 'dummy1' }, { ...dummySession, rowKey: 'dummy2' }, { ...dummySession, rowKey: 'dummy3' }, { ...dummySession, rowKey: 'dummy4' }, { ...dummySession, rowKey: 'dummy5' }
            ]
        };

        this._selection = new Selection({
            onSelectionChanged: () => this.setState({ numberOfSessionsSelected: this._selection.getSelectedCount() }),
        });
    
    
    }

    private _getKey(item: ISession/* , index?: number*/): string {
        // log.debug(`_getKey() executed with item ${JSON.stringify(item)} and index ${index}`);
        return item.rowKey;
    }

    private renderSearchBox() {
        return (<SearchBox
            styles={{ root: { marginTop: 4, width: 180 } }}
            placeholder="Filter"
            onSearch={(newValue: any) => {this.searchBoxChange(undefined, newValue)}}
            onFocus={() => log.debug("Search onFocus called")}
            onBlur={() => log.debug("Search onBlur called")}
            onChange={this.searchBoxChange}
          />);
    }

    searchBoxChange(event?: React.ChangeEvent<HTMLInputElement> | undefined, newValue?: string | undefined) {
        this.setState({
            filterText: newValue || ''
        });
    }

    private sessionsColumnClick = (
        ev: React.MouseEvent<HTMLElement>,
        column: IColumn
    ): void => {
        log.debug(
            `sessionsColumnClick() executed with column ${JSON.stringify(
                column
            )}, event target ${JSON.stringify(ev.pageY)}`
        );

        const currentSorting: ISortingInformation[] = this.state.SessionsSorting;
        let newSorting: (ISortingInformation | undefined)[] = [];
        if (
            currentSorting.filter(currentSort => {
                return currentSort.fieldName === column.fieldName;
            }).length > 0
        ) {
            newSorting = currentSorting.map(currentSortingColumn => {
                if (currentSortingColumn.fieldName === column.fieldName) {
                    if (currentSortingColumn.isSortedDescending) {
                        return undefined;
                    } else {
                        return {
                            fieldName: currentSortingColumn.fieldName,
                            isSorted: true,
                            isSortedDescending: !currentSortingColumn.isSortedDescending
                        };
                    }
                } else {
                    return currentSortingColumn;
                }
            });
        } else if (column.fieldName !== undefined) {
            newSorting.push({
                fieldName: column.fieldName,
                isSorted: true,
                isSortedDescending: false
            });
        }

        this.setState({
            SessionsSorting: newSorting.filter(sort => {
                return sort !== undefined;
            }) as ISortingInformation[]
        });
    };

    dismissSessionPanel() {
        this.setState({
            showSession: undefined
        });
    }

    sessionClick(item: ISession) {
        this.setState({
            showSession: item,
            isSessionModalOpen: true
        });
    }

    sessionActive(item?: ISession, index?: number | undefined, ev?: React.FocusEvent<HTMLElement> | undefined) {
        log.debug(`${JSON.stringify(this._selection)}`)
    }

    componentDidMount() {

        this.initSessions();

    }

    async initSessions() {

        if (this.props.user) {

            log.debug(`User logged in, calling API`);
            try {

                this.setState({
                    SessionsLoading: true
                });
                
                const dataPromises = [ApiHelper.get(`/_api/v1/redirects`, true), ApiHelper.get(`/data/sessions`, true)]
                
                const data = await Promise.all(dataPromises);
                const combinedSessions = data[1][0].sessions.map((session: any) => {
                    const redirects = data[0].filter((redirect: any) => { return redirect.rowKey === session.id});
                    if (redirects.length > 0) {
                        return {
                            rowKey: redirects[0].rowKey,
                            redirectTo: redirects[0].redirectTo,
                            videoLink: redirects[0].videoLink,
                            startRedirectingMinutes: redirects[0].startRedirectingMinutes,
                            clickCount: redirects[0].clickCount,
                            calendarClickCount: redirects[0].calendarClickCount,
                            videoClickCount: redirects[0].videoClickCount,
                            title: session.title,
                            speakers: session.speakers.map((speaker: any) => { return speaker.name; }).join(", "),
                            startsAt: session.startsAt,
                            endsAt: session.endsAt
                        };
                    }
                    else {
                        return {
                            rowKey: session.id,
                            title: session.title,
                            speakers: session.speakers.map((speaker: any) => { return speaker.name; }).join(", "),
                            startsAt: session.startsAt,
                            endsAt: session.endsAt
                        };
                    }
                });

                this.setState({
                    SessionsLoading: false,
                    SessionsSourceData: combinedSessions
                });
    
            }
            catch (err) {
                log.error(`${JSON.stringify(err)}`);
                this.setState({
                    SessionsLoading: false,
                    SessionsSourceData: []
                });
            }
        }
        else {

            log.debug(`User not logged in`);
            this.setState({
                SessionsLoading: false,
                SessionsSourceData: []
            });
        }

    };

    refreshButtonClick() {
        this.initSessions();
    }

    addButtonClick() {
        this.setState({
            isSessionModalOpen: true,
            showSession: undefined
        });
    }

    closeAddModalClick() {
        this.setState({
            isSessionModalOpen: false
        });
    }

    deleteSessions() {
        const items = this._selection.getSelectedIndices().map(index => { return this._selection.getItems()[index]});
        log.debug(`deleteSessions() ${JSON.stringify(items)}`);
        const promises = items.map(Session => { return ApiHelper.delete(`/_api/v1/redirect/${(Session as ISession).rowKey}`, true); });

        if (promises.length > 0) {
            this.performPromiseActions(promises);
        }
    }

    restoreSessions() {
        const items = this._selection.getSelectedIndices().map(index => { return this._selection.getItems()[index]});
        log.debug(`restoreSessions() ${JSON.stringify(items)}`);
        const promises = items.map(Session => { return ApiHelper.patch(`/_api/v1/redirect/${(Session as ISession).rowKey}`, { recycled: false }, true); });

        if (promises.length > 0) {
            this.performPromiseActions(promises);
        }
    }

    async performPromiseActions(promises: Promise<void>[]) {
        await Promise.all(promises);
        this.initSessions();
    }

    applySorting(items: any, sorting: ISortingInformation[]) {
        let returnItems = [...(items || [])];
        log.debug(`applySorting with options: ${JSON.stringify(sorting)}`);
        for (const sortOption of sorting) {
            returnItems.sort((a, b) => {
                if (sortOption.isSortedDescending) {
                    if (a[sortOption.fieldName] > b[sortOption.fieldName]) {
                        return -1;
                    }
                    if (a[sortOption.fieldName] < b[sortOption.fieldName]) {
                        return 1;
                    }
                    return 0;
                } else {
                    if (a[sortOption.fieldName] < b[sortOption.fieldName]) {
                        return -1;
                    }
                    if (a[sortOption.fieldName] > b[sortOption.fieldName]) {
                        return 1;
                    }
                    return 0;
                }
            });
        }
        return returnItems;
    }

    render() {

        const commandBarItems = [];
        // commandBarItems.push({
        //     key: "addSession",
        //     text: "Add a Session",
        //     iconProps: { iconName: "AddLink" },
        //     onClick: this.addButtonClick
        // });
        commandBarItems.push({
            key: "refresh",
            text: "Refresh",
            iconProps: { iconName: "Refresh" },
            onClick: this.refreshButtonClick
        });
        // commandBarItems.push({
        //     key: "recycleSession",
        //     text: `Remove`,
        //     iconProps: { iconName: "RecycleBin" },
        //     disabled: this.state.numberOfSessionsSelected === 0,
        //     onClick: this.deleteSessions
        // });
        commandBarItems.push(            {
            key: "searchBox",
            onRender: this.renderSearchBox.bind(this)
        });


        const commandBarFarItems: any[] = [
        ];

        const dragOptions: IDragOptions = {
            moveMenuItemText: 'Move',
            closeMenuItemText: 'Close',
            menu: ContextualMenu,
        };

        const iconButtonStyles = {
            root: {
                // color: theme.palette.neutralPrimary,
                marginLeft: 'auto',
                marginTop: '4px',
                marginRight: '2px',
            },
            rootHovered: {
                // color: theme.palette.neutralDark,
            },
        };

        const columns = new SessionsColumns();
        // const items = this.state.SessionsSourceData;

        let items = this.applySorting(
            (this.state.SessionsSearchData || this.state.SessionsSourceData),
            this.state.SessionsSorting
        );

        if (this.state.filterText.length > 0) {
            items = items.filter((item: ISession) => { 
                return `${(item.title || '').toLocaleLowerCase()} ${(item.description || '').toLocaleLowerCase()} ${item.rowKey} ${item.speakers.toString().toLocaleLowerCase()}`.indexOf(this.state.filterText.toLocaleLowerCase()) > -1 });
        }

        return (
            <>
                <Navigation />
                <main id={`viewport`} className={styles.sessions}>
                    <ReactShortcut
                        keys={[`Ctrl+A`]}
                        onKeysPressed={this.addButtonClick}/>
                    <ReactShortcut
                        keys={[`Ctrl+R`]}
                        onKeysPressed={this.refreshButtonClick}/>
                    <DocumentMeta {...meta} />
                    <Header />
                    <h1>{`All sessions`}</h1>
                    <CommandBar styles={{ root: { padding: 0 } }}
                        items={commandBarItems}
                        farItems={commandBarFarItems} />

                    <MarqueeSelection isEnabled={!this.state.isSessionModalOpen} selection={this._selection}>
                        <DetailsList
                            items={items}
                            compact={false}
                            columns={columns.Columns(
                                this.sessionsColumnClick,
                                this.state.SessionsSorting,
                                this.state.SessionsLoading
                            )}
                            selectionMode={SelectionMode.multiple}
                            getKey={this._getKey}
                            setKey="multiple"
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            isHeaderVisible
                            selection={this._selection}
                            selectionPreservedOnEmptyClick
                            onItemInvoked={this.sessionClick}
                            enterModalSelectionOnTouch
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="Row checkbox"
                        />
                    </MarqueeSelection>

                    <Modal
                        titleAriaId={`modalHeader`}
                        isOpen={this.state.isSessionModalOpen}
                        onDismiss={this.closeAddModalClick}
                        isBlocking={false}
                        containerClassName={styles.modalContainer}
                        dragOptions={dragOptions}
                    >
                        <div className={styles.modalHeader}>
                            <IconButton
                                styles={iconButtonStyles}
                                iconProps={ { iconName: 'Cancel' } }
                                ariaLabel="Close popup modal"
                                onClick={this.closeAddModalClick}
                            />
                        </div>
                        <div className={styles.modalBody}>
                            <AddSession 
                                rowKey={this.state.showSession?.rowKey}
                                dismissClick={this.closeAddModalClick} 
                                user={this.props.user} 
                                refreshCallback={this.initSessions} />
                        </div>
                    </Modal>



                </main>
            </>
        );
    }
}
