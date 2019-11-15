import React, {useState} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch, useHistory, useLocation, useParams} from "react-router-dom";
import {format, isToday, parse} from 'date-fns';
import {createMuiTheme, MuiThemeProvider} from "@material-ui/core";
import RootRoute from './dashboard/RootRoute.js';
import TodaysWagonWheel from "./dashboard/wheel/TodaysWagonWheel";
import Tumbleweed from "./tumbleweed/Tumbleweed";
import DutyRoster from "./duties/DutyRoster";
import HistoricalRoster from "./duties/HistoricalRoster";
import Corral from "./corral/Corral";
import PioneerDutyHistory from "./dutyHistory/PioneerDutyHistory";
import FetchService from "./utilities/services/fetchService";
import PioneerStatistics from "./pioneers/PioneerStatistics";
import './App.css';
import {Loading} from "./dashboard/Loading";

const theme = createMuiTheme({
    palette: {
        primary: {
            main: "#1aae9f",
            contrastText: "#fff"
        },
        text: {
            primary: "#293845",
            secondary: "#c3cfd9"
        }
    }
});

export default function App() {
    return (
        <div style={{padding: 32}}>
            <MuiThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        <Route exact path="/" component={Root}/>
                        <Route exact path="/corral" component={ChoreCorralPage}/>
                        <Route exact path="/roster" render={props => <DutyRosterPage key={props.location.search}/>}/>
                        <Route path="/roster/:date"
                               render={props => <HistoricalRosterPage key={props.match.params.date}/>}
                        />
                        <Route path="/pioneer/:id/history" component={PioneerHistory}/>
                        <Route path="/pioneer/statistics" component={PioneerStatistics}/>
                    </Switch>
                </Router>
                <Tumbleweed/>
            </MuiThemeProvider>
        </div>
    );
}

async function loadCorral(date) {
    try {
        return await FetchService.get(0, `/api/corral/${date}`, undefined);
    } catch (err) {
        if (err === 404) {
            const [pioneers, chores] = await Promise.all([
                FetchService.get(0, `/api/pioneer`, undefined),
                FetchService.get(0, `/api/chore`, undefined)
            ]);

            return {pioneers, chores, date: date};
        }
    }
}

const apiDateFormat = 'yyyy-MM-dd';

async function getDutyRosterData(today) {
    const [dutyRoster, corral] = await Promise.all([
        loadDutyRoster(today),
        loadCorral(today)
    ]);

    return {dutyRoster, corral};
}

async function loadDutyRoster(date) {
    try {
        return await FetchService.get(0, `/api/roster/${date}`, undefined);
    } catch (err) {
        return null;
    }
}

async function loadRosterHistory() {
    try {
        return await FetchService.get(0, `/api/roster/`, undefined);
    } catch (err) {
        return null;
    }
}

const DutyRosterPage = () => {
    const history = useHistory();
    const location = useLocation();
    const urlSearchParams = new URLSearchParams(location.search);
    const shouldSpin = urlSearchParams.get('spin');

    const [dataLoading, setDataLoading] = useState(false);
    const [data, setData] = useState(null);

    if (!dataLoading) {
        const today = format(new Date(), apiDateFormat);
        getDutyRosterData(today)
            .then(setData)
            .catch(console.error);
        setDataLoading(true);
    }

    if (data == null) {
        return <Loading/>
    }

    const roster = shouldSpin ? null : data.dutyRoster;

    return <div>
        <TodaysWagonWheel date={new Date()}/>
        <DutyRoster dutyRoster={roster} {...data.corral} history={history}/>
    </div>
};

function formatAsApiDate(date) {
    return format(date, apiDateFormat);
}

const ChoreCorralPage = () => {
    const history = useHistory();
    const [dataLoading, setDataLoading] = useState(false);
    const [corral, setCorral] = useState(null);

    if (!dataLoading) {
        const today = formatAsApiDate(new Date());
        loadCorral(today)
            .then(setCorral)
            .catch(console.error);

        setDataLoading(true);
    }

    if (corral == null) {
        return <div/>
    }
    return <div>
        <Corral {...corral} history={history}/>
    </div>
};

const Root = () => {
    const [data, setData] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);

    if (!dataLoading) {
        loadDutyRoster(formatAsApiDate(new Date()))
            .then(roster => setData({roster}))
            .catch(console.error);
        setDataLoading(true);
    }

    return data
        ? <RootRoute dutyRoster={data.roster}/>
        : <Loading/>;
};

const HistoricalRosterPage = () => {
    let {date} = useParams();
    const parsedDate = parse(date, "MMddyyyy", new Date());

    const [dataLoading, setDataLoading] = useState(null);
    const [data, setData] = useState(null);

    if (isToday(parsedDate)) {
        return <Redirect to="/"/>
    }

    if (!dataLoading) {
        loadDutyRoster(formatAsApiDate(parsedDate))
            .then(roster => {
                setData({roster})
            });
        setDataLoading(true);
    }

    if (!data) {
        return <Loading/>
    }

    return <div>
        <TodaysWagonWheel date={parsedDate}/>
        <HistoricalRoster dutyRoster={data.roster}/>
    </div>
};

const PioneerHistory = () => {
    const {id} = useParams();
    const [dataLoading, setDataLoading] = useState(null);
    const [data, setData] = useState(null);

    if (!dataLoading) {
        loadRosterHistory()
            .then(rosterHistory => {
                setData({rosterHistory})
            });
        setDataLoading(true);
    }

    if (!data) {
        return <Loading/>
    }

    return <PioneerDutyHistory id={id} rosterHistory={data.rosterHistory}/>
};