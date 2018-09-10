'use strict';

exports.redirect = async (event, s3, bucket_name, callback) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // prevents default root object from redirecting to infinity and beyond
  if(uri === '/index.html') {
    callback(null, request);
  } else if(uri.endsWith('/')) {
    request.uri += 'index.html';
    callback(null, request);
  } else if(uri.endsWith('/index.html')) {
    const response = {
      status: '301',
      headers: {
        location: [{
          key: 'Location',
          value: uri.slice(0, -10),
        }],
      }
    };

    callback(null, response);
  } else if(uri.indexOf('.') > -1) {
    callback(null, request);
  } else {
    const params = {
      Bucket: bucket_name,
      Key: uri.slice(1) // the slice removes the first / from the string
    };

    // this function returns an error when an object is not found (404)
    await s3.headObject(params).promise().then((data) => {
      callback(null, request);
    }).catch((error) => {
      const response = {
        status: '301',
        headers: {
          location: [{
            key: 'Location',
            value: uri + '/',
          }],
        }
      };

      callback(null, response);
    });
  }
}
