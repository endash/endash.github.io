---
title:  "ActiveRecord is Actively Harmful"
date:   2016-03-28 17:00:00 -0400
categories: jekyll update
color: orange
layout: post
redirect_from: "/posts/introduction-to-rom-part-i"
---
*This was originally titled "Introduction to ROM: Part I," but seeing as it focuses almost exclusively on AR and Rails, I've decided to rework it into a post specifically about ActiveRecord, with a separate series focusing exclusively on [ROM](http://rom-rb.org/). I've retitled this post to reflect the topic more accurately.*

---

Yesterday I was pointed to a [comment thread](https://www.reddit.com/r/ruby/comments/4cfn3p/rails_five_more_active_record_features_you_should/) for a blog post titled ["Five More ActiveRecord Features You Should Be Using](http://jakeyesbeck.com/2016/03/27/five-more-active-record-features-you-should-be-using/)." The features themselves were some of the usual suspects when it comes to AR anti-patterns: lots of coding by side effect (lifecycle callbacks, change tracking, etc). The interesting thing to me was what happened in the comment thread.

First, @solnic mentioned the suggestion that you use the `after_commit` lifecycle callback to automatically kick off an update to Redis when the database model is updated, and remarks "great, you just coupled your AR model to Redis, every time you persist it, it needs Redis." He doesn't say that the goal—synced data—is bad, merely that the implementation is introducing significant coupling. In reply, @awj says:

> There can be great value in having secondary data stores continuously kept in sync with primary data changes. There also can be value in not doing this. Stating that either is unequivocally a "bad practice" is little more than cargo cult system design.

Holy leap of logic, Batman. That's some underpants-gnome thinking... "Don't use A to implement B because that method increases coupling" does not imply "Don't implement B." At first I was angered by what I considered to be dishonest debating tactics, but after thinking about it for a while, I've come to realize that it most likely results not from dishonesty, but from a constrictive mindset that a developer, steeped in Rails and ActiveRecord culture, will almost inevitably adopt.

Within the Rails and AR world, whenever good coding practices are pitted against "Rails Way" mantras like DRY and various "best practices"—not to mention expediency—the good coding practices almost always lose. The fact is, there is no good way to implement that sort of automatic syncing between database and Redis that is both well-coded and compatible with the "Rails Way." To a certain kind of "Rails developer," the only way to resolve the dissonance is to adopt logic like "Saying I shouldn't couple is the same as saying I shouldn't implement my feature—" because when you're wedded to Rails and ActiveRecord, that is in fact exactly the case.

ActiveRecord—both as it is implemented and as it is used—is a big driver of the culture that insists that tightly integrated code and side-effect driven logic is necessary and desirable. On its surface, it purports to be a powerful and easy-to-use database access layer. Developers like it because they don't have to *do anything* to use it—its ease of use right from the start of a project is legendary. Unfortunately, these benefits are illusory. The fact is, ActiveRecord induces insane amounts of coupling in your app and severely restrict developer freedom down the road.

## ActiveRecord is Full of Anti-Patterns

How does ActiveRecord lead to coupling? Let me count the ways. The simplest is the globally accessible interface—such as being able to call `where` on any model from anywhere—which can lead to app code littered with knowledge of the database schema, not to mention that every class has complete unfettered access to your entire database. Named scopes aren't much of an improvement. How many named scopes look like this:

{% highlight ruby %}
scope :with_user_and_notes, -> { includes(user: :notes) }
scope :newest_active, -> { where(active: true).order('created_at desc, id desc') }
scope :red_color, -> { where(color: red) }
{% endhighlight %}

Not only does this barely count as syntactic sugar, but they still expose details of the database and remain available globally, as always. The global is still a significant problem—more semantic scopes would be either completely inflexible or forced to incorporate business logic (those will be some fun tests) to be useful in different circumstances. Other bullshit "best practices" like "thin controller, thick model" lead to monster model classes full of business logic—pretty much the definition of tightly coupled code:

{% highlight ruby %}
def publish_change_to_clients!(type)
  return unless topic

  channel = "/topic/#{topic_id}"
  msg = {} # actual message value cut for length

  if Topic.visible_post_types.include?(post_type)
    MessageBus.publish(channel, msg, group_ids: topic.secure_group_ids)
  else
    user_ids = User.where('admin or moderator or id = ?', user_id).pluck(:id)
    MessageBus.publish(channel, msg, user_ids: user_ids)
  end
end
{% endhighlight %}

What does code to send data to a client have to do with persisting a `Post` to the database? Beats me. The model class this method came from is over 600 lines long. Everything that this class does—and it is a lot—is more brittle and less maintainable for it.

Less obviously, the one-table-one-model approach couples your business domain and your database schema, which is sometimes fine but often not. I'll put that another way: a business domain and a database design aren't mirror images of one another—but Rails and ActiveRecord assume (and insist) that they are. As if that weren’t bad enough, by having so completely obliterated the distinction developers are universally encouraged to view the database as an extension of their Rails app, with schema changes and migrations directly correlated with changes to the app. The idea that your database is completely isomorphic to and a part of your app is sheer folly, but it is almost Rails gospel.

## The Database is Not Your App

The fundamental principle at play here is that of the architectural boundary—the place where your app and another system or concern interact with one another. Architectural boundaries aren't necessarily large, but the larger ones are pretty obvious and important: database, file system, network connectivity, in-memory store, etc. They're *boundaries* because from the perspective of your app what lies on the other side is not important—the file system could be real or a mock and your app does exactly the same things. The database could be SQL, NoSQL, or flat files and your app has to use the data in the same exact ways and eventually output the same exact updated data. Conversely, the less agnostic your business code is toward whatever is on the other side of a boundary, the more tightly coupled it is and the weaker the boundary.

If you're having trouble accepting that your app shouldn't care about what database you have on the other side of the boundary, consider this: Imagine a world where SQL is an obscure, relatively new and untested technology and NoSQL is the default, go-to data storage solution. Does that change *anything* about what your app actually needs to do, from a business perspective? Does a single user story change? Does a single formula for calculating some vital piece of data change? No, of course not. On the other hand, how wide is the impact on the code? How many classes have to change, even a little? The best case scenario is only your model classes have to be reworked—but even that alone can be an arduous prospect implicating thousands of lines of business logic.

The idea, again, isn't that you should care about these things because you might someday replace Postgres with Mongo. The point is your code *shouldn't* care about whether its data comes from Postgres or Mongo because it ultimately *makes no difference*, from a business logic perspective. By making your code care, you are, objectively, making it less valuable in the long-term and increasing maintenance costs, while simultaneously reducing its testability and confidence in any tests. You're handicapping your code, tying it to irrelevant detail for little to no upside.

The code forming the boundary mediates between two very different worlds—the world of your domain objects and business rules on one side, and the mechanics of data storage on the other. Architectural boundaries are not reducible to a single class wrapping up obscure details of a protocol inside a nice API. Instead, they translate and mediate between your app and the external system, speaking the language of your domain on one side and the language of the external system on the other.

Coupling happens when details cross over the architectural boundary and mold our code in unavoidable ways. This is exactly what happens with ActiveRecord, because ActiveRecord doesn't actually concern itself with translating between our app and the database—instead it operates from the assumption that your database and your app are the same thing. Rather than translate your business concepts to the database and back again, it simply provides high-level hooks into the low-level boundary not to bridge the boundary, but to erase it.

## Side-Effects May Include...

By combining business logic, querying, data representation, validation, lifecycle, and persistence your app is shackled to a single database and persistance strategy, oftentimes encompassing an enormous amount of the application. This unavoidable fact is directly implicated by another part of that comment that initially made me so angry:

> If it's acceptable for that to "need Redis" then that's what it does. If it's not, then maybe you work around it. It's not like you don't have options to control behavior there.

Essentially what he is saying is that *every part of your app* should know about how your model depends on and mutates Redis every time it saves a record, in order to decide if it should work around that behavior. Let that sink in. That's a recipe for the spaghetti-est of spaghetti code. Your code now can't simply use the data access class to save a record anymore, and if you want to use the interface that it is presenting for the stated purpose you have to have in-depth knowledge of its implementation at each point of use, lest you run afoul of its side effects. That's insanity—when you save a damn record you should expect the record to be saved and that's it. Driving your app by side effect makes it incredibly brittle, and simultaneously difficult to change, and the testing situation turns into a complete disaster.

You don't need to be a FP acolyte to see why it's bad that your classes that do basic, universal things like saving to the database would be kicking off all sorts of other business logic. Imagine that every time you turned the oven on, everyone in your family got automatic notifications that dinner was in 30 minutes—unless you remember to disable it by removing the face-plate and detaching the transmitter every single time you want to use the oven for something else. We encapsulate functionality because it makes that functionality better, for one, to be isolated. It makes it more easily tested, and it make the logic cleaner. We also encapsulate functionality because we don't always want to use things in the exact same ways with the exact same collaborators every time. And in situations where we don't want to use a particular collaborator, we don't want to have to actively take steps to avoid using it.

## Mo' Responsibilities, Mo' Problems

One of the driving factors behind the emergence of NodeJS and Javascript on the server is the canard of shared code. Thousands of devs have been conned into working with an excruciatingly bad language on a platform with a plethora of fantastic alternatives, at least partly through the fantasy of common classes on the server and in the browser. While surely there has been some of that—although I suspect it's mostly just platform-agnostic libraries that get shared and not so much business code—the reality of the situation at the app developer level is often a horror show of non-reusable code, with the same giant, thousand-line god classes encompassing dozens of responsibilities that you'll find in many Rails apps. What is going wrong such that a community obsessed with DRY and a community obsessed with code portability both end up with these single-use monstrosities, and what does it say about how much we actually value code reusability?

A lot of the blame goes to the libraries that are popular and the patterns they push. Encouraging—or enforcing—inheritance over composition leads to large classes with numerous responsibilities, just as a matter of course. Community pressure or "best practices" combined with laziness can then lead to an explosion of responsibilities, as plugins and developers add more and more code to a handful of classes. Finally, having an artificially limited range of "kinds" of classes a developer believes he or she can have (Model, Controller) leads directly to a parsimony of classes, and indeed a general trend of developer resistance towards adding new classes (maybe because it makes the "models" folder look so messy.)

DRY, an almost religious mantra in Rails circles, boils down to increasing code reusability through refactoring. Unfortunately, that's fundamentally at odds with the broader development pattern that is encouraged by almost everything else about Rails. In fact, the way DRY is pushed in Rails circles can lead directly to perverse outcomes. To go back to the `after_commit` hook and Redis example, the obvious alternative to putting that code in a lifecycle callback is to move it to the controller—invoke that completely separate behaviour where and when you want it. Of course, from a wider perspective this isn't good design, because it *does* repeat code. The problem is invoking DRY here and hooking into AR makes the code objectively *worse*, not better. Moving that code into the model reduced repetition, while simultaneously decreasing the reusability of the code.

The massive classes this sort of development process ends up encouraging prevent code reuse through tight coupling from two directions.

From the top-down, the class makes so many assumptions about how it is being used and what it is working with that it can only be used in a handful of ways, if that. If a graphics class internalizes the generation of output files, it'll probably be difficult to extend it to support other formats. If your models handle their own persistence, it can be nigh-impossible to persist the same model in different ways depending on context. If your model is also where you put data filtering and formatting accessors, then having to provide different views of the same data can lead to an combinatoric explosion of methods. Decisions that were made universally based on initial convenience almost never pan out in the long-term for most use-cases, leading to awkward compromises and workarounds which ever-more-tightly couple the class to its circumstances.

From the bottom-up, the class locks up code that might otherwise be generalizable and applicable elsewhere. Code to handle the peculiarities of graphics file formats could find other uses, were it not buried in a god class's private methods. Code to run reports on data can be refactored and made more powerful and flexible if it were its own class. One example of something that is successfully and commonly extracted from the AR hierarchy is serialization (via, e.g., ActiveModel::Serializers), exactly the sort of concern that should be treated as a separate responsibility.

Bottom line: there's an inverse relationship between composability and number of responsibilities. The more responsibilities you pile into a class, the less composable it is, and the less use you'll get out of your code, on average (which means you'll write more code, in the long run.) ActiveRecord is a complete failure on both grounds: AR models are increasingly less reusable as time goes on and they grow larger and introduce side-effects, and the code locked within is completely un-reusable right from the start... yet, it's all still DRY, somehow.

## Rails Models Have Many "Reasons to Change"

The Single Responsibility Principle says (spoilers) that every class should have a single responsibility—which is sometimes defined as "a reason to change." The "reason to change" clarification is useful because too often "responsibility" is conflated with a Rails "resource"—this class is responsible for posts, that's a single responsibility, right? Well, no. No, it isn't. Not at all.

Let's take a look at the responsibilities a `Post` class has in a Rails app. It loads the schema from its database, so that it knows what attributes it has. It defines the relationships between your models. It provides for querying the database. It performs domain validations on records. It *is* the data itself, and handles accessing and mutating record data. It persists (create or update as needed) records to its database. And all of that's without any user code.

Add in things like Paperclip and Devise and the responsibilities explode, before the dev even begins to pile on business responsibilities. What if you want to change how a post is persisted, without changing anything else? Good luck. Want different validations depending on whether the logged in user is an admin? I hope you like duplicated code and hackish workarounds. Persist auto-save drafts to an in-memory store rather than the database? Abandon all hope, ye who enter.

The thing is, when you first start a project or when you start with simple projects and gradually work your way up in terms of complexity, this can look pretty good—of course you don't want to worry about where a particular model is getting stored, or managing sets of validations. Of course! It "just works" ... for now. Eventually, though, all the things that AR makes so easy and simple at first glance will be your "reasons to change"—maybe not today, and maybe not tomorrow, but soon. Then what? If you were like many Rails devs, I imagine you'd simply "work around it" by using other parts of AR that seem to give you "options to control behavior."

There are strategies to mitigate some of the damage that ActiveRecord can cause. At best, they reduce but do not eliminate the problem. Regardless of efficacy, they are almost never put into practice. The attitude seems to be—if not outright hostility to any alternative—at least a resigned acceptance that one has made his or her deal with the devil. Far too often, the very worst parts of ActiveRecord are enthusiastically embraced and evangelized. And so it goes.