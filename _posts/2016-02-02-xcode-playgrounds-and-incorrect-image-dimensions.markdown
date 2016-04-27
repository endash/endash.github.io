---
title:  "Xcode Playgrounds and Incorrect Image Dimensions"
date:   2016-02-02 12:00:00 -0500
categories: jekyll update
color: red
layout: post
---
For a bit of fun I'm going through the [DARPA Shredder Challenge](http://archive.darpa.mil/shredderchallenge/) puzzles. The challenge ended 5 years ago (and I'm not a computer scientist, besides), so I'm sticking with the tools and technologies I use professionally, despite their potential inefficiency or inappropriateness for the task.

My first problem, right off the bat—trying to load the puzzle image into a playground kept coming up with the wrong dimensions, by almost an order of magnitude. The full-size image is important since I'm basically working with the image on a pixel-by-pixel basis, and the details I needed for analysis was getting blown away. Pretty much nothing I did that involved `NSImage` in any way would work, and since I just needed to get at the raw pixel data, I skipped it entirely:

{% highlight swift %}
let bundle = NSBundle.mainBundle()
let url = bundle.URLForResource("puzzle1", withExtension: "png")!
let dataProvider = CGDataProviderCreateWithURL(url)
let image = CGImageCreateWithPNGDataProvider(dataProvider,
  nil, false, .RenderingIntentDefault)!
let bitmap = NSBitmapImageRep(CGImage: image)
{% endhighlight %}

(Some lines split out to reduce horizontal scrolling)

Note that using `NSData(contentsOfURL:)` in conjunction with `NSBitmapImageRep(data:)` did *not* work, having the same dimensions problem as the simpler solutions.