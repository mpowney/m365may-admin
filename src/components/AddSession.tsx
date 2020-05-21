import * as React from "react";

import { LogFactory } from "../common/utils/InitLogger";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { PrimaryButton, DefaultButton } from "office-ui-fabric-react/lib/Button";
import { Slider } from 'office-ui-fabric-react/lib/Slider';

import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
  
  
import ApiHelper from "../common/utils/ApiHelper";
import { IUser } from "../App";
import { ISession } from "../entries/Sessions";

const styles = require("../assets/styles/components/AddSession.module.scss");
const log = LogFactory.getLogger("AddSession.tsx");

interface IAddSessionProps {
    user: IUser;
    dismissClick: any;
    refreshCallback: any;
    rowKey?: string;
}
interface IAddSessionState {
    session?: ISession;
    redirectTo: string;
    videoLink: string;
    startRedirectingMinutes: number;
    hasRedirect: boolean;
    generateError: boolean;
    isLoading: boolean;
    editMode: boolean;
    statsExpanded: boolean;
    statsMarkers: any;
}

export class AddSession extends React.Component<IAddSessionProps, IAddSessionState> {

    private urlRef: any;

    constructor(props: IAddSessionProps) {
        super(props);

        this.urlRef = React.createRef();

        this.state = {
            redirectTo: '',
            videoLink: '',
            startRedirectingMinutes: -10,
            hasRedirect: false,
            generateError: false,
            isLoading: false,
            editMode: false,
            statsExpanded: false,
            statsMarkers: null
        }

        this.cancelClick = this.cancelClick.bind(this);
        this.saveClick = this.saveClick.bind(this);
        this.checkForEnterKey = this.checkForEnterKey.bind(this);
        this.statsClick = this.statsClick.bind(this);

    }

    componentDidMount() {
        this.init();
        this.urlRef.current.focus();
    }

    async init() {
        if (this.props.rowKey) {
            this.setState({
                isLoading: true
            });
            const sessionResponse = await ApiHelper.get(`/calendar/session/${this.props.rowKey}?noTrack`, false);
            log.debug(`init() response from session api get ${JSON.stringify(sessionResponse)}`)
            this.setState({
                session: {
                    speakers: (sessionResponse.speakers as any[]),
                    rowKey: sessionResponse.id,
                    title: sessionResponse.title,
                    description: sessionResponse.description
                },
                editMode: true,
            });

            try {

                const response = await ApiHelper.get(`/_api/v1/redirect/${this.props.rowKey}`, true);
                log.debug(`init() response from redirect api get ${JSON.stringify(response)}`)
                this.setState({
                    redirectTo: response.redirectTo,
                    videoLink: response.videoLink,
                    hasRedirect: true,
                    editMode: true,
                    isLoading: false
                });
            }
            catch {
                this.setState({
                    editMode: true,
                    isLoading: false
                });
            }
        }
        
    }

    updateState(event: React.FormEvent | undefined, variable: string, value?: string | number) {
        log.info(
            `updateState() executing from element [${event?.target}] with variable [${variable}]`
        );
        const updateState: any = { };
        updateState[variable] = value || "";
        this.setState(updateState);
    }

    async saveClick() {

        if (this.state.hasRedirect) {
            await ApiHelper.patch(`/_api/v1/redirect/${this.props.rowKey}`, {
                redirectTo: this.state.redirectTo,
                videoLink: this.state.videoLink,
                startRedirectingMinutes: this.state.startRedirectingMinutes
            }, true);
    
        } else {
            await ApiHelper.post(`/_api/v1/redirect`, {
                rowKey: this.props.rowKey,
                redirectTo: this.state.redirectTo,
                videoLink: this.state.videoLink,
                startRedirectingMinutes: this.state.startRedirectingMinutes
            }, true);
    
        }
        
        this.setState({
            hasRedirect: true
        });
        await this.props.refreshCallback();
        this.props.dismissClick();

    }

    checkForEnterKey(ev: any) {
        if (ev.keyCode === 13) {
            this.saveClick();
        }
    }

