# Lehigh Liftoff

## Description

The goal of this website is to allow members within the Lehigh computer science community to connect with each other and collaborate on projects of interest. 

## [Live Link](https://liftoff.acm.lehigh.edu/)

## Technologies Used
* Elasticsearch - for text searching project data
* Postgresql - for storing persistent user, group, and project data
* Node.js - for running api web api endpoints
* Express - as a routing framework
* OAuth2.0 - for authentication of users into the site
* Kubernetes - for deployment

## Deployment

Our database configurations comprise a postgreSQL instance on AWS, and elasticsearch (multi-node cluster) and kibana are currently running locally under docker for development/testing. These are short-term temporary solutions, with long-term solutions involving porting to our production Kubernetes cluster which will manage both elasticsearch and kibana.

In order to perform a full production deployment of our application, you will first need to allocate a PostgreSQL instance and an ElasticSearch instance for the application to connect with. PostgreSQL can be deployed via the [official Helm Chart](https://github.com/helm/charts/tree/master/stable/postgresql), and ElasticSearch can be deployed via [its Helm chart](https://github.com/elastic/helm-charts/tree/master/elasticsearch).

1. Once the dependencies are installed, follow these steps to install the application:
2. Package the NPM project by running `npm pack ./`, followed by `mv lehigh-liftoff-*.tgz docker/lehigh-liftoff.tgz`.
3. Build the docker image via `cd docker; docker build -t ${YOUR_REPO}:latest .`. You’ll want to publish the container to your private repository via `docker push ${YOUR_REPO}:latest`.
4. Publish the Helm chart to your private repository. Assuming you’re using Nexus, this can be done via `cd chart; helm package ./; curl -u ${REPO_USER}:${REPO_PASS} https://${REPO_HOST}/repository/${REPO_NAME} --upload-file lehigh-liftoff-*.tgz -v`
5. Modify the `values.yaml` file to match your organization’s infrastructure.
6. Deploy the helm chart by running `helm repo update; helm install -f values.yaml lehigh-liftoff ${YOUR_REPO}/lehigh-liftoff`

## Front-End

Our front-end web UI is written in JavaScript, HTML, and CSS. In the future, we plan to integrate Vue.JS into the front-end codebase in order to provide a more flexible templating solution for the search results page, and also in order to increase the modularity of our frontend code.

## Backend

Our backend uses node.js, express.js, passport.js and a few other technologies to get cool api routes connecting everything together. We also have Google OAuth, so users can't visit pages unless they are logged in. We’ve got routes for users, and routes for groups. We've got routes galore. We also created some fetch functions for the github api, but came across a 60 request limit, limiting our data collection. We plan on using those in future though. 

## Contributors
- Alan Zarza <aez222@lehigh.edu>
- Buckley Ross <brr222@lehigh.edu>
- Tal Derei <tad222@lehigh.edu>
- Sam Markovich <srm322@lehigh.edu>
- Nicholas Lembo <ncl222@lehigh.edu>

