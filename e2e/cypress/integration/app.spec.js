import {format, subDays} from 'date-fns';
import {insertPioneer, insertChore, removePioneer} from "../support/integrationHelpers";

const uuid = require('uuid/v4');

context('Actions', () => {


    describe('when a new candidate is posted', function () {
        const pioneer = {name: "Jimmy Cypress", id: uuid()};

        before(async () => {
            await insertPioneer(pioneer);
        });

        beforeEach(() => cy.wait(40));

        it('it shows up on the page', () => {
            cy.visit('http://localhost:8080');
            cy.get(`.candidate[data-candidate-id=${pioneer.id}]`, {timeout: 2000})
                .should('have.text', pioneer.name);
        });

        after(async () => {
            await removePioneer(pioneer)
        });
    });

    describe('when a new chore is posted', () => {
        const chore = {name: "Dastardly Dishes", id: uuid()};

        beforeEach(async () => {
            await insertChore(chore);
        });

        beforeEach(() => cy.wait(40));

        it('it shows up on the page', () => {
            cy.visit('http://localhost:8080');
            cy.get(`.chore[data-chore-id=${chore.id}]`, {timeout: 2000})
                .should('have.text', chore.name);
        });
    });

    describe('When we save the spin results', () => {
        const chore = {id: uuid(), name: "Cow tipper", description: "Give some tips to cows", title: 'Tipper'};

        before(async function () {
            await insertChore(chore);
        });

        beforeEach(function () {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            cy.clock(yesterday.getTime());

            cy.visit('http://localhost:8080');
            cy.get("#saddle-up").click();
            cy.get("#save").click();
        });

        it('on the roster page the chore title', () => {
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
    });
    describe('remove pioneer from candidate list, saddle up, save and respin', () => {
        const pioneer = {name: "Very Unique Name", id: uuid()};

        before(async function () {
            await insertPioneer(pioneer);
        });

        beforeEach(function () {
            cy.visit('http://localhost:8080');
            cy.get(`.delete[data-candidate-id=${pioneer.id}]`).click();
            cy.get("#saddle-up").click();
            cy.get("#save").click();
            cy.get("#respin").click();
        });

        it('the removed pioneer does not appear on the chore corral', function () {
            cy.get(`.candidate[data-candidate-id=${pioneer.id}]`, {timeout: 2000})
                .should('not.to.exist');
        });

        it('reset will return pioneer to list', () => {
            cy.get("#reset-button").click();
            cy.get(`.candidate[data-candidate-id=${pioneer.id}]`, {timeout: 2000})
                .should('have.text', pioneer.name);
        });

        after(async () => {
            await removePioneer(pioneer)
        });
    });

    describe('forward and back buttons', () => {
        const yesterday = format(subDays(new Date(), 1), 'MMddyyyy');

        beforeEach(() => {
            cy.visit('http://localhost:8080');
            cy.get(".back-btn").click();
        });

        it('back button will take you to the historial roster page for yesterday', () => {
            cy.url().should('eq', `http://localhost:8080/roster/${yesterday}`);
        });

        it('will take you to the historical roster for today', () => {
            cy.get(".back-btn").click();
            cy.get(".forward-btn").click();
            cy.url().should('eq', `http://localhost:8080/roster/${yesterday}`);
        });
    });

    describe('visiting historical duty rosters', () => {
        it('there will be no respin or save buttons', () => {
            cy.visit("http://localhost:8080/roster/10102010");
            cy.get("#respin").should('have.length', 0);
            cy.get("#save").should('have.length', 0);
        });

        it('will redirect user to home if date is today', () => {
            const today = format(new Date(), 'MMddyyyy');
            cy.visit(`http://localhost:8080/roster/${today}`);
            cy.url().should('eq', 'http://localhost:8080/corral');
        });
    });
});

