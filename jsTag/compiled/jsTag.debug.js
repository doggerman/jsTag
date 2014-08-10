/************************************************
* jsTag JavaScript Library - Editing tags based on angularJS 
* Git: https://github.com/eranhirs/jsTag/tree/master
* License: MIT (http://www.opensource.org/licenses/mit-license.php)
* Compiled At: 08/10/2014 18:10
**************************************************/
'use strict';
var jsTag = angular.module('jsTag', []);

// Defaults for jsTag (can be overriden as shown in example)
jsTag.constant('jsTagDefaults', {
  'edit': true,
  'defaultTags': [],
  'breakCodes': [
    13, // Return
    44 // Comma
  ],
  'splitter': ',',
  'texts': {
    'inputPlaceHolder': "Input text",
    'removeSymbol': String.fromCharCode(215)
  }
});
var jsTag = angular.module('jsTag');

// Checks if item (needle) exists in array (haystack)
jsTag.filter('inArray', function() {
  return function(needle, haystack) {
    for(var key in haystack)
    {
      if (needle === haystack[key])
      {
        return true;
      }
    }

    return false;
  };
});

// TODO: Currently the tags in JSTagsCollection is an object with indexes,
// and this filter turns it into an array so we can sort them in ng-repeat.
// An array should be used from the beginning.
jsTag.filter('toArray', function() {
  return function(input) {
    var objectsAsArray = [];
    for (var key in input) {
      var value = input[key];
      objectsAsArray.push(value);
    }
  
    return objectsAsArray;
  };
});
var jsTag = angular.module('jsTag');

// Tag Model
jsTag.factory('JSTag', function() {
  function JSTag(value, id) {
    this.value = value;
    this.id = id;
  }
  
  return JSTag;
});
var jsTag = angular.module('jsTag');

// TagsCollection Model
jsTag.factory('JSTagsCollection', ['JSTag', '$filter', function(JSTag, $filter) {
  
  // Constructor
  function JSTagsCollection(defaultTags) {
    this.tags = {};
    this.tagsCounter = 0;
    for (var defaultTagKey in defaultTags) {
      var defaultTagValue = defaultTags[defaultTagKey];
      this.addTag(defaultTagValue);
    }
    
    this.unsetActiveTags();
    this.unsetEditedTag();
  }
  
  // *** Methods *** //
  
  // *** Object manipulation methods *** //
  
  // Adds a tag with received value
  JSTagsCollection.prototype.addTag = function(value) {
    var tagIndex = this.tagsCounter;
    this.tagsCounter++;
  
    var newTag = new JSTag(value, tagIndex);
    this.tags[tagIndex] = newTag;
  }
  
  // Removes the received tag
  JSTagsCollection.prototype.removeTag = function(tagIndex) {
    delete this.tags[tagIndex];
  }

  // Returns the number of tags in collection
  JSTagsCollection.prototype.getNumberOfTags = function() {
    return getNumberOfProperties(this.tags);
  }
  
  // Returns the previous tag before the tag received as input
  // Returns same tag if it's the first
  JSTagsCollection.prototype.getPreviousTag = function(tag) {
    var firstTag = getFirstProperty(this.tags);
    if (firstTag.id === tag.id) {
      // Return same tag if we reached the beginning
      return tag;
    } else {
      return getPreviousProperty(this.tags, tag.id);
    }
  }
  
  // Returns the next tag after  the tag received as input
  // Returns same tag if it's the last
  JSTagsCollection.prototype.getNextTag = function(tag) {
    var lastTag = getLastProperty(this.tags);
    if (tag.id === lastTag.id) {
      // Return same tag if we reached the end
      return tag;
    } else {
      return getNextProperty(this.tags, tag.id);
    }
  }
  
  // *** Active methods *** //
  
  // Checks if a specific tag is active
  JSTagsCollection.prototype.isTagActive = function(tag) {
    return $filter("inArray")(tag, this._activeTags);
  };
  
  // Sets tag to active
  JSTagsCollection.prototype.setActiveTag = function(tag) {
    if (!this.isTagActive(tag)) {
      this._activeTags.push(tag);
    }
  };
  
  // Sets the last tag to be active
  JSTagsCollection.prototype.setLastTagActive = function() {
    if (getNumberOfProperties(this.tags) > 0) {
      var lastTag = getLastProperty(this.tags);
      this.setActiveTag(lastTag);
    }
  };
  
  // Unsets an active tag
  JSTagsCollection.prototype.unsetActiveTag = function(tag) {
    var removedTag = this._activeTags.splice(this._activeTags.indexOf(tag), 1);
  };
  
  // Unsets all active tag
  JSTagsCollection.prototype.unsetActiveTags = function() {
    this._activeTags = [];
  };
  
  // Returns a JSTag only if there is 1 exactly active tags, otherwise null
  JSTagsCollection.prototype.getActiveTag = function() {
    var activeTag = null;
    if (this._activeTags.length === 1) {
      activeTag = this._activeTags[0];
    }
    
    return activeTag;
  };
  
  // Returns number of active tags
  JSTagsCollection.prototype.getNumOfActiveTags = function() {
    return this._activeTags.length;
  };
  
  // *** Edit methods *** //
  
  // Gets the edited tag
  JSTagsCollection.prototype.getEditedTag = function() {
    return this._editedTag;
  };
  
  // Checks if a tag is edited
  JSTagsCollection.prototype.isTagEdited = function(tag) {
    return tag === this._editedTag;
  };
  
  // Sets the tag in the _editedTag member
  JSTagsCollection.prototype.setEditedTag = function(tag) {
    this._editedTag = tag;
  };
  
  // Unsets the 'edit' flag on a tag by it's given index
  JSTagsCollection.prototype.unsetEditedTag = function() {
    // Kill empty tags!
    if (this._editedTag !== undefined &&
        this._editedTag !== null &&
        this._editedTag.value === "") {
      this.removeTag(this._editedTag.id);
    }
    
    this._editedTag = null;
  }
  
  return JSTagsCollection;
}]);

