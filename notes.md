## Things to do to get a service running inside our k8s cluster -

also, have a build pushed to docker hub before setting up deployment with scaffold.

1. First off, we need to make sure that we create a new deployment config file inside of our k8s directory.

2. Then, make sure to add a config entry to our scaffold YAML file, particularly inside `artifacts` section. **The artifact section is going to set up some code syncing.** This is done to make sure that any time we make a change to some JS files inside our service's local directory, those changes get sent into the pod that is running our service image.

3. Last, we want to be able to access this application from outside. So, we need to somehow make requests from outside of our cluster and get them correctly routed inside of it. We are using Ingress Nginx for that.
   So, we have `ingress-srv` file inside of k8s. This, is where we are listing out all of config to specify routing rules inside the cluster for incoming request from the outside world.

## Understanding the deployment config file:

- apiVersion, kind, name inside of metadata are self understood.
- spec: to describe exactly how this deployment is supposed to behave
- replicas: to specify the number of pods to run
- template: describe exactly how every pod that is created and managed by this deployment should behave.
- the metadata section inside of template and the selector section above it is how the deployment is going to find the set of pods that it's supposed to manage.
- the spec after template is to describe how every pod should behave.
- every pod is going to have a container section and the name along with image is specified to it.

- After creating the deployment, we also need a service to allow requests inside the cluster to get access this pod.
- the selector inside spec is how the service is going to find the pods that it is supposed to govern request to.
- after selcector, we specify the list of ports that we want to allow access to.
- the name of port is not super important as it used only for logging purposes.

---

Imperative command to create a secret object in k8s cluster:
kubectl create secret generic jwt-secret --from-literal JWT_KEY=asdf

---

## Testing in Microservices

Whats the scope of our tests?

- Test a single piece of code in isolation -> Single Middleware
- Test how different pieces of code work together -> Request flowing through multiple middlewares to a request handler
- Test how different components work together -> Make request to service, ensure write to database was completed
- Test how different services work together -> Create a 'payment' at the 'payments' service should affect the 'orders' service

Testing all of this is much hassell so instead, focus on only testing isolation.

### Testing goals for Auth service

    1. Basic Request Handling
    2. Some tests around models
    3. Emitting + receiving

---

## When getInitialService is executed in browser vs server

| Request Source                                      | getInititalProps |
| --------------------------------------------------- | ---------------- |
| Hard Refresh Of Page                                | Server           |
| clicking link from different domain                 | Server           |
| Typing URL into Address bar                         | Server           |
| Navigating from one app to another while in the app | on the client    |

---
