import TokenSimulationModule from '../../lib/viewer';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import fileDrop from 'file-drops';

import exampleXML from '../resources/example.bpmn';


const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = true;

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
})();

function hideDropMessage() {
  const dropMessage = document.querySelector('.drop-message');

  dropMessage.style.display = 'none';
}

if (persistent) {
  hideDropMessage();
}

const ExampleModule = {
  __init__: [
    [ 'eventBus', 'bpmnjs', 'toggleMode', function(eventBus, bpmnjs, toggleMode) {

      if (persistent) {
        eventBus.on('commandStack.changed', function() {
          bpmnjs.saveXML().then(result => {
            localStorage['diagram-xml'] = result.xml;
          });
        });
      }

      if ('history' in window) {
        eventBus.on('tokenSimulation.toggleMode', event => {

          if (event.active) {
            url.searchParams.set('e', '1');
          } else {
            url.searchParams.delete('e');
          }

          history.replaceState({}, document.title, url.toString());
        });
      }

      eventBus.on('diagram.init', 500, () => {
        toggleMode.toggleMode(active);
      });
    } ]
  ]
};

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    ExampleModule,
    TokenSimulationModule
  ],
  keyboard: {
    bindTo: document
  }
});

viewer.openDiagram = function(diagram) {
  return this.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }
    })
    .catch(err => {
      console.error(err);
    });
};

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', function(files) {

  // files = [ { name, contents }, ... ]

  if (files.length) {
    hideDropMessage();
    viewer.openDiagram(files[0].contents);
  }

}), false);

viewer.openDiagram(initialDiagram);

document.getElementById('start-button').onclick = () => {
  document.getElementById('play-this').click();
}

document.getElementById('canvas').hidden = true;

document.getElementById('file-upload').onchange = function (evt) {
  var tgt = evt.target;
  var files = tgt.files;

  var reader = new FileReader();

    reader.onload = function(evt) {
        if(evt.target.readyState != 2) return;
        
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }

        viewer.openDiagram(evt.target.result)
    };

    const name = document.getElementById('filename')
    if (files.length === 0) {
      name.innerText = 'No file selected'
    } else {
      name.innerText = files[0].name
    }

    reader.readAsText(files[0]);
}

