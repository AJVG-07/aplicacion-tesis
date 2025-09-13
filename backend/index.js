const express = require ('express')
const mysql = require ( 'mysql')
const cors = require('cors')

const app = express()
app.use (cors())
app.use (express.json())

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'aplicacion_tesis'
})

db.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
})

app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            res.status(500).sens({
                error: 'Error al obtener los usuarios'
            })
        } else {
            res.json(results)
        }
    })
})

app.post('/usuarios/add', (req, res) => {
    const { nombre, email } = req.body

    const query ='INSERT INTO usuarios (nombre, email) VALUES (?, ?)'

    db.query(query, [nombre, email], (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al crear el usuario'
            })
        } else {
            res.status(201).json({
                id: results.insertId,
                nombre,
                email
            })
        }
    })      
})

app.put('/usuarios/update/:id', (req, res) => {
    const { id } = req.params
    const { nombre, email } = req.body

    const query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?'

    db.query(query, [nombre, email, id], (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al actualizar el usuario'
            })
        } else {
            res.json({
                id,
                nombre,
                email
            })
        }
    })
})

app.delete('/usuarios/delete/:id', (req, res) => {
    const { id } = req.params

    const query = 'DELETE FROM usuarios WHERE id = ?'

    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send({
                error: 'Error al eliminar el usuario'
            })
        } else {
            res.status(204).send()
        }
    })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})