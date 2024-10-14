// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');
const axios = require('axios'); // To send emails via EmailJS
const Task = require('./models/Task'); // Task model

dotenv.config(); // Load environment variables from .env

const app = express();
app.use(express.json()); // Middleware to parse incoming JSON requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Basic route for API status
app.get('/', (req, res) => {
    res.send('Task Scheduler API');
});

// Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, scheduledTime, email } = req.body;
        const task = new Task({ title, description, scheduledTime, email });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Function to send an email using EmailJS
const sendEmailReminder = async (task) => {
    const emailData = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
            title: task.title,
            scheduledTime: task.scheduledTime,
            to_email: task.email
        }
    };

    await axios.post('https://api.emailjs.com/api/v1.0/email/send', emailData)
        .then(response => console.log('Email sent successfully'))
        .catch(error => console.error('Failed to send email:', error.message));
};

// Cron job to check for tasks every minute and send reminder emails
cron.schedule('* * * * *', async () => {
    const now = new Date();
    const tasks = await Task.find({
        scheduledTime: { $lte: new Date(now.getTime() + 5 * 60 * 1000) }, // within 5 minutes
        reminderSent: false
    });

    tasks.forEach(async (task) => {
        await sendEmailReminder(task);  // Send the reminder email
        task.reminderSent = true;        // Mark task as reminder sent
        await task.save();               // Save the updated task in the database
    });
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
