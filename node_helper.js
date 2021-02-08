/* Magic Mirror
 * Node Helper: MMM-Stoic-quote-of-the-day
 *
 * By 
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
const request = require("request");
const bodyParser = require('body-parser');

module.exports = NodeHelper.create({
	
	start: function () {
		
		console.log(this.name + ' helper started');
		
		this.handleApiRequest();
		
		this.quoteConfig = {}
	},
	
	getNewQuote: function () {
		
		let self = this;
		
		self.url = this.quoteConfig.url;
		
		let options = {
			
			url: self.url,
			json: true,
			method: "GET"
			
		};
		
		request(options, function(error, response, body) {
			
			if (error) {
				return console.log(error);
			}
			
			let strObject = JSON.stringify(body, null, 4);
			console.log(strObject);
			
			self.returned_data = body;
		
              
                self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
            
        });
			
	
			
			
		
		
		},

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		let self = this;
		console.log(this.name + " recieved a socket notification: " + notification + " - Payload: " + payload);
		
		if (notification === 'INIT_HELPER') {
			this.quoteConfig = payload;
		}
		if (notification === 'GET_QUOTE') {
			this.getNewQuote();
		}
	},
	
	
	handleApiRequest: function ()
	{
		
		this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

        this.expressApp.post('/quote-of-the-day', (req, res) => {
            if (req.body.notification && req.body.notification === "QUOTE-OF-THE-DAY"){
                if (req.body.payload){
                    let payload = req.body.payload;
                    console.log("[MMM-quote-of-the-day] payload received: " + payload);

                    if (payload === "getNewQuote") {
                        this.getNewQuote();
                        res.send({"status": "success"});
                    }else{
                        res.send({"status": "failed", "error": "non recognized payload"});
                    }

                }else{
                    res.send({"status": "failed", "error": "No payload given."});
                }
            }else{
                res.send({"status": "failed", "error": "No notification given."});
            }
        });
	
	
	
	
	
	}
	
	
	
	
	
	
});
