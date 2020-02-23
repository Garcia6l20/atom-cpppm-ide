'use babel';

import CpppmIdeView from './cpppm-ide-view';
import {
  CompositeDisposable,
  BufferedProcess,
  Disposable
} from 'atom';
import {
  spawn
} from 'child_process';
import fs from 'fs';

export default {

  cpppmIdeView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.cpppmIdeView = new CpppmIdeView(state.cpppmIdeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.cpppmIdeView.getElement(),
      visible: false
    });
    this.cpppmIdeView.ondone = () => {
      this.modalPanel.hide()
    }

    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cpppm-ide:install-requirements': () => this.installRequirements(),
      'cpppm-ide:generate': () => this.generate(),
      'cpppm-ide:build': () => this.build(),
      'cpppm-ide:install': () => this.install(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.cpppmIdeView.destroy();
    if (this.disposables) {
      this.disposables.dispose();
    }
  },

  serialize() {
    return {
      cpppmIdeViewState: this.cpppmIdeView.serialize()
    };
  },

  consumeConsolePanel(consolePanel) {
      this.consolePanel = consolePanel;
      return new Disposable(() => this.consolePanel = null)
  },
  consumeStatusBar (statusBar) {
      this.statusBar = statusBar;
      return new Disposable(() => this.statusBar = null)
  },
  showMessage(message) {
    this.cpppmIdeView.setMessage(message)
    console.log(this.cpppmIdeView)
    return ( this.modalPanel.show() );
  },

  pythonLoggingToConsole(output) {
    m = output.match(/^(.*: )?(\w+): ?(.*)/)
    let level
    if(m == null) {
      this.consolePanel.error(output)
    } else {
      switch (m[2]) {
        case 'CRITICAL':
          level = 'error'
          break;
        case 'WARNING':
          level = 'warn'
          break;
        default:
          level = m[2].toLowerCase()
      }
      let prefix = m[1]
      if (prefix === undefined)
        prefix = ''
      this.consolePanel.log(prefix + m[3], level)
    }
  },

  projectCommand(...args) {
    projectPaths = atom.project.getPaths()
    let found = false
    for (let path of atom.project.rootDirectories) {
      cpppmProject = path.getFile('project.py')
      if (cpppmProject.existsSync()) {
        command = 'python3'
        args = [cpppmProject.path, ...args]
        stdout = (output) => this.consolePanel.notice(output)
        stderr = (output) => this.pythonLoggingToConsole(output)
        exit = (code) => {
          let level
          if (code != 0) {
            level = 'error'
          } else {
            level = 'notice'
          }
          this.consolePanel.log(`cpppm-ide:${args[1]} teraminated with code ${code}`, level)
        }
        proc = new BufferedProcess({command, args, stdout, stderr, exit})
        found = true
      }
    }
    if (!found) {
      this.consolePanel.warn(`Unable to find project file in ${atom.project.rootDirectories.map((dir) => {return dir.path}).join(', ')}`)
    }
  },


  installRequirements() {
    this.projectCommand('install-requirements')
  },

  generate() {
    this.projectCommand('generate')
  },

  build() {
    this.projectCommand('build')
  },

  install() {
    this.projectCommand('install')
  },
};
