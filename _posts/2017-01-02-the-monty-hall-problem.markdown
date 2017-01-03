---
title:  "The Monty Hall Problem"
date:   2017-01-02 9:00:00 -0400
categories: jekyll update
color: blue
layout: post
---
The Monty Hall problem is a classic example of a provable, simple truth that runs entirely counter to our expectations. When it was widely distributed in Parade Magazine in 1990, thousands of readers—many very well educated, including scientists—wrote in to vigorously disagree with the proferred conclusion. Yet, computer simulations have (trivially) proven the extremely intuitive solution to be incorrect.

The problem is simple, and is based on the game show "Let's Make a Deal." A game show host presents you with three doors. Behind two of the doors is a goat. Behind the third door is a new car. You're invited to select one of the three doors. After you pick your door, the host opens one of the other two doors to reveal a goat. He then gives you the option of switching to the door that you did not pick and that he did not open. Should you switch?

The answer is yes—your odds of winning the car are doubled if you switch. The intuitive answer is "it doesn't matter"—there are two doors, one of which definitely has a car behind it, so if you were to flip a coin and pick one you'd have a 50% chance of picking the right door. That answer is provably incorrect. So, what's going on here?

Let's step back and take another look at how this could go. You're back in front of the doors, which have been reset. This time, after picking your door (let's say you pick door C) the host offers to let you either stay with the door you picked, or get *both* of the other doors (A & B). If the car is behind door A or door B, then you win it. Should you switch?

Of course you should. It's plainly evident that two doors give you twice as many chances to get the car. With one door, you only have a 33% chance of having picked the car. There's a 66% chance the car is behind one of the other two doors. Now, remember again that there is only 1 car, and 2 goats. That means that at least one of the two doors definitely has a goat behind it. The question to consider is: are the odds different if the goat is behind door A rather than door B? You *know* for an absolute ironclad fact that one of them is a goat, so does it matter *which* door has a goat?

Let's say you switch. At this point, your choice is locked in. The host reminds you that behind one of the two doors there is definitely a goat, and asks what you think your odds of winning are. You tell him that you're twice as likely to win as not win, since you have 2 chances to get the car. Then the host says "What if I were to tell you that behind door A is a goat, what are the odds now?"

There remains, of course, a 66% likelihood of winning the car.

There was always going to be a goat, behind either door A or door B (or both, of course.) And the host was always going to tell which one had the goat, whether or not it was door A or door B. You have received absolutely zero new information that would affect your odds of winning the car.

This scenario is completely identical to the original formulation, where the option to switch is given after the goat is revealed. There is no new information, you always knew there was a goat, and you knew the host was going to show you one. The key to all of this, and what makes it counter to our intuitions, is that the door opened to reveal the goat wasn't chosen *randomly.* The host was *never* going to open your door, even if it held a goat. So, even though there are now two unopened doors to choose between, the odds aren't equal because the two sets of doors were treated differently.

If a complete stranger were to come across the set, and see the three doors with one already open to reveal a goat then it *would* be a coin flip for that stranger—because they don't know which door you initially picked. That extra information is what tips the odds in your favor if you end up switching.
