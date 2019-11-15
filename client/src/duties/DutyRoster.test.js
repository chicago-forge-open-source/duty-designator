import React from "react";
import {shallow} from 'enzyme';
import DutyRoster from "./DutyRoster";
import DutyGrid from "./DutyGrid";
import {format} from 'date-fns';
import FetchService from "../utilities/services/fetchService";
import {waitUntil, wrapInPromise} from "../utilities/testUtils";
import {Button} from "@material-ui/core";

describe('DutyRoster', function () {
    let fetchMock;
    beforeEach(() => {
        fetchMock = FetchService.put = jest.fn().mockReturnValue(wrapInPromise({}));
    });

    it('will persist new duty roster', function () {
        const pioneer = {name: "jack"};
        const chore = {name: "jest"};
        const date = format(new Date(), "yyyy-MM-dd");
        const history = {push: jest.fn()};
        const dutyRoster = shallow(
            <DutyRoster pioneers={[pioneer]} chores={[chore]} dutyRoster={null} history={history}/>
        );

        dutyRoster.find('#save').simulate('click');

        expect(fetchMock).toBeCalledWith(0, `/api/roster/${date}`, {date, duties: [{pioneer, chore}]}, undefined);
    });

    test('given no chores returns nothing', () => {
        const dutyRoster = shallow(<DutyRoster chores={[]} pioneers={[]}/>);
        expect(dutyRoster.find(DutyGrid).props()['duties']).toEqual([]);
    });

    test('when given single pioneer and single chore will make single duty with them', () => {
        const pioneer = {name: "jack"};
        const chore = {name: "jest"};
        const dutyRoster = shallow(<DutyRoster pioneers={[pioneer]} chores={[chore]}/>);

        expect(dutyRoster.find(DutyGrid).props()['duties']).toEqual([{pioneer, chore}]);
    });

    test('given associate and one pioneer and one chore get one duty', () => {
        const pioneers = ["Pioneer Jeb"];
        const chores = ["codin"];

        const results = shallow(<DutyRoster chores={chores} pioneers={pioneers}/>);

        expect(results.find(DutyGrid).props().duties.length).toEqual(1);
    });

    test('given no duty roster is saved, show saved button', () => {
        const dutyRoster = shallow(<DutyRoster chores={["codin"]} pioneers={["Pioneer Jeb"]} dutyRoster={null}/>);
        expect(dutyRoster.find('#save').length).toEqual(1);
    });

    test('given a duty roster is saved, do not show saved button', () => {
        const pioneer = {name: "jack"};
        const chore = {name: "jest"};
        const date = format(new Date(), "MM/dd/yyyy");

        const dutyRoster = shallow(<DutyRoster dutyRoster={{date, duties: [{pioneer, chore}]}}/>);

        expect(dutyRoster.find('#save').length).toEqual(0);
        expect(dutyRoster.find('#saved-confirmation').length).toEqual(1);
    });

    test('respin will redirect to the corral', () => {
        const pushSpy = jest.fn();
        const dutyRoster = shallow(<DutyRoster history={{push: pushSpy}}/>);

        dutyRoster.find("#respin").simulate("click");
        expect(pushSpy.mock.calls.length).toBe(1);
        expect(pushSpy.mock.calls[0][0]).toEqual('/corral');
    });

    test('during save all buttons are not shown', async () => {
        let promiseResolve;
        fetchMock.mockReturnValue(new Promise((resolve, reject) => {
            promiseResolve = resolve;
        }));
        const pushSpy = jest.fn();
        const dutyRoster = shallow(<DutyRoster dutyRoster={null} history={{push: pushSpy}}/>);

        dutyRoster.find('#save').simulate('click');
        expect(dutyRoster.find(Button).length).toBe(0);

        promiseResolve();

        await waitUntil(() => dutyRoster.update() && dutyRoster.find(Button).length > 0);

        expect(dutyRoster.find(Button).length).toBe(1);
    })
});