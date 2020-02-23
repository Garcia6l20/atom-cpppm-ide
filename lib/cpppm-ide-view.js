'use babel';

export default class AtomCpppmIdeView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('cpppm-ide')

    // Create message element
    this.message = document.createElement('div')
    this.message.textContent = 'nope'
    this.message.classList.add('message')
    this.element.appendChild(this.message)

    this.element.addEventListener('keypress', () => { this.ondone(this, false) })

    // the ok button
    this.ok = document.createElement('button')
    this.ok.classList.add('cpppm-ide')
    this.ok.textContent = 'Got it !'
    this.ok.classList.add('btn')
    this.ok.addEventListener('click', () => { this.ondone(this, true) })
    this.element.appendChild(this.ok)

    console.debug(this)
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  setMessage(message) {
    this.message.textContent = message
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

}