// *** Extension methods used to iterate object like a dictionary. Used for the tags. *** //
// TODO: Find another place for these extension methods. Maybe filter.js
// TODO: Maybe use a regular array instead and delete them all :)

// Gets the number of properties, including inherited
function getNumberOfProperties(obj) {
  return Object.keys(obj).length;
}

// Get the first property of an object, including inherited properties
function getFirstProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[0]];
}

// Get the last property of an object, including inherited properties
function getLastProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[keys.length - 1]];
}

// Get the next property of an object whos' properties keys are numbers, including inherited properties
function getNextProperty(obj, propertyId) {
  var keys = Object.keys(obj);
  var indexOfProperty = keys.indexOf(propertyId.toString());
  var keyOfNextProperty = keys[indexOfProperty + 1];
  return obj[keyOfNextProperty];
}

// Get the previous property of an object whos' properties keys are numbers, including inherited properties
function getPreviousProperty(obj, propertyId) {
  var keys = Object.keys(obj);
  var indexOfProperty = keys.indexOf(propertyId.toString());
  var keyOfPreviousProperty = keys[indexOfProperty - 1];
  return obj[keyOfPreviousProperty];
}
var jsTag = angular.module('jsTag');

// This service handles everything related to input (when to focus input, key pressing, breakcodeHit).
jsTag.factory('InputService', ['$filter', function($filter) {
  
  // Constructor
  function InputService(options) {
    this.input = "";
    this.isWaitingForInput = options.autoFocus || false;
    this.options = options;
  }
  
  // *** Events *** //
  
  // Handles an input of a new tag keydown
  InputService.prototype.onKeydown = function(inputService, tagsCollection, options) {
    var e = options.$event;
    var keycode = e.which;
    var $currentTarget = $(e.currentTarget);
  
    // Check if should break by breakcodes
    if ($filter("inArray")(keycode, this.options.breakCodes) !== false) {

      inputService.breakCodeHit(tagsCollection, this.options);

      // TODO: Extract bootstrap extension to different file and use events to easly customize
      //       Move into $watch on this._input, inside typeahead's directive
      $currentTarget.typeahead('val', '')
    } else {
      switch (keycode) {
        case 9:	// Tab
          
          break;
        case 37: // Left arrow
        case 8: // Backspace
          if (inputService.input === "") {
            // TODO: Call removing tag event instead of calling a method, easier to customize
            tagsCollection.setLastTagActive();
          }
          
          break;
      }
    }
  }
  
  // Handles an input of an edited tag keydown
  InputService.prototype.tagInputKeydown = function(tagsCollection, options) {
    var e = options.$event;
    var keycode = e.which;
    var $currentTarget = $(e.currentTarget);
    
    // Check if should break by breakcodes
    if ($filter("inArray")(keycode, this.options.breakCodes) !== false) {
      this.breakCodeHitOnEdit(tagsCollection);
    }
  }
  
  // *** Methods *** //
  
  InputService.prototype.resetInput = function() {
    var value = this.input;
    this.input = "";
    return value;
  }
  
  // Sets focus on input
  InputService.prototype.focusInput = function() {
    this.isWaitingForInput = true;
  }
  
  // breakCodeHit is called when finished creating tag
  InputService.prototype.breakCodeHit = function(tagsCollection, options) {
    if (this.input !== "") {
      var originalValue = this.resetInput();
      
      // Input is an object when using typeahead (the key is chosen by the user)
      if (originalValue instanceof Object)
      {
        originalValue = originalValue[Object.keys(originalValue)[0]];
      }
      
      // Split value by spliter (usually ,)
      var values = originalValue.split(options.splitter);
      
      // Add tags to collection
      for (var key in values) {
        var value = values[key];
        tagsCollection.addTag(value);
      }
    }
  }
  
  // breakCodeHit is called when finished editing tag
  InputService.prototype.breakCodeHitOnEdit = function(tagsCollection) {
    // Input is an object when using typeahead (the key is chosen by the user)
    var editedTag = tagsCollection.getEditedTag();
    if (editedTag.value instanceof Object) {
      editedTag.value = editedTag.value[Object.keys(editedTag.value)[0]];
    }
  
    tagsCollection.unsetEditedTag();
    this.isWaitingForInput = true;
  };
    
  return InputService;
}]);
var jsTag = angular.module('jsTag');

