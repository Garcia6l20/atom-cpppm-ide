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
  panel: null,
  subscriptions: null,
  config: {
    buildType: {
      type: 'string',
      default: 'Debug',
      enum: [
        { value: 'Debug', description: 'Debug' },
        { value: 'Release', description: 'Release' }
      ]
    }
  },

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      // Add an opener for our view.
      atom.workspace.addOpener(uri => {
        if (uri === 'atom://cpppm-panel') {
          return new CpppmIdeView();
        }
      }),

      // Register command that toggles this view
      atom.commands.add('atom-workspace', {
        'cpppm-ide:toggle-panel': () => this.toggle(),
      }),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof ActiveEditorInfoView) {
            item.destroy();
          }
        });
      })
    );

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'cpppm-ide:install-requirements': () => this.installRequirements(),
      'cpppm-ide:generate': () => this.generate(),
      'cpppm-ide:build': () => this.build(),
      'cpppm-ide:install': () => this.install(),
    }));

    // configuration
    atom.config.observe('cpppm-ide.buildType', (value) => {
      this.buildType = value
    })

  },

  deactivate() {
    this.panel.destroy();
    this.subscriptions.dispose();
    this.cpppmIdeView.destroy();
    if (this.disposables) {
      this.disposables.dispose();
    }
  },

  serialize() {
    return {
      cpppmIdeViewState: this.cpppmIdeView ? this.cpppmIdeView.serialize() : null
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

  toggle() {
    atom.workspace.toggle('atom://cpppm-panel');
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

  projectCommand(cmd, ...args) {
    projectPaths = atom.project.getPaths()
    let found = false
    for (let path of atom.project.rootDirectories) {
      cpppmProject = path.getFile('project.py')
      if (cpppmProject.existsSync()) {
        command = 'python3'
        args = [cpppmProject.path, '-b', this.buildType, cmd, ...args]
        stdout = (output) => this.consolePanel.notice(output)
        stderr = (output) => this.pythonLoggingToConsole(output)
        exit = (code) => {
          let level
          if (code != 0) {
            level = 'error'
          } else {
            level = 'notice'
          }
          this.consolePanel.log(`cpppm-ide:${cmd} teraminated with code ${code}`, level)
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
