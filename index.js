// Package imports
const express = require('express');
const mysql = require('mysql2');

// Server setup
const server = express();
server.use(express.json());
const port = 1234;
server.listen(port, () => {
	console.log('Server is running with port: ', port);
});

// Database setup
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Carvs@10072000',
	database: 'mydb',
});

db.connect((error) => {
	if (error) throw error;
	console.log('✅ DB is connected !');
});

// GET Method
// req = request, res = response
server.get('/users', (req, res) => {
	db.query('SELECT * FROM USERS', (error, result) => {
		if (error) throw error;
		res.json(result);
	});
});

server.get('/user/:user_id', (req, res) => {
	db.query('SELECT * FROM USERS WHERE ID = ?', req.params.user_id, (error, result) => {
		if (error) throw error;
		res.json(result);
	});
});

// POST Method
server.post('/create-user', (req, res) => {
	const { name, email, phone, address } = req.body;

	const createUser = 'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)';
	db.query(createUser, [name, email, phone, address], (error, result) => {
		if (error) throw error;
		res.json(result);
	});
});

// PUT Method
server.put('/update-user/:id', (req, res) => {
	const { id } = req.params;
	const { name, email, phone, address } = req.body;

	const updateUser = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
	db.query(updateUser, [name, email, phone, address, id], (error, result) => {
		if (error) throw error;
		res.json({
			status: true,
			message: 'Successfully updated !',
		});
	});
});
