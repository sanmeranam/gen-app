const dotevn = require('dotenv');
dotevn.config();
const express = require('express');
const aiModule = require('./jdGenerator');
const multer = require("multer");
const fs = require("fs");
const session = require('express-session');


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const upload = multer({ dest: "uploads/" });


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

// allow cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/api/jd-generate', async (req, res) => {
    const { job, experience, skills } = req.body;
    const text = await aiModule.generateJobDescription({ job, experience, skills });
    res.json({ text });
});

app.post('/api/resume-from-jd', async (req, res) => {
    // const { resume } = req.body;
    // const text = await aiModule.generateJobDescriptionFromResume(resume);
    // res.json({ text });
});

app.get('/api/session-user', async (req, res) => {
    res.json(req.session.user);
});

app.get('/api/logout', async (req, res) => {
    req.session.user = null;
    res.json({ message: "Logout successful" });
});

app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const users = require('./users.json');
    const user = users.find(u => u.username === username && u.secret === password);
    if (user) {
        const _user = { ...user };
        delete _user.secret;
        req.session.user = _user;
        res.json({ user: _user, message: "Login successful", ok: true });
    } else {
        res.status(401).json({ error: "Invalid username or password", ok: false });
    }
});

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        let text = await aiModule.generateResumeSummerization(req.file.path);
        const json = text.replace('```json', '').replace('```', '');
        text = JSON.parse(json);
        res.json(text);
        await fs.promises.unlink(req.file.path);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running');
});