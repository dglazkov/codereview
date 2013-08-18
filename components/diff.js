var diff = (function() {
  var kFileHeaderBegin = 'Index: ';
  var kFileHeaderEnd = '+++ ';

  function startsWith(string, text) {
    return string.slice(0, text.length) == text;
  }

  function classifyLine(line) {
    if (!line.length)
      return 'empty';
    var c = line[0];
    if (c == '@')
      return 'header';
    if (c == '+')
      return 'add';
    if (c == '-')
      return 'remove';
    if (c == 'I')
      return 'index';
    if (c == ' ')
      return 'both';
    throw 'Parse error: Unable to classify line: "' + line + '"';
  }

  function trimLine(type, line) {
    if (type == 'add' || type == 'remove' || type == 'both')
      return line.slice(1);
    return line;
  }

  function Parser(diff) {
    this.lines = diff.split('\n');
    this.currentLine = 0;
  }

  Parser.prototype.peekLine = function() {
    return this.lines[this.currentLine];
  }

  Parser.prototype.takeLine = function() {
    return this.lines[this.currentLine++];
  }

  Parser.prototype.haveLines = function() {
    return this.currentLine != this.lines.length;
  };

  Parser.prototype.parseFile = function() {
    var groups = [];
    var currentGroupType = null;
    var currentGroup = [];
    var currentBeforeLineNumber = 0;
    var currentAfterLineNumber = 0;
    while (this.haveLines()) {
      var type = classifyLine(this.peekLine());
      if (type == 'index' || type == 'empty')
        break; // We're done with this file.

      var groupType = type;
      var line = {
        type: type
      };
      var lineText;
      if (groupType == 'header') {
        var matchedHeader = this.takeLine().match(/^@@\ \-(\d+),[^+]+\+(\d+)\,\d+\ @@\ ?(.*)/);
        currentBeforeLineNumber = matchedHeader[1];
        currentAfterLineNumber = matchedHeader[2];
        line.beforeNumber = "@@";
        line.afterNumber = "@@";
        line.text = matchedHeader[3];
      } else {
        line.beforeNumber = currentBeforeLineNumber;
        line.afterNumber = currentAfterLineNumber;
        line.text = trimLine(type, this.takeLine());

        if (groupType == 'remove' || groupType == 'both')
          currentBeforeLineNumber++;
        if (groupType == 'add' || groupType == 'both')
          currentAfterLineNumber++;
      }

      if (groupType == 'add' || groupType == 'remove')
        groupType = 'delta';
      if (groupType != currentGroupType) {
        if (currentGroup.length)
          groups.push(currentGroup);
        currentGroupType = groupType;
        currentGroup = [];
      }
      currentGroup.push(line);
    }
    if (currentGroup.length)
      groups.push(currentGroup);
    return groups;
  }

  Parser.prototype.parseHeader = function() {
    while (this.haveLines()) {
      var line = this.takeLine();
      if (startsWith(line, kFileHeaderEnd)) {
        return;
      }
    }
    throw 'Parse error: Filed to find "' + kHeaderStop + '"';
  };

  Parser.prototype.parse = function() {
    var files = [];
    while (this.haveLines()) {
      var line = this.takeLine();
      if (!startsWith(line, kFileHeaderBegin))
        continue;
      var name = line.slice(kFileHeaderBegin.length);
      this.parseHeader();
      files.push({
        name: name,
        groups: this.parseFile(),
      })
    }
    return files;
  };

  function parse(diff) {
    if (!diff)
      return null;
    return (new Parser(diff)).parse();
  }

  return {
    parse: parse,
  }

}());
