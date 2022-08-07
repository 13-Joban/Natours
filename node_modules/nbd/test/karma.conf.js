// Karma configuration
// Generated on Mon May 20 2013 19:01:43 GMT-0400 (EDT)


// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
files = [
  'test/lib/es5-shim.js',

  JASMINE,
  JASMINE_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,

  'test/lib/mock-ajax.js',
  'test/lib/jquery.js',
  'test/lib/jasmine-jquery.js',

  {pattern: 'build/all.js', included: false},
  {pattern: '*.js', included: false},
  {pattern: 'Controller/**/*.js', included: false},
  {pattern: 'View/**/*.js', included: false},
  {pattern: 'trait/**/*.js', included: false},
  {pattern: 'util/**/*.js', included: false},
  {pattern: 'test/specs/**/*.js', included: false},
  
  'test/main.js'
];


// list of files to exclude
exclude = [
  
];

// preprocessor inclusions
preprocessors = {
  '*.js': 'coverage',
  'View/**/*.js': 'coverage',
  'Controller/**/*.js': 'coverage',
  'trait/**/*.js': 'coverage',
  'util/**/*.js': 'coverage',
};

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots', 'coverage'];


coverageReporter = {
  type : 'text-summary',
  dir : 'test/coverage/'
};


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['PhantomJS'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
