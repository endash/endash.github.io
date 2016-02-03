---
title:  "How Do I Unit Test This?"
date:   2015-11-14 12:00:00 -0500
categories: jekyll update
color: redorange
layout: post
---

Hang out in IRC, Slack, or Gitter rooms for OS projects for a few days and before too long you'll see someone ask how to unit test some part of their app. It's particularly common with large frameworks that encourage inheritance over composition, which usually results in a great deal of environmental setup standing in the way of efficient, automated testing on a unit basis. It sometimes makes me feel bad, but usually my answer is: you can't.

If you've lashed your code so tightly to your framework that you need to jump through hoops to test it, then you're almost certainly not *unit* testing it. Testing code that's in a subclass of `ActiveRecord::Base` is an integration test. Testing how an Angular component renders using the framework's templating system is an integration test. It's hard to write a unit test when your app is forcing you to write an integration test.

## Why do we even test at all?

When it comes to testing—any testing—one must always keep in mind that the actual point of the testing is to help us write better software, not to meet some quota for code coverage or tests written. So many devs are content to write bullshit, space-filling tests just to keep up appearances, or out of a sense of obligation. The emphasis in some communities (cough-ruby-cough) on "test-driven" design or development is particularly problematic here, since too often there's an over-emphasis on writing the test first as the only hallmark of TDD, and a complete ignorance of how to let the test drive the code—the actually important part.

"Best practices" or "being idiomatic" aren't magical outs here, either. Design patterns and best practices are great, insofar as they actually result in good code design. It is self-evident, however, that if the way a developer codes and tests is predetermined by cookie-cutter-style conventions then that developer is not letting the tests drive anything other than the clock. While this often puts the lie to claims of test-driven development, it isn't just a concern for aspiring practitioners of TDD—Awkward, jury-rigged, and brittle tests should be setting off alarms and clueing us into code smells and technical debt whether we write tests before the code or after.

## Just calling it a unit test doesn't make it a unit test

When it comes to unit testing in particular—where TDD is most natural and effective—there are two rules to follow in order for something to be a unit test, in a meaningful sense:

1.  You need to be able to mock any dependencies of the unit
2.  You need to own all the dependencies of the unit

These rules, just like the rule of writing tests at all or writing the test first, are in service of a higher goal: allowing the process of writing tests to make it clear to us where our design needs to change. This is the most basic way tests "drive" development—by encouraging design choices that make it possible to test in the first place.

## Two approaches to mocking

One approach to the first rule is to figure out how to reduce and simplify your dependencies. Just by chopping up one class into several—each with one or two dependencies—the code almost magically becomes much more easily tested, refactored, and extended. This is a classic example of the test driving the improvement of your code by encouraging the separation of responsibilities.

The second approach is to look at your oodles of dependencies and piss and moan about all this mocking you have to do. Slog through it for a few hours. Pop into a chatroom. Let someone tell you that you can just test directly against the database. Write an integration test disguised as a unit test. Finally, call it a day for the rest of your career.

One reason so many developers insist on the tests adapting to fit their design, rather than the other way around, is because it isn't actually their design at all. Frameworks that encourage code to be piled into a handful of classes that fit a set of roles determined by some development methodology do developers a disservice. Frameworks aren't bad, necessarily, but when it's considered "best practice" for the developer to forfeit all responsibility for their app's architecture and their code's design, it makes it impossible for the developer's tests to inform the development process.

If you start off by subclassing someone else's code you've almost certainly fallen afoul of the first rule right from the start. You've introduced a massive, irresolvable dependency into the very foundation of your code. Sometimes you'll have little choice but to rely on scaffolding provided by the dependency in order to test your own code, integration style.

The two operative words in the first rule are "you" and "able." The rule isn't "It must be theoretically possible for someone, with unbounded knowledge of the dependencies, to mock the dependencies," or even "You need to have mocks for the dependencies, from wherever you can get them." If you can't look at the class and immediately know what needs to be mocked and how to mock it, that should be a huge red flag.

## Only mock what you own

The second rule is a consequence of a third rule: only mock what you own. You own your project's pure classes, and to the extent that you subclass you own whatever logic you've added. You don't own the base classes, despite their behaviour being incorporated via inheritance. This is another rule where the face value isn't so much the point of it as the consequences: by only mocking your own classes, you're pushed into building out facade and bridge classes to formalize the boundaries between your app and any external systems.

Tests are much more confidence-inspiring when the mocks they depend on are rock-solid doubles of tiny classes each with a single responsibility. Tests that instead stub one or two methods on a huge dependency are brittle, are prone to edge cases, increase coupling, and are more difficult to write and tweak with confidence. Tests of classes that *themselves* have to be stubbed are almost worthless.

## Thinking outside of the class

Following these three rules can help put the focus back on writing well-structured, maintainable code. It's not always obvious, however, what changes need to be made. If a developer is staring at a class that descends from `ActiveRecord::Base`, and which includes a couple of plugins, along with a raft of methods that all need to be tested it's understandable to look askance at the notion that AR and those plugins should be expunged in order to test the class. After all, without AR they don't even have a class to begin with, right? The path of least resistance all too often is just to write an integration test using the entire stack.

In these situations one must keep in mind that "unit" and "class" are not identical, and to ask not "how can I possibly remove these dependencies from *my class*" but "how do I remove *my code* from this class, which I don't really own?" By moving those methods off to other classes as appropriate (formatting, serializing, and complex validations are things that might be on an AR class that can easily be broken out into their own plain-old-ruby classes) we've accomplished the same thing. So much ActiveRecord-dependent code can be refactored to depend only on a hash (or OpenStruct) of attributes.

It's possible to use monolithic frameworks and still care about good design. Finding ways to take ownership of our code away from the framework is crucial. Your tests should be a searchlight, pointing out places where your code is unnecessarily tangled up in someone else's class hierarchy.

## Preventing bad testing habits

Developers often begin their professional life with a few high-level heuristics that are, unfortunately, continually reinforced. A few relevant ones:

1.  Minimize the number of classes to write and test
2.  "DRY" code up by relying on libraries as much as possible
3.  MVC means my app is made up of models, views, and controllers

It's not difficult to see how these lead to large, fragmented classes tightly coupled to oodles of dependencies. The resulting code is going to be difficult to test well in any circumstance, and will bear little resemblance to anything that was "test-driven." I'd like to suggest some replacements:

1.  Minimize the number of dependencies per class.
2.  Minimize the number of classes dependent on an external dependency.
3.  Write the code first, worry what "category" each class falls into later.

The first will result in more classes, but they'll be more easily tested, refactored, and maintained. The second encourages dependencies to be isolated into bridge, adapter, or facade classes, keeping the dev's code dependent on interfaces he or she owns. The third breaks the MVC (among others) intuition pump that says every class we write has to fit one of two or three possible roles. A dev utilizing these heuristics will find themselves asking "how do I unit test this?" far less frequently.

Now, "how do I integration test this" is a different question entirely... more on that later.

