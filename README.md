# The Tour

![image](https://user-images.githubusercontent.com/48129546/223292527-6614f040-1813-4a5c-ae28-11d2c7c662ab.png)
<p float="left">
    <img src="https://user-images.githubusercontent.com/48129546/223292877-d95ed0c1-e209-4d48-b809-1162a5e2a980.png" width="400"/>
    <img src="https://user-images.githubusercontent.com/48129546/223294911-c5cd15de-3840-4f63-a4c6-623572bd6ac6.png" width="400"/>
<p>
    
![image](https://user-images.githubusercontent.com/48129546/223295637-3710f3f4-79c0-45a8-8d5a-9b5ff4ca32ea.png)


## Description

The Tour is a fully-fledged web application designed for persons who love travelling and provides an online platform for them to explore and book sightseeing tours. A sightseeing tour takes tourists on a themed adventure by visiting different locations. A visiting user who does not have an account on the app can view all the tours and detailed information about each tour. Once registered or logged in, an authenticated user can book any tour that they desire. An authenticated user can also write a review and give a rating to the tour. 

## Getting Started 

### Installation guide
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

### Set up local environment
In /.config.env, you can set up accounts with MongoDB, Stripe, sendGrip and mailGrip.

```
NODE_ENV=development
PORT=3000
DATABASE=
DATABASE_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525

EMAIL_FROM=

SENDGRID_USERNAME=apikey
SENDGRID_PASSWORD=

STRIPE_SECRET_KEY=

```

## Tech Stack
-   JavaScript
-   Node.js
-   Express.js
-   HTML5 / CSS
-   MongoDB Atlas
-   Pug Template engine
-   Flowbite Library


## Architecture
![image](https://user-images.githubusercontent.com/48129546/223295704-24319ac8-1a50-456e-b915-2de3eb41f2f0.png)



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

## User manual

### Book a tour
Register an account and then log in to the website.  
View the tour and click the tour that you want to book.  
Click the book button to book a tour.  
Proceed to the payment page.  
Enter the credit card data.  
- Card No. : 4242 4242 4242 4242
- Expiry date: 04 / 24
- CVV: 424
Finish the booking and transaction.  


### API documentation
The API documentation of this web application is created via Postman. It is published online.  

The URL for the API documentation:  
https://documenter.getpostman.com/view/23277889/2s8YsxuB4J


## Contained Files
### Main folders
- ./controller: contains all files of control logic
- ./models: contain all files of MongoDB schema
- ./routes: contain all routing files
- ./views: contain all pug templates
- ./dev-data: contain all data for development
- ./public: contain all statics files including image, CSS stylesheet and frontend JavaScript

| Path     | Component function |
| ----------- | ----------- |
|./controller/authController.js |	Handle authentication logic |
|./controller/errorController.js |	Handle error controller |
|./controller/reviewController.js |	Handle review logic  |
|./controller/tourBookingController.js |	Handle tour booking logic | 
|./controller/tourController.js |	Handle tour logic |
|./controller/userController.js |	Handle user logic |
|./controller/viewController.js	| Handle the logic of webpage rendering |
|./controller/handlerFactory.js	|Handle the factory design pattern |
|./models/bookingModel.js |	Define booking schema |
|./models/reviewModel.js |	Define review schema |
|./models/tourModel.js |	Define tour schema |
|./models/userModel.js |	Define user schema |
|./routes/reviewRoutes.js |	Define routes and endpoints for review |
|./routes/tourBookingRoutes.js |	Define routes and endpoints for booking |
|./routes/tourRoutes.js |	Define routes and endpoints for tour |
|./routes/userRoutes.js |	Define routes and endpoints for user |
|./routes/viewRoutes.js |	Define routes and endpoints for frontend view |
|./utils/appError.js |	Define an extended error class |
|./utils/apiFeatures.js	| Define an APIFeatures class to handle URL query and generate MongoDB query string |
|./utils/catchAsync.js |	Handle asynchronous promise rejection error |
|./utils/email.js |	Define an email class |
|./app.js |	Set up middlewares and Express router |
|./server.js |	Set up the web server and database connection |
|./config.env | 	Store configuration variables 



