// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/taskRoutes');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname);
        const filename = `${uniqueId}${extension}`;
        file.uniqueId = uniqueId; // Attach uniqueId to the file object
        cb(null, filename);
    }
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(process.env.UPLOADS_DIRECTORY));
app.use('/api', taskRoutes(upload));

app.get('/', (req, res) => {
    res.send("Server is running!");
});


app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
