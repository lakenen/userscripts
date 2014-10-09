// ==UserScript==
// @name       Text input features
// @version    1.0
// @description Add quotes, parens, etc around selected text
// @match      http://*/*
// @match      https://*/*
// ==/UserScript==


function getSelectionText() {
  var text = ''
  if (window.getSelection) {
    text = window.getSelection().toString()
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text
  }
  return text
}

function getInputSelection(el) {
  return {
      start: el.selectionStart
    , end: el.selectionEnd
  }
}

function getCaretPosition(element) {
    var caretOffset = 0
      , doc = element.ownerDocument || element.document
      , win = doc.defaultView || doc.parentWindow
      , sel
      , range
      , preCaretRange
      , textRange
      , preCaretTextRange
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection()
        if (sel.rangeCount > 0) {
            range = win.getSelection().getRangeAt(0)
            preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(element)
            preCaretRange.setEnd(range.endContainer, range.endOffset)
            caretOffset = preCaretRange.toString().length
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        textRange = sel.createRange()
        preCaretTextRange = doc.body.createTextRange()
        preCaretTextRange.moveToElementText(element)
        preCaretTextRange.setEndPoint("EndToEnd", textRange)
        caretOffset = preCaretTextRange.text.length
    }
    return caretOffset
}

function replaceSelectedHTML(replacementText) {
  var sel, range
  if (window.getSelection) {
    sel = window.getSelection()
    if (sel.rangeCount) {
      range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(replacementText))
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange()
    range.text = replacementText
  }
}

function replaceSelectedText(el, text) {
  var start = 0

  if (isContentEditable(el)) {
    replaceSelectedHTML(text)
    // start = getCaretPosition(el)
  } else {
    var val = el.value
      , sel = getInputSelection(el)
    el.value = val.slice(0, sel.start) + text + val.slice(sel.end)
    start = sel.start
  }

  if (text.length === 2) {
    start -= 1
  }
  setCaretToPos(el, start + text.length)
}

function setSelectionRange(input, selectionStart, selectionEnd) {
  var range
  if (input.setSelectionRange) {
    input.focus()
    input.setSelectionRange(selectionStart, selectionEnd)
  }
  else if (input.createTextRange) {
    range = input.createTextRange()
    range.collapse(true)
    range.moveEnd('character', selectionEnd)
    range.moveStart('character', selectionStart)
    range.select()
  }
}

function setContenteditableCaretPosition(el, pos) {
  var range = document.createRange()
    , sel = window.getSelection()
  range.setStart(sel.focusNode.nextSibling || sel.focusNode, pos)
  range.collapse(true)
  sel.removeAllRanges()
  sel.addRange(range)
}

function setCaretToPos(el, pos) {
  if (isContentEditable(el)) {
    setContenteditableCaretPosition(el, pos)
  } else {
    setSelectionRange(el, pos, pos)
  }
}

function isContentEditable(el) {
  return typeof el.value === 'undefined' && el.contentEditable
}

window.addEventListener('keydown', function (event) {
  var selected = getSelectionText() || ''
    , target = event.target
    , value = target.value

  // it's not an input...
  if (typeof value === 'undefined') {
    if (isContentEditable(target)) {
      value = target.innerText
    } else {
      return
    }
  }

  // TODO: deleting stuff (backspace is keyCode 8)
  // console.log(event.keyCode)

  switch (event.keyCode) {
    case 56: // 8 or *
      if (event.shiftKey && selected) {
        replaceSelectedText(target, '*' + selected + '*')
        event.preventDefault()
      }
      break
    case 57: // 9 or (
      if (event.shiftKey) {
        replaceSelectedText(target, '(' + selected + ')')
        event.preventDefault()
      }
      break
    case 189: // - or _
      if (event.shiftKey && selected) {
        replaceSelectedText(target, '_' + selected + '_')
        event.preventDefault()
      }
      break
    case 192: // ` or ~
      if (!event.shiftKey && selected) {
        replaceSelectedText(target, '`' + selected + '`')
        event.preventDefault()
      }
      break
    case 219: // [ or {
      if (event.shiftKey) {
        replaceSelectedText(target, '{' + selected + '}')
      } else {
        replaceSelectedText(target, '[' + selected + ']')
      }
      event.preventDefault()
      break
    case 222: // ' or "
      if (event.shiftKey) {
        replaceSelectedText(target, '"' + selected + '"')
      } else {
        var start = target.selectionStart || getCaretPosition(target)
        if (selected || start === 0 || /\s/.test(value.charAt(start - 1))) {
          replaceSelectedText(target, '\'' + selected + '\'')
        } else {
          break
        }
      }
      event.preventDefault()
      break
  }
}, true)
