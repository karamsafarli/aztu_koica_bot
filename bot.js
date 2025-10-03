const puppeteer = require('puppeteer');
const { db, studentDetails } = require('./db');
const { eq } = require('drizzle-orm');

const getSubjectDetails = async (page, link) => {
    try {
        await page.goto(link)
        await page.waitForSelector('.button-list a');

        await page.evaluate(() => {
            const btn = document.querySelectorAll('.button-list a')[document.querySelectorAll('.button-list a')?.length - 1];
            btn?.click();
        });

        await page.waitForSelector('table#op_list');

        const details = await page.evaluate(() => {
            const table = document.querySelector('table#op_list')

            const subject = table.querySelectorAll('td')[7]?.innerText;
            const totalHours = table.querySelectorAll('td')[8]?.innerText;
            const credits = table.querySelectorAll('td')[10]?.innerText;


            const absentTable = document.querySelector('#datatable-buttons');
            const absentRow = absentTable.querySelectorAll('tr')[5];

            const ieCount = absentRow.querySelectorAll('td span.ie')?.length;
            const qbCount = absentRow.querySelectorAll('td span.qb')?.length;
            const cellCount = absentRow.querySelectorAll('td')?.length;
            const attendance = absentRow.querySelectorAll('td')[cellCount - 1]?.innerText;


            return {
                subject,
                totalHours,
                credits,
                ieCount,
                qbCount,
                attendance
            }
        });

        return details;

    } catch (error) {
        console.log(error)
        return null;
    }
}

const getAndSaveStudentDetails = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1500,
        height: 800
    });

    await page.goto('https://sso.aztu.edu.az')


    await page.waitForSelector('#Username');

    await page.type('#Username', process.env.USERNAME);
    await page.type('#Password', process.env.PASSWORD)
    await page.keyboard.press('Enter');

    await page.waitForSelector('.nav-item');

    await page.evaluate(() => {
        const link = document.querySelectorAll('.nav-item a')[2];

        link?.click()
    });


    await page.waitForSelector('.nav-second-level a');

    const subjectLinks = await page.evaluate(() => {
        const links = [...document.querySelectorAll('.nav-second-level a')];

        const subjectLinks = [];

        links.forEach((link) => subjectLinks.push(link?.href));

        return subjectLinks
    });

    const allDetails = [];

    for (const link of subjectLinks) {
        const details = await getSubjectDetails(page, link);
        if (!details) continue;
        allDetails.push({ username: process.env.USERNAME, ...details });
    }


    await db
        .delete(studentDetails)
        .where(eq(studentDetails.username, process.env.USERNAME));

    await db.insert(studentDetails).values(allDetails);


    await browser.close();

}


module.exports = { getAndSaveStudentDetails }