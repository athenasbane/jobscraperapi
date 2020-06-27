const express = require('express')
const mongoose = require('mongoose')
const schedule = require('node-schedule')

const db = process.env.MongoURI
const Job = require('./src/models/Job')
const scraper = require('./src/datascraper/dataScraper')

const app = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("access-control-allow-methods", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(express.json())

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

const deleteDB = schedule.scheduleJob('30 * * * * *', () => {


    Job.deleteMany({ applied: false, dismissed: true }, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

const scraperSchedule = schedule.scheduleJob('* * 6 * * *', () => {

    scraper('recruiter')
    scraper('recruitment')
    scraper('talent')

})

app.get('/jobs', async (req, res) => {

    try {
        await Job.find().lean().exec((err, jobs) => {
            
            res.status(201).send(jobs)
        })

    } catch(e) {

          res.status(401).send()
    }
})

app.patch('/jobs/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    
    try {
        const job = await Job.findOne({ _id: req.params.id})
        
        if(!job) {
            res.status(404).send('no such job')
        }

        updates.forEach(update => {
            job[update] = req.body[update]
        })

        await job.save()

        res.send(job)   

    } catch(e) {

        res.status(500).send()
    }
})



const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started on Port ${PORT}`))
