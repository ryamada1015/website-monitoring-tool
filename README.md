# Website Monitoring Application
## Introduction
This Website Monitoring Application is a Node.js tool designed to monitor websites and track various metrics such as uptime, response time, and content changes. Users can initiate monitoring tasks via HTTP requests, and the application fetches website data and stores relevant information for analysis.

## Features
</br>**Uptime Monitoring**: Checks if a website is up and running.
</br>**Response Time Tracking**: Measures and records the response time of the website.
</br>**Load Time Tracking**: Measures and records the load time of the website.
</br>**Network Activity Monitoring**: Monitors incoming requests, responses and status codes.
</br>**Content Change Detection**: Monitors for changes in the website content.
</br>**Data Storage**: Stores monitoring data for further analysis.
</br>**HTTP Request Trigger**: Monitoring tasks can be started using HTTP requests, compatible with tools like Postman.

## Prerequisites
Before setting up the application, ensure you have the following installed:

- Node.js (version 12 or higher)
- npm (usually comes with Node.js)
- Postman or any HTTP client for sending requests
- MongoDB (or any DBMS you like to use)

## Installation
1. Clone the Repository

```
git clone https://github.com/your-repository/website-monitoring-app.git
cd website-monitoring-app
```


2. Install Dependencies
Run these commands in website-monitoring-app\sensory-api

```
npm install
```

## Configuration

Set up your environment variables or configuration files as required by your application.
Create a .env file in the directory, add a port number (80 by default) and a URI string for your database.

### Database Setup
MongoDB Atlas is used as an example here.

1. Create a Cluster: Once logged in, create a new cluster.

2. Configure Database Access:

- Set up a database user with a username and password.
- Configure IP Whitelist to allow connections from your application's IP address or range.
- Connect to Your Cluster: After setting up your cluster and user, you'll be given a connection string. Add this string to the .env file to connect to your MongoDB database.


## Usage
### Starting the Application
Run the application using:
```
npm start
```

The application will start and listen for incoming HTTP requests to trigger monitoring tasks.

### Triggering Monitoring
To start monitoring a website:

1. Open Postman or your preferred HTTP client.
2. Set up a new request with the following details:
</br>**Method**: POST (or as per your application design)
</br>**URL**: http://localhost:80/api/tracker/monitor
</br>**Body**: {inputurl: <url>} (replace <url> with URL of a website you want to monitor. Make sure it is in raw JSON format.)
<img width="640" alt="postman-image" src="https://github.com/ryamada1015/website-monitoring-tool/assets/60910478/5fd63407-45d1-49c1-8ce9-450780ffafb8">


### Viewing Results
The results of the monitoring will be displayed in the console.
</br>Ex.
<img width="332" alt="result-image" src="https://github.com/ryamada1015/website-monitoring-tool/assets/60910478/3edf2e4a-f0f4-4c25-b5e7-c7b3e8525e32">


## Contributions
Contributions to the Website Monitoring Application are welcome. Please ensure to follow the code of conduct and contribution guidelines laid out in CONTRIBUTING.md.

## Support and Contact
For support or to report issues, please file an issue in the GitHub repository or contact the maintainers at rikakoyamada.0927@gmail.com].