// TagsCollection Model
jsTag.factory('TagsInputService', ['JSTag', 'JSTagsCollection', function(JSTag, JSTagsCollection) {
  // Constructor
  function TagsHandler(options) {
    this.options = options;
    var tags = options.tags;
    
    // Received ready JSTagsCollection
    if (tags && tags.__proto__ === JSTagsCollection.prototype) {
      this.tagsCollection = tags;
    }
    // Received array with default tags or did not receive tags
    else {
      var defaultTags = options.defaultTags;
      this.tagsCollection = new JSTagsCollection(defaultTags);
    }
    this.shouldBlurActiveTag = true;
  }
  
  // *** Methods *** //
  
  TagsHandler.prototype.tagClicked = function(tag) {
    this.tagsCollection.setActiveTag(tag);
  };
  
  TagsHandler.prototype.tagDblClicked = function(tag) {
    var editAllowed = this.options.edit;
    if (editAllowed) {
      // Set tag as edit
      this.tagsCollection.setEditedTag(tag);
    }
  };
  
  // Keydown was pressed while a tag was active.
  // Important Note: The target of the event is actually a fake input used to capture the keydown.
  TagsHandler.prototype.onActiveTagKeydown = function(inputService, options) {
    var activeTag = this.tagsCollection.getActiveTag();
    
    // Do nothing in unexpected situations
    if (activeTag !== null) {
      var e = options.$event;
      
      // Mimics blur of the active tag though the focus is on the input.
      // This will cause expected features like unseting active tag
      var blurActiveTag = function() {
        // Expose the option not to blur the active tag
        if (this.shouldBlurActiveTag) {
          this.onActiveTagBlur(options);
        }
      };
      
      switch (e.which) {
        case 13: // Return
          var editAllowed = this.options.edit;
          if (editAllowed) {
            blurActiveTag.apply(this);
            this.tagsCollection.setEditedTag(activeTag);
          }
          
          break;
        case 8: // Backspace
          this.tagsCollection.removeTag(activeTag.id);
          inputService.isWaitingForInput = true;
          
          break;
        case 37: // Left arrow
          blurActiveTag.apply(this);
          var previousTag = this.tagsCollection.getPreviousTag(activeTag);
          this.tagsCollection.setActiveTag(previousTag);
            
          break;					
        case 39: // Right arrow
          blurActiveTag.apply(this);
          
          var nextTag = this.tagsCollection.getNextTag(activeTag);
          if (nextTag !== activeTag) {
            this.tagsCollection.setActiveTag(nextTag);
          } else {
            inputService.isWaitingForInput = true;
          }
          
          break;
      }
    }
  }
  
  // Jumps when active tag calls blur event.
  // Because the focus is not on the tag's div itself but a fake input,
  // this is called also when clicking the active tag.
  // (Which is good because we want the tag to be unactive, then it will be reactivated on the click event)
  // It is also called when entering edit mode (ex. when pressing enter while active, it will call blur)
  TagsHandler.prototype.onActiveTagBlur = function(options) {
    var activeTag = this.tagsCollection.getActiveTag();
    
    // Do nothing in unexpected situations
    if (activeTag !== null) {
      this.tagsCollection.unsetActiveTag(activeTag);
    }
  }
  
  // Jumps when an edited tag calls blur event
  TagsHandler.prototype.onEditTagBlur = function(tagsCollection, inputService) {
    tagsCollection.unsetEditedTag();
    this.isWaitingForInput = true;
  }
  
  return TagsHandler;
}]);
var jsTag = angular.module('jsTag');
var jsTag = angular.module('jsTag');

