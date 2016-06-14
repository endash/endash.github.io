---
title:  "Monads and Ruby"
date:   2015-11-12 11:00:00 -0500
categories: jekyll update
color: redorange
layout: post
---
Monads have a weird and varied reputation outside of the FP universe. For Rubyists, in particular, monads and functional programming can look alien and nearly unparseable. Ruby is aggressively object oriented—it doesn't even have first-class functions, technically—and the foreign nature of a lot of the background necessary to grok monads leads to indifference at best and hostility at worst.

On that score, I once overheard (after mentioning monads at a Ruby meetup) someone define a monad as "something assholes talk about to seem smart." There is way too much knee-jerk rejection by some in the Ruby community of things they don't immediately understand or find comfortable, but that's another post—or multi-year psychological survey—entirely. This isn't an article about why monads are awesome and why Ruby devs should love them.

Other than the indifferent and the hostile, there's also a weird middle group of Ruby developers who are enthusiastic about monads, but who drastically overthink their implementation. I recall coming across a project that was mostly just an ersatz implementation of algebraic data types and type checking in Ruby. I definitely appreciate the benefits of those things, but Ruby just does not have either, and besides that we don't need them to use monads—in Ruby or any other language.

## What is a monad? A refresher

At their core, monads are just another design pattern, like the command or visitor patterns. Here's a simple definition of a monad, or at least I think so, courtesy of [Jed Wesley-Smith](https://developer.atlassian.com/blog/2015/08/optional-broken/), and paraphrased by myself:

> A type T which encapsulates value *a* *(T a)*, and for which there exist<br> functions such that:
>
> a <span class="arrow"></span> T a<br>
> T a <span class="arrow"></span> (a <span class="arrow"></span> T b) <span class="arrow"></span> T b

What's interesting about this definition is that, in a philosophical sense, something is a monad regardless of whether you actually write down and implement those functions in code. Either the functions exist, and someone somewhere could write them and use them in their code, or they don't.

This is the concept of mathematical realism, which underlies the notion that we "discover" mathematics as opposed to invent it. Max Tegmark, an MIT physicist, extends this into his hypothesis that the universe itself is essentially mathematical, and, as a consequence, all possible mathematical structures exist, in some meaningful sense. Here the idea is much simpler: if it is possible for an object to be a monad, then it is a monad, whether that was your intention, or not, and regardless of the extent to which it looks like a monad in another language.

As Rubyists, things shake out even more simply since we don't have much in the way of typing to worry us. If we implement `#bind` (the second function) there's no mechanism for defining or enforcing type signatures, so `#bind` and `#map` have the exact same signature in Ruby. As a result of duck typing the only real type signature is arity, but that being the case remember that a monad in the general case is a mathematical entity—not a type or a class—and as such it is and remains a monad only so long as we use it as one.

## Ruby almost has a built-in monad already

We've already recognized the similar shape of `#bind` and `#map`, but what about that first function, usually called `#return`? `#return`, being a method that takes a value and returns an instance of a type, is, in Ruby, just a constructor. Actually, it isn't strictly identical: with `return`, there's a universal interface, while initializers have hard-coded and peculiar names. This is a direct consequence of dynamic typing and the differing natures of OO vs Functional Programming.

`Array`, of course, has both an initializer and `#map`. Can `Array#map` function as `Array#bind`? Unfortunately, not quite. Let's look at that signature again.

> T a <span class="arrow"></span> (a <span class="arrow"></span> T b) <span class="arrow"></span> T b

In terms of `Array`, this looks like

> Array a <span class="arrow"></span> (a <span class="arrow"></span> Array b) <span class="arrow"></span> Array b

So, `#bind` takes a block that returns an `Array` of a given type, and then itself returns an `Array` of that given type. `#map` doesn't work that way. If you tried to use `#map` like `#bind` you would get the following:

{% highlight ruby %}
[1, 2, 3].map { |x| [x + 1] }
=> [[2], [3], [4]]
{% endhighlight %}

Clearly, not what we wanted. `#map` gave us an `Array` of `Array`s, not an `Array` of `Integer`s like we'd expect from `#bind`. Luckily for us, it looks like there's a simple transform from one to the other. We're just one `#flatten` call away from having an `Array` monad, in theory:

{% highlight ruby %}
refine Array do
  def bind(&block)
    map(&block).flatten
  end
end

[1, 2, 3].bind { |x| [x + 1] }
=> [2, 3, 4]
{% endhighlight %}

With just five lines of code we seemingly now have a monad in Ruby, no complex type enforcement necessary. It remains, however, incumbent on us, the developer, to maintain fidelity to the monad requirements, as with all other informal contracts in our code. With our implementation above we could ignore the laws and use `#bind` exactly the same as we'd use `#map`, and it, surprisingly or not, would work just fine:

{% highlight ruby %}
[1, 2, 3].bind { |x| x + 1 }
=> [2, 3, 4]
{% endhighlight %}

This works thanks to the specifics of our implementation, and we all know not to depend on knowledge of an implementation rather than interface when we rely on a library method, right? In fact, in this case it'd be an even bigger mistake, because the implementation is flawed. It works for `Array`s of numbers, strings, your own classes, etc... but it doesn't work for `Array`s of `Array`s.

{% highlight ruby %}
[[1], [2], [3]].bind { |x| [x + [4]] }
=> [1, 4, 2, 4, 3, 4]
{% endhighlight %}

The monadic law has been broken: `#bind` has given us an `Array` of `Integer`s, instead of an `Array` of `Array`s of `Integer`s. We can tweak our implementation to fix this, but in doing so we'd break (and have to fix) any uses of `#bind` that ignore the law and treat it like `#map`:

{% highlight ruby %}
refine Array do
  def bind(&block)
    map(&block).reduce(:+)
  end
