import {shallow} from "enzyme";
import {AddChoreModal, ChoreTable, PioneerTable} from "../dashboard";
import React from "react";
import ChoreCorral from "./ChoreCorral";
import FetchService from "../utilities/services/fetchService";
import {waitUntil} from "../utilities/testUtils";

describe('ChoreCorral', function () {
    it('handles null chore and pioneer lists', async function () {
        const choreCorral = shallow(<ChoreCorral/>);

        expect(choreCorral.find(PioneerTable).props()["pioneers"].length).toEqual(0);
        expect(choreCorral.find(ChoreTable).props()["chores"].length).toEqual(0);
    });

    it('ChoreTable can open modal', async () => {
        const choreCorral = shallow(<ChoreCorral/>);

        choreCorral.find(ChoreTable)
            .props()
            ["addChoreHandler"]();

        expect(choreCorral.find(AddChoreModal).prop('open')).toEqual(true);
    });

    describe('with pioneer data', () => {
        let choreCorral, pioneers;

        beforeEach(() => {
            pioneers = [
                {id: ' at thing', name: 'Friday Jeb'},
                {id: 'something else', name: 'Everyday Natalie'},
                {id: 'nothing', name: 'Odd Day Rob'}
            ];

            let fetchMock = FetchService.get = jest.fn();
            fetchMock.mockReturnValue(new Promise(resolve => resolve(pioneers)));

            choreCorral = shallow(<ChoreCorral pioneers={pioneers}/>);
        });

        it('shows a list of pioneers', () => {
            const pioneerTable = choreCorral.find(PioneerTable);
            expect(pioneerTable.props()["pioneers"]).toBe(pioneers);
        });

        it('When PioneerTable remove last Pioneer, last Pioneer row is removed', () => {
            let pioneerToRemove = pioneers[2];
            simulateRemovePioneer(pioneerToRemove);

            expect(choreCorral.find(PioneerTable).props()["pioneers"]).toEqual(pioneers.slice(0, 2))
        });

        it('When PioneerTable remove middle Pioneer, middle Pioneer row is removed', () => {
            let pioneerToRemove = pioneers[1];
            simulateRemovePioneer(pioneerToRemove);

            const expectedRemaining = [pioneers[0], pioneers[2]];
            expect(choreCorral.find(PioneerTable).props()["pioneers"]).toEqual(expectedRemaining)
        });

        it('Reset button presents default page', async () => {
            let pioneerToRemove = pioneers[0];
            simulateRemovePioneer(pioneerToRemove);

            choreCorral.find('#reset-button').simulate('click');

            await waitUntil(() =>
                choreCorral.find(PioneerTable).props()["pioneers"].length === pioneers.length);

            expect(choreCorral.find(PioneerTable).props()["pioneers"]).toEqual(pioneers)
        });

        function simulateRemovePioneer(pioneerToRemove) {
            let removeFunction = choreCorral.find(PioneerTable).props()["onRemove"];
            removeFunction(pioneerToRemove)
        }
    });

    describe('with chore data', () => {
        let choreCorral, chores;

        beforeEach(() => {
            chores = [
                {id: '1', name: 'Move chairs'},
                {id: '2', name: 'Turn off coffee pot'},
                {id: '3', name: 'Stock fridge with soda'},
                {id: '4', name: 'Put away dishes'},
            ];

            let fetchMock = FetchService.get = jest.fn();
            fetchMock.mockReturnValue(new Promise(resolve => resolve(chores)));
            choreCorral = shallow(<ChoreCorral/>);
        });

        it('will send chores to chore table', () => {
            const chores = choreCorral.find(ChoreTable).props()["chores"];
            expect(chores).toEqual(chores);
        });

        it('When ChoreTable remove a chore, the chore entry is removed', () => {
            const choreToRemove = chores[1];
            const expectedRemaining = [chores[0], chores[2], chores[3]];
            simulateRemoveChore(choreToRemove);

            expect(choreCorral.find(ChoreTable).props()["chores"]).toEqual(expectedRemaining)
        });

        it('When AddChoreModal adds a chore, the chore entry is added to the list', () => {
            const newChore = {id: '5', name: 'Super Easy Chore', description: 'Its so easy', title: 'Mouse'};
            const expectedChores = [...chores, newChore];
            choreCorral.find(AddChoreModal)
                .props()["onChoreAdd"](newChore);

            expect(choreCorral.find(ChoreTable).props()["chores"]).toEqual(expectedChores)
        });

        function simulateRemoveChore(pioneerToRemove) {
            let removeFunction = choreCorral.find(ChoreTable).props()["onRemove"];
            removeFunction(pioneerToRemove)
        }
    });
});