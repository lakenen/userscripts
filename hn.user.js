// ==UserScript==
// @name       Hacker News Improvements
// @version    1.0
// @description Open links in new tab
// @match      https://news.ycombinator.com/*
// ==/UserScript==

[].forEach.call(document.querySelectorAll('a'), function (a) {
  a.setAttribute('target', '_blank')
})