end

[[1], [2], [3]].bind { |x| [x + [4]] }
=> [[1, 4], [2, 4], [3, 4]] # Good!

[1, 2, 3].bind { |x| x + 1 }
=> 9 # Bad!

[1, 2, 3].bind { |x| [x + 1] }
=> [2, 3, 4] # Good!
{% endhighlight %}

So that leaves us with an `Array` monad, which is of limited usefulness without the other `List` goodness in Haskell. A far more universally useful monad is `Maybe` (or `Optional` for Swift devs).

## Call me (maybe)

`Maybe` represents the possibility of there being a value, or there not being a value, without using `nil`. This means we can call methods on the result of an operation without worrying about which situation we're dealing with. If we actually do have a value, calling `#bind` (or other related methods) operates on the value. If we don't have a value, `#bind` short-circuits and simply returns the empty `Maybe`. It's basically rails's `#try` on steroids.

{% highlight ruby %}
b = foo(5) #<None>
b.map { |x| x * 2 }
=> #<None>

c = foo(2) #<Some @value=2>
c.map { |x| x * 2 }
=> #<Some @value=4>
{% endhighlight %}

`Maybe` and `Optional` are the names of types for this monad in Haskell and Swift, respectively, but that doesn't mean there has to be a corresponding class in Ruby. Haskell and Swift's implementation uses algebraic data types, which are great, but they're not objects and Ruby doesn't have anything similar. So when we talk about `Maybe` in Ruby, we're not actually talking about anything called `Maybe` in our code, but the coupling of two types that we *can* implement: `Some` and `None`. In a sense that's all `Maybe`/`Optional` are, as well: a combination (called a tagged union) of two other types.

Here are the Haskell-ish type signatures for `Maybe` (Haskell uses `Just` and `Nothing` rather than `Some` and `None`):

> Maybe a = Some a | None<br>
> bind :: Maybe a <span class="arrow"></span> (a <span class="arrow"></span> Maybe b) <span class="arrow"></span> Maybe b

`#bind` is the same as before: it takes a function that receives the value and returns another `Maybe`, and itself returns a `Maybe`. So, a block passed to `#bind` has to return either `Some a` with a new value or `None` without a new value. There are no other choices. Ruby obviously will let us return anything we feel like, or even however many different kinds of anything we feel like. We can't rely on type checking to help us here anymore than we ever can, and trying to build some ersatz type enforcement just for this special case makes no more sense than it ever would. So, what do we do? Well, we return either `Some a` or `None`. It's as simple as that.

{% highlight ruby %}
Some = Struct.new(:value) do
  def bind(&block)
    block.call(value)
  end
end

None = Class.new do
  def bind
    self
  end
end
{% endhighlight %}

That's it. That's all we need in order to conform to the laws. There is, almost literally, nothing to it when written down in actual code. Concerned that `#bind` will let you return anything you damn well please? So will almost any other Ruby method, so don't sweat it too much. I don't mean "don't test your code," or anything so laissez-faire, but don't get too caught up in the lack of type checking. That's a red herring, and either way your monadic code isn't any worse off than the rest of your Ruby code in that regard.

One very real downside to forcing your code to care about return types is that you lose the benefit of duck typing, and couple your use of a monad to your specific implementation. Theoretically, if you were to use a library or other shared code with methods that returned a `Maybe`, its return values should be interchangeable with your implementations. `Some#bind` will work as expected, `None#bind` will short-circuit as expected, and so on. Now, there might be other differences you care about (particularly around what utility methods are implemented/exposed), but when it comes to the monad type, the behaviour of `#bind` is the only thing that matters.

One more thing to be careful of: `#bind` has to return a monad of the same kind. Returning `Some` from an `Array#bind` call, or `[]` from a `Some#bind` are both monads, and will both respond to `#bind` in turn, but they aren't valid invocations. You can nest `#bind` calls, of course, but when it comes time to return, make sure you're returning the same kind of monad as you started with.

{% highlight ruby %}
arr = [2, 5, 7, 9, 4]

greater_than_5 = ->(x) { x > 5 ? None.new : Some.new(x) }
even           = ->(x) { x.even? ? Some.new(x * 2) : None.new }
increment      = ->(x) { Some.new(x + 1) }

composed       = ->(x) { Array(Some.new(x).bind(&greater_than_5)
                                    .bind(&even)
                                    .bind(&increment)) }

arr.bind(&composed) - [None]
=> [#<Some @value=5>, #<Some @value=9>]
{% endhighlight %}

I have, in my own projects, a pair of module methods—`Monad.bind` and `Monad.compose`—for simplifying monad composition. `compose` actually is just a bit of sugar on top of `reduce` and `bind`, which does the heavy lifting. By using `Proc`s and composition it's trivial to build up a set of simple transforms into more complex operations. They're very easily tested, as individually they're just procs which respond to `#call`, same as always.

## Either

The `Either` monad is similar to `Maybe`, except instead of just one value or nothing you get either a `Left` with a value or a `Right` with a value. `Left` often represents an error, and `Right` a succesful result. The implementations are equally simple:

{% highlight ruby %}
Right = Class.new(Some) # Right is identical to Some

Left = Struct.new(:error) do
  def bind
    self
  end
end
{% endhighlight %}

## Conclusion

Does the rigid type enforcement of a language like Haskell or Swift help catch bugs in your use of monads that you might trip over in a permissive environment like Ruby? Absolutely. That doesn't mean monads have no value to Rubyists, or that we have to turn the language on its head to mine that value. We can build some nice APIs on top of these basic implementations, of course, to add some safety or convenience, but at their core there's nothing about monads that's incompatible with Ruby or that even qualifies as nonidiomatic Ruby.