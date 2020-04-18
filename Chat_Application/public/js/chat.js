const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form') 
const $mesageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#sendLocation')
const $messages = document.querySelector('#messages')


//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//Options
const {username, room} =  Qs.parse(location.search, {ignoreQueryPrefix: true})


socket.on('message',(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAT: moment(msg.createdAT).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage',(msg)=>{
    console.log(msg)
    const html = Mustache.render(locationMessageTemplate, {
        username: msg.username,
        url: msg.url,
        createdAT : moment(msg.createdAT).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (msg)=>{
        $messageFormButton.removeAttribute('disabled')
        $mesageFormInput.value = ''
        $mesageFormInput.focus()
        console.log('message was delivered',msg)
    })
})


$sendLocationButton.addEventListener('click', ()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit('sendLocation',{
            lattitude : position.coords.latitude,
            longitude: position.coords.longitude
        })
        $sendLocationButton.removeAttribute('disabled')
    })
})


socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href= '/'
    }
})