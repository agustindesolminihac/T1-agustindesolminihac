const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');
const orden_llamada = require('./levels.js');

const Elevator = require('../models/elevator');
const User = require('../models/user');
const Level = require('../models/level');


router.get('/', (req, res, next) => {
    Elevator.find()  
        .exec()
        .then(elevators => {
            res.status(200).json({
                message: 'Lista de ascensores:',
                elevators: elevators 
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    const max_weight = req.body.max_weight;
    const parsed_max_weight = parseInt(max_weight);

    if (!max_weight) {
        return res.status(400).json({
            Error: 'missing parameter: max_weight'
        });
    }

    if (isNaN(parsed_max_weight) || parsed_max_weight < 0) {
        return res.status(400).json({Error: `invalid max wight ${max_weight}`});
    }

    const elevator = new Elevator({
        _id: new mongoose.Types.ObjectId(),
        max_weight: max_weight,
        current_weight: 0,
        level: 1,
        users: [],
        doors: "closed"
    });

    elevator
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Acabas de crear un ascensor',
                createdElevator: elevator
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                Error: 'Error al crear el ascensor'
            });
        });
});

router.get('/:elevator_id', (req, res, next) => {
    const id = req.params.elevator_id;
    Elevator.findById(id)
    .exec()
    .then(doc => {
        console.log("From DB", doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({Error: `elevator with id ${id} not found`});
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({Error: `elevator with id ${id} not found`});
    });
});

router.delete('/:elevator_id', (req, res, next) => {
    const id = req.params.elevator_id;
    Elevator.deleteOne({ _id: id })
        .exec()
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ Error: `Elevator with id ${id} not found` });
            }
            res.status(200).json({ message: `Elevator with id ${id} deleted` });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({Error: `elevator with id ${id} not found`});
        });
});

