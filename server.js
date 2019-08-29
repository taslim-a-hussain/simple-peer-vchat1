const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

const port = process.env.PORT || 3000

// Static folder
app.use(express.static(__dirname + '/public'))

let client = 0

io.on('connection', (sockect) => {
    sockect.on('NewClient', () => {
        if (client < 2) {
            if(client == 1) {
                this.emit('CreatePeer')
            }
        } else {
            this.emit('SessionActive')
            client++;
        }
    })
    sockect.on('Offer', SendOffer)
    sockect.on('Answer', SendAnswer)
    sockect.on('disconnect', Disconnect)
})


function Disconnect() {
    if (client > 0) {
        client--
    }
}

function SendOffer(offer) {
    this.broadcast.emit('BackOffer', offer)
}

function SendAnswer(data) {
    this.broadcast.emit('BackAnswer', data)
}


http.listen(port, () => {
    console.log(`Server is up and running on port: ${port}`)
})