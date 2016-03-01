(function( $ ) {
    // Dependencies: jQuery and Modernizr with options: _prefixes and prefixedCSS

    // Successfully tested on the examples on:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_without_z-index
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_and_float
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Adding_z-index
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_1
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_2
    // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_context_example_3

    // Chrome has a filter property, but it's used for SVG - get the correctly prefixed -webkit-filter property
    // Reference: https://github.com/Modernizr/Modernizr/issues/981
    function getFilterPrefixed() {
        var elem = document.createElement('div');
        var testValue = 'grayscale(1)';
        var prop;
        var i;

        for (i = 0; i < Modernizr._prefixes.length; i++) {
            prop = Modernizr._prefixes[i] + 'filter';

            // Set-and-check: if the property holds a valid value, it's the one
            elem.style[prop] = testValue;
            if (elem.style[prop] == testValue) {
                return prop;
            }
        }
    }

    // Experimental function to get the correctly prefixed clip-path property
    // Chrome has a clip-path property, but it's used for SVG and doesn't create a new stacking contest
    // Get the correctly prefixed -webkit-clip-path property
    // Tested with Chrome, Firefox and Safari
    function getClipPathPrefixed() {
        var elem = document.createElement('div');
        var webkitPrefixed = 'webkitClipPath';
        var unPrefixed = 'clipPath';
        var testValue = 'inset(0px)'; // test value for webkit, Firefox only suports the url() syntax at the moment
        elem.style[webkitPrefixed] = testValue;
    
        document.querySelector('body').appendChild(elem);
        var computedStyle = window.getComputedStyle(elem);
        var webkitResult = computedStyle[webkitPrefixed];
        var mozillaResult = computedStyle[unPrefixed];
        elem.remove();
    
        if(webkitResult == testValue){
            return webkitPrefixed;
        } else if(mozillaResult && mozillaResult !== ""){
            return unPrefixed;
        }
    }

    // Experimental function to get the correctly prefixed mask property
    // The correct prefixed value to check if masked is set in webkit is -webkit-mask-image
    // Both -webkit-mask and -webkit-mask-image create a new stacking context
    // However, when -webkit-mask is set, the getComputedStyle['-webkit-mask'] returns ""
    // To read out the value of -webkit-mask, query for -webkit-mask-image
    // This is annoying, because will-change needs to check for -webkit-mask,
    // -webkit-mask-image in will-change doesn't create a new stacking context
    // Firefox doesn't support the mask-image property, instead it supports the un-prefixed mask
    // But if I set will-change to -webkit-mask-image in Firefox, this value will also be in the getComputedStyle['will-change'],
    // even though Firefox doesn't understand this value.
    // So a value of -webkit-mask in will-change doesn't create a new stacking context in Firefox,
    // but 'mask' does
    function getMaskPrefixed(unPrefixed) {
        var elem = document.createElement('div');
        var webkitPrefixed = '-webkit-mask-image';
        var testValue = 'url(#)'; // test value for webkit, Firefox only suports the url() syntax at the moment
        elem.style[webkitPrefixed] = testValue;
    
        document.querySelector('body').appendChild(elem);
        var computedStyle = window.getComputedStyle(elem);
        var webkitResult = computedStyle[webkitPrefixed];
        var mozillaResult = computedStyle[unPrefixed];
        elem.remove();

        if(webkitResult && webkitResult !== ""){
            return webkitPrefixed;
        } else if(mozillaResult && mozillaResult !== ""){
            return unPrefixed;
        }
    }

    var maskUnprefixed = 'mask';
    var filterPrefixed = getFilterPrefixed();
    var clipPathPrefixed = getClipPathPrefixed();
    var maskPrefixed = getMaskPrefixed(maskUnprefixed);
    var transformPrefixed = Modernizr.prefixedCSS('transform');
    var transformStylePrefixed = Modernizr.prefixedCSS('transform-style');
    var perspectivePrefixed = Modernizr.prefixedCSS('perspective');
    var isolationPrefixed = Modernizr.prefixedCSS('isolation');
    var mixBlendModePrefixed = Modernizr.prefixedCSS('mix-blend-mode');
    var willChangeProperties = ['opacity', transformPrefixed, transformStylePrefixed, perspectivePrefixed, isolationPrefixed, filterPrefixed, mixBlendModePrefixed, clipPathPrefixed]

    // In case of webkit, add '-webkit-mask' to check for in will-change value
    // Otherwise check for the unprefixed value 'mask'
    if(maskPrefixed !== maskUnprefixed){
        willChangeProperties.push('-webkit-mask');
    } else {
        willChangeProperties.push(maskUnprefixed);
    }

    function zIndex(ctx) {
        // Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
        // The root element (HTML) forms a stacking context
        if ( !ctx || ctx === document.querySelector('html') ) return;

        var computedStyle = window.getComputedStyle(ctx);
    
        var position = computedStyle['position'];
        var positioned = position !== 'static';
        var computedZindex = computedStyle['z-index'];
    
        // Positioned elements with a z-index value other than "auto" form a stacking context
        if(positioned && computedZindex !== 'auto'){
            // Return the numerical z-index value if the computedZindex is not 'auto'
            return +computedZindex;
        }
    
        // Reference: https://css-tricks.com/using-flexbox/
        // If element has a z-index other than auto and the parent is a flex container then a new stacking context is created
        if(computedZindex !== 'auto' && (['-webkit-box', '-ms-flexbox', '-webkit-flex', 'flex'].indexOf(window.getComputedStyle(ctx.parentNode).display) > -1)){
            // Return the numerical z-index value if the computedZindex is not 'auto'
            return +computedZindex;
        }

        // Always create a new stacking context in case:

        // - the element has a position of 'fixed' and a z-index of auto    
        var fixed = (position === "fixed" || position === "sticky");
        if(fixed){ return 0; }
    
        // - the element has opacity < 1 and is not positioned or has a z-index of auto
        var notOpaque = (computedStyle.opacity < 1);
        if(notOpaque){ return 0; }
    
        // - the element is transformed
        var transformed = (computedStyle[transformPrefixed] !== 'none' || computedStyle[transformStylePrefixed] === 'preserve-3d');
        if(transformed){ return 0; }    
    
        // - the element has a perspective value set
        var perspective = (computedStyle[perspectivePrefixed] !== 'none');
        if(perspective){ return 0; }

        // - the element has isolation set to 'isolate'    
        var isolation = (computedStyle[isolationPrefixed] === 'isolate');
        if(isolation){ return 0; }

        // - the elements has a filter set        
        var filter = (computedStyle[filterPrefixed] !== 'none');
        if(filter){ return 0; }

        // - the element has a mix-blend-mode set    
        var mixBlendMode = (computedStyle[mixBlendModePrefixed] !== 'normal');
        if(mixBlendMode){ return 0; }    
    
        // Edge cases - experimental CSS properties
        // - the element has -webkit-overflow-scrolling set to 'touch'
        var overflowScrolling = (computedStyle.webkitOverflowScrolling === "touch"); // iOS specific
        if(overflowScrolling){ return 0; }
    
        // - the element is clipped (clip-path or clip with position absolute)
        var clipped = (computedStyle[clipPathPrefixed] !== 'none' || (position === 'absolute' && computedStyle.clip !== "auto"));
        if(clipped){ return 0; }

        // - the element has a mask-image (webkit) or a mask (Firefox)    
        var masked = computedStyle[maskPrefixed];
        masked = (masked && masked !== 'none' && masked !== '');
        if(masked){ return 0; }
    
        // - a value for will-change with at least one of the specified properties
        if(computedStyle['willChange']){ // don't execute below in case browser doesn't support will-change
            var returnValue;
            computedStyle['willChange'].split(', ').some(function(value){
                if(willChangeProperties.indexOf(value) > -1){
                    returnValue = 0;
                    return true;
                }
            });
            return returnValue;
        }
    }

    /* a and b are the two elements we want to compare.
     * ctxA and ctxB are the first noncommon ancestor they have (if any)
     */
    function relativePosition(ctxA, ctxB, a, b) {
        // If one is descendant from the other, the parent is behind (preorder)
        if ( $.inArray(b, $(a).parents()) >= 0 )
            return a;
        if ( $.inArray(a, $(b).parents()) >= 0 )
            return b;

        // If two contexts are siblings, the one declared first - and all its
        // descendants (depth first) - is behind    
        var withHighestDomIndex = ($(ctxA).index() - $(ctxB).index() > 0 ? a : b);

        aComputedStyle = window.getComputedStyle(a);
        bComputedStyle = window.getComputedStyle(b);

        aPositioned = aComputedStyle.position !== 'static';
        bPositioned = bComputedStyle.position !== 'static';
    
        // UNCLEAR why is DIV #3 on top of DIV #1 even though DIV #1 has position absolute?
        // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_and_float
    
        // Answer below?
        // Within each stacking context, the following layers are painted in back-to-front order:
        // 
        // 1. the background and borders of the element forming the stacking context.
        // 2. the child stacking contexts with negative stack levels (most negative first).
        // 3. the in-flow, non-inline-level, non-positioned descendants.
        // 4. the non-positioned floats.
        // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
        // 6. the child stacking contexts with stack level 0 and the positioned descendants with stack level 0.
        // 7. the child stacking contexts with positive stack levels (least positive first).
        // Within each stacking context, positioned elements with stack level 0 (in layer 6), non-positioned floats (layer 4), inline blocks (layer 5), and inline tables (layer 5), are painted as if those elements themselves generated new stacking contexts, except that their positioned descendants and any would-be child stacking contexts take part in the current stacking context.    
        // Reference: https://www.w3.org/TR/CSS2/visuren.html#propdef-z-index
        // Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/Stacking_and_float
    /*
        // Level 6. Descendant positioned elements, in order of appearance (in HTML)
        // If a is positioned and b is not, a is on top
        if(aPositioned && !bPositioned){
            return a;
        // If b is positioned and a is not, b is on top
        } else if(bPositioned && !aPositioned){
            return b;
        // If both elements are positioned, return in DOM order
        } else if (aPositioned && bPositioned){
            return withHighestDomIndex;
        }
    */
    
        aInline = aComputedStyle.display.indexOf('inline') > -1;
        bInline = bComputedStyle.display.indexOf('inline') > -1;

    /*    
        // level 5. Inline descendants in the normal flow 
        // If a is inline and b is not, a is on top
        if(aInline && !bInline){
            return a;
        // If b is inline and a is not, b is on top
        } else if(bInline && !aInline){
            return b;
        // If both elements are inline, return in DOM order
        } else if (aInline && bInline){
            return withHighestDomIndex;
        }
    */

        aFloat = aComputedStyle.float !== 'none';
        bFloat = bComputedStyle.float !== 'none';

    /*    
        // Level 4. Floating blocks
        // If a is floated and b is not, a is on top
        if(aFloat && !bFloat){
            return a;
        // If b is floated and a is not, b is on top
        } else if(bFloat && !aFloat){
            return b;
        // If both elements are floating, return in DOM order
        } else if (aFloat && bFloat){
            return withHighestDomIndex;
        }
    */
    
        // It's not very clear from the spec,
        // But it seems that siblings on level 4, 5 or 6
        // should be treated equally - if this is the case
        // return the elements in DOM order
        var aState = (aPositioned || aInline || aFloat);
        var bState = (bPositioned || bInline || bFloat);

        if(aState && !bState){
            return a;
        } else if(bState && !aState){
            return b;
        }
    
        // If we made it here, the two elements can be:
        // - positioned with an equal z-index (higher than 0) (level 7)
        // - positioned (with a z-index of 0), inline or float (applies to both elements) (level 4, 5, 6)
        // - non positioned, block level and non float (applies to both elements) (level 3)
        // Return in DOM order (order of appearance in HTML)
        return withHighestDomIndex;
    }

    $.fn.visuallyInFront = function(a, b) {
        // Skip all common ancestors, since no matter its stacking context,
        // it affects a and b likewise
        var pa = $(a).parents(), ia = pa.length;
        var pb = $(b).parents(), ib = pb.length;
        while ( ia >= 0 && ib >= 0 && pa[--ia] == pb[--ib] ) { }

        // Here we have the first non-common ancestor of a and b
        var ctxA = (ia >= 0 ? pa[ia] : a), za = zIndex(ctxA), relativeCtxA = ctxA;
        var ctxB = (ib >= 0 ? pb[ib] : b), zb = zIndex(ctxB), relativeCtxB = ctxB;

        // Finds the first ancestor with defined z-index, if any
        // The "shallowest" one is what matters, since it defined the most general
        // stacking context (affects all the descendants)
        while ( ctxA && za === undefined ) {
            ctxA = ia < 0 ? null : --ia < 0 ? a : pa[ia];
            za = zIndex(ctxA);
        }
        while ( ctxB && zb === undefined ) {
            ctxB = ib < 0 ? null : --ib < 0 ? b : pb[ib];
            zb = zIndex(ctxB);
        }
        
        // Compare the z-indices, if applicable; otherwise use the relative method
        if ( za !== undefined ) { 
            if ( zb !== undefined ){ // a and b both have a z-index value
                if (za > zb){
                    return a;   // if a has a larger z-index, a is on top
                } else if (za < zb){
                    return b;   // if b has a larger z-index, b is on top
                }
            } else if (za > 0){ // a has a z-index value, b doesn't
                return a;   // if a has a positive z-index, a is on top
            } else if (za < 0){
                return b; // if a has a negative z-index, b is on top
            }
        } else if ( zb !== undefined ){ // b has a z-index value, a doesn't
            if(zb < 0){ 
                return a; // if b has a negative z-index, a is on top
            } else if(zb > 0){ 
                return b; // if b has a positive z-index, b is on top
            }
        }

        // Finds the relative position between the first non-common ancestor of a and b
        // (this value will only be used if neither has an explicit and different z-index)
        return relativePosition(relativeCtxA, relativeCtxB, a, b);
    }
}( jQuery ));