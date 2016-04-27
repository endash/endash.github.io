---
title:  "iOS Design Patterns: Part II"
date:   2016-02-06 09:00:00 -0500
categories: jekyll update
color: orange
layout: post
---
Here are three more iOS development patterns that fly somewhat in the face of answers you might see on Stack Overflow touted as "best practices." Two of these are rock solid and a third is on probationary status, which I'm throwing out there as a discussion point.

## Use structs to define appropriate architectural boundaries

It's really easy to blur architectural boundaries in an iOS app. That's partly thanks to the Delegate pattern, which encourages concerns to spread across multiple classes with varying roles and responsibilities. When we lose sight of that boundary between view and controller we inevitably neglect the fact that appropriate and tightly defined boundaries are the backbone of a well-designed and maintainable architecture. An extremely common and simple example of where this can happen is configuring `UITableViewCell`s in a `UITableView`'s data source.

Often we'll end up with one of two extremes: either a controller that knows a lot about the internal view structure (directly setting `UILabel` strings and colors and other blatant Demeter violations), or a view object that takes a domain record (such as an `NSManagedObject`) and is responsible for translating that high level object into specific pieces of display data, itself. In either case, we have parts of our app that are tightly coupled to things from which they should be insulated. The contagion can easily spread, for instance by moving view-specific display logic to that high level domain record in order to "clean things up."

Somewhere between tweaking `UILabel`s in your view controller and passing `NSManagedObject`s all over the place is the sweet spot of just enough data for the view to render itself, with a minimum of logic required to do so. Minimizing logic is a key goal, here—the view system is one of the more complex and opaque parts of an iOS app, and one of the last places you want to have code dependent on high-level semantics, if you can avoid it. Any code in your view that takes a high-level concept and translates it into things like colors, text strings, and the like is code that is significantly harder to test than if it were elsewhere.

Immutable structs are fantastic for exactly this purpose. A struct provides a single value that can be passed across the boundary while encapsulating a potentially unlimited amount of complexity. Immutability simplifies our code by ensuring a single entry point for the configuration logic, and helps keep the logic for generating the struct's member values in one place. They can be as high-level or low-level as is appropriate given the view and the data. For basic table views that are primarily text I might simply have a struct of `String`, `Bool` and `UIColor` values mapped to each visual element. On the other hand, I have a view for drawing graphs that takes a general description of the graph to be drawn, where there is less of a direct connection between the values I pass and what ultimately gets set as the final configuration.

*(In the latter example, the view makes use of other classes to interpret the input and produce the final display values—to what extent you continue to rely on the view-side of things being able to interpret data in complex ways will vary. In my case, the controller "collates" the data into a general form, and the view is responsible for turning that into a renderable form)*

In either case, there is one correct way to cross the boundary between controller and view, and provided you keep your view outlets `private` (as you should) you'll have confidence that your controllers and views remain both loosely coupled and synchronized in their effects.

## Use `awakeFromNib` as a form of dependency injection

Google around for how to get at your `NSManagedObjectContext` from your view controllers, and you'll get two answers:

>  Set it on your root view controller in your `AppDelegate`, then pass it to each view controller you present

One downside to this solution is that, at least as of the last project I began, the `AppDelegate` is no longer necessarily involved in bootstrapping the storyboard. You can get at your root view controller via the `window`, getting a chain of optionals leading to your controller and then setting your `managedObjectContext` property, but it is exceedingly slapdash, at best. Another problem is all the laborious glue code involved in ensuring an unbroken chain of passing along the context, bucket brigade style, between your root and any controller that might need it. All of this is in service of avoiding globals, as advocated by the next solution:

>  `(UIApplication.sharedApplication().delegate as! AppDelegate).managedObjectContext`

Anytime this solution is mentioned, comments about avoiding globals or Apple having rejected this approach surely follow. In general, yes, globals are bad, for varying reasons (some of which have less to do with "global" and more to do with general pitfalls of reference types.) In this case, the global is bad because it bakes an external dependency into our code. In my opinion, a global is bad in this situation for the exact same reason that using a class constructor can be bad—absolutely nothing would be improved here if `AppDelegate` were a constructor we could call, rather than a property.

What this all is crying out for is a form of dependency injection—which is why the first solution is often preferred, being a poor man's dependency injection solution. Too poor, in my view, since it ties a class's dependencies to the classes it might eventually be responsible for presenting. That's craziness, and even worse than just using `UIApplication.SharedApp...` inline, if followed to its natural conclusion.

Thankfully, because we're using storyboards, we can have the best of both worlds. First, yes: your methods should be dependent on a `managedObjectContext` property on your class, not directly referring to the global. Eliminate the global from inline code. Second, no: passing objects bucket brigade style from controller to controller isn't the only form of injection available to us. Storyboards can't set arbitrary values on the classes it instantiates—unfortunately—but it gives us a hook to handle in code any setup that it can't: `awakeFromNib`.

The fact that `awakeFromNib` is in our class and not somehow external to it is a complete technicality. To the extent that we're being pushed into doing the least unreasonable thing we can, using global or top level methods in `awakeFromNib` is fair game—this code is only ever run by the storyboard, at instantiation time. To be fair, `awakeFromNib` is a blunt instrument, but we needn't live with its dictates, as plenty of other hooks are called before the controller is actually put to use. Ultimately, I view using `awakeFromNib` in this way as no different than specifying a concrete class to instantiate in a storyboard and connect to a view controller via a protocol-typed outlet.

(In this specific case, one additional thing I would do is have my own global function to return the managed object context, and call that in `awakeFromNib`, as a single point of contact with the "real" global. I'll also note that I avoid having my view controllers directly dependent on `NSManagedObjectContext` as much as possible, which is another pattern I'll be discussing.)

One last thing: why `awakeFromNib` and not `initWithCoder`? First, `awakeFromNib` is called in any object instantiated by the storyboard, not just views and view controllers. Second, it reinforces the special-cased nature of the injection, over the more general case of object instantiation. Third, outlets are connected by the time `awakeFromNib` is called, in case that's ever a concern. Fourth, initializers are very clearly a proper part of their class, but `awakeFromNib` is, arguably, properly part of the storyboard/nib system and only located on the class for convenience, giving our class-proper code design a bit of distance from what goes on therein.

## Handle view controller setup in UIStoryboardSegue subclasses

This one might be a bit more controversial. I'm going to see how it shakes out, long-term, but from a coupling-and-responsibilities perspective it seems a no brainer. In short: configuring a new view controller isn't necessarily—or even usually—the responsibility of whatever view controller came before it. If only we had a class that was responsible for handling the transition from one view controller to another, where we could handle that responsibility. Wait, there *is* such an object—a segue. Of course, segues aren't a perfect solution, since using them conflates animations with nuts-and-bolts setup. They are, however, a natural, lightweight mechanism for getting random crosstalk code out of our view controllers, and the field for setting a custom `UIStoryboardSegue` class is right below the field for setting the identifier.

If there's one underlying theme throughout these patterns it's "stop using view controllers as junk drawers for your code."