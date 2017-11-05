---
title:  "What is a Design Principle?"
date:   2017-11-05 14:00:00 -0400
categories: jekyll update
color: blue
layout: post
---
Engineers love design patterns. They make our jobs easier, because they provide us with a lot of time-tested, proven ways of solving common problems. We also love design _principles_, which help guide good code design. Confusing the two is a common, and unfortunate, mistake that can lead an engineer down a deep well of poor code design that can be hard to escape. We all know a principle when we see one (Single Responsibility Principle, etc), but what, exactly, _is_ a design principle?

A design principle is a top-down, goal-directed, descriptive heuristic.

It's top-down, because design is top-down: high level concepts and systems are recursively decomposed into smaller systems and finally into classes. That doesn't mean starting with a complete spec, but it does mean that, whatever your methodology, the end result needs to make sense from that perspective. If your end result has no high-level design then the process has failed.

It's goal-directed, because it's in service of external goals and not a goal in-and-of itself. Those goals are many but include: ease of testing, long-term maintainability, reusability, and velocity. A design principle that makes any one of those things worse is less than useless.

It's descriptive, because it describes a likely ideal outcome without necessarily prescribing the means to achieve it. The difference is between giving someone enough information to reliably identify a cow, and that person trying to reconstruct a cow from that description without seeing one in advance.

It's a heuristic, because it's a rule of thumb, not a law. Heuristics help us get into and stay in the ballpark, by cleaving off unlikely or obviously unpalatable alternatives. Once there, though, they don't help you identify the right answer. Occam's razor, for instance, is a heuristic that is often abused. It says that the simplest explanation should be preferred to others. The point isn't that any given simple explanation is necessarily more correct than a more complex one, it's that simple explanations are preferable as a _practical_ matter to more complex ones (and note they need not be mutually exclusive,) and, more importantly, as a basis of inquiry they're likely to prove more fruitful.

So when applying a design principle, keep these things in mind:

* Are you applying it as part of an actual design process? Are you going to end up with a series of well-structured, coherent, and reasonable systems and classes, ordered into appropriate levels of abstraction? At any given level and for any given system, can you hold the entire thing in your head and comprehend it reasonably well?
* Are you making things easier for yourself in the long term, or just making a bigger mess  on a large scale for the sake of applying a principle on the immediate, small scale?
* Are you just applying it by rote, as if it were an algorithm? Are you judging your use of the principle from the perspective of finished, high-quality software, or by whether some cookie-cutter pattern has been universally applied everywhere possible?
* Have you considered whether it even applies, or whether it applies in the same way as it has in other situations?
