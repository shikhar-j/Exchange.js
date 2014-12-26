Exchange.js
===========

Exchange.js allows you to load responsive content based on media queries. The project takes inspiration from Foundation's Interchange.js but eliminates several dependencies and bugs, is written is pure javascript, and adds more flexibility.

Note: Exchange.js does not support DOM reflow as of now.

Exchange.js does not depend on jQuery. It also saves page from sending several ajax requests by caching element state, unlike Interchange.js which reloads responsive content every time a resize event is fired. It also uses a neat trick of attaching element state and different media query dependent responsive content urls, to cached element directly. Hence no ID or other data-attributes are added to elements. This trick also makes the process of updating element faster as DOM is not traversed again. 

###Example

Exchange.js works with data attributes (similar to interchange.js). It allows you to replace images and content depending upon which media query is valid. Just add a **data-exchange** attribute to your image or element.

    <div data-exchange="[exchange/small.html, (small)], [exchange/medium.html, (medium)], [exchange/large.html, (large)]">
    </div>

    <img data-exchange="[images/small.jpg, (small)], [images/medium.jpg, (medium)], [images/large.jpg, (large)]">

After attaching data attributes, all you have to do is initialize Exchange.js.

    <script>
        Exchange.init();
    </script>

As on now, you must attach your media queries to exchange.js by passing an options object, or extend 'media_queries' object in exchange.js. You can then use these keys inside the data attribute as presented in the example above.

You can also change the attribute name (by default data-exchange) to something else by passing new data attribute name to 'target_attr' inside options object.

The media queries (as of now) must be complete i.e. they shouldn't overlap. Only one media query supplied to exchange.js should be valid at any point. Exchange.js is still young and depending upon usage, this approach may change depending upon usage.

    <script>
        Exchange.init({
            target_attr : "newattribute",
            media_queries : {
                // custom media queries here
            }
        })
    </script>

###License

Free to use under MIT License
