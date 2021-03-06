'use strict';

var XML = require('xmlbuilder');
var YAML = require('yamljs');
var moment = require('moment');

module.exports = function (req, res, next) {
  if (typeof res.body !== 'object') {
    res.bodyXmlObj = {
      result: res.body
    };
  }

  // am I pretty?
  var spaces = req.headers['x-pretty-print'] ? parseInt(req.headers['x-pretty-print']) : false;

  function YAMLResponse () {
    if (typeof res.body === 'string') {
      return res.send(res.body);
    }

    res.send(YAML.stringify(res.body, 6, spaces));
  }

  function JSONResponse () {
    req.app.set('json spaces', spaces);

    res.jsonp(res.body);
  }

  function XMLResponse () {
    res.send(XML.create(res.bodyXmlObj || res.body).end({
      pretty: spaces ? true : false,
      indent: new Array(spaces).join(' '),
      newline: '\n'
    }));
  }

  function HTMLResponse () {
    req.app.locals.moment = moment;

    res.render(res.view || 'default', {
      req: req,
      res: res,
      data: {
        raw: res.body,
        yaml: YAML.stringify(res.body, res.yamlInline || 3, 2),

        json: JSON.stringify(res.body, null, 2),

        xml: XML.create(res.bodyXmlObj || res.body).end({
          pretty: true,
          indent: '    ',
          newline: '\n'
        })
      }
    });
  }

  res.format({
    'application/json': JSONResponse,
    'text/json': JSONResponse,
    'text/x-json': JSONResponse,
    'application/x-json': JSONResponse,

    'text/javascript': JSONResponse,
    'application/javascript': JSONResponse,
    'application/x-javascript': JSONResponse,

    'text/xml': XMLResponse,
    'application/xml': XMLResponse,
    'application/x-xml': XMLResponse,

    'text/html': HTMLResponse,
    'application/xhtml+xml': HTMLResponse,

    'text/yaml': YAMLResponse,
    'text/x-yaml': YAMLResponse,
    'application/yaml': YAMLResponse,
    'application/x-yaml': YAMLResponse,

    'text/plain': YAMLResponse,

    default: JSONResponse
  });

  next();
};