jsTag.controller('JSTagMainCtrl', ['$attrs', '$scope', 'InputService', 'TagsInputService', 'jsTagDefaults', function($attrs, $scope, InputService, TagsInputService, jsTagDefaults) {
  // Parse user options and merge with defaults
  var userOptions = {};
  try {
    userOptions = $scope.$eval($attrs.jsTagOptions);
  } catch(e) {
    console.log("jsTag Error: Invalid user options, using defaults only");
  }
  
  // Copy so we don't override original values
  var options = angular.copy(jsTagDefaults);
  
  // Use user defined options
  if (userOptions !== undefined) {
    userOptions.texts = angular.extend(options.texts, userOptions.texts || {});
    angular.extend(options, userOptions);
  }
  
  $scope.options = options;
  
  // Export handlers to view
  $scope.tagsInputService = new TagsInputService($scope.options);
  $scope.inputService = new InputService($scope.options);
  
  // Export tagsCollection separately since it's used alot
  var tagsCollection = $scope.tagsInputService.tagsCollection;
  $scope.tagsCollection = tagsCollection;
    
  // TODO: Should be inside inside tagsCollection.js
  // On every change to editedTags keep isThereAnEditedTag posted
  $scope.$watch('tagsCollection._editedTag', function(newValue, oldValue) {
    $scope.isThereAnEditedTag = newValue !== null;
  });
  
  // TODO: Should be inside inside tagsCollection.js
  // On every change to activeTags keep isThereAnActiveTag posted
  $scope.$watchCollection('tagsCollection._activeTags', function(newValue, oldValue) {
    $scope.isThereAnActiveTag = newValue.length > 0;
  });
}]);
var jsTag = angular.module('jsTag');

// TODO: Maybe add A to 'restrict: E' for support in IE 8?
jsTag.directive('jsTag', ['$templateCache', function($templateCache) {
  return {
    restrict: 'E',
    scope: true,
    controller: 'JSTagMainCtrl',
    templateUrl: function($element, $attrs) {
      var mode = $attrs.jsTagMode || "default";
      return 'jsTag/source/templates/' + mode + '/js-tag.html';
    }
  }
}]);

