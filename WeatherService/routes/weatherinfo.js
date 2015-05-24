

var https = require('https');

var error; //// this will hold error message

//this function will need to be called to get weather details
exports.callweatherapi = function(request, response) {
    console.log("Request Attributes:");
    console.log("City: " + request.query.city);
    console.log("State: " + request.query.state);
    console.log("Country: " + request.query.country);

    /* URI Encoding all request fields to prevent any white space between words like "New York" to be submitted to service*/
    var uriEncodedCity = encodeURIComponent(request.query.city.trim());
    var uriEncodedState = encodeURIComponent(request.query.state.trim());
    var uriEncodedCountry = encodeURIComponent(request.query.country.trim());

    //formatted url texts to be passed to options object while calling the https.request() API
    var url = '/api/d05297fc5d16d280/conditions/q/' + uriEncodedCountry + '/' + uriEncodedState + '/' + uriEncodedCity + '.json';

    //option object to be passed to https.req(option, function(res)) function
    var options = {
        hostname: 'api.wunderground.com',
        port: 443,
        path: url,
        method: 'GET'
    };

    //API call to Weather Underground Service
    var req = https.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);
        console.log("headers: ", res.headers);

        res.on('data', function(d) {
            console.log("Response from Service: " + d); //logging the response to standard out for debugging, this will be turned off in Production Env

            var result; //this will hold the intermediate result object to save the parsed JSON response from each API call

            try {
                result = JSON.parse(d);
            } catch (err) {
                result = {'status_code': 500, 'status_text': 'JSON Parse Failed'};
            }

            //if JSON response has current_observation attribute then weather data was successfully received, redirect the results page
            // or redirect back to search page with error
            if(result.current_observation != null) {
                response.render('weather/WeatherResult', {
                    title: 'Weather Data',
                    weatherInfo: result
                });
            } else {

                console.log("Some error occured!!");
                response.render('weather/WeatherSearch', {
                    title: 'Search Failed',
                    error: "Search failed, please try again!!"
                });

            }

        });

    });
    req.end();

    req.on('error', function(e) {
        console.log("In error block!!")
        console.error(e);
        response.type('application/json');
        response.send(e);
    });

};