---
title:  "Monads and Category Errors"
date:   2019-06-12 09:23:00 -0400
categories: jekyll update
color: blue
layout: post
---
I was noodling on how to explain some aspect of React to someone in terms of Haskell, and it struck to me, after the fourth or fifth time, that I kept thinking the word "monad," as in "the State monad." The realization that followed was that I was still thinking of Haskell types in object-oriented terms, where "type" and "class" are the same thing. None of my explanatory use of `State` relied on its monadic aspect at all, but I was still calling it the "State monad." This is the metonymic fallacy: treating one limited aspect of something as a universal signifier, like referring to everyone of school age as "students," even in contexts completely removed from education.

The immediate problem is that this then makes that thread of the conversation about monads instead of about `State`. As an analogy, imagine you were talking to someone and they kept referring to "Patrick, an American." You would naturally assume that some aspect of the conversation hinged on the fact that Patrick is one of a number of people who are Americans, would you not? If whatever the person was trying to tell you had in fact nothing at all to do with nationality, then this would just be needless misdirection. Valid and true in a technical sense, but poor communication nonetheless.