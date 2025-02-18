const dotevn = require('dotenv');
dotevn.config();
const express = require('express');
const generateJobDescription = require('./jdGenerator');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/jd-generate', async (req, res) => { 
    const { job, experience, skills } = req.body;
    const text = await generateJobDescription({ job, experience, skills });
    res.json({ text });
});


app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});