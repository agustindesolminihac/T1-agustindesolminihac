const express = require('express');
const router = express.Router()
const mongoose = require('mongoose');

const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()  
        .exec()
        .then(users => {
            res.status(200).json({
                message: 'Lista de usuarios:',
                usuarios: users 
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:user_id', (req, res, next) => {
    const id = req.params.user_id;
    User.deleteOne({ _id: id })
        .exec()
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: `User with id ${id} not found` });
            }
            res.status(200).json({ message: `User with id ${id} deleted` });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({message: `User with id ${id} not found`});
        });
});

router.post('/', (req, res, next) => {
    const user = new User({
        _id: "hola123",
        weight: 85,
        destination: 1
    });

    user
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Acabas de crear un usuario',
                createduser: user
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'Error al crear el ascensor'
            });
        });
});

module.exports = router;