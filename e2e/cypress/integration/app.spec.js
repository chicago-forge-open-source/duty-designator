const uuid = require('uuid/v4');

context('Actions', () => {

    async function insertCandidate(candidate) {
        await fetch("http://localhost:8080/api/candidate", {
            method: "POST",
            body: JSON.stringify(candidate),
            signal: undefined
        });
    }

    describe('when a new candidate is posted', function () {

        const candidate = {name: "Jimmy Cypress", id: uuid()};

        beforeEach(async function () {
            await insertCandidate(candidate);
        });

        beforeEach(() => cy.wait(40));

        it('it shows up on the page', () => {
            cy.visit('http://localhost:8080');
            cy.get(`.candidate[data-candidate-id=${candidate.id}]`, {timeout: 2000})
                .should('have.text', candidate.name);
        });
    });

    async function insertChore(chore) {
        await fetch("http://localhost:8080/api/chore", {
            method: "POST",
            body: JSON.stringify(chore),
            signal: undefined
        });
    }

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
    })

    describe('When we save the spin results', () => {
        const chore = {name: "Cow tipper", description: "Give some tips to cows", id: uuid()};

        before( function () {
            insertChore(chore);
        })

        beforeEach( function () {
            cy.visit('http://localhost:8080')
            cy.get("#saddle-up").click()
            cy.get("#save").click()
        })

        it('still has results table on refresh', () => {
            cy.reload()
            cy.get('.results').should("have.length",1 )
        })

        it('keeps a chore that has been added in the results list', () => {
            cy.reload()
            cy.get(`.duty-chore-name[data-duty-id=${chore.id}]`, {timeout:2000})
                .should('have.text', chore.name)
        })

        it('does not have a save button on reload', () => {
            cy.reload()
            cy.get('#save').should('have.length', 0)
        })

        it('after respin and saddle up you can save again', () => {
            cy.get("#respin").click()
            cy.get("#saddle-up").click()
            cy.get('#save').should('have.length', 1)
        })
    })

});

