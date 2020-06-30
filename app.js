const express = require('express')
const mongoose = require('mongoose')
const schedule = require('node-schedule')

const db = process.env.MongoURI
const Job = require('./src/models/Job')
const User = require('./src/models/User')
const auth = require('./src/middleware/auth')

const jobScraper = require('./src/datascraper/dataScraper')

const app = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("access-control-allow-methods", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
  });

app.use(express.json())

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

const deleteDB = schedule.scheduleJob('* 0 5 * * *', () => {


    Job.deleteMany({ applied: false, dismissed: true }, (err) => {
        if (err) {
            console.log(err)
        }
    })
})

// const scraperSchedule = schedule.scheduleJob('30 * * * * *', () => {

//     scraper('recruiter')
//     scraper('recruitment')
//     scraper('talent')

// })

// users


app.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

app.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


app.post('/jobs', async (req, res) => {

    try {
        const title = req.body.title
        const location = req.body.location
        console.log(title, location)

        jobScraper(title, location)
            .then(response => {
                res.send(response)
            })
            
    } catch (e) {
        res.status(500).send()
    }
    

})


app.post('/jobs/save', auth, async (req, res) => {
    const job = new Job({
        ...req.body, 
        owner: req.user._id
    })

    try {
        await job.save()
        res.status(201).send()
    } catch (e) {
        res.status(400)
    }

})

app.get('/users/jobs', auth, async (req, res) => {
    const match = {}
    
    if(req.query.applied) {
        match.applied = req.query.applied
    }

    try {
        await req.user.populate({
            path: 'jobs',
            match
        }).execPopulate()
        res.send(req.user.jobs)
    } catch (e) {
        res.status(500).send()
    }
})

app.patch('/jobs/:id', auth, async (req, res) => {
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
