---
title: Overview
sectionName: API Reference
template: api.jade
menuIndex: 4
---

This pages contains general documentation about the API. Use the links on the
right to navigate to specific resources.


### Content-type

The API uses the JSON format. Unless specified otherwise, all requests and 
response should have the `Content-Type: application/json` header.


### HTTP verbs

The API uses the standard HTTP verbs to perform CRUD operations (**C**reate,
**R**etrieve, **U**pdate, **D**elete) on resources, following standard RESTful
API practices.

Here is a quick summary of how HTTP verbs are used in the API:

| Verb     | Description |
|----------|--------
| `GET`    | Used to retrieve a resource or a collection of resources.
| `HEAD`   | Like `GET` but only returns the headers without the response body. Note that this verb is only available for some resources.
| `POST`   | Used to create a new resource.
| `PUT`    | Used to perform a full update of a resource (replacing the resource with the JSON representation provided in the request).
| `PATCH`  | Used to perform a partial update of a resource (only updating the properties of the resource specified in the JSON representation provided in the request).
| `DELETE` | Used to delete a resource.


### Authentication

To interact with the API, your client must be authenticated.
This is done by using the **Authorization** header with bearer tokens:

    Authorization: Bearer QWxhZGRpbjpvcGVuIHNlc2FtZQ==

The administrator can create new bearer tokens for users.
There is one secret bearer token for the administrator.


### Errors

In case of error, the API will send a plain text response with a message describing the problem:

```
HTTP/1.1 422 Unprocessable Entity
Content-Type: text/plain

The "image" field is missing.
```

### Dates

All dates returned by the API are in the [ISO-8601](http://en.wikipedia.org/wiki/ISO_8601) format (ex: `2015-03-12T21:48:51.192Z`).
