// ==UserScript==
// @name       GH toggle diff
// @version    1.0
// @description Add a button to toggle file diffs
// @match      https://github.com/*
// ==/UserScript==

[].forEach.call(document.querySelectorAll('.diff-view .file'), function (fileEl) {
  var groupEl = fileEl.querySelector('.actions')
    , btn = document.createElement('a')
  btn.classList.add('minibutton')
  btn.innerText = 'Toggle'
  btn.addEventListener('click', function () {
    var inner = fileEl.querySelector('.data,.image')
    if (inner) {
      inner.classList.toggle('hidden')
    }
  })
  groupEl.insertBefore(btn, groupEl.firstChild)
})
