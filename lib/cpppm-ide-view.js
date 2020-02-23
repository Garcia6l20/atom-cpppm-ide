'use babel';

class EditorView {

  constructor(options = {}) {
    this.editor = document.createElement('div')
    this.editor.classList.add('section-container')

    this.buildTypeSelect = document.createElement('select')
    this.buildTypeSelect.appendChild(new Option('Debug', 'Debug'))
    this.buildTypeSelect.appendChild(new Option('Release', 'Release'))

    this.editor.appendChild(this.buildTypeSelect)

    this.buildTypeSelect.addEventListener('change', () => {
      atom.config.set('cpppm-ide.buildType', this.buildTypeSelect.value)
    })

    this.buildTypeSub = atom.config.observe('cpppm-ide.buildType', (value) => {
      this.buildTypeSelect.value = value
    })
  }

  getItem() {
    return this.editor
  }
}

export default class CpppmIdeView {

    constructor(serializedState) {
        // Create panel element
        this.panel = document.createElement('div');
        this.panel.classList.add('pane');

        // Create console wrapper element
        const editorElementsWrapper = document.createElement('div');
        editorElementsWrapper.classList.add('editor-wrapper');
        this.panel.appendChild(editorElementsWrapper);

        const consoleIcon = document.createElement('span');
        consoleIcon.classList.add('icon', 'icon-terminal', 'custom-editor-icon');
        editorElementsWrapper.appendChild(consoleIcon);

        // Create console prefix element
        const editorPrefix = document.createElement('div');
        editorPrefix.classList.add('editor-prefix');
        editorPrefix.textContent = 'cpppm';
        editorElementsWrapper.appendChild(editorPrefix);

        this.editor = new EditorView();
        editorElementsWrapper.appendChild(this.editor.getItem())

        // this.dLSymbol = document.createElement('span');
        // this.dLSymbol.classList.add('icon', 'icon-arrow-down', 'custom-console-icon', 'load-icon-wrapper', 'down-arrow');
        // this.loadSymbol = document.createElement('span');
        // this.loadSymbol.classList.add('icon-sync', 'custom-console-icon', 'load-icon-wrapper', 'load-icon');
        // this.dLSymbol.style.visibility = "hidden";
        // this.loadSymbol.style.visibility = "hidden";
        // editorElementsWrapper.appendChild(this.loadSymbol);
        // editorElementsWrapper.appendChild(this.dLSymbol);
    }

    getTitle() {
      // Used by Atom for tab text
      return 'cpppm';
    }

    getURI() {
      // Used by Atom to identify the view when toggling.
      return 'atom://cpppm-panel';
    }
    getDefaultLocation() {
      // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
      // Valid values are "left", "right", "bottom", and "center" (the default).
      return 'right';
    }

    getAllowedLocations() {
      // The locations into which the item can be moved.
      return ['left', 'right', 'bottom'];
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.panel.remove();
    }

    getElement() {
        return this.panel;
    }
}
