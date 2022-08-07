/**
 Jasmine Reporter that outputs test results to the browser console. 
 Useful for running in a headless environment such as PhantomJs, ZombieJs etc.

 Usage:
 // From your html file that loads jasmine:  
 jasmine.getEnv().addReporter(new jasmine.ConsoleReporter());
 jasmine.getEnv().execute();
*/
/*global jasmine */

(function(jasmine, console) {
  if (!jasmine) {
    throw "jasmine library isn't loaded!";
  }

  var ANSI = {
    color_map : {
      "green" : 32,
      "red"   : 31
    },
    colorize_text : function(text, color) {
      var color_code = this.color_map[color];
      return "\u001b[" + color_code + "m" + text + "\u001b[0m";
    }
  }, proto;
  
  function ConsoleReporter() {
    if (!console || !console.log) { throw "console isn't present!"; }
    this.status = this.statuses.stopped;
  }

  proto = ConsoleReporter.prototype;
  proto.statuses = {
    stopped : "stopped",
    running : "running",
    fail    : "fail",
    success : "success"
  };

  proto.reportRunnerStarting = function(runner) {
    this.status = this.statuses.running;
    this.start_time = (new Date()).getTime();
    this.executed_specs = 0;
    this.passed_specs = 0;
    this.log("Starting...");
  };

  proto.reportRunnerResults = function(runner) {
    var failed = this.executed_specs - this.passed_specs,
        spec_str = this.executed_specs + (this.executed_specs === 1 ? " spec, " : " specs, "),
        fail_str = failed + (failed === 1 ? " failure in " : " failures in "),
        color = (failed > 0)? "red" : "green",
        dur = (new Date()).getTime() - this.start_time;

    this.log("");
    this.log("Finished");
    this.log("-----------------");
    this.log(spec_str + fail_str + (dur/1000) + "s.", color);

    this.status = (failed > 0)? this.statuses.fail : this.statuses.success;

    /* Print something that signals that testing is over so that headless browsers
       like PhantomJs know when to terminate. */
    this.log("");
    this.log("ConsoleReporter finished");
  };


  proto.reportSpecStarting = function(spec) {
    this.executed_specs++;
  };

  proto.reportSpecResults = function(spec) {
    if (spec.results().passed()) {
      this.passed_specs++;
      return;
    }

    var items, i, trace,
        resultText = spec.suite.description + " : " + spec.description;
    this.log(resultText, "red");

    items = spec.results().getItems();
    for (i = 0; i < items.length; i++) {
      trace = items[i].trace.stack || items[i].trace;
      this.log(trace, "red");
    }
  };

  proto.reportSuiteResults = function(suite) {
    if (suite.parentSuite) { return; }
    var results = suite.results(),
        failed = results.totalCount - results.passedCount,
        color = (failed > 0)? "red" : "green";
    this.log(suite.description + ": " + results.passedCount + " of " + results.totalCount + " passed.", color);
  };

  proto.log = function(str, color) {
    var text = (color != undefined)? ANSI.colorize_text(str, color) : str;
    console.log(text);
  };

  jasmine.ConsoleReporter = ConsoleReporter;
}(jasmine, console));

