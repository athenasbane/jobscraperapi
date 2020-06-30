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