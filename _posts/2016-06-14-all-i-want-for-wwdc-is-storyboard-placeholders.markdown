---
title:  "All I Want for WWDC is Storyboard Placeholders"
date:   2016-06-14 9:00:00 -0400
categories: jekyll update
color: blue
layout: post
---
One of the unsung heroes of Interface Builder is the "custom object." This doesn't go onto the storyboard canvas—it isn't a view or a view controller. Instead, objects goes up in the "scene dock," that bar with little icons (for, for example, the view controller and its exit segue) at the top of a scene. Simply drag from the palette to the scene dock, and then set the class in the inspector and you can start connecting outlets and actions to the object. Then, on instantiation, the object will be initialized for you and connected.

This is pretty great, but the usefulness is somewhat limited by the fact that the storyboard will only initialize the object via its class's designated initializer. That isn't always possible or desirable. In one very, very, very common case—managed object contexts—it isn't possible by any stretch of the imagination. It would, however, save a LOT of glue code and reduce a great deal of coupling if custom objects were just a bit more powerful.

What I'd like to see is the ability to give a custom object a storyboard ID, in addition to a class. Using the storyboard ID, an app delegate could register a pre-initialized object with the storyboard that would be used, rather than a fresh object being instantiated.

<div class="image"><img class="fullbleed" src="/assets/storyboard-placeholders.png" title="Interface Builder screenshot showing custom Object with option to specify a storyboard id"></div>

This would transform the storyboard into a fairly powerful dependency injection container. Imagine removing this code, or anything like it:

{% highlight swift %}
let masterNavigationController = splitViewController.viewControllers[0] as! UINavigationController
let controller = masterNavigationController.topViewController as! MasterViewController
controller.managedObjectContext = self.managedObjectContext
{% endhighlight %}

This sort of code is sprinkled through a lot of code bases, passing the managed object context around "bucket brigade" style. The theory is it's better than calling a global method to get at the managed object context (I actually disagree, see [my post on iOS design patterns]({% post_url 2016-02-06-ios-design-patterns-part-ii %}).) I think it leads to potentially insane amounts of coupling, not to mention being a pain in the ass to unwind if app flows change. Imagine, instead, that you add the managed object context as a custom object to each scene where you need access to it. Then, in one place, you register your MOC with the storyboard:

{% highlight swift %}
func application(application: UIApplication, willFinishLaunchingWithOptions launchOptions: [NSObject : AnyObject]?) -> Bool {
  UIStoryboard.registerObject(managedObjectContext, forStoryboardId: "managedObjectContext")
}
{% endhighlight %}

And never worry about it again. Your controllers that need access to the MOC magically get access, ***without*** the previous controller having to care about or have access to the MOC itself.