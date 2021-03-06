import React from "react";
import TodaysWagonWheel from "./TodaysWagonWheel";
import {shallow} from "enzyme";
import {Typography} from "@material-ui/core";
import {Link} from "react-router-dom";

describe('TodaysWagonWheel', () => {

    it('will render the date nicely', () => {
        const date = new Date(2020, 10, 3, 12, 34, 43);

        let wheelWrapper = shallow(<TodaysWagonWheel date={date}/>);

        expect(wheelWrapper.find(Typography).at(1).text())
            .toContain('11/03/2020');
    });

    it('will supply a back button with a route to the day before the provided date', () => {
        const date = new Date(2020, 10, 3, 12, 34, 43);
        let wheelWrapper = shallow(<TodaysWagonWheel date={date}/>);
        expect(wheelWrapper.find(".back-btn").props().to).toBe("/roster/11022020");
    });

    it('will supply a forward button with a route to the day after the provided date', () => {
        const date = new Date(2010, 10, 3, 12, 34, 43);
        let wheelWrapper = shallow(<TodaysWagonWheel date={date}/>);
        expect(wheelWrapper.find(".forward-btn").props().to).toBe("/roster/11042010");
    });

    it('will hide the forward button if the date is today', () => {
        let wheelWrapper = shallow(<TodaysWagonWheel date={new Date()}/>);
        expect(wheelWrapper.find(".forward-btn").length).toEqual(0);
        expect(wheelWrapper.find(".back-btn").length).toEqual(1);
    });

    it('will have a link to the pioneer statistics page', () => {
        let wheelWrapper = shallow(<TodaysWagonWheel date={new Date()}/>);
        expect(wheelWrapper.find('.statistics-link').props().to).toBe("/pioneer/statistics");
    });
});