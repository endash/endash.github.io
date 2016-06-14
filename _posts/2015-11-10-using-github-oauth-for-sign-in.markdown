---
title:  "Using Github OAuth For Sign-in"
date:   2015-11-10 12:00:00 -0500
categories: jekyll update
color: red
layout: post
---
This weekend I went to implement sign-in with Github (specifically, since my app is dev-focused). Having used it to sign into apps in the past, I had the vague idea that Github was an OpenID provider. It's not, it's just a plain-old OAuth2 server, so even more than usual it's incumbent on the developer, i.e. me, to ensure it is used securely. There are a few major considerations.

It should be well-known—but probably isn't—that Oauth 2, by itself, is an authorization protocol, not an authentication protocol. In authorizing a user, we want to gain access to some protected resource. In authenticating a user, we want to affirmatively establish their identity. OAuth specifies a rock solid flow for the former, but mostly ignores the latter. This might seem counterintuitive if you're used to thinking of OAuth as an authentication mechanism, but when you consider that the point of the protocol is to enable password-less access to data owned by a third party service it actually makes a lot of sense that authentication for *your* app is out of scope.

It's still possible to use OAuth2 as part of a secure authentication process. In fact, there are extensions that build on OAuth2 to create such an authentication protocol, such as OpenID Connect or Facebook Login. OAuth isn't inherently insecure, it just doesn't go that last mile to provide the functionality we want by default. Absent implementation of an additional authentication layer spec, there are steps that an application developer can take to use OAuth for authentication.

## Properly configured SSL is absolutely essential

SSL can be an incredible pain to setup: acquiring the certificates, processing them in obscure ways, installing them, configuring it all, and then dealing with potential errors and issues in your code. OAuth 2 relies heavily on SSL to provide security, however, and as such eschews techniques such as token signing to provide fallback security. Improper use of SSL can expose client secrets in addition to communications between your server and the browser. When faced with certain errors it can be tempting to toggle obscurely named settings that seem to resolve the error. Oftentimes this can have the effect of severely crippling SSL, for instance by disabling certificate verification.

## Only use the server-side authorization grant

Using the implicit grant is inherently insecure, as a "bad actor" app developer can attain an access token for someone who has logged into their app and has also logged into your app. That token can then be injected into your app. Your app would have no way of knowing that the access token provided was issued to another app entirely. If a user is logged in based solely on verifying this access token, then your user's account can be completely compromised. Github does not support the implicit grant.

## Block cross-site scripting attacks

OAuth2 provides a 'state' parameter that, when provided as part of the authorization request, will get returned as part of the callback. This parameter should be an unguessable string that can be verified, usually by tying it to the session. Cross-site attackers won't be able to guess the 'state' and thus won't be able to inject arbitrary access tokens into your app. This sort of attack is obviously significantly more dangerous when it comes to apps that export data.