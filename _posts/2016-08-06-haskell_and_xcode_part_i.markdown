---
title:  "Haskell & XCode Part I: Using Haskell In Your Application"
date:   2016-08-06 9:00:00 -0400
categories: jekyll update
color: blue
layout: post
---
I'm working on an experimental graphics app that delegates a lot of functionality (including user-scriptability) to (mostly) pure functional code, written in Haskell. To be clear, the point here isn't to "write a Mac app in Haskell." Instead, my Haskell code consists of certain domain-specific operations on data structures. Transformed data is returned to the main app, to be interpreted as appropriate.

There are two main problems to solve: (1) integrating the Haskell part of the app in the first place and (2) exchanging structured data between Swift and Haskell. This post is Part 1, and I'll discuss marshaling data across the boundary in a later post. The first step turns out to be pretty simple, in contrast to the impression given by an article on the official Haskell wiki on the subject. This post covers the process for an Application target. Framework targets are a bit different, and will be covered in Part 2.

## The Haskell Code

Haskell integration with other languages is based on the Foreign Function Interface (FFI.) The FFI handles translating/calling the external function (or vice-versa.) All we have to do is tell it a little bit about how the function gets called, and what the types are. We'll start with a very simple function:

{% highlight haskell %}
module Triple where

triple :: Int -> Int
triple x = 3 * x
{% endhighlight %}

I went with `triple` to avoid any confusion with `Double.` In order to export this function to be called elsewhere, we have to first include the `ForeignFunctionInterface` language extension at the top of the file:

{% highlight haskell %}
{-# LANGUAGE ForeignFunctionInterface #-}
{% endhighlight %}

The last thing we need to do is actually export the function. Note that the typing situation can be a little weird, and FFI provides the `Foreign.C.Types` module with C-specific types. In this case, however, the normal `Int` type works just fine.

{% highlight haskell %}
foreign export ccall triple :: Int -> Int
{% endhighlight %}

`ccall` specifies the calling convention, e.g., how to find the function and its arguments in memory. In this and most cases `ccall` suffices, and tells the compiler to use the C calling conventions. Finally, we simply repeat the function signature. Note that in many cases it will not be this simple to translate a Haskell signature into the C-compatible version. That'll be covered in more detail in Part 3.

## Compiling The Haskell Code

GHC has a gazillion flags... the man page is truly frightening. Luckily we need only to use a handful. The command to compile our simple Haskell file looks like this:

>  `ghc --make -dynamic -shared -lHSrts -lffi -O -o triple.so triple.hs`

There's a lot going on here:

*  `--make` combines all the modules of your code and the dependencies in one step
*  `-dynamic` specifies using dynamic Haskell libraries.
*  `-shared` generates a shared library
*  `-lHSrts` links in the Haskell (HS) rts library
*  `-lffi` links in the FFI library
*  `-O` (that's a capital 'o') enables default optimization
*  `-o triple.so` specifies our output filename
*  `triple.hs` is our input file

## Add Files To The XCode Project

The compiler will output four files. The only two we're interested in are `triple.so` and `triple_stub.h`. Add those to your project. Ideally you would just add references to the files, so that modifying and recompiling the Haskell source won't necessitate any copying or re-adding of files later.

## Configuring The Header Files

In your bridging header file, add `#import "triple_stub.h"`. If you don't have a bridging header, you can just create a new `.h` file and name it `projectname-Bridging-Header.h.`

`triple_stub.h` includes `HsFFI.h`, which is part of the core GHC libraries. We have to tell XCode where to find the header file, via the project inspector. Under the "Build Settings" tab, find the "Header Search Paths" setting and add the location of the GHC includes directory. On my system that directory is:

>  `/Library/Frameworks/GHC.framework/Versions/Current/usr/lib/ghc-7.10.2/include`

but your mileage may vary.

## Final XCode Build Settings

`triple.so` should have been added automatically to "Linked Frameworks and Libraries," at the bottom of the "General" tab for the app target. If not, add it now.

This isn't enough to actually make the library available, though, so we have to tell XCode to copy it via the "Build Phases" tab. Click the "+" at the top and add a "New Copy Files Phase." Set the "Destination" dropdown to "Frameworks." Now, drag `triple.so` into the file list for the new build phase.

## Setup Complete!

Now that we have our project set up, we can call our function from our Swift code just like any other C function that is automatically bridged for us. The only caveat is before we call a Haskell function we have to call `hs_init` to setup... I'm not entirely sure what it sets up. There is a corresponding 'hs_exit' function to call when we're all done with Haskell.

{% highlight swift %}
func applicationDidFinishLaunching(aNotification: NSNotification) {
  hs_init(nil, nil)
  NSLog("\(triple(4))") // => 12
  hs_exit()
}
{% endhighlight %}

Sending and receiving more complex data will require a bit more work, and I'll cover that in a separate post.