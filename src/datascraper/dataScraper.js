const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose')
const Job = require('../models/Job')

module.exports = (titleSearch) => {

    // Database Save Function

    const dbSave = (jobsArray, titleSearchTerm) => {

        jobsArray.forEach(job => {

            const capitalizedTitle = titleSearchTerm.charAt(0).toUpperCase() + titleSearchTerm.slice(1)

            if(job.title.includes(capitalizedTitle)) {

            const newJob = new Job({
                title: job.title,
                company: job.company,
                location: job.location,
                link: job.link,
                source: job.source
            })

            newJob.save()
                .then(console.log(`[${job.source}] Job Saved!`))
                .catch(err => {
                    console.log(err)
                })

            } else {
                console.log('[REJECTED JOB] ' + job.title + ' - ' + job.source)
            }

        })

    }

     // Indeed

    axios.get(`https://www.indeed.co.uk/jobs?q=title%3A${titleSearch}&l=Leeds&fromage=1`)
    .then(res => {

        const jobs = [];

        const $ = cheerio.load(res.data);

        $('.jobsearch-SerpJobCard').each((index, element) => {
            const title = $(element)
                .children('h2')
                .text()
                .trim()
                .replace("\n\n", "")
                .replace("new", "")
            const company = $(element)
                .find('.company')
                .text()
                .replace("\n", "")
            const location = $(element)
                .find('.location')
                .text()
            const link = $(element)
                .find('.jobtitle')
                .attr('href')

            jobs[index] = { title, company, location, link: (['https://www.indeed.co.uk', link].join('')), source: 'Indeed'}


        })

        dbSave(jobs, titleSearch)
            
    })
    .catch(err => {
        console.log(err);
    });

    // Reed 

    axios.get(`https://www.reed.co.uk/jobs/${titleSearch}-jobs-in-leeds?datecreatedoffset=Today&proximity=20`)
        .then(res => {

            const jobs = [];

            const $ = cheerio.load(res.data);

            $('.details').each((index, element) => {
                const title = $(element)
                    .find('h3')
                    .text()
                    .trim()
                
                const company = $(element)
                    .find('.gtmJobListingPostedBy')
                    .text()
                    .trim()
                
                const location = $(element)
                    .find('.location')
                    .text()
                    .trim()
                    .replace('\n', '')
                
                const link = $(element)
                    .find('.title')
                    .children('a')
                    .attr('href')

                    jobs[index] = { title, company, location, link: (['https://www.reed.co.uk', link].join('')), source: 'Reed'}

            })

            dbSave(jobs, titleSearch)

        })
        .catch(err => {
            console.log(err)
        })
    
}



