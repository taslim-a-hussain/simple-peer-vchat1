const Peer = require('simple-peer')
const socket = io()
const video = document.querySelector('video')
const client = {}


// Get stream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    socket.emit('NewClient')
    video.srcObject = stream
    video.play()
    
    // Initialize a peer
    function initPeer(type) {
        let peer = new Peer({ 
            initiator: (type == 'init') ? true : false,
            stream: stream,
            trickle: false 
        })

        peer.on('stream', stream => {
            CreateVideo(stream)
        })

        peer.on('close', () => {
            document.getElementById('peerVideo').remove()
            peer.destroy()
        })

        return peer;
    }

    // For peer of type init
    function makePeer() {
        client.gotAnswer = false
        let peer = initPeer('init')
        peer.on('signal', (data) => {
            if (!client.gotAnswer) {
                socket.emit('Offer', data)
            }
        })
        client.peer = peer
    }

    // For peer of type not init
    function frontAnswer(offer) {
        let peer = initPeer('notInit')
        peer.on('signal', data => {
            socket.emit('Answer', data)
        })
        peer.signal(offer)
    }


    function signalAnswer(answer) {
        client.gotAnswer = true
        let peer = client.peer
        peer.signal(answer)
    }


    function createVideo(stream) {
        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.class = 'embed-responsive-item'
        document.querySelector('#peerDiv').appendChild(video)
    }


    function sessionActive() {
        document.write('Session active. Please come back later!')
    }


    socket.on('BackOffer', frontAnswer)
    socket.on('BackAnswer', signalAnswer)
    socket.on('SessionActive', sessionActive)
    socket.on('CreatePeer', makePeer)

}).catch(err => document.write(err))