// Package imports
const express = require('express')
const mysql = require('mysql2')

// Server setup
const server = express()
server.use(express.json())
const port = 1234
const host = '0.0.0.0'

server.listen(port, host, () => {
	const networkInterfaces = require('os').networkInterfaces()
	const localIP = Object.values(networkInterfaces)
		.flat()
		.find((i) => i.family === 'IPv4' && !i.internal)
	console.log('Server is running with port: ', port)
	console.log(`🌐 LAN access: http://${localIP ? localIP.address : 'unknown'}:${port}`)
})

// Database setup
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Carvs@10072000',
	database: 'mydb',
})

db.connect((error) => {
	if (error) {
		console.error('❌ DB connection failed:', error.message)
	} else {
		console.log('✅ DB is connected !')
	}
})

// GET Method
// req = request, res = response
server.get('/api/users', (req, res) => {
	db.query('SELECT * FROM USERS', (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}
		res.json(result)
	})
})

server.get('/api/user/:user_id', (req, res) => {
	db.query('SELECT * FROM USERS WHERE ID = ?', req.params.user_id, (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}
		res.json(result)
	})
})

// POST Method
server.post('/api/create-user', (req, res) => {
	const { name, email, phone, address } = req.body

	const createUser = 'INSERT INTO users (name, email, phone, address) VALUES (?, ?, ?, ?)'
	db.query(createUser, [name, email, phone, address], (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}
		res.json({
			status: true,
			message: 'Successfully created !',
		})
	})
})

// PUT Method
server.put('/api/update-user/:id', (req, res) => {
	const { id } = req.params
	const { name, email, phone, address } = req.body

	const updateUser = 'UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?'
	db.query(updateUser, [name, email, phone, address, id], (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}
		res.json({
			status: true,
			message: 'Successfully updated !',
		})
	})
})

// PATCH Method
server.patch('/api/patch-user/:id', (req, res) => {
	const { id } = req.params

	// Only these columns may be patched, so req.body keys never reach the SQL string
	const allowed = ['name', 'email', 'phone', 'address']
	const fields = allowed.filter((field) => req.body[field] !== undefined)

	if (fields.length === 0) {
		return res.status(400).json({
			status: false,
			message: 'No valid fields to update !',
		})
	}

	const setClause = fields.map((field) => `${field} = ?`).join(', ')
	const values = fields.map((field) => req.body[field])

	const patchUser = `UPDATE users SET ${setClause} WHERE id = ?`
	db.query(patchUser, [...values, id], (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}

		if (result.affectedRows === 0) {
			return res.status(404).json({
				status: false,
				message: 'User not found !',
			})
		}

		res.json({
			status: true,
			message: 'Successfully patched !',
		})
	})
})

// DELETE Method
server.delete('/api/delete-user/:id', (req, res) => {
	const { id } = req.params

	const deleteUser = 'DELETE FROM users WHERE id = ?'
	db.query(deleteUser, [id], (error, result) => {
		if (error) {
			console.error('Query error:', error.message)
			return res.status(500).json({ status: false, message: error.message })
		}

		if (result.affectedRows === 0) {
			return res.status(404).json({
				status: false,
				message: 'User not found !',
			})
		}

		res.json({
			status: true,
			message: 'Successfully deleted !',
		})
	})
})

// Global safety net — prevents the server from crashing on unexpected errors
process.on('uncaughtException', (error) => {
	console.error('⚠️ Uncaught Exception:', error.message)
})

process.on('unhandledRejection', (reason) => {
	console.error('⚠️ Unhandled Rejection:', reason)
})
