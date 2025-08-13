// editor.js
// Página simple con un editor de texto

document.addEventListener('DOMContentLoaded', function() {
  // Panel lateral
  const sidePanel = document.createElement('div');
  sidePanel.style.position = 'fixed';
  sidePanel.style.top = '0';
  sidePanel.style.right = '0';
  sidePanel.style.width = '260px';
  sidePanel.style.height = '100vh';
  sidePanel.style.background = '#f8f9fa';
  sidePanel.style.borderLeft = '1px solid #e0e0e0';
  sidePanel.style.padding = '24px 16px 16px 16px';
  sidePanel.style.overflowY = 'auto';
  sidePanel.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.04)';
  sidePanel.style.zIndex = '100';

  const panelTitle = document.createElement('h3');
  panelTitle.textContent = 'Variables {{}}';
  panelTitle.style.fontSize = '1.1em';
  panelTitle.style.marginTop = '0';
  sidePanel.appendChild(panelTitle);

  const variablesList = document.createElement('div');
  variablesList.id = 'variables-list';
  variablesList.style.paddingLeft = '0';
  sidePanel.appendChild(variablesList);

  // Estado de valores de variables
  const variableValues = {};

  // Panel de vista previa
  const previewPanel = document.createElement('div');
  previewPanel.style.margin = '40px auto 0 auto';
  previewPanel.style.maxWidth = '600px';
  previewPanel.style.background = '#e9ecef';
  previewPanel.style.border = '1px solid #d1d5db';
  previewPanel.style.borderRadius = '8px';
  previewPanel.style.padding = '24px';
  previewPanel.style.color = '#888';
  previewPanel.style.fontSize = '1.05rem';
  previewPanel.style.pointerEvents = 'none';
  previewPanel.style.userSelect = 'none';
  previewPanel.style.marginBottom = '32px';
  previewPanel.style.minHeight = '60px';
  previewPanel.style.opacity = '0.7';
  previewPanel.style.whiteSpace = 'pre-wrap';
  previewPanel.style.wordBreak = 'break-word';

  document.body.appendChild(sidePanel);

  // Contenedor principal del editor
  const editorContainer = document.createElement('div');
  editorContainer.style.maxWidth = '600px';
  editorContainer.style.margin = '40px auto';
  editorContainer.style.padding = '24px';
  editorContainer.style.border = '1px solid #ccc';
  editorContainer.style.borderRadius = '8px';
  editorContainer.style.background = '#fafbfc';

  const title = document.createElement('h2');
  title.textContent = 'Editor de texto';
  title.style.textAlign = 'center';
  editorContainer.appendChild(title);

  // Contenedor de bloques
  const blocksContainer = document.createElement('div');
  blocksContainer.id = 'blocks-container';
  editorContainer.appendChild(blocksContainer);

  // Área de output en tiempo real
  const outputArea = document.createElement('pre');
  outputArea.id = 'editor-output';
  outputArea.style.marginTop = '32px';
  outputArea.style.background = '#f4f4f4';
  outputArea.style.padding = '16px';
  outputArea.style.borderRadius = '6px';
  outputArea.style.fontSize = '0.95rem';
  outputArea.style.overflowX = 'auto';
  outputArea.style.border = '1px solid #e0e0e0';
  editorContainer.appendChild(outputArea);

  // Función para actualizar el output, panel lateral y preview
  function updateOutput() {
    // Guardar el input activo y la posición del cursor si el foco está en un input de variables
    const active = document.activeElement;
    let restoreInputId = null;
    let restorePos = null;
    if (active && active.tagName === 'INPUT' && active.dataset.varname) {
      restoreInputId = active.dataset.varname;
      restorePos = active.selectionStart;
    }

    // Solo los bloques, no los wrappers
    const wrappers = Array.from(blocksContainer.children);
    const blocks = wrappers.map(w => w.querySelector('.notion-block'));
    const values = blocks.map(b => b.innerHTML);
    outputArea.textContent = JSON.stringify(values, null, 2);

    // Buscar {{variable}} en todos los bloques
    const variables = [];
    blocks.forEach(b => {
      if (!b) return;
      // Buscar todas las ocurrencias de {{...}}
      const matches = b.innerText.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        matches.forEach(m => {
          // Limpiar los {{ }}
          const clean = m.slice(2, -2).trim();
          if (clean && !variables.includes(clean)) variables.push(clean);
        });
      }
    });
    // Actualizar panel lateral con textboxes
    variablesList.innerHTML = '';
    if (variables.length === 0) {
      const div = document.createElement('div');
      div.textContent = 'No hay variables.';
      div.style.color = '#aaa';
      variablesList.appendChild(div);
    } else {
      variables.forEach(v => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.marginBottom = '10px';
        const label = document.createElement('label');
        label.textContent = v;
        label.style.marginRight = '8px';
        label.style.minWidth = '60px';
        label.style.fontWeight = 'bold';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = variableValues[v] || '';
        input.style.flex = '1';
        input.style.padding = '4px 8px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '4px';
        input.style.fontSize = '1em';
        input.dataset.varname = v;
        input.oninput = function() {
          variableValues[v] = input.value;
          updateOutput();
        };
        row.appendChild(label);
        row.appendChild(input);
        variablesList.appendChild(row);
      });
    }

    // Restaurar el foco y la posición del cursor si corresponde
    if (restoreInputId) {
      const ref = variablesList.querySelector(`input[data-varname="${restoreInputId}"]`);
      if (ref) {
        ref.focus();
        if (restorePos !== null) ref.setSelectionRange(restorePos, restorePos);
      }
    }

    // Actualizar panel de preview
    // Unir todos los bloques en un solo div, reemplazando {{}} por valores
    let previewHTML = '';
    blocks.forEach(b => {
      if (!b) return;
      let html = b.innerHTML;
      // Reemplazar todas las {{var}} por su valor
      html = html.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
        const key = p1.trim();
        return variableValues[key] !== undefined ? `<span style='color:#333;font-weight:500'>${variableValues[key]}</span>` : match;
      });
      previewHTML += html + '<br/>';
    });
    previewPanel.innerHTML = previewHTML;
  }

  // Función para crear un bloque editable con handler de arrastre
  function createBlock(focus = false, text = '') {
    // Wrapper relativo
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'flex-start';

    // Handler de arrastre
    const dragHandle = document.createElement('span');
    dragHandle.textContent = '⋮⋮';
    dragHandle.title = 'Arrastrar para reordenar';
    dragHandle.style.cursor = 'grab';
    dragHandle.style.userSelect = 'none';
    dragHandle.style.fontSize = '1.2em';
    dragHandle.style.margin = '8px 8px 0 0';
    dragHandle.style.color = '#bbb';
    dragHandle.setAttribute('draggable', 'true');

    // Drag events
    dragHandle.addEventListener('dragstart', function(e) {
      wrapper.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
      window._draggedBlock = wrapper;
    });
    dragHandle.addEventListener('dragend', function(e) {
      wrapper.classList.remove('dragging');
      window._draggedBlock = null;
    });
    wrapper.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      wrapper.style.background = '#e6f7ff';
    });
    wrapper.addEventListener('dragleave', function(e) {
      wrapper.style.background = '';
    });
    wrapper.addEventListener('drop', function(e) {
      e.preventDefault();
      wrapper.style.background = '';
      const dragged = window._draggedBlock;
      if (dragged && dragged !== wrapper) {
        blocksContainer.insertBefore(dragged, wrapper.nextSibling);
        updateOutput();
      }
    });

    // Bloque editable
    const block = document.createElement('div');
    block.className = 'notion-block';
    block.contentEditable = 'true';
    block.spellcheck = true;
    block.style.minHeight = '28px';
    block.style.padding = '8px 12px';
    block.style.margin = '6px 0';
    block.style.borderRadius = '4px';
    block.style.border = '1px solid #e0e0e0';
    block.style.background = '#fff';
    block.style.outline = 'none';
    block.textContent = text;
    block.style.flex = '1';

    // Barra de herramientas (oculta por defecto)
    const toolbar = document.createElement('div');
    toolbar.className = 'block-toolbar';
    toolbar.style.display = 'none';
    toolbar.style.position = 'absolute';
    toolbar.style.left = '0';
    toolbar.style.top = '-38px';
    toolbar.style.background = '#fff';
    toolbar.style.border = '1px solid #ccc';
    toolbar.style.borderRadius = '4px';
    toolbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    toolbar.style.padding = '4px 8px';
    toolbar.style.zIndex = '10';
    toolbar.style.minHeight = '28px';
    toolbar.style.display = 'none';

    // Ejemplo de botón en la barra de herramientas
    const btnBold = document.createElement('button');
    btnBold.textContent = 'B';
    btnBold.title = 'Negrita';
    btnBold.style.fontWeight = 'bold';
    btnBold.style.marginRight = '4px';

    // Utilidad para ejecutar comando de formato solo si la selección está dentro del bloque
    function execFormat(cmd, value = null) {
      block.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Asegurarse de que la selección esté dentro del bloque
        if (block.contains(range.startContainer)) {
          document.execCommand(cmd, false, value);
        }
      }
      updateOutput();
    }

    btnBold.onclick = function(e) {
      e.preventDefault();
      execFormat('bold');
    };
    toolbar.appendChild(btnBold);

    // Botón cursiva
    const btnItalic = document.createElement('button');
    btnItalic.textContent = 'I';
    btnItalic.title = 'Cursiva';
    btnItalic.style.fontStyle = 'italic';
    btnItalic.style.marginRight = '4px';
    btnItalic.onclick = function(e) {
      e.preventDefault();
      execFormat('italic');
    };
    toolbar.appendChild(btnItalic);

    // Botón subrayado
    const btnUnderline = document.createElement('button');
    btnUnderline.textContent = 'U';
    btnUnderline.title = 'Subrayado';
    btnUnderline.style.textDecoration = 'underline';
    btnUnderline.style.marginRight = '4px';
    btnUnderline.onclick = function(e) {
      e.preventDefault();
      execFormat('underline');
    };
    toolbar.appendChild(btnUnderline);

    // Botón tachado
    const btnStrike = document.createElement('button');
    btnStrike.textContent = 'S';
    btnStrike.title = 'Tachado';
    btnStrike.style.textDecoration = 'line-through';
    btnStrike.style.marginRight = '4px';
    btnStrike.onclick = function(e) {
      e.preventDefault();
      execFormat('strikeThrough');
    };
    toolbar.appendChild(btnStrike);

    // Botón lista
    const btnList = document.createElement('button');
    btnList.textContent = '• List';
    btnList.title = 'Lista';
    btnList.style.marginRight = '4px';
    btnList.onclick = function(e) {
      e.preventDefault();
      execFormat('insertUnorderedList');
    };
    toolbar.appendChild(btnList);

    // Handler para mostrar/ocultar la barra de herramientas
    block.addEventListener('focus', function() {
      toolbar.style.display = 'block';
    });
    block.addEventListener('blur', function() {
      setTimeout(() => { toolbar.style.display = 'none'; }, 100);
    });

    // Manejar Enter para crear nuevo bloque
    block.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const newBlock = createBlock(true);
        blocksContainer.insertBefore(newBlock, wrapper.nextSibling);
        updateOutput();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = wrapper.previousElementSibling;
        if (prev) prev.querySelector('.notion-block').focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = wrapper.nextElementSibling;
        if (next) next.querySelector('.notion-block').focus();
      } else if (e.key === 'Backspace' && block.textContent === '') {
        if (blocksContainer.children.length > 1) {
          e.preventDefault();
          const prev = wrapper.previousElementSibling;
          const next = wrapper.nextElementSibling;
          wrapper.remove();
          if (prev) prev.querySelector('.notion-block').focus();
          else if (next) next.querySelector('.notion-block').focus();
          updateOutput();
        }
      }
    });

    // Actualizar output en tiempo real
    block.addEventListener('input', updateOutput);

    // Permitir enfocar el bloque
    block.setAttribute('tabindex', '0');
    if (focus) {
      setTimeout(() => block.focus(), 0);
    }

    // Estructura del wrapper: handler | toolbar (arriba, absoluto) | block
    wrapper.appendChild(dragHandle);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(block);
    wrapper.style.position = 'relative';
    // Ajustar el wrapper para dejar espacio arriba del bloque para la toolbar
    wrapper.style.marginTop = '32px';

    return wrapper;
  }

  // Crear el primer bloque
  blocksContainer.appendChild(createBlock(true));

  // Actualizar output inicial
  updateOutput();

  // Insertar el panel de preview antes del outputArea
  editorContainer.insertBefore(previewPanel, outputArea);

  document.body.appendChild(editorContainer);
});
