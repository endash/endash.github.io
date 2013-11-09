---
layout: post
title:  "Annotated ember.js changelog"
date:   2013-11-09 15:56:50
---

* Table of Contents
{:toc}

### 1.2 Beta 3

* {: .other-0}Update router.js

* {: .bugfix-1}Give precedence to routes with more static segments. Fixes #357

* {: .other-0}Improve unhandled action error messages

### 1.2 Beta 2

* {: .bugfix-0}reduceComputed ignore changes during reset.

* {: .bugfix-0}reduceComputed handle out-of-range index.

* {: .bugfix-0}Allow Ember.Object.create to accept an Ember.Object.

### 1.2 Beta 1

* {: .feature-2}Add support for nested loading/error substates.

  A loading substate will be entered when a slow-to-resolve promise is returned from one of the `Route#model` hooks during a transition and an appropriately-named loading template/route can be found.  An error substate will be entered when one of the `Route#model` hooks returns a rejecting promise and an appropriately-named error template/route can be found.

* {: .feature-1}Components and helpers registered on the container can be rendered in templates via their dasherized names. E.g. {{helper-name}} or {{component-name}}

* {: .feature-2}Add a `didTransition` hook to the router.

* {: .feature-0}Add a non-block form link-to helper. E.g {{link-to "About us" "about"}} will have "About us" as link text and will transition to the "about" route. Everything works as with the block form link-to.

* {: .feature-1}Add sortBy using Ember.compare to the Enumerable mixin

* {: .feature-1}reduceComputed dependent keys may refer to @this.

* {: .bugfix-1}reduceComputed handle out of range indexes.

* {: .other-0}Update Ember.immediateObserver and Ember.beforeObserver to match the new Ember.observer style.

* {: .other-0}Make Ember.observer work with the function as the last argument.

* {: .other-0}Ember.run.debounce and throttle accept string numbers like time interval

* {: .other-0}Use Ember.Error consistently.

* {: .other-0}Add assertion upon too many ajaxStop's.

* {: .other-0}Introduce registerAsyncHelper which allows for unchained async helpers

* {: .other-0}Ember-testing should not cause a test failure when aborting transitions

* {: .other-1}Ember.Test Helpers no longer need to be chained

* {: .other-2}Refactored promises usage

* {: .other-0}Should not reference global `Handlebars` object, use `Ember.Handlebars` instead

* {: .other-0}Added support for jQuery as a `require` module

* {: .other-0}Decamelize handles strings with numbers

* {: .other-0}disallow container registration if the corresponding singleton lookup has already occurred

* {: .other-0}collection view will now defer all normalization to the resolver

* {: .api-1}Remove Route#redirect soft deprecation

* {: .other-0}Universalize {{view}} helper quoteless binding syntax, prevent id binding

* {: .other-0}prefer Ember.Logger.assert over Logger error + setTimeout throw.

* {: .other-0}Allow for the initial router to be resolved.

* {: .other-0}Don't allow registration of undefined factories.

* {: .other-0}Add `Ember.Subarray.prototype.toString`.

* {: .other-0}provide helpful assertion if needs is specified but no container is present.

* {: .other-0}Update router.js to bc22bb4d59e48d187f8d60db6553d9e157f06789

* {: .other-0}Update route recognizer

* {: .other-0}Allow apps with custom jquery builds to exclude the event-alias module

* {: .api-0}Removes long-deprecated getPath/setPath