router.patch('/:elevator_id', async (req, res, next) => {
    try {
        const id = req.params.elevator_id;
        const new_level = req.body.level;
        const parsed_level = parseInt(new_level);
        const elevator = await Elevator.findById(id);

        if (!new_level) {
            return res.status(400).json({ Error: 'missing parameter: level' });
        }

        if (isNaN(parsed_level) || parsed_level < 1) {
            return res.status(400).json({ Error: `invalid level ${new_level}` });
        }

        if (!elevator) {
            return res.status(404).json({ Error: `Elevator with id ${id} not found` });
        }

        if (elevator.doors === "open") {
            return res.status(400).json({ Error: 'elevator doors are open' });
        }

      


        const users = await User.find({});
        const levels = await Level.find({});
        let piso_primera_llamada;
        let destino_elevator;
        for (const level of levels) {
            if (level.users.length !== 0) {               
                if (level.users[0]._id === users[0].id) {
                    piso_primera_llamada = parseInt(level.id);
                    break;
                }
            }
            
        }

        /* si el elevador no esta vacio */
        if (elevator.users.length !== 0){
            let encontrado;
            const distancias = [];
            for (const user of elevator.users) {
                distancias.push(parseInt(user.destination))
            }
            console.log(distancias);
            let destino_in_elevator = Math.min(...distancias);
  

            /* si el elevador va subiendo */
            if (destino_in_elevator > parseInt(elevator.level)) {
                destino_in_elevator = Math.min(...distancias);
                for (const level of levels) {
                    if (encontrado === 1){
                        break;
                    }
                    
                    if (parseInt(level.id) === destino_in_elevator) {
                        destino_elevator = destino_in_elevator;
                        break;
                    }
                    if (level.users.length !== 0 && parseInt(level.id) >= parseInt(elevator.level)) {
                        for (const user of level.users){
                            if (parseInt(user.destination) > parseInt(level.id)) {
                                destino_elevator = level.id;
                                encontrado = 1;
                                break;
                            }
                        }
                    }
                }
            }

            /* si el elevador va bajando */
            if (destino_in_elevator < parseInt(elevator.level)) {
                destino_in_elevator = Math.max(...distancias);
                for (const level of levels) {
                    if (encontrado === 1){
                        break;
                    }
                    if (parseInt(level.id) === parseInt(elevator.level)) {
                        destino_elevator = destino_in_elevator;
                        break;
                    }
                    if (level.users.length !== 0 && destino_in_elevator < parseInt(level.id)) {
                        for (const user of level.users){
                            if (parseInt(user.destination) < parseInt(level.id)) {
                                destino_elevator = level.id;
                                encontrado = 1;
                                break;
                            }
                        }
                    }
                }
            }
        }


    
        /* si el elevador esta vacio */
        if (elevator.users.length === 0 && users.length !== 0) {
            let encontrado;
            

            /* si el elevador va subiendo */
            if (piso_primera_llamada > parseInt(elevator.level)) {
                for (const level of levels) {
                    if (encontrado === 1){
                        break;
                    }
                    
                    if (parseInt(level.id) === piso_primera_llamada) {
                        destino_elevator = piso_primera_llamada;
                        break;
                    }
                    
                    if (level.users.length !== 0 && parseInt(level.id) >= parseInt(elevator.level)) {
                        for (const user of level.users){
                            if (parseInt(user.destination) > parseInt(level.id)) {
                                destino_elevator = level.id;
                                encontrado = 1;
                                break;
                            }
                        }
                        
                    }
                }
            }
            
            /* si el elevador va bajando */
            if (piso_primera_llamada < parseInt(elevator.level)) {
                for (const level of levels) {
                    if (encontrado === 1){
                        break;
                    }

                    if (parseInt(level.id) === parseInt(elevator.level)) {
                        destino_elevator = piso_primera_llamada;
                        break;
                    }
                    if (level.users.length !== 0 && piso_primera_llamada < parseInt(level.id)) {
                        for (const user of level.users){
                            if (parseInt(user.destination) < parseInt(level.id)) {
                            destino_elevator = level.id;
                            encontrado = 1;
                            break;
                        }
                        }
                    }
                }
            }
        
        }
        if (!(destino_elevator)){
            destino_elevator = new_level
        }
        console.log(destino_elevator)
        if (parseInt(destino_elevator) !== parseInt(new_level)) {
            return res.status(400).json({ Error: `elevator should have gone to level ${destino_elevator}, not to level ${new_level}` });
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

router.put('/:elevator_id/doors', async (req, res, next) => {
    try {
        const id = req.params.elevator_id;
        const new_doors = req.body.doors;
        const elevator = await Elevator.findById(id);

        if (!new_doors) {
            return res.status(400).json({ Error: 'missing parameter: doors' });
        }

        if (!elevator) {
            return res.status(404).json({ Error: `Elevator with id ${id} not found` });
        }

        if (!(new_doors === "open" || new_doors === "closed")) {
            return res.status(400).json({ Error: `invalid door state ${new_doors}` });
        }

        const updatedElevator = await Elevator.findByIdAndUpdate(
            id,
            { $set: { doors: new_doors } },
            { new: true }
        );

        console.log(updatedElevator);
        res.status(200).json(updatedElevator);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.put('/:elevator_id/users/:user_id', async (req, res, next) => {
    try {
        const elevator_id = req.params.elevator_id;
        const user_id = req.params.user_id;
        const elevator = await Elevator.findById(elevator_id);
        const user = await User.findById(user_id);

        if (!elevator) {
            return res.status(404).json({ Error: `Elevator with id ${elevator_id} not found` });
        }

        if (!user) {
            return res.status(404).json({ Error: `User with id ${user_id} not found` });
        }
        
        const user_in_elevator = elevator.users.find(u => u._id === user_id);
        if (user_in_elevator) {
            return res.status(400).json({ Error: `user ${user_id} already on elevator ${elevator_id}` });
        }

        const level_elevator = await Level.findById(elevator.level);
        const users_in_level_of_elevator = level_elevator.users;
        const user_in_level = users_in_level_of_elevator.find(u => u._id === user_id);
        if (!user_in_level) {
            return res.status(400).json({ Error: `User and elevator are not on the same level` });
        }

        
        
        if (elevator.doors === "closed") {
            return res.status(400).json({ Error: `Elevator doors are closed` });
        }

        const total_weight = elevator.current_weight + user.weight;
        if (total_weight > elevator.max_weight) {
            return res.status(400).json({ Error: `Elevator max weight exceeded` });
        }

        elevator.users.push(user); 
        elevator.current_weight = total_weight; 
        await elevator.save();

        level_elevator.users.pull(user); 
        await level_elevator.save();
        res.status(200).json(elevator);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.delete('/:elevator_id/users/:user_id', async (req, res, next) => {
    try {
        const elevator_id = req.params.elevator_id;
        const user_id = req.params.user_id;
        const elevator = await Elevator.findById(elevator_id);
        const user = await User.findById(user_id);

        if (!elevator) {
            return res.status(404).json({ Error: `Elevator with id ${elevator_id} not found` });
        }

        if (!user) {
            return res.status(404).json({ Error: `User with id ${user_id} not found` });
        }

        if (!(elevator.level === user.destination)) {
            return res.status(400).json({ Error: `user requested level ${user.destination} but elevator is on level ${elevator.level}` });
        }

        const user_in_elevator = elevator.users.find(u => u._id === user_id);
        if (!user_in_elevator) {
            return res.status(400).json({ Error: `"user ${user_id} already left elevator ${elevator_id}` });
        }
        
        if (elevator.doors === "closed") {
            return res.status(400).json({ Error: `Elevator doors are closed` });
        }

        
        elevator.current_weight = elevator.current_weight - user.weight;
        elevator.users.pull(user); 
        await elevator.save();
        console.log(elevator);
        console.log(elevator.users);

        await User.deleteOne({ _id: user_id });

        /* const level_elevator = await Level.findById(elevator.level);
        level_elevator.users.push(user); 
        await level_elevator.save();*/
        const updatedElevator = await Elevator.findById(elevator_id); 

        res.status(200).json(updatedElevator);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;