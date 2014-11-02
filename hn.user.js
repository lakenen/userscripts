// ==UserScript==
// @name       Hacker News Improvements
// @version    1.0
// @description Open links in new tab
// @match      https://news.ycombinator.com/*
// ==/UserScript==


var cssTemplate = '.{{id}} ~ .{{id}}, .{{id}} .comment, .{{id}} .default p { display: none }';
var stylesheet = createStylesheet().sheet;

[].forEach.call(document.querySelectorAll('a'), function (a) {
  a.setAttribute('target', '_blank');
});

var root = { level: -1, children: [] }, prevNode = root;
[].forEach.call(document.querySelectorAll('img[src="s.gif"]'), function (el) {
  var row = getNearest(getNearest(el, 'table'), 'tr');
  var span = getNearest(el, 'span');
  if (span && span.classList.contains('pagetop')) return;
  if (row) {
    var node = {
      level: el.width / 40,
      children: [],
      el: row
    };
    var parentNode = prevNode;
    while (parentNode.level >= node.level) {
      parentNode = parentNode.parent;
    }
    node.parent = parentNode;
    parentNode.children.push(node);
    prevNode = node;
    var a = document.createElement('a');
    a.addEventListener('click', collapse);
    a.innerHTML = '[-]';
    a.href = 'javascript:;';
    row.querySelector('.comhead').innerHTML += ' | ';
    row.querySelector('.comhead').appendChild(a);

    var index, collapsed = false;
    function collapse() {
      if (collapsed) {
        deleteCSSRule(stylesheet, index);
      } else {
        index = appendCSSRule(stylesheet, cssTemplate.replace(/\{\{id\}\}/g, node.id));
      }
      collapsed = !collapsed;
      a.innerHTML = collapsed ? '[+]' : '[-]';
    }
  }
})

var currentId = 0
addCollapseClasses(root, '')

function addCollapseClasses(obj, classes) {
  obj.children.forEach(function (child, i) {
    var id = 'comments-' + currentId++
    var newClasses = classes + ' ' + id
    child.id = id
    newClasses.trim().split(' ').forEach(function (cls) {
      child.el.classList.add(cls)
    })
    addCollapseClasses(child, newClasses)
  })
}

function getNearest(el, tag) {
  tag = tag.toUpperCase();
  do {
    if (el.nodeName === tag) {
      return el;
    }
  } while (el = el.parentNode);
  return null;
}


function createStylesheet() {
  var styleEl = document.createElement('style');
  document.getElementsByTagName('head')[0].appendChild(styleEl);
  return styleEl;
}

function appendCSSRule(sheet, rule) {
  return sheet.insertRule(rule, sheet.cssRules.length);
}

function deleteCSSRule(sheet, index) {
  sheet.deleteRule(index);
}
