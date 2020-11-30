FROM node:15.3.0

# Copy the NPM tarball into the root directory for installation:
COPY lehigh-liftoff.tgz /lehigh-liftoff.tgz

# Install the lehigh-liftoff package from the ACM registry:
RUN mkdir /opt/lehigh-liftoff; \
	cd /opt/lehigh-liftoff; \
	npm install /lehigh-liftoff.tgz; \
	rm /lehigh-liftoff.tgz

# Define the default execution environment:
WORKDIR /opt/lehigh-liftoff
CMD [ "npx", "lehigh-liftoff" ]

