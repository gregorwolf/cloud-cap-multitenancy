
const cds = require("@sap/cds");
const axios = require('axios');
const bodyParser = require('body-parser');
console.log(`CDS Custom Boostrap from /srv/server.js`)

var cds_mtx_way = true;

// OLD WAY BEGIN
var myLogger = function (req, res, next) {
  console.log('XXX_LOGGED');
  console.log("XXX_==== method: " + req.method + " + " + req.url);
  console.log("XXX_==== headers:" + JSON.stringify(req.headers) + "====");
  console.log("XXX_==== body:" + JSON.stringify(req.body) + "====");
  next();
}

async function mockSubscribe() {
  var result = "";
  //const appurl = process.env.MTXSM_APP_URL;
  const appurl = 'http://localhost:8001/mtx/v1/provisioning/tenant/123';

  var config = {
    method: 'post',
    url: appurl,
    // Hardcoded for localized testing against CF
    headers: {         
      'Accept': '*/*',
      'content-type': 'application/json'
    }
  };

  var response = {};
  var data = {};
  try {
    response = await axios(config);
    result += "OK now stuff from the axios get.<br />";
    result += "title: " + response.data.title + "<br />";
  } catch (error) {
    result += "error: " + error + ".<br />";
  }

  return result;
}

cds.on('bootstrap', (app) => {

if (!cds_mtx_way) {
  const bodyParser = require('body-parser');
  const cfenv = require('cfenv');
  const appEnv = cfenv.getAppEnv();

  const xsenv = require('@sap/xsenv');
  xsenv.loadEnv();
  const services = xsenv.getServices({
      uaa: { tag: 'xsuaa' },
      registry: { tag: 'SaaS' }
  });

  const xssec = require('@sap/xssec');
  const passport = require('passport');
  passport.use('JWT', new xssec.JWTStrategy(services.uaa));
  app.use(passport.initialize());
  app.use(passport.authenticate('JWT', {
      session: false
  }));

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    console.log("req: " + req.method + " : " + req.url);
    next(); // this will invoke next middleware function
  });

  // subscribe/onboard a subscriber tenant
  app.get("/mtx/v1/provisioning/tenant/*", function(req, res) {
    var responseStr = "";
    responseStr +=
      "<!DOCTYPE HTML><html><head><title>CAP-MTX</title></head><body><h1>CAP-MTX</h1><h2>WARNING!</h2><br />";
    responseStr +=
      "Tenant callback endpoint only allows PUT and DELETE methods to facilitate subscribe/unsubscribe.<br />";
    responseStr += "</body></html>";
    console.log("Tenant callback endpoint only allows PUT and DELETE methods to facilitate subscribe/unsubscribe");
    res.status(200).send(responseStr);
  });

  app.get("/admin", function(req, res) {
    res.status(200).send("");
  });

  // subscribe/onboard a subscriber tenant
  app.put("/mtx/v1/provisioning/tenant/*", function(req, res) {
      let tenantHost = req.body.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g,'-') + '-' + services.registry.appName.toLowerCase().replace(/_/g,'-') + '-app';
      let tenantURL = 'https:\/\/' + tenantHost + /\.(.*)/gm.exec(appEnv.app.application_uris[0])[0];

      console.log("==== Tenant URL: " + tenantURL + "====");
      console.log("==== headers:" + JSON.stringify(req.headers) + "====");
      console.log("==== body:" + JSON.stringify(req.body) + "====");

      res.status(200).send(tenantURL);
  });

  // unsubscribe/offboard a subscriber tenant
  app.delete("/mtx/v1/provisioning/tenant/*", function(req, res) {
      let tenantHost = req.body.subscribedSubdomain + '-' + appEnv.app.space_name.toLowerCase().replace(/_/g,'-') + '-' + services.registry.appName.toLowerCase().replace(/_/g,'-') + '-app';

    res.status(200).send("");
  });
  // OLD WAY END

} else {

  // NEW WAY BEGIN
  app.use(myLogger);
  
  const cfenv = require('cfenv');
  const appEnv = cfenv.getAppEnv();
  
  const xsenv = require('@sap/xsenv');
  const services = xsenv.getServices({
    uaa: { tag: 'xsuaa' },
    registry: { tag: 'SaaS' }
  });
  
  const xssec = require('@sap/xssec');
  const passport = require('passport');
  passport.use('JWT', new xssec.JWTStrategy(services.uaa));
  app.use(passport.initialize());
  app.use(passport.authenticate('JWT', {
      session: false
  }));

  app.use(bodyParser.json());

  app.get("/test/*", function(req, res) {

    var responseStr = "";
    responseStr +=
      "<!DOCTYPE HTML><html><head><title>CAP-MTX</title></head><body><h1>CAP-MTX</h1><h2>WARNING!</h2><br />";
    responseStr += "Testing....<br />";

    let c = cds.env.for('app');        // use cds config framework to read app specific config node
    let appuri = typeof c.urlpart === "undefined" ? ' ' : c.urlpart;
  
    responseStr += "POST: " + "FINISHED" + ".<br />";
  
    //responseStr += "appuri: " + c.urlpart + "<br />";

    mockSubscribe().then(
      function (res2) {
        responseStr += "</body></html>";
        console.log("XXX_Testing... " + 'OK' + "");
        responseStr += "POST: " + "OK" + ".<br />";
        responseStr += "RES: " + res2 + ".<br />";
        res.status(200).send(responseStr);
          },
      function (err) {
        responseStr += "</body></html>";
        console.log("XXX_Testing... " + 'BAD' + "");
        responseStr += "POST: " + "BAD" + ".<br />";
        responseStr += "ERR: " + err + ".<br />";
        res.status(200).send(responseStr);
      });
  });


  // connect to datasource 'db' which must be the HANA instance manager 
  cds.connect.to('db'); 
  // serve cds-mtx APIs
  //cds.mtx.in(app); 

   cds.mtx.in(app).then(async() => {
    console.log("XXX_Overriding Default Provisioning... ");
    const provisioning = await cds.connect.to('ProvisioningService');
    provisioning.impl(require('./handlers/provisioning'));
  });
  
// cd srv/node_modules/@sap/cds-mtx/lib/tenant
// cp srv/handlers/tenant_index.js srv/node_modules/@sap/cds-mtx/lib/tenant/index.js
// vi srv/node_modules/@sap/cds-mtx/lib/tenant/index.js
// vi node_modules/@sap/cds-mtx/lib/tenant/index.js
// cf push capmt-srv -p srv -n org-space-capmt-srv -d cfapps.us10.hana.ondemand.com -k 1024M -m 512M

  // serve application defined services: in combination with a CAP Java server, this won't appear here.
  cds.serve('all').in(app);
/*
  // serve cds-mtx APIs (required for tenant provisioning)
  cds.mtx.in(app).then(() => {
    const provisioning = cds.connect.to('ProvisioningService');
    // provisioning.impl(require('./srv/provisioning')); // Nope
    // provisioning.impl(require('./provisioning')); // Nope
    // provisioning.impl(require('./srv/provisioning.js')); // Nope
    provisioning.impl(require('./handlers/provisioning'));
  });
*/
  // NEW WAY END

}

})

module.exports = async (o) => {
  o.port = process.env.PORT || 4004
  o.baseDir = process.cwd()
  o.routes = []

  const express = require('express')
  let app = express()
  app.express = express
  app.baseDir = process.cwd()
  o.app = app


  const path = require('path')
  const fileExists = require('fs').existsSync

  let staticFolder = path.join(__dirname, '/resources')
  app.use(express.static(staticFolder))

  let expressFile = path.join(__dirname, '/server/express.js')
  if (fileExists(expressFile)) {
      await require(expressFile)(app)
  }
  o.app.httpServer = await cds.server(o)

  const glob = require('glob')
  //Load routes
  let routesDir = path.join(__dirname, '/routes/**/*.js')
  let files = glob.sync(routesDir)
  this.routerFiles = files;
  if (files.length !== 0) {
      for (let file of files) {
          await require(file)(app, app.httpServer)
      }
  }

  return o.app.httpServer
}