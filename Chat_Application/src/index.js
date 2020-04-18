const path = require('path')
const http = require('http')
const express = require('express')
const scoketio = require('socket.io')
const  {generateMessage, generateLocationMessage}= require('./utils/messages')
const {addUser,removeUser,getUser,getUsersRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = scoketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

io.on('connection', (socket)=>{
    console.log('new websocket connection')

    
    socket.on('join', ({username, room}, callback)=>{
       const {error, user} =  addUser({id: socket.id, username, room})
        
        if (error) {
            return callback(error)
        } 


        socket.join(user.room)
        
        socket.emit('message', generateMessage('WELCOME!'))

        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))

        callback()
    
    })

    socket.on('sendMessage',(message, callback) => {
        const user = getUser(socket.id)
        
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback('delivered')
    })

    socket.on('sendLocation',(coords) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.lattitude},${coords.longitude}`))
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
        }

        
    })

   
    
})

server.listen(port, ()=>{
    console.log(` server is up on port ${port}!`)
})