import React from 'react';
import FetchService from '../services/fetchService';
import { Box, Button, Container } from '@material-ui/core';
import { AddChoreModal, ChoreTable, PioneerTable } from './index';
import Results from '../results/Results'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pioneers: [],
            chores: [],
            modalOpen: false
        }
    }

    componentDidMount() {
        this.populateTableState();
    }

    populateTableState() {
        FetchService.get(0, "/api/candidate", undefined)
            .then(response => this.setState({ pioneers: response }))
            .catch(err => console.warn(err));

        FetchService.get(0, "/api/chore", undefined)
            .then(response => this.setState({ chores: response }))
            .catch(err => console.warn(err));
    }

    addChore = (name, description) => {
        const id = (this.state.chores.length + 1).toString();
        const newChore = { id, name, description };
        this.setState({ modalOpen: false, chores: [...this.state.chores, newChore] });
    };

    handleClickOpen = () => this.setState({ modalOpen: true });

    handleClose = () => this.setState({ modalOpen: false });

    getPioneerTable = () => (
        <PioneerTable
            pioneers={this.state.pioneers}
            onRemove={removedPioneer => {
                this.setState({
                    pioneers: this.state.pioneers.filter(
                        pioneer => pioneer !== removedPioneer
                    )
                })
            }}
        />
    );

    getChoreTable = () => (
        <ChoreTable
            chores={this.state.chores}
            addChoreHandler={this.handleClickOpen}
            onRemove={removedChore => {
                this.setState({
                    chores: this.state.chores.filter(
                        chore => chore !== removedChore
                    )
                })
            }}
        />
    );

    render = () => (
        <div>
        <Container>
            <Box display="flex" flexDirection="row" justifyContent="center">
                {this.getPioneerTable()}
                {this.getChoreTable()}
            </Box>

            <Box>
                <Button
                    color="primary"
                    size="large"
                    variant="contained"
                    id="reset-button"
                    onClick={() => this.populateTableState()}
                >
                    Reset
                </Button>
                <Button
                    color="primary"
                    size="large"
                    variant="contained"
                    id="saddle-up"
                >
                    Saddle Up
                </Button>
                < AddChoreModal
                    open={this.state.modalOpen}
                    onClose={this.handleClose}
                    addChore={this.addChore}
                />
            </Box>
            <Results pioneers={[0,0,0,0]} duties={[]}/>
        </Container>
        </div>
    );
}