    cancelClick() {
        log.info(`cancelClick() executing`);
        this.props.dismissClick();
    }

    statsClick() {
        log.info(`statsClick() executing`);
        this.setState({
            statsExpanded: !this.state.statsExpanded
        }, async () => {
            if (this.state.statsExpanded) {
                const geoData = await ApiHelper.get(`/_api/v1/redirect/${this.props.rowKey}/geo`, true);
                log.debug(`geoData: ${JSON.stringify(geoData)}`);

                const geoStats = geoData && Object.keys(geoData).map((key: string, index: number) => {
                    log.debug(`geoData geoStats map: ${JSON.stringify(geoData[key])}`)
                    return { 
                        name: `${geoData[key].city}: ${geoData[key].clickCount}`,
                        markerOffset: -25,
                        coordinates: [geoData[key].longitude, geoData[key].latitude]
                    };
                });

                if (geoStats) {
                    this.setState({statsMarkers: geoStats});
                }
            }
        });
    }

    isValidURL(str: string) {
        var pattern = new RegExp('^(https?:\\/\\/)'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }

    render() {

        const saveButtonActive = (this.state.redirectTo === '' || this.isValidURL(this.state.redirectTo))
            && (this.state.videoLink === '' || this.isValidURL(this.state.videoLink));
        const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

        log.debug(`render() this.state.statsMarkers: ${JSON.stringify(this.state.statsMarkers)}`);
      
        return (
            <div className={`${styles.addSession} ${this.state.statsExpanded && styles.statsExpanded}`}>
            
                <h2 id={`modalHeader`}>{this.state.isLoading ? `Loading...` : `Session details`}</h2>
                <TextField value={this.state.session?.title} label={`Title`} readOnly />
                <TextField value={this.state.session?.description} label={`Description`} readOnly multiline />
                <TextField value={this.state.redirectTo} label={`Live event`} onKeyUp={this.checkForEnterKey} disabled={this.state.isLoading} placeholder={`Enter the live event URL`} className={styles.SessionField} onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => this.updateState(event, `redirectTo`, value) } componentRef={this.urlRef} />
                <TextField value={this.state.videoLink} label={`Video`} onKeyUp={this.checkForEnterKey} disabled={this.state.isLoading} placeholder={`Enter the video URL`} className={styles.SessionField} onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => this.updateState(event, `videoLink`, value) } componentRef={this.urlRef} />
                <Slider value={this.state.startRedirectingMinutes} label={`Live event doors open (minutes)`} min={-60} max={60} showValue onChange={(value?: number) => this.updateState(undefined, `startRedirectingMinutes`, value) } />

                { this.state.statsExpanded && <div className={styles.statsSection}>
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            // rotate: [58, 20, 0],
                            scale: 100
                        }}
                        >
                            <ZoomableGroup zoom={1}>
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map(geo => (
                                            <Geography 
                                            key={geo.rsmKey} 
                                            geography={geo}
                                            fill="#ccc"
                                            stroke="#EAEAEC"
                                            strokeWidth="0.5"
                                            />
                                        ))}
                                </Geographies>

                                {this.state.statsMarkers && this.state.statsMarkers.map((marker: any) => { return (
                                    <Marker key={marker.name} coordinates={marker.coordinates}>
                                        <circle r={10} fill="#F00" stroke="#fff" strokeWidth={2} />
                                        <text
                                            textAnchor="middle"
                                            y={marker.markerOffset}
                                            style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}>
                                            {marker.name}
                                        </text>
                                    </Marker>);
                                })}

                            </ZoomableGroup>

                        </ComposableMap>

                    </div>}    


                <div className={styles.buttonContainer}>
                    <PrimaryButton text={`Save`} onClick={this.saveClick} className={styles.generateButton} disabled={!saveButtonActive} />
                    <DefaultButton text={`Cancel`} onClick={this.cancelClick} className={styles.cancelButton} />
                    {this.state.hasRedirect && <DefaultButton text={`Stats`} onClick={this.statsClick} /> }
                </div>
            </div>
        );
    }
}
