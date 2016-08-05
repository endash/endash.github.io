---
title:  "Classes, Methods & Functions—Oh My!"
date:   2016-01-20 12:00:00 -0500
categories: jekyll update
color: orange
layout: post
---
Lately I've been thinking a lot about responsibilities, and when a given responsibility should be a class, when it should be a method on a related class, and when it should be a function. Methods are almost always a convenient and straightforward option, but they are also inappropriate for a great many of the things you want to do with/to an object. Refactoring, after all, very often involves restructuring a warren of methods on a single class into a constellation of objects that work together via composition. There are obvious examples of things that are simple to bang out as methods but really shouldn't be done—saving to particular file formats, generating reports, business transactions—but what big picture rules are there to guide us?

I'm currently writing a series of classes to take a set of data and ultimately render it as a graph in a `UIView`. The controller is responsible for collating the data into a `Graph` struct, which is passed to `GraphView`. We cross the controller-view barrier with a medium-level object that describes the output we want, but we leave the particulars to the view. The first step in getting something that can be displayed (specifically, a `CGPath` to render using `CAShapeLayer`) is to use a `GraphVectorizer` object to generate a description of the graph as a path. `GraphVectorizer` is a protocol—so that different styles can be implemented as separate classes—with the `GraphView` being agnostic as to which one is actually used.

`GraphVectorizer` does not return a `CGPath`. `CGPath` is an opaque data type, and while technically it can be introspected in a limited fashion it isn't really amenable to being compared to other `CGPath` values all that easily. `GraphVectorizer` isn't simply doing grunt conversion work, however—a lot of our important logic about how things get displayed lives in these classes, with the potential for edge and corner cases. In order to facilitate easy testing, we instead return our own transparent Path type, which is essentially an array of `CGPathDoSuchAndSuch` function calls stored as enums. For each style we can vectorize a `Graph`, compare the returned array, and be confident that we're going to end up with the `CGPath` we want to display.

The question now is what form does the code to turn my transparent `Path` type into a `CGPath` take? Pragmatics dictates that it simply be a method on my `Path` type—this will only ever conceivably be used as an intermediary for generating `CGPath`s, and we've already decided to couple to the `CGPath` interface fairly tightly. But step back for a second and consider that we might have other drawing system possibilities at play—perhaps something OpenGL based, or the slightly higher level UIGraphics. I often feel stuck seesawing between the unsatisfying options of a very simple—often single method—class, or a top-level function, floating off by itself. A third option—static methods on a bucket struct—is equally unsatisfying.

I've been ruminating on some rules to help guide myself in these situations, and others. These are just possibilities, and nothing I've set in stone:

1.  Instance methods can receive and return values of the same type, or a lower-level type. Equals should meet only in a neutral place. Thus, for instance, a PNG could take a `UIColor` and return a count of pixels close to that color, but it could not take a `JPEG` and return an estimate of how similar the images are, nor could it return a `JPEG` from a conversion method.
2.  Instance methods should never return a higher-level type.
3.  When two different types that are "equal enough" need to interact, the default should be a full class, for flexibility of implementation.
4.  If the implementation devolves into a single method, it should be removed to a free function.

## Protocols and Extensions

As should be obvious from the above, I'm writing an iOS application. Not so obvious is that I'm using Swift, and not Objective-C. Swift allows the extension of types with locally visible additions. Random new methods could be added to a type, or protocol conformance could be added. It's a very powerful feature, if a bit uncomfortably close to monkey-patching for my taste.

Is this a situation where a `CGPathConvertible` protocol could be declared, and an extension to my `Path` type provided to implement that conversion? It depends. My rule on extensions is that, if they're not exceedingly low-level additions, then they should be exceedingly simple. An extension might be a good place for code that hits rule #3 to end up, provided it doesn't violate rule #2. One can imagine a Rails-esque extension to `Int` along the lines of `- number(int: Int, ofThing: Thing) -> [Thing]`, and weep.