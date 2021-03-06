import {format} from 'date-fns';
import {deleteCorral, deleteRoster, deleteToday} from "../support/apiHelpers";
import {apiDateFormat} from "../support/stubs";
import {insertPioneer, insertChore, removePioneer, removeChore} from "../support/apiHelpers";

const uuid = require('uuid/v4');

context('Actions', () => {

    describe('when a new pioneer is posted', function () {
        const pioneer = {name: "Jimmy Cypress", id: uuid()};

        beforeEach(async function () {
            await deleteToday();
            await insertPioneer(pioneer);
        });

        beforeEach(() => cy.wait(40));

        it('it shows up on the page', () => {
            cy.visit('http://localhost:8080');
            cy.get(`.corral-card[data-corral-id=${pioneer.id}]`, {timeout: 2000})
                .should('have.text', pioneer.name);
        });

        afterEach(async () => {
            await removePioneer(pioneer);
        });
    });

    describe('when a new chore is posted', () => {
        const chore = {name: "Dastardly Dishes", id: uuid()};

        beforeEach(async () => {
            await deleteToday();
            await insertChore(chore);
        });

        beforeEach(() => cy.wait(40));

        it('it shows up on the page', () => {
            cy.visit('http://localhost:8080');
            cy.get(`.corral-card[data-corral-id=${chore.id}]`, {timeout: 2000})
                .should('have.text', chore.name);
        });

        afterEach(async () => {
           await removeChore(chore);
        });
    });

    describe('When a chore is added, spin happens, and is saved', () => {
        let chore, yesterday;

        beforeEach(async function () {
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await deleteToday();
            await deleteRoster(format(yesterday, apiDateFormat));
            await deleteCorral(format(yesterday, apiDateFormat));
            chore = {id: uuid(), name: "Cow tipper", description: "Give some tips to cows", title: 'Tipper'};
            await insertChore(chore);
        });

        beforeEach(function () {
            cy.clock(yesterday.getTime());

            cy.visit('http://localhost:8080');
            cy.get("#saddle-up").click();
            cy.get("#save").click();
        });

        it('on the roster page the chore title is shown', () => {
            cy.get(`.duty-pioneer-title[data-chore-id=${chore.id}]`, {timeout: 2000})
                .should('have.text', chore.title);
        });

        describe('and reload', function () {
            beforeEach(function () {
                cy.reload();
            });

            it('it still has results table', () => {
                cy.get('.results').should("have.length", 1);
            });

            it('keeps a chore that has been added in the results list', () => {
                cy.get(`.duty-chore-name[data-chore-id=${chore.id}]`, {timeout: 2000})
                    .should('have.text', chore.name);
            });

            it('does not have a save button on reload', () => {
                cy.get('#save').should('have.length', 0);
            });
        });

        it('respin, and saddle up, then you can save again', () => {
            cy.get("#respin").click();
            cy.get("#saddle-up").click();
            cy.get('#save').should('have.length', 1)
        });

        it('respin, and reload, then the previous spin is remembered', () => {
            cy.get("#respin").click();
            cy.reload();

            cy.get("#save").should('have.length', 0);
        });

        it('respin, reload, respin, saddle up, and you can save again', () => {
            cy.get("#respin").click();
            cy.reload();
            cy.get("#saddle-up").click();
            cy.get("#respin").click();
            cy.get("#saddle-up").click();
            cy.get("#save").should('have.length', 1);
        });

        describe('and it becomes tomorrow', function () {
            beforeEach(function () {
                cy.clock().then(clock => clock.restore());
                cy.visit('http://localhost:8080');
            });

            it('there is prepare to spin page', function () {
                cy.get("#saddle-up").should('have.length', 1);
            });

            it('can view yesterday', function () {
                cy.get(".back-btn").click();
                cy.get("#saddle-up").should('have.length', 0);
            });
        });

        afterEach(async () => {
            await removeChore(chore);
        });
    });
    describe('remove pioneer from candidate list, saddle up, save and respin', () => {
        let pioneer;

        beforeEach(async function () {
            pioneer = {name: "Very Unique Name", id: uuid()};
            await deleteToday();
            await insertPioneer(pioneer);
        });

        beforeEach(function () {
            cy.visit('http://localhost:8080');
            cy.get(`.corral-card[data-corral-id=${pioneer.id}]`)
                .find(`.delete`).click();
            cy.get("#saddle-up").click();
            cy.get("#save").click();
            cy.get("#respin").click();
        });

        it('the removed pioneer does not appear on the chore corral', function () {
            cy.get(`.pioneer-name[data-corral-id=${pioneer.id}]`, {timeout: 2000})
                .should('not.to.exist');
        });

        it('reset will return pioneer to list', () => {
            cy.get("#reset-button").click();
            cy.get(`.corral-card[data-corral-id=${pioneer.id}]`, {timeout: 2000})
                .should('have.text', pioneer.name);
        });

        afterEach(async () => {
            await removePioneer(pioneer)
        });
    });
});

