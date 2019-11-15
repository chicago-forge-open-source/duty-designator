import {Button, Container, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {associateWithOffset} from "./Associator";
import {format} from "date-fns";
import FetchService from "../utilities/services/fetchService";
import DutyGrid from "./DutyGrid";

export default function DutyRoster(props) {
    const [canSave, setCanSave] = useState(props.dutyRoster === null);
    const [saving, setSaving] = useState(false);
    const pioneers = props.pioneers || [];
    const chores = props.chores || [];
    const dutyRoster = props.dutyRoster || associator(pioneers, chores);
    const history = props.history;
    
    return <Container className="results" maxWidth={"xl"}>
        <DutyGrid duties={dutyRoster["duties"]}/>
        <br/>
        {!saving ?
            <div>
                {respinButton(history)}
                {conditionalButtons(canSave, setCanSave, dutyRoster, history, setSaving)}
            </div> : undefined}
    </Container>;
}

const associator = (pioneers, chores) => {
    return {duties: associateWithOffset(pioneers, chores, Date.now())}
};

function conditionalButtons(canSave, setCanSave, dutyRoster, history, setSaving) {
    return canSave
        ? saveButton(setCanSave, dutyRoster, history, setSaving)
        : <Typography id='saved-confirmation' variant="body2" color='textPrimary'>
            Save Confirmed!
        </Typography>;
}

function respinButton(history) {
    return <Button
        color="secondary"
        size="large"
        variant="contained"
        id="respin"
        onClick={() => history.push('/corral')}
    >
        Respin this Wagon Wheel
    </Button>
}

async function onSaveClick(dutyRoster, setCanSave, history, setSaving) {
    setSaving(true)
    await saveWithDate(dutyRoster);
    setCanSave(false);
    history.push('/roster');
    setSaving(false)
}

function saveButton(setCanSave, dutyRoster, history, setSaving) {
    return <Button
        color="primary"
        size="large"
        variant="contained"
        id="save"
        onClick={() => {
            onSaveClick(dutyRoster, setCanSave, history, setSaving);
        }}>
        Save this Wagon Wheel
    </Button>;
}

async function saveWithDate(dutyRoster) {
    const date = format(new Date(), 'yyyy-MM-dd');
    await FetchService.put(0, `/api/roster/${date}`, Object.assign(dutyRoster, {date}), undefined)
        .catch(err => console.error(err));
}

