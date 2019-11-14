import {format} from "date-fns";

const uuid = require('uuid/v4');

export const apiDateFormat = 'yyyy-MM-dd';

export function stubCorral() {
    const pioneers = [
        {name: "Dewy Dooter", id: "10"},
        {name: "Rosy Rosee", id: "11"}
    ];
    const chores = [
        {name: "Burrito builder", description: "Build burritos", id: "101"},
        {name: "Horseshoer", description: "shoe horses", id: "102"}
    ];
    const today = format(new Date(), apiDateFormat);
    return {date: today, pioneers, chores};
}

export function stubRoster() {
    return {
        date: format(new Date(), apiDateFormat),
        duties: [{
            pioneer: {name: "Dewy Dooter", id: "10"},
            chore: {name: "Horseshoer", description: "shoe horses", id: "102"},
            completed: false
        }, {
            pioneer: {name: "Rosy Rosee", id: "11"},
            chore: {name: "Burrito builder", description: "Build burritos", id: "101"},
            completed: true
        }]
    };
}