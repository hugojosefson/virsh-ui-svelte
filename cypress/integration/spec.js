describe('virsh-ui', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('has an <ul>', () => {
    cy.contains('ul')
  })

  it('has an <ul> with <li>domains</li>', () => {
    cy.get('ul').contains('li', 'domains')
  })

  it('navigates to /domains', () => {
    cy.get('ul').contains('domains').click()
    cy.url().should('include', '/domains')
  })
})
