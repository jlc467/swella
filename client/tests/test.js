module.exports = {
  'Body is visible'(browser) {
    browser
      .url(`http://localhost:3000/`)
      .waitForElementVisible('body', 1000)
  }
}