[![Build Status](https://travis-ci.org/pgentile/tests-cucumber.svg?branch=master)](https://travis-ci.org/pgentile/tests-cucumber)

Tests Cucumber
==============

A backend to record Cucumber results. An UI to read results.


Requirements
------------

* JDK 8
* Node
* Bower
* Grunt
* Mongo


Build
-----

First time, install Bower dependencies and init Gradle build for Node component:

```
(cd tests-cucumber-ui && npm install && bower install)
```

Build application with Gradle:

```
./gradlew build
```

_Warning_: when Gradle is launched with Intellij, the PATH environment variable doesn't
always contain path to Grunt. If this is the case, relaunch Gradle daemon:

```
./gradlew --stop
./gradlew build
```


Develop
-------

Run Mongo with Docker Compose:

```
docker-compose up
```

Run Mongo migrations to build database:

```
(cd tests-cucumber-mongo && ./migrate.sh MONGO_HOST/MONGO_DATABASE)
```

Start Java backend:

```
./gradlew runBackend
```

Start UI:

```
(cd tests-cucumber-ui && grunt serve)
```

You can build sample Cucumber reports from the `tests-cucumber-example-features`:

```
./gradlew dryRunCucumber runCucumber
```

Generated reports can be found in `build` directory.


Deploy
------

The sub-project `tests-cucumber-capsule` builds a fat [Capsule](http://www.capsule.io) that contains in one JAR
backend and UI. This JAR contains everything that is needed to run the TestsCucumber app.

You can run it from Gradle:

```
./gradlew runCapsule
```

The fat Capsule JAR is named `tests-cucumber-capsule-VERSION-SNAPSHOT-capsule.jar`. Run it with this command:

```
java -jar tests-cucumber-capsule-VERSION-SNAPSHOT-capsule.jar server CONFIG.yml
```


Architecture
------------

Used frameworks:

* UI project: [AngularJS](https://angularjs.org)
* Backend project: [Dropwizard](http://dropwizard.io),
  [Spring](http://spring.io), [Morphia](http://mongodb.github.io/morphia/),
  [Orika](http://orika-mapper.github.io/orika-docs)
