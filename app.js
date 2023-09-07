const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const elevatorRoutes = require('./api/routes/elevators');
const levelsRoutes = require('./api/routes/levels');
const usersRoutes = require('./api/routes/users');
const resetRoutes = require('./api/routes/reset');

mongoose.connect('mongodb+srv://adesolminihac:5ccg9o2u@cluster0.fcrb51g.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/elevators', elevatorRoutes);
app.use('/levels', levelsRoutes);
app.use('/users', usersRoutes);
app.use('/reset', resetRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;























/* const ascensor = [
    {id: 1, name: 'Jorge', age: '20', enroll: true},
    {id: 2, name: 'Pancho', age: '30', enroll: true},
    {id: 3, name: 'Mario', age: '40', enroll: true}

];
 {id: str, max_weight: int, current_weight: int, level: int, users: Users, doors: "closed"} 

app.get('/', (req, res) => {
    res.send('API');
});

app.get('/api/ascensor', (req, res) => {
    res.send(ascensor);
});

app.get('/api/students/:id', (req, res) => {
    const student = students.find(c => c.id === parseInt(req.params.id));
    if (!student) return res.status(404).send('Estudiante no encontrado');
    else res.send(ascensor);
});

const port = process.env.port || 80;
app.listen(port, () => console.log(`Escuchando en puerto ${port}...`)); */