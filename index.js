'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const redirect = require('src/redirect');

exports.handler = async (event, context, callback) => {
  const bucket_name = process.env.BUCKET_NAME;
  redirect(event, s3, bucket_name, callback);
};
