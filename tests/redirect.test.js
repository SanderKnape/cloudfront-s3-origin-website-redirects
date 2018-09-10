'use strict';

const assert = require('assert');
const { redirect } = require('../src/redirect');

function getEvent(request) {
  return {
    Records: [
      {
        cf: {
          request: request
        }
      }
    ]
  };
}

test('test root level object', done => {
  const event = getEvent({
    uri: '/index.html'
  });

  redirect(event, {}, "", (err, data) => {
    expect(data.uri).toBe('/index.html');
    done();
  });
});

test.each`
  uri                  | expected
  ${'/subdir/'}        | ${'/subdir/index.html'}
  ${'/subdir/subdir/'} | ${'/subdir/subdir/index.html'}
`('test $uri ending with /', ({uri, expected}, done) => {

  redirect(getEvent({uri: uri}), {}, "", (err, data) => {
    expect(data.uri).toBe(expected);
    done();
  });
});

test.each`
  uri                           | expected
  ${'subdir/index.html'}        | ${'subdir/'}
  ${'subdir/subdir/index.html'} | ${'subdir/subdir/'}
`('test $uri ending with index.html', ({uri, expected}, done) => {

  redirect(getEvent({uri: uri}), {}, "", (err, data) => {
    expect(data.headers.location[0].value).toBe(expected);
    done();
  });
});

test.each`
  uri
  ${'abc.abc'}
  ${'something.something'}
  ${'subdir/dot.dot'}
  ${'subdir/dot.index.html'}
  ${'style/main.css'}
`('test $uri containing a dot to remain the same', ({uri, expected}, done) => {

    redirect(getEvent({uri: uri}), {}, "", (err, data) => {
      expect(data.uri).toBe(uri);
      done();
    });
});

test('s3 returns that file exists', done => {
  const s3Mock = {
    headObject: (params) => {
      return {
        promise: jest.fn(() => { return Promise.resolve()}) // resolve = exists
      }
    }
  }

  const event = getEvent({
    uri: 'filethatexists'
  });

  redirect(event, s3Mock, "", (err, data) => {
    expect(data.uri).toBe('filethatexists');
    done();
  });
});

test('s3 returns that file not exists', done => {
  const s3Mock = {
    headObject: (params) => {
      return {
        promise: jest.fn(() => { return Promise.reject()}) // reject = not exists
      }
    }
  }

  const event = getEvent({
    uri: 'filethatnotexists'
  });

  redirect(event, s3Mock, "", (err, data) => {
    expect(data.headers.location[0].value).toBe('filethatnotexists/');
    done();
  });
});


// test('something', () => {
//   const callbackMock = jest.fn();
//   app({}, callbackMock);

//   expect(callbackMock.mock.calls.length).toBe(1);
// });
