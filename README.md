# CloudFront website redirects when using an S3 origin

[![Build Status](https://travis-ci.org/SanderKnape/cloudfront-s3-origin-website-redirects.svg?branch=master)](https://travis-ci.org/SanderKnape/cloudfront-s3-origin-website-redirects)

This repository contains a Lambda@Edge function which is available through the Serverless Application Repository. The function implements standard webserver redirects for when using the S3 REST API endpoint as an origin for a CloudFront distribution.

S3 websites are accessible through [two different endpoints](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteEndpoints.html): the REST API endpoint and the Website Endpoint. The Website endpoint handles the webserver redirects for you. However, the Website endpoint does not support the CloudFront [Origin Access Identity](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html) (OAI) feature. Through this feature, you can protect the origin by only giving CloudFront access. This prevents having duplicate URLs to the same website.

To use the CloudFront OAI feature, you therefore must use the REST API endpoint. Then, however, S3 does not handle the webserver redirects for you anymore.

That's what the Lambda function in this repository solves. You can use this as a Lambda@Edge origin request feature. The Lambda function then handles the webserver redirects for you.

This function is perfect for static websites, generated through tools such as [Hugo](https://gohugo.io/) or [Jekyll](https://jekyllrb.com/). Such tools put an `index.html` in directories, which this function properly displays and redirects to avoid duplicate URLs.

## Redirects

The function contains the following logic;

* Using the [Default Root Object](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DefaultRootObject.html) in CloudFront, any requests to your homepage (either with or without a trailing `/`, or `/index.html`) all return `/index.html`.
* The following three URLs are all redirected to `/subpage`. This prevents that you have three different URLs with the same content:
    * /subpage
    * /subpage/
    * /subpage/index.html
* The function does **not** redirect pages when they have a dot (.) in the name. This way, URLs such as `/style.css` are never redirected to `/style.css/`, even if the file does not exist
* If a file without a dot (e.g. `/filename`) exists, that file is returned. If not, the page is redirected to `/filename/`.

## Usage

This function is to be used as a CloudFront `Origin Request` Lambda@Edge function. See the [AWS Documentation regarding Lambda@Edge](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html) for more information on how to configure the function in CloudFront.

Set the `Default Root Object` property in CloudFront to `index.html`. This file should contain the homepage of your application.
