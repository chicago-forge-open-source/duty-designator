import {Box, Button, Container} from "@material-ui/core";
import React, {useState} from "react";
import {AddChoreModal} from "../dashboard";
import FetchService from "../utilities/services/fetchService";
import {format} from "date-fns";
import PioneerCorral from "../pioneers/PioneerCorral";
import ChoreCorral from "../chores/ChoreCorral";
import TodaysWagonWheel from "../dashboard/wheel/TodaysWagonWheel";
import Grid from "@material-ui/core/Grid";

export default function Corral(props) {
    const [pioneers, setPioneers] = useState(props.pioneers || []);
    const [chores, setChores] = useState(props.chores || []);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const {history} = props;

    if (dataLoaded === false) {
        handleDataLoad(props, setDataLoaded, setPioneers, setChores);
    }

    return <div>
        <Container style={{maxWidth: 1600}}>
                <Grid container>
                    <Grid item xs={5}>
                        {pioneerCorral(pioneers, setPioneers)}
                    </Grid>
                    <Grid item xs={2}>
                        <TodaysWagonWheel date={new Date()}/>
                        {resetButton(setPioneers, setChores, setDataLoaded)}
                        {saddleUpButton(pioneers, chores, history)}
                    </Grid>
                    <Grid item xs={5}>
                        {choreCorral(chores, setChores, setModalOpen)}
                    </Grid>
                </Grid>
            {addChoreModal(modalOpen, setModalOpen, chores, setChores)}
            <br/>
            <Box>

            </Box>
        </Container>
    </div>;
}

function handleDataLoad(props, setDataLoaded, setPioneers, setChores) {
    if (hasProvidedData(props)) {
        setDataLoaded(true);
    } else {
        startDataLoad(setPioneers, setChores, setDataLoaded);
    }
}

function hasProvidedData(props) {
    return !!props.pioneers && !!props.chores;
}

function startDataLoad(setPioneers, setChores, setDataLoaded) {
    getData(setPioneers, setChores)
        .then(results => {
            const [pioneers, chores] = results;
            setPioneers(pioneers);
            setChores(chores);
            setDataLoaded(true);
        });
}

function getData() {
    return Promise.all([
        FetchService.get(0, "/api/pioneer", undefined),
        FetchService.get(0, "/api/chore", undefined)
    ]);
}

function pioneerCorral(pioneers, setPioneers) {
    return <PioneerCorral
        pioneers={pioneers}
        onRemove={
            removedPioneer => setPioneers(
                pioneers.filter(pioneer => pioneer !== removedPioneer)
            )
        }
    />;
}

const choreCorral = (chores, setChores, setModalOpen) => (
    <ChoreCorral
        chores={chores}
        addChoreHandler={() => setModalOpen(true)}
        onRemove={removedChore =>
            setChores(chores.filter(
                chore => chore !== removedChore
            ))}
    />
);

function resetButton(setPioneers, setChores, setDataLoaded) {
    return button("reset-button", "Reset", () => startDataLoad(setPioneers, setChores, setDataLoaded));
}

async function putCorral(today, pioneers, chores, history) {
    await fetch(`/api/corral/${today}`, {
        method: "PUT",
        body: JSON.stringify({pioneers, chores, date: today}),
        signal: undefined
    });
    history.push('/roster?spin=true')
}

function saddleUpButton(pioneers, chores, history) {
    return <Button
        id="saddle-up"
        color="primary"
        size="large"
        variant="contained"
        onClick={() => {
            const apiDateFormat = 'yyyy-MM-dd';
            const today = format(new Date(), apiDateFormat);
            putCorral(today, pioneers, chores, history).catch(err => console.error(err));
        }}
    >
        Saddle Up
    </Button>
}

const button = (id, text, onClick) => (
    <Button
        color="primary"
        size="large"
        variant="contained"
        id={id}
        onClick={onClick}>
        {text}
    </Button>
);

function addChoreModal(modalOpen, setModalOpen, chores, setChores) {
    return <AddChoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onChoreAdd={(newChore) => addChore(newChore, chores, setModalOpen, setChores)}
    />;
}

const addChore = (newChore, chores, setModalOpen, setChores) => {
    const id = (chores.length + 1).toString();
    setModalOpen(false);
    setChores([...chores, {id, ...newChore}]);
};