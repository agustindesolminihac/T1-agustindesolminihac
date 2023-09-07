const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');

const Elevator = require('../models/elevator');
const User = require('../models/user');
const Level = require('../models/level');

router.post('/', async (req, res, next) => {
    try {
        await Elevator.deleteMany({});
        await User.deleteMany({});

        const levels = await Level.find({});
        for (const level of levels) {
            if (level.users.length !== 0){
                level.users = []; 
                await level.save(); 
            }
            
        }
        
        res.status(200).json({ message: 'ok' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting elevators and users' });
    }
});

module.exports = router;