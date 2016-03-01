Visually On Top: Order by z-index
========
Visually On Top allows you to compare which of two HTML elements is closer to the user (visually on top). In the example provided a selection of HTML elements is sorted according to the stacking order.

Why?
-----
As an answer to [this Stack Overflow question](http://stackoverflow.com/questions/12190338/compare-html-elements-by-actual-z-index). There are other ways to determine which element is on top of the other. For example document.elementFromPoint() or document.elementsFromPoint() spring to mind. However, there are many (undocumented) factors that influence the reliability of these methods. For example, opacity, visibility, pointer-events, backface-visibility and some transforms may make document.elementFromPoint() unable to hit test a specific element. And then there is the issue that document.elementFromPoint() can only query the top-most element (not underlying ones). This should be solved with document.elementsFromPoint(), but currently has only been implemented in Chrome. In addition to that, I filed [a bug](https://bugs.chromium.org/p/chromium/issues/detail?id=589849) with the Chrome developers about document.elementsFromPoint(). When hit testing an anchor tag, all underlying elements go unnoticed. All these issues combined made me decide to attempt a re-implementation of the stacking mechanism. The benefit of this approach is that the stacking mechanism is documented quite extensively and that it can be tested and understood.

How it works
-----
Visually On Top re-implements the HTML stacking mechanism. It aims to correctly follow all the rules which influence the stacking order of HTML elements. This includes positioning rules, floats, DOM order but also CSS3 properties like opacity, transform and more experimental properties like filter and mask. The rules seem to be correctly implemented as of march 2016, but will need to be updated in the future when the specification and browser support changes.

Example
-----
```
front = $.fn.visuallyInFront(document.documentElement, document.body);
// front == <body>...</body> because the BODY node is 'on top' of the HTML node
```

Browser support
-----
Visually On Top has been tested in Firefox 44.0.2, Google Chrome 48.0.2564.116 (64-bit) and Safari 9.0.2 (10601.3.9). No tests have been done on Windows and Microsoft browsers.

Dependencies
-----
- jQuery, tested with jQuery 2.2.1
- Modernizr with the options: _prefixes and prefixedCSS, tested with 3.3.1

Credits
------
Visually On Top by Jip de Beer  
Initial approach from 2013:  
Marcelo Gibson and bfavaretto

References
------
- [Original SO question: Compare HTML elements by actual z-index](http://stackoverflow.com/questions/12190338/compare-html-elements-by-actual-z-index)
- [The stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)
- [Stacking and float](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_and_float)
- [Stacking without z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_without_z-index)
- [Stacking and float](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_and_float)
- [Adding z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Adding_z-index)
- [Stacking context example 1](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_1)
- [Stacking context example 2](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_2)
- [Stacking context example 3](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_3)
- [Visual formatting model](https://www.w3.org/TR/CSS2/visuren.html#propdef-z-index)
- [Using Flexbox: Mixing Old and New for the Best Browser Support](https://css-tricks.com/using-flexbox/)
