import { storageGet, storageSet } from "./localStorage.js";
import { askNotificationPermission } from "./notifications.js";
import updateTimer from "./timer.js";

const optionValues = {
    ['time-pomodoro']: {
        current: storageGet('time-pomodoro') || 15
    },
    ['time-shortBreak']: {
        current: storageGet('time-shortBreak') || 5
    },
    ['time-longBreak']: {
        current: storageGet('time-longBreak') || 25
    },
    font: {
        current: storageGet('font') || 'Nunito'
    },
    theme: {
        current: storageGet('theme') || 'red'
    }
};
const timeInputs = document.querySelectorAll('.settings__time input');
const fonts = document.querySelectorAll('.fonts > button');
const colors = document.querySelectorAll('.color > button');
const apply = document.getElementById('submitSettings');
const timer = document.querySelector('.timer--counter');
const settings = document.getElementById('settings');
const timerPath = document.querySelector('.base-timer__path-elapsed');
const notifSwitch = document.querySelector('.settings__notifications .switch');
const notifCheckbox = notifSwitch.children[0]
const notifPerms = storageGet('notifications') || false;

(function setSettingsPopup() {
    const settingsButton = document.getElementById('settingsButton')
    const closeSettings = document.getElementById('closeSettings')

    settingsButton.onclick = (e = MouseEvent) => {
        settings.style.display = 'block'
    }

    closeSettings.onclick = (e = MouseEvent) => {
        settings.style.display = 'none'
        applySettings(false)
    }
})();

(function setTimeSettings() {
    timeInputs.forEach(inputTag => {
        inputTag.addEventListener('input', changeTimeCache)
        inputTag.value = optionValues[`time-${inputTag.id}`].current
    })

    function changeTimeCache() {
        optionValues[`time-${this.id}`].next = this.value
    }

})();

(function setSettingsFonts() {
    fonts.forEach(font => {
        if (optionValues.font.current === font.getAttribute('data-font')) {
            changeSelectedFont(font)
        }
        font.style.fontFamily = font.getAttribute('data-font')

        font.addEventListener('click', function () {
            optionValues.font.next = this.getAttribute('data-font')
            changeSelectedFont(this)
        })
    })

})();
function changeSelectedFont(target) {
    const previousSelected = document.querySelector('.fonts .selected')
    previousSelected.classList.remove('selected')
    target.classList.add('selected')
    timer.style.fontFamily = target.getAttribute('data-font')
};

(function setSettingsColors() {
    colors.forEach(color => {
        if (optionValues.theme.current === color.id) {
            changeSelectedColor(color)
        }
        color.style.backgroundColor = color.getAttribute('data-color')

        color.addEventListener('click', function () {
            optionValues.theme.next = this.id
            changeSelectedColor(this)
        })
    })

})();
function changeSelectedColor(target) {
    const menuItems = document.querySelectorAll('.menu--item');

    const previousSelected = document.querySelector('.color .selected')
    previousSelected.classList.remove('selected')
    target.classList.add('selected')
    timerPath.className.baseVal = `base-timer__path-elapsed ${optionValues.theme.current}`
    notifSwitch.children[1].className = `slider round ${optionValues.theme.current}`

    menuItems.forEach(item => {
        if (item.classList.contains('selected')) return item.className = `menu--item selected ${optionValues.theme.current}`
        item.className = `menu--item ${optionValues.theme.current}`
    })
};
changeSelectedColor(optionValues.theme.current)

(function setNotifButton() {
    if(notifPerms == 'true') notifCheckbox.checked = true
    else notifCheckbox.checked = false

    notifSwitch.addEventListener('click', function () {
        if (notifCheckbox.checked) {
            storageSet('notifications', 'false')
            return notifCheckbox.checked = false
        } else {
            askNotificationPermission().then(res => {
                if (res === 'granted') {
                    storageSet('notifications', 'true')
                    return notifCheckbox.checked = true
                }
                else if (res === 'denied') {
                    storageSet('notifications', 'false')
                    return
                }
            })
            return
        }
    })
})();

(function submitSettings() {
    apply.classList.add(optionValues.theme.current)
    let includeTimer = false

    apply.addEventListener('click', function () {

        Object.entries(optionValues).forEach(([key, value]) => {
            if(key.startsWith('time') && value.next !== undefined) {
                includeTimer = true
            }

            if (value.next) {
                value.current = value.next
                storageSet(key, value.next)
                return delete value.next
            }
        })
        applySettings(includeTimer)

    })
})();

function applySettings(includeTimer = true) {
    timeInputs.forEach(inputTag => {
        inputTag.value = optionValues[`time-${inputTag.id}`].current
    })
    fonts.forEach(font => {
        if (optionValues.font.current === font.getAttribute('data-font')) {
            changeSelectedFont(font)
        }
    })
    colors.forEach(color => {
        if (optionValues.theme.current === color.id) {
            changeSelectedColor(color)
        }
    })

    apply.className = `settings--apply ${optionValues.theme.current}`
    settings.style.display = 'none'
    includeTimer && updateTimer()
}