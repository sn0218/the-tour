# The Tour

![image](https://user-images.githubusercontent.com/48129546/223292527-6614f040-1813-4a5c-ae28-11d2c7c662ab.png)
![image](https://user-images.githubusercontent.com/48129546/223292877-d95ed0c1-e209-4d48-b809-1162a5e2a980.png)
![image](https://user-images.githubusercontent.com/48129546/223294911-c5cd15de-3840-4f63-a4c6-623572bd6ac6.png)
![image](https://user-images.githubusercontent.com/48129546/223294952-f3f9cce6-9159-4bdf-af53-6b1a71157513.png)
![image](https://user-images.githubusercontent.com/48129546/223294960-163685d4-8f2f-447d-a38a-72cd2063266a.png)
![image](https://user-images.githubusercontent.com/48129546/223294968-d19bea2f-afd8-4183-9755-3b79d1e7746f.png)


## Description

The Tour is a fully-fledged web application designed for persons who love travelling and provides an online platform for them to explore and book sightseeing tours. A sightseeing tour takes tourists on a themed adventure by visiting different locations. A visiting user who does not have an account on the app can view all the tours and detailed information about each tour. Once registered or logged in, an authenticated user can book any tour that they desire. An authenticated user can also write a review and give a rating to the tour. 

## Getting Started 
Your local machine must be installed with Node.js. If not, download LTS version in https://nodejs.org/en/.  
Navigate to the root file of the application in the command-line interface. The root folder name is “tour_app”.  
To run the application in a local machine, run the following commands in the root folder path.

```
// install dependencies
npm install

// install nodemon
npm install -g nodemon

// run the application (development environment)
npm run

// run the application (production environment) (optional)
npm run start -prod

// debug the application (optional)
ndb server.js

// setting up eslint and prettier (optional)
npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y  eslint-plugin-react --save-dev

```
The application will be available on http://127.0.0.1:3000/.

## Tech Stack
-   JavaScript
-   Node.js
-   Express.js
-   HTML5 / CSS
-   MongoDB Atlas
-   Pug Template engine
-   Flowbite Library


## Functions and Features
### Functions
-   Authentication and authorization including registeration, login and logout.
-   User account management e.g update username, email address, profile picture and password.
-   View all tours and details of a single tour.
-   Add, update and cancel tour booking.
-   Create, edit and delete tour's review and rating.
-   View tour's reviews on the tour page.

### Features
- Multipage application
- JSON Web Token (JWT) Authentication
- Credit Card Checkout (Stripe)

## API endpoints
![image](https://user-images.githubusercontent.com/48129546/223294239-47b9d420-c1db-47e7-b6fb-4acaab4cbfe2.png)

## Database
The data model consists of 4 schemas: tours, reviews, bookings and users. Tours have a one-to-many relationship with bookings and reviews. Users also have a one-to-many relationship with reviews and bookings. Each schema maps to a MongoDB collection. 

### Data model
![image](https://user-images.githubusercontent.com/48129546/223294454-2f6b28ab-80c4-44a6-8147-c890165d855b.png)




## Contained Files
