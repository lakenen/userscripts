// ==UserScript==
// @name       Amazon Smile
// @version    1.0
// @description Auto-redirect to Amazon Smile
// @match      http://www.amazon.com/*
// ==/UserScript==

window.location = 'https://smile.amazon.com' + window.location.pathname + window.location.search;
