import { storageGet } from "./localStorage.js";
import { sendNotification } from './notifications.js';

const pause = document.querySelector('.timer--pause')
const timer = document.querySelector('.timer--counter')
const menuButtons = document.querySelectorAll('.menu--item')
const timerPath = document.querySelector('.base-timer__path-elapsed');
const menuItems = document.querySelectorAll('.menu--item')
const alarm = new Audio('resources/mixkit-alarm-tone-996.wav')

let notification = null
let currentColor = storageGet('theme') || 'red'
let pomodoro = storageGet('time-pomodoro')
let short = storageGet('time-shortBreak')
let long = storageGet('time-longBreak')
let isPaused = false
let currentTimer = document.getElementById('menuPomodoro')
let timestamp = Math.floor(Number(pomodoro) * 60)
// let timestamp = 10
let totalTimestamp = Math.floor(Number(pomodoro) * 60)
// let totalTimestamp = 10
let breakSequence = 0;

menuItems.forEach(item => {
    item.classList.add(currentColor)

    item.onclick = (e = MouseEvent) => {
        changeSelected(item)
        changeTimer(item)
    }
})

function changeSelected(item) {
    const previousSelected = document.querySelector('.menu--item.selected')
    previousSelected.classList.remove('selected')
    item.classList.add('selected')
}

pause.addEventListener('click', pauseTimer)
function pauseTimer() {
    if (isPaused) {
        isPaused = false
        pause.className = 'timer--pause'
        return pause.textContent = "pause"
    }
    isPaused = true
    pause.className = `timer--pause ${currentColor}`
    return pause.textContent = "resume"
}
pauseTimer()

function numToHour(num) {
    let minutes = Math.floor(num % 3600 / 60)
    let seconds = Math.floor(num % 3600 % 60)

    if (minutes < 10) minutes = "0" + minutes
    if (seconds < 10) seconds = "0" + seconds

    return minutes + ':' + seconds
}
timer.textContent = numToHour(timestamp)

function changeTimer(item) {
    const times = {
        menuPomodoro: pomodoro,
        menuShort: short,
        menuLong: long
    }

    currentTimer = item
    timestamp = Math.floor(Number(times[item.id]) * 60)
    totalTimestamp = Math.floor(Number(times[item.id]) * 60)
    timer.textContent = numToHour(timestamp)
    timerPath.style.strokeDasharray = `${timestamp / totalTimestamp * 283} 283`
}

const timerInterval = setInterval(() => {
    if (isPaused) return

    timestamp--
    const timeFraction = timestamp / totalTimestamp
    timerPath.style.strokeDasharray =
        `${(timeFraction - (1 / totalTimestamp) * (1 - timeFraction)) * 283} 283`

    if (timestamp === 0) {
        let notificationPerm = storageGet('notifications') || 'false'

        if (currentTimer === menuButtons[0] && breakSequence === 3) {
            // take a long break
            changeTimer(menuButtons[2])
            breakSequence = 0
            changeSelected(menuButtons[2])

            if (notificationPerm == 'true') {
                notification = sendNotification({
                    title: 'You can finally rest!',
                    body: `Take a long break now, your next pomodoro timer will start in ${Math.floor(totalTimestamp / 60)} minutes.`,
                    image: './resources/longBreak.png'
                    // image: 'https://i.imgur.com/OzcVy9J.png'
                })
            }
            else {
                alarm.play()
            }
        }
        else if (currentTimer === menuButtons[0]) {
            // take a short break
            changeTimer(menuButtons[1])
            breakSequence++
            changeSelected(menuButtons[1])

            if (notificationPerm == 'true') {
                notification = sendNotification({
                    title: 'Hey, take a short break!',
                    body: `Your next pomodoro timer will start in ${Math.floor(totalTimestamp / 60)} minutes.`,
                    image: './resources/shortBreak.png'
                    // image: 'https://i.imgur.com/ucKAK47.png'
                })
            }
            else {
                alarm.play()
            }
        }
        else {
            // task time
            changeTimer(menuButtons[0])
            changeSelected(menuButtons[0])

            if (notificationPerm == 'true') {
                notification = sendNotification({
                    title: 'It is time to start your task!',
                    body: `You will have a ${breakSequence === 3 ? 'long' : 'short'} break in ${Math.floor(totalTimestamp / 60)} minutes.`,
                    image: './resources/pomodoro.png'
                    // image: 'https://i.imgur.com/QRSKyvq.png'
                })
            }
            else {
                alarm.play()
            }
        }
    }

    timer.textContent = numToHour(timestamp)
}, 1000)

function updateTimer() {
    pomodoro = storageGet('time-pomodoro')
    short = storageGet('time-shortBreak')
    long = storageGet('time-longBreak')
    currentColor = storageGet('theme') || 'red'
    if (pause.textContent === 'resume') pause.className = `timer--pause ${currentColor}`
    changeTimer(currentTimer)
}

export default updateTimer