// TODO: Replace this custom directive by a supported angular-js directive for blur
jsTag.directive('ngBlur', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
          // this next line will convert the string
          // function name into an actual function
          var functionToCall = $parse(attrs.ngBlur);
          elem.bind('blur', function(event) {
          
            // on the blur event, call my function
            scope.$apply(function() {
              functionToCall(scope, {$event:event});
            });
          });
        }
    };
}]);


// Notice that focus me also sets the value to false when blur is called
// TODO: Replace this custom directive by a supported angular-js directive for focus
// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
jsTag.directive('focusMe', ['$parse', '$timeout', function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if (value === true) {
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
      
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function() {
        scope.$apply(model.assign(scope, false));
      });
    }
  };
}]);

// focusOnce is used to focus an element once when first appearing
// Not like focusMe that binds to an input boolean and keeps focusing by it
jsTag.directive('focusOnce', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].select();
      });
    }
  };
}]);

// auto-grow directive by the "shadow" tag concept
jsTag.directive('autoGrow', ['$timeout', function($timeout) {
  return {
    link: function(scope, element, attr){
      var paddingLeft = element.css('paddingLeft'),
          paddingRight = element.css('paddingRight');
   
      var minWidth = 60;
   
      var $shadow = angular.element('<span></span>').css({
        'position': 'absolute',
        'top': '-10000px',
        'left': '-10000px',
        'fontSize': element.css('fontSize'),
        'fontFamily': element.css('fontFamily'),
        'white-space': 'pre'
      });
      element.after($shadow);
   
      var update = function() {
        var val = element.val()
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&/g, '&amp;')
        ;
        
        // If empty calculate by placeholder
        if (val !== "") {
          $shadow.html(val);
        } else {
          $shadow.html(element[0].placeholder);
        }
        
        var newWidth = ($shadow[0].offsetWidth + 10) + "px";
        element.css('width', newWidth);
      }
   
      var ngModel = element.attr('ng-model');
      if (ngModel) {
        scope.$watch(ngModel, update);
      } else {
        element.bind('keyup keydown', update);
      }
      
      // Update on the first link
      // $timeout is needed because the value of element is updated only after the $digest cycle
      // TODO: Maybe on compile time if we call update we won't need $timeout
      $timeout(update);
    }
  }
}]);
angular.module("jsTag").run(["$templateCache", function($templateCache) {

  $templateCache.put("jsTag/source/templates/default/js-tag.html",
    "<div\n" +
    "  class=\"jt-editor\"\n" +
    "  ng-click=\"inputService.focusInput()\" >\n" +
    "  <span\n" +
    "    ng-repeat=\"tag in tagsCollection.tags | toArray:orderBy:'id'\"\n" +
    "    ng-switch=\"tagsCollection.isTagEdited(tag)\">\n" +
    "    <span\n" +
    "      ng-switch-when=\"false\"\n" +
    "      class=\"jt-tag active-{{tagsCollection.isTagActive(this.tag)}}\">\n" +
    "      <span\n" +
    "        class=\"value\"\n" +
    "        ng-click=\"tagsInputService.tagClicked(this.tag)\"\n" +
    "        ng-dblclick=\"tagsInputService.tagDblClicked(this.tag)\">\n" +
    "        {{tag.value}}\n" +
    "      </span>\n" +
    "      <span class=\"remove-button\" ng-click=\"tagsCollection.removeTag(this.tag.id)\">{{options.texts.removeSymbol}}</span>\n" +
    "    </span>\n" +
    "    <span\n" +
    "      ng-switch-when=\"true\">\n" +
    "      <input\n" +
    "        type=\"text\"\n" +
    "        class=\"jt-tag-edit\"\n" +
    "        focus-once\n" +
    "        ng-model=\"tag.value\"\n" +
    "        data-tag-id=\"{{tag.id}}\"\n" +
    "        ng-keydown=\"inputService.tagInputKeydown(tagsCollection, {$event: $event})\"\n" +
    "        placeholder=\"{{options.texts.inputPlaceHolder}}\"\n" +
    "        auto-grow\n" +
    "        />\n" +
    "    </span>\n" +
    "  </span>\n" +
    "  <input\n" +
    "    class=\"jt-tag-new\"\n" +
    "    type=\"text\"\n" +
    "    focus-me=\"inputService.isWaitingForInput\"\n" +
    "    ng-model=\"inputService.input\"\n" +
    "    ng-hide=\"isThereAnEditedTag\"\n" +
    "    ng-keydown=\"inputService.onKeydown(inputService, tagsCollection, {$event: $event})\"\n" +
    "    placeholder=\"{{options.texts.inputPlaceHolder}}\"\n" +
    "    auto-grow\n" +
    "  />\n" +
    "  <input\n" +
    "    class=\"jt-fake-input\"\n" +
    "    focus-me=\"isThereAnActiveTag\"\n" +
    "    ng-keydown=\"tagsInputService.onActiveTagKeydown(inputService, {$event: $event})\"\n" +
    "    ng-blur=\"tagsInputService.onActiveTagBlur()\" />\n" +
    "</div>"
  );

  $templateCache.put("jsTag/source/templates/typeahead/js-tag.html",
    "<div\n" +
    "  class=\"jt-editor\"\n" +
    "  ng-click=\"inputService.focusInput()\" >\n" +
    "  <span\n" +
    "    ng-repeat=\"tag in tagsCollection.tags | toArray:orderBy:'id'\"\n" +
    "    ng-switch=\"tagsCollection.isTagEdited(tag)\">\n" +
    "    <span\n" +
    "      ng-switch-when=\"false\"\n" +
    "      class=\"jt-tag active-{{tagsCollection.isTagActive(this.tag)}}\">\n" +
    "      <span\n" +
    "        class=\"value\"\n" +
    "        ng-click=\"tagsInputService.tagClicked(this.tag)\"\n" +
    "        ng-dblclick=\"tagsInputService.tagDblClicked(this.tag)\">\n" +
    "        {{tag.value}}\n" +
    "      </span>\n" +
    "      <span class=\"remove-button\" ng-click=\"tagsCollection.removeTag(this.tag.id)\">{{options.texts.removeSymbol}}</span>\n" +
    "    </span>\n" +
    "    <span\n" +
    "      ng-switch-when=\"true\">\n" +
    "      <input\n" +
    "        type=\"text\"\n" +
    "        class=\"jt-tag-edit\"\n" +
    "        focus-once\n" +
    "        ng-model=\"tag.value\"\n" +
    "        data-tag-id=\"{{tag.id}}\"\n" +
    "        ng-keydown=\"inputService.tagInputKeydown(tagsCollection, {$event: $event})\"\n" +
    "        placeholder=\"{{options.texts.inputPlaceHolder}}\"\n" +
    "        auto-grow\n" +
    "        options=\"exampleOptions\" datasets=\"exampleData\"\n" +
    "        sf-typeahead\n" +
    "        />\n" +
    "    </span>\n" +
    "  </span>\n" +
    "  <input\n" +
    "    class=\"jt-tag-new\"\n" +
    "    type=\"text\"\n" +
    "    focus-me=\"inputService.isWaitingForInput\"\n" +
    "    ng-model=\"inputService.input\"\n" +
    "    ng-hide=\"isThereAnEditedTag\"\n" +
    "    ng-keydown=\"inputService.onKeydown(inputService, tagsCollection, {$event: $event})\"\n" +
    "    placeholder=\"{{options.texts.inputPlaceHolder}}\"\n" +
    "    auto-grow\n" +
    "    options=\"exampleOptions\" datasets=\"exampleData\"\n" +
    "    sf-typeahead\n" +
    "  />\n" +
    "  <input\n" +
    "    class=\"jt-fake-input\"\n" +
    "    focus-me=\"isThereAnActiveTag\"\n" +
    "    ng-keydown=\"tagsInputService.onActiveTagKeydown(inputService, {$event: $event})\"\n" +
    "    ng-blur=\"tagsInputService.onActiveTagBlur()\" />\n" +
    "</div>"
  );

}]);


