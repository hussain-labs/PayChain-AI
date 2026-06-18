const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  // Wait for the navbar to be rendered
  await page.waitForSelector('.nav-menu a');
  
  const colors = await page.evaluate(() => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const heroBg = window.getComputedStyle(document.querySelector('.hero')).backgroundColor;
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const links = Array.from(document.querySelectorAll('.nav-menu a')).map(el => {
      return {
        text: el.innerText,
        color: window.getComputedStyle(el).color
      };
    });
    return { isDark, heroBg, bodyBg, links };
  });
  
  console.log(JSON.stringify(colors, null, 2));
  await browser.close();
})();
