import { getTranslation } from "./languages.js";
import { storageGet } from "./localStorage.js";
import { sendNotification } from './notifications.js';

const pause = document.querySelector('.timer--pause')
const timer = document.querySelector('.timer--counter')
const menuItems = document.querySelectorAll('.menu--item')
const menuButtons = document.querySelectorAll('.menu--item')
const tickingClock = new Audio('resources/ticking-clock.mp3')
const alarm = new Audio('resources/mixkit-alarm-tone-996.wav')
const timerPath = document.querySelector('.base-timer__path-elapsed');

let idleID;
let notification;
let timerInterval;
let startTimestamp;
let isPaused = false
let currentColor = storageGet('theme') || 'red'
let pomodoro = storageGet('time-pomodoro') || 25
let short = storageGet('time-shortBreak') || 5
let long = storageGet('time-longBreak') || 15
let currentTimer = document.getElementById('menuPomodoro')
let timestamp = Math.floor(Number(pomodoro) * 60)
let totalTimestamp = Math.floor(Number(pomodoro) * 60)
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
        startTimestamp = new Date().getTime()
        idleID = requestIdleCallback(startTimer)
        return pause.textContent = pause.getAttribute('data-pause') || 'pause'
    }
    isPaused = true
    cancelIdleCallback(idleID)
    clearInterval(timerInterval)
    pause.className = `timer--pause ${currentColor}`
    return pause.textContent = pause.getAttribute('data-resume') || 'resume'
}
pauseTimer()

function numToHour(num) {
    if(num === 3600) return "60:00"
    
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
    startTimestamp = new Date().getTime()
    timer.textContent = numToHour(timestamp)
    timerPath.style.strokeDasharray = `${timestamp / totalTimestamp * 283} 283`
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (isPaused) return
        let now = Math.floor((new Date().getTime() - startTimestamp) / 1000 - 1)

        if (now >= totalTimestamp - timestamp) timestamp = totalTimestamp - now


        timestamp--
        const timeFraction = timestamp / totalTimestamp
        timerPath.style.strokeDasharray =
            `${(timeFraction - (1 / totalTimestamp) * (1 - timeFraction)) * 283} 283`

        if (timestamp === 8) {
            tickingClock.play()
        }
        else if (timestamp <= 0) {
            let notificationPerm = storageGet('notifications') || 'false'

            if (currentTimer === menuButtons[0] && breakSequence === 3) {
                // take a long break
                changeTimer(menuButtons[2])
                breakSequence = 0
                changeSelected(menuButtons[2])

                if (notificationPerm == 'true') {
                    const userLang = storageGet('language') || 'en'
                    const translated = getTranslation('notification-long-break', userLang)

                    notification = sendNotification({
                        title: translated.title,
                        body: translated.body.replace(/%{time}/g, Math.floor(totalTimestamp / 60)),
                        image: './resources/longBreak.png',
                        icon: './resources/logo500.png'
                        // image: 'https://i.imgur.com/OzcVy9J.png'
                    })
                }
                alarm.play()

            }
            else if (currentTimer === menuButtons[0]) {
                // take a short break
                changeTimer(menuButtons[1])
                breakSequence++
                changeSelected(menuButtons[1])

                if (notificationPerm == 'true') {
                    const userLang = storageGet('language') || 'en'
                    const translated = getTranslation('notification-short-break', userLang)

                    notification = sendNotification({
                        title: translated.title,
                        body: translated.body.replace(/%{time}/g, Math.floor(totalTimestamp / 60)),
                        image: './resources/shortBreak.png',
                        icon: './resources/logo500.png'
                        // image: 'https://i.imgur.com/ucKAK47.png'
                    })
                }
                alarm.play()

            }
            else {
                // task time
                changeTimer(menuButtons[0])
                changeSelected(menuButtons[0])

                if (notificationPerm == 'true') {
                    const userLang = storageGet('language') || 'en'
                    const translated = getTranslation('notification-pomodoro', userLang)

                    notification = sendNotification({
                        title: translated.title,
                        body: translated.body
                            .replace(/%{time}/g, Math.floor(totalTimestamp / 60))
                            .replace(/%{break-type}/g, breakSequence === 3
                                ? translated.long : translated.short),
                        image: './resources/pomodoro.png',
                        icon: './resources/logo500.png'
                        // image: 'https://i.imgur.com/QRSKyvq.png'
                    })
                }
                alarm.play()

            }
        }

        timer.textContent = numToHour(timestamp)
    }, 1000)
};

function updateTimer(onlyColor = true) {
    currentColor = storageGet('theme') || 'red'
    if (pause.textContent === 'resume') {
        pause.className = `timer--pause ${currentColor}`
    }
    if (onlyColor) return

    pomodoro = storageGet('time-pomodoro') || 25
    short = storageGet('time-shortBreak') || 5
    long = storageGet('time-longBreak') || 15
    changeTimer(currentTimer)
}

export default updateTimer