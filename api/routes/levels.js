const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');

const Level = require('../models/level');
const User = require('../models/user');


router.get('/', (req, res, next) => {
    Level.find()  
        .exec()
        .then(levels => {
            res.status(200).json({
                message: 'Lista de levels:',
                levels: levels 
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:level_id', async (req, res, next) => {
    try {
        const level_id = req.params.level_id;
        const parsed_level = parseInt(level_id);

        if (isNaN(parsed_level) || parsed_level < 1) {
            return res.status(400).json({ Error: `invalid level ${level_id}` });
        }

        const level = await Level.findById(level_id);

        console.log(level);
        res.status(200).json(level);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/:level_id/users',async (req, res, next) => {
    try {
        const level_id = req.params.level_id;
        const user_id = req.body.id;
        

        if (isNaN(level_id) || parseInt(level_id) < 1) {
            return res.status(400).json({ Error: `invalid level ${level_id}` });
        }

        if (!user_id) {
            return res.status(400).json({
                Error: 'missing parameter: id'
            });
        }

        const weight = Math.floor(Math.random() * (100 - 20 + 1)) + 20; 
        const destination = Math.floor(Math.random() * 100) + 1;

        const user = new User({
            _id: user_id,
            weight: weight,
            destination: destination
        });
        await user.save();

        if (parseInt(user.destination) === parseInt(level_id)) {
            return res.status(400).json({ Error: `user ${user.id} is already on level ${level_id}` });
        }


        
        const level = await Level.findById(level_id);
        level.users.push(user); 
        await level.save();

        console.log(level);
        res.status(200).json(level);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/', async (req, res, next) => {
    try {
        for (let i = 1; i <= 100; i++) {
            const newLevel = new Level({
                _id: i,
                users: []
            });
            await newLevel.save();
        }

        res.status(200).json({ message: 'Se crearon 100 levels' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

const miVariable = 'Hola desde archivo1';


module.exports = router;