const axios = require('axios');
const cheerio = require('cheerio');


const jobsScraper = async (searchTitle, searchLocation) => {
    let res = await axios.get(`https://www.indeed.co.uk/jobs?q=title%3A${searchTitle}&l=${searchLocation}&fromage=1`);
    
    const jobs = [];

    let $ = cheerio.load(res.data);

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

        let job = { title, company, location, link: (['https://www.indeed.co.uk', link].join('')), source: 'Indeed'}
        
        jobs.push(job)

    })

    let res2 = await axios.get(`https://www.reed.co.uk/jobs/${searchTitle}-jobs-in-${searchLocation}?datecreatedoffset=Today&proximity=20`)

    $ = cheerio.load(res2.data);

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
        
                            job = { title, company, location, link: (['https://www.reed.co.uk', link].join('')), source: 'Reed'}

                            jobs.push(job)
        
    })

    let res3 = await axios.get(`https://www.monster.co.uk/jobs/search/?cy=uk&q=${searchTitle}&client=power&intcid=swoop_Hero_Search&where=${searchLocation}&rad=20&tm=3`)

    $ = cheerio.load(res3.data);

    $('.card-content').each((index, element) => {
                        const title = $(element)
                            .find('.title')
                            .text()
                            .trim()
                        
                        const company = $(element)
                            .find('.company')
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
        
                            job = { title, company, location, link, source: 'Monster'}
                            jobs.push(job)
        
    })

    let res4 = await axios.get(`https://www.jobsite.co.uk/jobs/${searchTitle}/in-${searchLocation}?postedwithin=1`)

    $ = cheerio.load(res4.data);

    $('.job').each((index, element) => {
                        const title = $(element)
                            .find('.job-title')
                            .text()
                            .trim()
                            .replace('\n', '')
                            .replace('Featured\n', '')
                            .replace('In partnership with totaljobs', '')
                            .trim()
                        
                        const company = $(element)
                            .find('.company')
                            .text()
                            .trim()
                        
                        const location = $(element)
                            .find('.location')
                            .text()
                            .trim()
                            .replace('\n', '')
                            .replace('\n', '')
                            .split('\n')
                        
                        const link = $(element)
                            .find('.job-title')
                            .children('a')
                            .attr('href')
        
                            job = { title, company, location: location[0], link, source: 'Jobsite'}
                            
                            jobs.push(job)
        
    })

    let res5 = await axios.get(`https://www.cv-library.co.uk/${searchTitle}-jobs-in-${searchLocation}?distance=25&posted=1&us=1`)

    $ = cheerio.load(res5.data);

    $('.results__item').each((index, element) => {
                        const title = $(element)
                            .find('.job__title')
                            .text()
                            .trim()
                            .replace('\n', '')
                            .split('\n')
                        
                        const company = $(element)
                            .find('.job__details-value.text--semibold')
                            .text()
                            .trim()
                        
                        const location = $(element)
                            .find('.job__details-location')
                            .text()
                            .trim()
                            .split('\n')
                        
                        const link = $(element)
                            .find('.job__title')
                            .children('a')
                            .attr('href')
        
                            job = { title: title[0], company, location: location[0], link: ['https://www.cv-library.co.uk', link].join(''), source: 'CV-Library'}
                            jobs.push(job)
        
    })

    let res6 = await axios.get(`https://www.glassdoor.co.uk/Job/${searchLocation}-${searchTitle}-jobs-SRCH_IL.0,5_IC3414359_KO6,17.htm?fromAge=1`)

    $ = cheerio.load(res6.data);

    $('.react-job-listing').each((index, element) => {
                        
                        
                        const company = $(element)
                            .find('.jobEmpolyerName')
                            .text()
                            .trim()

                            const title = $(element)
                            .find('.jobLink')
                            .text()
                            .replace(company, '')
                            .trim()
                        
                        const location = $(element)
                            .find('.loc')
                            .text()
                            .trim()
                        
                        const link = $(element)
                            .find('.jobHeader')
                            .children('a')
                            .attr('href')
        
                            job = { title, company, location, link, source: 'Glassdoor'}
                            jobs.push(job)
        
    })

    const checkedJobs = []
    
    jobs.forEach(job => {

    const capitalizedTitle = searchTitle.charAt(0).toUpperCase() + searchTitle.slice(1)
    
                if(job.title.includes(capitalizedTitle)) {
                    checkedJobs.push(job)
                } else {
                    console.log(`[Rejected Job] ${job.title} - ${job.source}`)
                }
            })

        return checkedJobs

    }


module.exports = jobsScraper