let translations;
const literalTranslate = {
    ['short-break']: document.querySelectorAll('#menuShort,.shortBreak>label'),
    ['long-break']: document.querySelectorAll('#menuLong,.longBreak>label'),
    settings: document.querySelector('.settings__header>h2'),
    ['time-minutes']: document.querySelector('.settings__time>h3'),
    font: document.querySelector('.settings__font>h3'),
    color: document.querySelector('.settings__color>h3'),
    language: document.querySelector('.settings__language>h3'),
    notifications: document.querySelector('.settings__notifications>h3'),
    apply: document.getElementById('submitSettings'),
};

const attrTranslate = {
    resume: document.querySelector('.timer--pause'),
    pause: document.querySelector('.timer--pause'),
    ['help-desc']: document.querySelector('.settings--help'),
    ['pomodoro-tip']: document.querySelector('.pomodoro'),
    ['short-break-tip']: document.querySelector('.shortBreak'),
    ['long-break-tip']: document.querySelector('.longBreak')
};

async function changeLanguage(newLang) {
    translations = await (await fetch('./js/translations.json')).json();
    const pause = attrTranslate.pause

    Object.entries(literalTranslate).forEach(([key, target]) => {
        const translation = translations[key][newLang].replace(/<br>/g, '\n')

        if (target instanceof NodeList) {
            return target.forEach(item => item.textContent = translation)
        }
        return target.textContent = translation
    })
    
    const isPaused = pause.getAttribute('data-resume') === pause.textContent
        || 'resume' === pause.textContent

    Object.entries(attrTranslate).forEach(([key, target]) => {
        const translation = translations[key][newLang].replace(/<br>/g, '\n')

        if (target instanceof NodeList) {
            return target.forEach(item => item.setAttribute('data-' + key, translation))
        }
        return target.setAttribute('data-' + key, translation)

    })

    if (isPaused) pause.textContent = pause.getAttribute('data-resume')
    else pause.textContent = pause.getAttribute('data-pause')
};

function getTranslation(key, lang) {
    return translations[key][lang]
};

export { changeLanguage, getTranslation }