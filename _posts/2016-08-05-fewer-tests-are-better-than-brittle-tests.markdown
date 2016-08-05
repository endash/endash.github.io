---
title:  "Fewer Tests Are Better Than Brittle Tests"
date:   2016-08-05 9:00:00 -0400
categories: jekyll update
color: blue
layout: post
---
Tests shouldn't have to be changed or updated all that often. If they are, then they're getting in the way of what tests are supposed to help us achieve: high velocity, effortless refactoring, code maintenance, etc. High test churn is an indication that something is wrong with either the testing methodology or the code design. The proximate causes are legion: lots of stubbing/mocking, large numbers of dependencies, spaghetti classes, testing glue code, high level (integration) tests masquerading as low level (unit) tests, and so on. This is a separate issue from keeping tests DRY. If your helper modules or shared contexts are churning, then that's likely as much a smell as if you have to constantly rewrite the tests themselves.

There are three main kinds of problems, in my experience:

## Testing The Wrong Thing

It's really easy to test things you shouldn't, especially if library glue/boilerplate code makes up a significant fraction of your app. There's sometimes an insistence on exhaustively testing "our code," even if our code doesn't actually do anything. Or there might be pressure, internal or external, to write tests just to say you wrote tests. Often this will take the form of testing rote configuration of some framework class, which is a combination of code duplication *and* testing third-party code. Not only are you probably "testing" something that is liable to change, but you're quite possibly coupling your test to your implementation, at best, and the implementation of a third party library, at worst.

A very rough rule of thumb is not to write a test if you didn't actually write a function or method yourself. In those situations where you do feel the need to write a test, then it should be functional: varying inputs and asserting on results, *not* interrogating and asserting against internal state. A good example might be validations built into an ORM class: testing those validations should be functional, i.e. the validate method should be called with actual valid or invalid data—simply using introspection to check that "this class has a uniqueness validation registered on it" is pointless.

## Testing Too Much

If you fall into the mindset that good testing is to throw a veil over the code and rigorously test against any conceivable bug via every single access point, then it'll be easy to ramp up the quantity of tests you write to an absurd level. This can result in a lot of test churn if the things you're overtesting end up changing—and they probably will. For example, you might write a bunch of tests that verify logic for a method that simply forwards its arguments elsewhere. Test logic present in the class, method, or function. Don't test delegated logic.

For instance, if you have a method that does some sort of computation, and another method that composes that method:

{% highlight ruby %}
def calculate_tax(product, state); end;
def tax_for_order(order); end;
{% endhighlight %}

Then tests for `tax_for_order` shouldn't be testing that individual taxes were calculated properly. The tests for `calculate_tax` handle that. A good rule of thumb is that if you find yourself testing more than one thing for a given method/function, or testing the same thing across multiple test subjects, then you're either testing logic that is elsewhere *or logic that should be elsewhere.* How applicable the rule is will vary based on how vital the thing you are testing is, whether it's public vs. private, whether it's part of an interface that client code might use, etc. In general, though, well-written code will have simple, single-issue tests. In this example, `tax_for_order` might initially look like this:

{% highlight ruby %}
def tax_for_order(order)
  if @states_we_tax.include?(order.state); end
end
{% endhighlight %}

Now you're testing at least two things: (1) Whether we even charge tax on this order, based on the state and (2) What the tax for the order should be. Code that is more cleanly tested might look like:

{% highlight ruby %}
def order_subject_to_tax?(order); end;

def tax_for_order(order)
  if order_subject_to_tax?(order); end
end
{% endhighlight %}

(An even worse initial version might be something more like `@states_where_we_have_warehouses.include?(order.state)`.)

## Testing Poorly Designed Code

There's nothing wrong with mocking, stubbing, test doubles, etc. However, *too much* mocking, or stubbing in low-level unit tests, can oftentimes be a code smell. Having to mock or stub a lot is a strong indication that a class is too tightly coupled, either to its dependencies or because the class combines a lot of responsibilities. If you have to stub the class you're testing itself, then something has gone horribly wrong. If you're stubbing or mocking some internal method, then you've hit on something that should be in another class in the most direct and obvious way possible.

Too much mocking/stubbing can be caused by a class having too many dependencies. Having many dependencies is, furthermore, an indication that your class is doing too much. Often this'll be paired with large methods that tie everything together. One of the chief benefits of testing is its ability to highlight larger-scale design problems: if it sucks to test something, it's probably poorly designed. Being at a loss for how to test something, or even just really not looking forward to it, is a strong indication that you should be refactoring, not papering over the problem with painful, complex tests.

## Conclusion

None of these problems are peculiar to any particular testing methodology. However, if you're encountering them while ostensibly practicing TDD then you should step back and reconsider how much you're actually letting the tests drive the code. Actually writing tests first is a key part of TDD, of course, but *putting* the tests first is, in my opinion, both more important and often overlooked entirely.