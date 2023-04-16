console.log('executedTranslateScript')

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'translate') {
    const translateTextArea = document.querySelector('div[_d-id="1"]')
    const translatedTextArea = document.querySelector('div[_d-id="8"]')

    function fillTranslateTextArea() {
      translateTextArea.textContent = message.translateArray[index].textToTranslate
      translateTextArea.dispatchEvent(new Event('input', { bubbles: true }))
    }

    function clearTranslateTextArea() {
      let clearButton = document.querySelector('button#translator-source-clear-button')

      if (clearButton) {
        clearButton.dispatchEvent(new Event('click', { bubbles: true }))
        return true
      }
    }

    let index = 0
    let skip = false
    let translatedArray = []

    const observer = new MutationObserver((mutations) => {
      if (mutations[0].target.attributes[0].nodeValue === 'false') {
        if (message.translateArray.length - 1 > index) {
          !skip ? index++ : skip = false
          fillTranslateTextArea()
        } else {
          // console.log(message.translateArray)
          observer.disconnect()
        }
      } else {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length === 1 && mutation.removedNodes.length === 0 && mutation.addedNodes[0].textContent) {
            translatedArray = [...translatedArray, mutation.addedNodes[0].textContent]
            if (translatedArray.length > Math.floor(message.translateArray.length / 10)) {
              chrome.runtime.sendMessage({ type: 'translated', translatedArray, index })
            }
            clearTranslateTextArea()
          }
        })
      }
    })

    observer.observe(translatedTextArea, { childList: true })
    if (clearTranslateTextArea()) skip = true
    fillTranslateTextArea()
  }
})
