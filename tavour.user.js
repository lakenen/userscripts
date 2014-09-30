// ==UserScript==
// @name       Tavour + BA
// @version    1.0
// @description Fix emails from Tavour to include BeerAdvocate descriptions
// @match      https://mail.google.com/*
// ==/UserScript==

var URL_PREFIX = 'https://cors-anywhere.herokuapp.com/'

function makeRequest(url, cb) {
  var r = new XMLHttpRequest()
  r.open('GET', URL_PREFIX + url, true)
  r.onload = cb
  r.send()
}

function getBeerName() {
  var el = document.querySelector('.a3s strong u')
  if (!el) {
    return null
  }
  var name = el.innerText
  name = name.replace(/\$.*$/, '')
  name = name.replace(/\W+/g, ' ')
  name = name.replace(/\s+/g, ' ')
  return name.trim()
}

function isOnTavourEmail() {
  return !!document.querySelector('.iw span[name*=Tavour]')
}

function getBeerInfo(url, cb) {
  makeRequest(url, function () {
    var info = findInHTML(this.responseText, '#baContent table')
    if (info.length) {
      cb(info[0].outerHTML)
    }
  })
}

function getInsertNode() {
  var nameEl = document.querySelector('.a3s strong u')
  insertEl = nameEl.parentNode.parentNode
  return insertEl
}

function insertIntoEmail(html) {
  var p = document.createElement('p')
  p.innerHTML = html

  // relative fix links...
  Array.prototype.forEach.call(p.querySelectorAll('a'), function (a) {
    if (a.hostname === 'mail.google.com') {
      a.href = 'http://beeradvocate.com' + a.pathname + a.search + a.hash
    }
  })

  getInsertNode().appendChild(p)
}

function findBeer(name) {
  var url = 'http://beeradvocate.com/search/?q=' + encodeURIComponent(name) + '&qt=beer'
  makeRequest(url, function () {
    var beerEls = findInHTML(this.responseText, '#baContent ul li')
    if (beerEls.length) {
      var url = beerEls[0].querySelector('a').href
      getBeerInfo(url, insertIntoEmail)
    }
  })
}

function findInHTML(html, selector) {
  var parser = new DOMParser()
  var doc = parser.parseFromString(html, 'text/html')
  return [].slice.call(doc && doc.querySelectorAll(selector) || [])
}

var current
function check() {
  if (isOnTavourEmail()) {
    if (!current) {
      current = getBeerName()

      if (current) {
        findBeer(current)
      }
    }
  } else {
    current = null
  }
}

setInterval(check, 500)
