const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');

const Elevator = require('../models/elevator');
const User = require('../models/user');
const Level = require('../models/level');


const userSchema = mongoose.Schema({
    _id: String,
    weight: Number,
    destination: Number
});



const levelSchema = mongoose.Schema({
    _id: Number,
    users: [Object]
});

module.exports = mongoose.model('Level', levelSchema);

module.exports = mongoose.model('User', userSchema);


router.patch('/:elevator_id', async (req, res, next) => {
    try {
        const id = req.params.elevator_id;
        const new_level = req.body.level;
        const parsed_level = parseInt(new_level);
        const elevator = await Elevator.findById(id);


      /*   if (elevator.users.length > 0) {} */


      const users = await User.find({});
      const levels = await Level.find({});

      for (const level of levels) {
        if (level.users.length !== 0) {
            if (level.users.includes(users[0])) {
                const piso_primera_llamada = parseInt(level.id);
                break
            }
        }
        
      }
      console.log(piso_primera_llamada)
    
        /* si el elevador esta vacio */
        if (elevator.users.length === 0 && users.length !== 0) {

            /* si el elevador va subiendo */
            if (piso_primera_llamada > parseInt(elevator.level)) {
                for (const level of levels) {
                    if (parseInt(level.id) === piso_primera_llamada) {
                        const destino_elevator = await piso_primera_llamada;
                        break;
                    }
                    if (level.users.length !== 0 && parseInt(level.id) >= parseInt(elevator.level)) {
                        if (parseInt(level.users[0].destination) > parseInt(level.id)) {
                            const destino_elevator = await level.id;
                            break;
                        }
                    }
                }
            }
          
            if (destino_elevator !== new_level) {
                return res.status(404).json({ Error: `elevator should have gone to level ${destino_elevator}, not to level ${new_level}` });
            }
        }


        const updatedElevator = await Elevator.findByIdAndUpdate(
            id,
            { $set: { level: new_level } },
            { new: true }
        );

        console.log(updatedElevator);
        res.status(200).json(updatedElevator);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;