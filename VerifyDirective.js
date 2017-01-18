define(['Module'], function(Module) {
	// 基类验证失败 移除标記 “verifySuccess”
	var removeAttrVerifySuccess = function(attr, ele) {
		if (attr.verifySuccess == "") {
			ele.removeAttr("verify-success");
		}
	};
	// 基类验证成功 移除标記 “verifySuccess”
	var addAttrVerifySuccess = function(attr) {
		if (!attr.verifySuccess) {
			attr.$set('verifySuccess', '');
		}
	};

	var async = function(scope, ctrl, func, showMsgFunc) {
		// 异步获得數据
		func(scope, {
				param: ctrl.$viewValue
			})
			.then(function(data) {
				// console.log(data);
				// data返回的數据
				msgShow_stamp = data.Data; //是否成功应该是IsSuccess，Data是返回數据，不一定是true或false。    jason yiu 2015-11-13
				msgShow_stamp = data.IsSuccess;
				if (msgShow_stamp) {
					ctrl.$setValidity('verifyIsAsync', true);
				} else {
					ctrl.$setValidity('verifyIsAsync', false);
				}
				if (data.Message == null) {
					data.Message = ""
				}
				// 判断异步获取數据是否成功 且 data.Message 不为空，则msgShow_stamp 改为false
				// 
				if (data.Message != null && msgShow_stamp) {
					msgShow_stamp = !msgShow_stamp;
				}
				showMsgFunc(data.Message, msgShow_stamp, data.IsSuccess);
				// 添加变量errorMsgShow控制错误信息的显示 
				// input框失去焦点时，errorMsgShow为true,错误消息显示
				scope.errorMsgShow = true;
				scope.$apply(function() {
					scope.$parent[formName][scope.name].stamp = ctrlArry[1].$dirty && ctrlArry[1].$invalid;
					if (ctrlArry[1].$dirty && ctrlArry[1].$invalid) {
						element.addClass('isValid');
					} else {
						element.removeClass('isValid');
					}
				});
			});
	}


	// 获取form对象
	Module.directive('getForm', function($rootScope) {
			return {
				restrict: 'A',
				scope: true,
				link: function(scope, element, attrs) {
					$rootScope.forms = {};
					var formArr = attrs.getForm.split(",");
					for (var i = 0; i < formArr.length; i++) {
						$rootScope.forms[formArr[i]] = scope[formArr[i]];

					};
				}
			}
		})
		// submit
	Module.directive('vsubmit', function($rootScope) {
		return {
			restrict: 'A',
			scope: {
				func: '&'
			},
			link: function(scope, element, attrs) {
				element.click(function() {
					// console.log($rootScope.forms[attrs.fname]);
					// angular.element('form[name="'+ attrs.fname +'"]').submit();
					$rootScope.forms[attrs.fname].submitted = false;
					/**
					 * [判断表单合法]
					 * @param  {[boolean]} $rootScope.forms[attrs.fname].$valid [表单合法性]
					 * 若合法：调用绑定的方法func();
					 * 若不合法：scope.fname.submitted 设置为true
					 */
					if ($rootScope.forms[attrs.fname].$valid) {
						//scope.func();
						//console.log("success");
						//如果數据不是绑定给指令时，双向绑定会失效
						scope.$apply(function() {
							scope.func();
							console.log("success");
						});

					} else {
						scope.$apply(function() {
							$rootScope.forms[attrs.fname].submitted = true;
						});
						angular.element('form[name="' + attrs.fname + '"]').find('.ng-invalid').addClass('isValid');
						angular.element('form[name="' + attrs.fname + '"].ng-invalid').removeClass('isValid');
						console.log("error");
					}
				});
			}
		}
	});


	Module.directive('verify', function($compile, $timeout, $rootScope, $parse) {
		return {
			/**
			 * [model 双向绑定ngModel]
			 * @type {Object}
			 *
			 * [name 单向绑定name属性]
			 * @type {String}
			 */
			restrict: 'A',
			require: ['?^verify', '?^ngModel'],
			scope: {
				model: '=ngModel',
				name: '@'
			},
			controller: function($scope, $element, $attrs) {
				$scope.msg = [];

				/**
				 * [控制错误时显示必填項的*]
				 * @param  {[string]} msg [传入提示信息]
				 */
				var showRequired = function(msg) {
						// 判断msg是否为必填項
						// 若是者显示*，否则不显示
						if (msg.join("") == "必填項") {
							$scope.showRequired = true;
						} else {
							$scope.showRequired = false;
						}
					}
					/**
					 * [控制msg]
					 * @param  {[string]} msg   [提醒信息]
					 * @param  {[bool]} valid [控制是否进入數组]
					 * @param  {[bool]} required [控制必填項符号“*”的显示]
					 */
				this.showMsg = function(msg, valid, success) {
					// 判断success是否为布尔类型,若验证为verifyCustomFunc则为ture,其他则为fasle
					if (typeof(success) == 'boolean') {
						$scope.msg = [];
						// 判断异步获取數据是否成功，则控制显示成功信息； 若不是异步加载，则没有success属性
						// $scope.successShow 控制必填项显示*号
						// $scope.asyncSuccessShow 控制异步成功后是否有提示信息的显示
						if (!success) {
							$scope.successShow = true;
							$scope.asyncSuccessShow = false;
						} else {
							$scope.successShow = false;
							$scope.asyncSuccessShow = true;
						}
					} else {
						$scope.successShow = true;
					}

					if (valid) {
						angular.forEach($scope.msg, function(value, key) {
							if (value == msg) {
								$scope.msg.splice(key, 1);
							}
						});
					} else {
						if ($.inArray(msg, $scope.msg) < 0) {
							$scope.msg.push(msg);
						}
					}
					showRequired($scope.msg);
				};

				// verifyGeneral 调用的方法
				this.generalShowMsg = function(msg) {
					// 将$scope.successShow设置为false,因为异步验证将$scope.successShow设置为true后，不改变
					// $scope.successShow 控制必填项显示*号
					// $scope.asyncSuccessShow 控制异步成功后是否有提示信息的显示
					$scope.successShow = false;
					$scope.asyncSuccessShow = false;
					$scope.msg = [];
					if (msg != "") {
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				}

				this.getRequiredSign = function(arg) {
					$scope.requiredSign = arg;
				}
			},
			link: function(scope, element, attrs, ctrlArry) {
				// console.log($rootScope.forms);
				if(!$rootScope.forms){
					$rootScope.forms = {};
				}
				var formName = element.parents("form").attr('name');
				$rootScope.forms[formName] = scope.$parent[formName];

				ctrlArry[1].$parsers.unshift(function(viewValue) {
					// 添加变量errorMsgShow控制错误信息的显示 
					// 修改ngModel时，errorMsgShow为false,错误消息消失
					scope.errorMsgShow = false;
					return viewValue;
				});

				element.bind('blur', function(evt) {
					// 添加变量errorMsgShow控制错误信息的显示 
					// input框失去焦点时，errorMsgShow为true,错误消息显示
					scope.errorMsgShow = true;
					ctrlArry[1].$setValidity('verifyIsAsync', true);
					scope.$apply(function() {
						scope.$parent[formName][scope.name].stamp = ctrlArry[1].$dirty && ctrlArry[1].$invalid;
						if (ctrlArry[1].$dirty && ctrlArry[1].$invalid) {
							element.addClass('isValid');
						} else {
							element.removeClass('isValid');
							if (attrs.verifyIsasync && !ctrlArry[1].$isEmpty(ctrlArry[1].$viewValue) && attrs.verifySuccess == "") {
								// async(scope.$parent, ctrlArry[1], $parse(attrs.verifyIsasync), ctrlArry[0].showMsg);
								// ctrlArry[0].showMsg(data.Message, msgShow_stamp, data.IsSuccess);
								// 异步获得數据
								var func = $parse(attrs.verifyIsasync);
								func(scope.$parent, {
										param: ctrlArry[1].$viewValue
									})
									.then(function(data) {
										// console.log(data);
										// data返回的數据
										msgShow_stamp = data.Data; //是否成功应该是IsSuccess，Data是返回數据，不一定是true或false。    jason yiu 2015-11-13
										msgShow_stamp = data.IsSuccess;
										if (msgShow_stamp) {
											ctrlArry[1].$setValidity('verifyIsAsync', true);
										} else {
											ctrlArry[1].$setValidity('verifyIsAsync', false);
										}
										if (data.Message == null) {
											data.Message = ""
										}
										// 判断异步获取數据是否成功 且 data.Message 不为空，则msgShow_stamp 改为false
										// 
										if (data.Message != null && msgShow_stamp) {
											msgShow_stamp = !msgShow_stamp;
										}
										ctrlArry[0].showMsg(data.Message, msgShow_stamp, data.IsSuccess);
										// 添加变量errorMsgShow控制错误信息的显示 
										// input框失去焦点时，errorMsgShow为true,错误消息显示
										scope.errorMsgShow = true;
										// scope.$apply(function() {
										scope.$parent[formName][scope.name].stamp = ctrlArry[1].$dirty && ctrlArry[1].$invalid;
										if (ctrlArry[1].$dirty && ctrlArry[1].$invalid) {
											element.addClass('isValid');
										} else {
											element.removeClass('isValid');
										}
										// });
									});
							}
						}
					});



				});
				var template = '<span ng-if="!$parent.' + formName + '.submitted && requiredSign && !successShow || $parent.' + formName + '[name].$valid && !requiredSign && requiredSign != undefined  && !successShow">*</span><span class="error" ng-if="$parent.' + formName + '[name].stamp && errorMsgShow || ($parent.' + formName + '.submitted && $parent.' + formName + '[name].$invalid && !$parent.' + formName + '[name].$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span><span class="verify-success" ng-if="asyncSuccessShow && errorMsgShow">{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				element.parent().append(content);
			}
		}
	});

	// required
	Module.directive('verifyRequired', function($compile) {
		return {
			restrict: 'A',
			priority: 3,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				/**
				 * [msg 提示信息]
				 * @type {String}
				 * 并设置默认值为"必填項"
				 * 
				 * [msgShow_stamp 控制提示信息显示与否]
				 * @type {boolean}
				 *
				 *[requiredSign 控制必填項“*”的显示]
				 * @type {boolean}
				 * 
				 */
				var msg = "必填項";
				var msgShow_stamp, requiredSign;
				/**
				 * 
				 * @function [ctrlArry[1].$parsers.unshift] [当视图上的值发生了改变，反映至ngModel]
				 * @viewValue [ngModel.$viewValue]
				 * 判断是否为空，设置ngModel合法性，并设置msgShow_stamp;
				 * @return viewValue {[String]} [返回viewValue至Dom] 
				 * 
				 * @function showMsg() [调用verify中的方法，控制msg]  
				 * @param {String} [msg] [提示信息]      
				 * @param {boolean} [msgShow_stamp] [控制msg是否进入數组]
				 * @param {boolean} [requiredSign] [控制必填項“*”的显示] ngModel修改过的requiredSign值都为false
				 * 
				 * 
				 */
				ctrlArry[1].$parsers.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						msgShow_stamp = false;
						requiredSign = false;
						ctrlArry[1].$setValidity('verifyRequired', false);
					} else {
						msgShow_stamp = true;
						requiredSign = false;
						ctrlArry[1].$setValidity('verifyRequired', true);
						addAttrVerifySuccess(attrs);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[0].getRequiredSign(requiredSign);
					return viewValue;

				});
				/**
				 * 
				 * @function [ctrlArry[1].$formatters.unshift] [当ngMolde值发生了改变，反应至Dom(页面加载读取ngModel數据，初始化)]
				 * @viewValue [ngModel.$viewValue]
				 * 判断是否为空，设置ngModel合法性，并设置msgShow_stamp;
				 * @return viewValue {[String]} [返回viewValue至Dom] 
				 *
				 * @function showMsg() [调用verify中的方法，控制msg]  
				 * @param {boolean} [requiredSign] [控制必填項“*”的显示] requiredSign默认值为true；ngModel修改过的requiredSign值都为false
				 */
				ctrlArry[1].$formatters.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						msgShow_stamp = false;
						requiredSign = true;
						ctrlArry[1].$setValidity('verifyRequired', false);
					} else {
						msgShow_stamp = true;
						requiredSign = false;
						ctrlArry[1].$setValidity('verifyRequired', true);
						addAttrVerifySuccess(attrs);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[0].getRequiredSign(requiredSign);
					return viewValue;
				});
			}
		}
	});

	// 验证數字
	Module.directive('verifyNumber', function($timeout) {
		return {
			restrict: 'A',
			priority: 2,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				/**
				 * [pattern 正则表达式]
				 * @type {String}
				 */
				var msg = "需要輸入數字";
				var pattern = new RegExp("^[0-9]+$");
				var msgShow_stamp;
				ctrlArry[1].$parsers.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						msgShow_stamp = true;
						ctrlArry[0].showMsg(msg, msgShow_stamp);
						ctrlArry[1].$setValidity('verifyNumber', true);
					} else {
						msgShow_stamp = pattern.test(viewValue);
						if (msgShow_stamp) {
							ctrlArry[1].$setValidity('verifyNumber', true);
							addAttrVerifySuccess(attrs);
						} else {
							ctrlArry[1].$setValidity('verifyNumber', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
				ctrlArry[1].$formatters.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						ctrlArry[1].$setValidity('verifyNumber', true);
					} else {
						msgShow_stamp = pattern.test(viewValue);
						if (msgShow_stamp) {
							ctrlArry[1].$setValidity('verifyNumber', true);
							addAttrVerifySuccess(attrs);
						} else {
							ctrlArry[1].$setValidity('verifyNumber', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
			}
		}
	});

	// verifyRequiredCheckbox
	Module.directive('verifyRequiredCheckbox', function() {
		return {
			restrict: 'A',
			priority: 2,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				/**
				 * [msg 提示信息]
				 * @type {String}
				 * 并设置默认值为”必填項“
				 *
				 * [msgShow_stamp 控制提示信息显示与否]
				 * @type {boolean}
				 *
				 * [minLenght 最小長度]
				 * @type {number}
				 */
				var msg = "必填項";
				var msgShow_stamp, minLength, requiredSign;
				/**
				 * [如果设置了提示信息，则替换掉默认值]
				 * attrs.verifyMsg  {[String]} attrs.verifyMsg [或者设置的提示信息]
				 */
				if (attrs.verifyMsg) {
					msg = attrs.verifyMsg;
				}
				/**
				 * [如果设置了最小長度，则赋值]
				 * @attrs.verifyRequiredCheckboxMinLength  {[number]} attrs.verifyRequiredCheckboxMinLength [设置最小值]
				 */
				if (attrs.verifyRequiredCheckboxMinLength) {
					minLength = attrs.verifyRequiredCheckboxMinLength;
				} else {
					minLength = 0;
				}

				/**
				 * 当ngMolde值发生了改变，反应至Dom
				 * @viewValue [ngModel.$viewValue]
				 * 若存在viewValue则判断ngModel合法性
				 * 若不存在则判断ngModel.$valid不合法
				 * @return viewValue {[String]} [返回viewValue至Dom]
				 */
				ctrlArry[1].$formatters.unshift(function(viewValue) {
					if (viewValue) {
						msgShow_stamp = viewValue.split(",").length >= minLength;
						if (msgShow_stamp) {
							requiredSign = true;
							ctrlArry[1].$setValidity('verifyRequiredCheckbox', true);
						} else {
							requiredSign = false;
							ctrlArry[1].$setValidity('verifyRequiredCheckbox', false);
						}
					} else {
						msgShow_stamp = false;
						requiredSign = true;
						ctrlArry[1].$setValidity('verifyRequiredCheckbox', false);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[0].getRequiredSign(requiredSign);
					return viewValue;
				});
			}
		}
	});

	// verifyCustomReg 自定义正则
	Module.directive('verifyCustomReg', function($timeout) {
		return {
			restrict: 'A',
			priority: 2,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				var msg, msgShow_stamp, pattern;
				if (attrs.verifyMsg) {
					msg = attrs.verifyMsg;
				} else {
					msg = "請輸入提示信息！"
				}
				if (attrs.verifyCustomReg) {
					pattern = new RegExp(attrs.verifyCustomReg);
				} else {
					return;
				}
				ctrlArry[1].$parsers.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						msgShow_stamp = true;
						ctrlArry[0].showMsg(msg, msgShow_stamp);
						ctrlArry[1].$setValidity('verifyCustomReg', true);
					} else {
						msgShow_stamp = pattern.test(viewValue);
						if (msgShow_stamp) {
							ctrlArry[1].$setValidity('verifyCustomReg', true);
							addAttrVerifySuccess(attrs);
						} else {
							ctrlArry[1].$setValidity('verifyCustomReg', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
				ctrlArry[1].$formatters.unshift(function(viewValue) {
					removeAttrVerifySuccess(attrs, ele);
					if (ctrlArry[1].$isEmpty(viewValue)) {
						ctrlArry[1].$setValidity('verifyCustomReg', true);
					} else {
						msgShow_stamp = pattern.test(viewValue);
						if (msgShow_stamp) {
							ctrlArry[1].$setValidity('verifyCustomReg', true);
							addAttrVerifySuccess(attrs);
						} else {
							ctrlArry[1].$setValidity('verifyCustomReg', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
			}
		}
	});

	// verifyCustomFunc 自定义方法
	Module.directive('verifyCustomFunc', function($timeout, $parse, $rootScope, $q) {
		return {
			restrict: 'A',
			priority: 2,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				var msg, msgShow_stamp, pattern;
				if (attrs.verifyMsg) {
					msg = attrs.verifyMsg;
				} else {
					msg = "請輸入提示信息！"
				}
				if (attrs.verifyCustomFunc) {
					var func = $parse(attrs.verifyCustomFunc);
				} else {
					return;
				}

				ctrlArry[1].$parsers.unshift(function(viewValue) {
					if (ctrlArry[1].$isEmpty(viewValue)) {
						msgShow_stamp = true;
						ctrlArry[0].showMsg(msg, msgShow_stamp);
						ctrlArry[1].$setValidity('verifyCustomFunc', true);
						return viewValue;
					} else {
						//判断基础验证是否通过，若通过再行异步
						if (attrs.verifySuccess == "") {
							// 异步获得數据
							func(scope, {
									param: viewValue
								})
								.then(function(data) {
									// data返回的數据
									//msgShow_stamp = data.Data;                        //是否成功应该是IsSuccess，Data是返回數据，不一定是true或false。    jason yiu 2015-11-13
									msgShow_stamp = data.IsSuccess;
									if (msgShow_stamp) {
										ctrlArry[1].$setValidity('verifyCustomFunc', true);
									} else {
										ctrlArry[1].$setValidity('verifyCustomFunc', false);
									}
									if (data.Message == null) {
										data.Message = ""
									}
									// 判断异步获取數据是否成功 且 data.Message 不为空，则msgShow_stamp 改为false
									// 
									if (data.Message != null && msgShow_stamp) {
										msgShow_stamp = !msgShow_stamp;
									}
									ctrlArry[0].showMsg(data.Message, msgShow_stamp, data.IsSuccess);
								});
							return viewValue;
						} else { //否则，stop；
							return viewValue;
						}

					}
				});
				ctrlArry[1].$formatters.unshift(function(viewValue) {
					if (ctrlArry[1].$isEmpty(viewValue)) {
						ctrlArry[1].$setValidity('verifyCustomFunc', true);
					} else {
						msgShow_stamp = func(scope);
						if (msgShow_stamp) {
							ctrlArry[1].$setValidity('verifyCustomFunc', true);
						} else {
							ctrlArry[1].$setValidity('verifyCustomFunc', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
			}
		}
	});
	// verifyTime 日历验证
	Module.directive('verifyTime', function($compile, $timeout, $parse) {
		return {
			restrict: 'A',
			priority: 3,
			// require: '?^ngModel',
			scope: {
				model: '=ngModel',
				name: '@'
			},
			controller: function($scope, $element, $attrs) {
				var msgArr = [];
				$scope.showMsg = function(msg) {
					$scope.msg = [];
					if (msg != "") {
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				};
				var showRequired = function(msg) {
					// 判断msg是否为必填項
					// 若是者显示*，否则不显示
					if (msg.join('') == "必填項") {
						$scope.showRequired = true;
					} else {
						$scope.showRequired = false;
					}
				};
				$scope.getRequiredSign = function(arg) {
					$scope.requiredSign = arg;
				};
			},
			link: function(scope, ele, attrs) {
				var msg, msgShow_stamp, pattern, requiredSign;
				var optional = attrs.verifyTime.split("|");
				var formName = ele.parents('form')[0].name;
				var field = ele.find('input');
				var fieldArr = [];
				angular.forEach(field, function(value, key) {
					fieldArr = scope.$parent[formName][value.name];
				});
				// dom对象
				var DateEle = ele.children('input');

				fieldArr.$parsers.unshift(function(viewValue) {
					autocomplete.date(fieldArr, field, viewValue);
					publicMethod.isTimefunc(viewValue, 1, fieldArr);
					return viewValue;
				});
				fieldArr.$formatters.unshift(function(viewValue) {
					publicMethod.isTimefunc(viewValue, 0, fieldArr);
					return viewValue;
				});

				DateEle.bind('blur', function(evt) {
					publicMethod.blurEventFunc(fieldArr, DateEle);
				});
				// 添加错误信息
				var template = '<span class="asterisk" ng-if="!$parent.' + formName + '.submitted && requiredSign || $parent.' + formName + '.' + fieldArr.$name + '.$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.' + formName + '.' + fieldArr.$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName + '.' + fieldArr.$name + '.$invalid && !$parent.' + formName + '.' + fieldArr.$name + '.$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				ele.append(content);

				var publicMethod = {
					/**
					 * [isTimeSlotfunc 验证和提示]
					 * @param  {[obj]}   ctrl     [当前ngModel对象]
					 * @param  {[obj]}   element  [当前获取焦点的元素]
					 * @param  {[string]}  position [属于开始日期还是結束日期，0：开始日期，1:結束日期]
					 * @return {Boolean}          [description]
					 */
					isTimefunc: function(val, flag, ctrl) {
						// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
						var regex = /^(?:(?:(?:0[1-9]|1[0-9]|2[0-8])[/](?:0[1-9]|1[0-2])|(?:29|30)[/](?:0[13-9]|1[0-2])|31[/](?:0[13578]|1[02]))[/](?!0000)[0-9]{4}|29([/])02\1(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00))$/g
						if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrl.$setValidity('verifyTime', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[0].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrl.$isEmpty(val)) {
								ctrl.$setValidity('verifyTime', true);
							} else if (regex.test(val)) {
								//设置最小日期
								var minDateArr = optional[1].split("/");
								var minDate = new Date();
								minDate.setFullYear(minDateArr[2], parseInt(minDateArr[1]) - 1, minDateArr[0]);
								//设置最大日期
								var maxDateArr = optional[2].split("/");
								var maxDate = new Date();
								maxDate.setFullYear(maxDateArr[2], parseInt(maxDateArr[1]) - 1, maxDateArr[0]);
								//获取当前输入的日期
								var valArr = val.split("/");
								var valDate = new Date();
								valDate.setFullYear(valArr[2], parseInt(valArr[1]) - 1, valArr[0]);
								// 判断当前输入的值是否大於最大值，小於最小值
								var isMinOrMax = function() {
									if (valDate < minDate || valDate > maxDate) {
										msg = "請輸入" + optional[1] + "至" + optional[2] + "範圍內的日期";
										ctrl.$setValidity('verifyTime', false);
										return 1;
									} else {
										msg = "";
										ctrl.$setValidity('verifyTime', true);
										return 0;
									}
								}
								isMinOrMax();
								minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null; //垃圾回收，清空内存
							} else {
								msg = "格式不正確，格式為：日日/月月/年年年年";
								ctrl.$setValidity('verifyTime', false);
							}
						}

						scope.showMsg(msg);
						scope.getRequiredSign(requiredSign);
					},
					/**
					 * [blurEventFunc 错误时添加或移除类isValid]
					 * @param  {[type]} ctrl    [description]
					 * @param  {[obj]}  ctrl [当前ngModel值]
					 * @param  {[obj]} element [当前的dom元素]
					 */
					blurEventFunc: function(ctrl, element) {
						// console.log(scope);
						fieldName = ctrl.$name;
						scope.$apply(function() {
							scope.$parent[formName][fieldName].stamp = ctrl.$dirty && ctrl.$invalid;
							if (ctrl.$dirty && ctrl.$invalid) {
								element.addClass('isValid');
							} else {
								element.removeClass('isValid');
							}
						});
					}

				};
			}
		}
	});

	// verifyMonth 月历验证
	Module.directive('verifyMonth', function($compile, $timeout, $parse) {
		return {
			restrict: 'A',
			priority: 3,
			// require: '?^ngModel',
			scope: {
				model: '=ngModel'
			},
			controller: function($scope, $element, $attrs) {
				var msgArr = [];
				$scope.showMsg = function(msg) {
					$scope.msg = [];
					if (msg != "") {
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				};
				var showRequired = function(msg) {
					// 判断msg是否为必填項
					// 若是者显示*，否则不显示
					if (msg.join('') == "必填項") {
						$scope.showRequired = true;
					} else {
						$scope.showRequired = false;
					}
				};
				$scope.getRequiredSign = function(arg) {
					$scope.requiredSign = arg;
				};
			},
			link: function(scope, ele, attrs) {
				var msg, requiredSign;
				var optional = attrs.verifyMonth.split("|");
				var formName = ele.parents('form')[0].name;
				var field = ele.find('input');
				var fieldArr = [];
				angular.forEach(field, function(value, key) {
					fieldArr = scope.$parent[formName][value.name];
				});
				// dom对象
				var DateEle = ele.children('input');

				fieldArr.$parsers.unshift(function(viewValue) {
					autocomplete.month(fieldArr, field, viewValue);
					publicMethod.isTimefunc(viewValue, 1, fieldArr);
					return viewValue;
				});
				fieldArr.$formatters.unshift(function(viewValue) {
					publicMethod.isTimefunc(viewValue, 0, fieldArr);
					return viewValue;
				});

				DateEle.bind('blur', function(evt) {
					publicMethod.blurEventFunc(fieldArr, DateEle);
				});
				// 添加错误信息
				var template = '<span class="asterisk" ng-if="!$parent.' + formName + '.submitted && requiredSign || $parent.' + formName + '.' + fieldArr.$name + '.$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.' + formName + '.' + fieldArr.$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName + '.' + fieldArr.$name + '.$invalid && !$parent.' + formName + '.' + fieldArr.$name + '.$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				ele.append(content);

				var publicMethod = {
					/**
					 * [isTimeSlotfunc 验证和提示]
					 * @param  {[obj]}   ctrl     [当前ngModel对象]
					 * @param  {[obj]}   element  [当前获取焦点的元素]
					 * @param  {[string]}  position [属于开始日期还是結束日期，0：开始日期，1:結束日期]
					 * @return {Boolean}          [description]
					 */
					isTimefunc: function(val, flag, ctrl) {
						// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
						var regex = /^(?:0[1-9]|1[0-2])[/](?:(?!0000)[0-9]{4})$/g
						if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrl.$setValidity('verifyMonth', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[0].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrl.$isEmpty(val)) {
								ctrl.$setValidity('verifyMonth', true);
							} else if (regex.test(val)) {
								//设置最小日期
								var minDateArr = optional[1].split("/");
								var minDate = new Date();
								minDate.setFullYear(minDateArr[1], parseInt(minDateArr[0]) - 1);
								//设置最大日期
								var maxDateArr = optional[2].split("/");
								var maxDate = new Date();
								maxDate.setFullYear(maxDateArr[1], parseInt(maxDateArr[0]) - 1);
								//获取当前输入的日期
								var valArr = val.split("/");
								var valDate = new Date();
								valDate.setFullYear(valArr[1], parseInt(valArr[0]) - 1);
								// 判断当前输入的值是否大於最大值，小於最小值
								var isMinOrMax = function() {
									if (valDate < minDate || valDate > maxDate) {
										msg = "請輸入" + optional[1] + "至" + optional[2] + "範圍內的日期";
										ctrl.$setValidity('verifyMonth', false);
										return 1;
									} else {
										msg = "";
										ctrl.$setValidity('verifyMonth', true);
										return 0;
									}
								}
								isMinOrMax();
								minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null; //垃圾回收，清空内存
							} else {
								msg = "格式不正確，格式為：月月/年年年年";
								ctrl.$setValidity('verifyMonth', false);
							}
						}

						scope.showMsg(msg);
						scope.getRequiredSign(requiredSign);
					},
					/**
					 * [blurEventFunc 错误时添加或移除类isValid]
					 * @param  {[type]} ctrl    [description]
					 * @param  {[obj]}  ctrl [当前ngModel值]
					 * @param  {[obj]} element [当前的dom元素]
					 */
					blurEventFunc: function(ctrl, element) {
						// console.log(scope);
						fieldName = ctrl.$name;
						scope.$apply(function() {
							scope.$parent[formName][fieldName].stamp = ctrl.$dirty && ctrl.$invalid;
							if (ctrl.$dirty && ctrl.$invalid) {
								element.addClass('isValid');
							} else {
								element.removeClass('isValid');
							}
						});
					}

				};
			}
		}
	});


	// verifyTimeSlot
	Module.directive('verifyTimeSlot', function($compile, $timeout, $parse) {
		return {
			restrict: 'A',
			priority: 3,
			// require: '?^ngModel',
			scope: {
				model: '=ngModel'
			},
			controller: function($scope, $element, $attrs) {
				var msgArr = [];
				$scope.showMsg = function(msg, position) {
					$scope.msg = [];
					if (msg != "") {
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				};
				var showRequired = function(msg) {
					// 判断msg是否为必填項
					// 若是者显示*，否则不显示
					if (msg.join('') == "必填項") {
						$scope.showRequired = true;
					} else {
						$scope.showRequired = false;
					}
				};
				$scope.getRequiredSign = function(arg) {
					$scope.requiredSign = arg;
				};
			},
			link: function(scope, ele, attrs) {
				var msg, msgShow_stamp, pattern, requiredSign;
				var optional = attrs.verifyTimeSlot.split("|");
				var formName = ele.parents('form')[0].name;
				var field = ele.find('input');
				var fieldArr = [];
				angular.forEach(field, function(value, key) {
					fieldArr.push(scope.$parent[formName][value.name]);
				});
				// dom对象
				var fromDateEle = ele.children('input').eq(0); // 开始日期
				var toDateEle = ele.children('input').eq(1); //結束如期

				// fieldArr[0] 开始日期
				fieldArr[0].$parsers.unshift(function(viewValue) {
					autocomplete.date(fieldArr[0], fromDateEle, viewValue);
					publicMethod.isTimeSlotfunc(viewValue, 1, fieldArr[0], fromDateEle, 'p1');
					// publicMethod.isMsgShowfunc(fieldArr[0],fromDateEle);
					return viewValue;
				});
				fieldArr[0].$formatters.unshift(function(viewValue) {
					publicMethod.isTimeSlotfunc(viewValue, 0, fieldArr[0], fromDateEle, 'p1');
					return viewValue;
				});
				// fieldArr[1] 結束日期
				fieldArr[1].$parsers.unshift(function(viewValue) {
					autocomplete.date(fieldArr[1], toDateEle, viewValue);
					publicMethod.isTimeSlotfunc(viewValue, 1, fieldArr[1], toDateEle, 'p2');
					// publicMethod.isMsgShowfunc(fieldArr[1], toDateEle);
					return viewValue;
				});
				fieldArr[1].$formatters.unshift(function(viewValue) {
					publicMethod.isTimeSlotfunc(viewValue, 0, fieldArr[1], toDateEle, 'p2');
					return viewValue;
				});

				fromDateEle.bind('blur', function(evt) {
					publicMethod.blurEventFunc(fieldArr[0], fromDateEle);
					// publicMethod.blurEventFunc(fieldArr[1],toDateEle);
				});
				toDateEle.bind('blur', function(evt) {
					publicMethod.blurEventFunc(fieldArr[1], toDateEle);
				});

				// 添加错误信息
				var template = '<span class="asterisk" ng-if="!$parent.' + formName + '.submitted && requiredSign || $parent.' + formName + '.' + fieldArr[0].$name + '.$valid && $parent.' + formName + '.' + fieldArr[1].$name + '.$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.' + formName + '.' + fieldArr[0].$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName + '.' + fieldArr[0].$name + '.$invalid && !$parent.' + formName + '.' + fieldArr[0].$name + '.$dirty)||$parent.' + formName + '.' + fieldArr[1].$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName + '.' + fieldArr[1].$name + '.$invalid && !$parent.' + formName + '.' + fieldArr[1].$name + '.$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				ele.append(content);

				var publicMethod = {
					/**
					 * [isTimeSlotfunc 验证和提示]
					 * @param  {[obj]}   ctrl     [当前ngModel对象]
					 * @param  {[obj]}   element  [当前获取焦点的元素]
					 * @param  {[string]}  position [属于开始日期还是結束日期，0：开始日期，1:結束日期]
					 * @return {Boolean}          [description]
					 */
					isTimeSlotfunc: function(val, flag, ctrl, element, position) {
						// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
						var regex = /^(?:(?:(?:0[1-9]|1[0-9]|2[0-8])[/](?:0[1-9]|1[0-2])|(?:29|30)[/](?:0[13-9]|1[0-2])|31[/](?:0[13578]|1[02]))[/](?!0000)[0-9]{4}|29([/])02\1(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00))$/g
						if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrl.$setValidity('verifyTimeSlot', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[0].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrl.$isEmpty(val)) {
								ctrl.$setValidity('verifyTimeSlot', true);
							} else if (regex.test(val)) {
								//设置最小日期
								var minDateArr = optional[1].split("/");
								var minDate = new Date();
								minDate.setFullYear(minDateArr[2], parseInt(minDateArr[1]) - 1, minDateArr[0]);
								//设置最大日期
								var maxDateArr = optional[2].split("/");
								var maxDate = new Date();
								maxDate.setFullYear(maxDateArr[2], parseInt(maxDateArr[1]) - 1, maxDateArr[0]);
								//获取当前输入的日期
								var valArr = val.split("/");
								var valDate = new Date(valArr[2], parseInt(valArr[1]) - 1, valArr[0], 0, 0, 0);
								/**
								 * [isMinOrMax 判断当前输入的值是否大於最大值，小於最小值]
								 * @param  {[object]}   arg         [需要验证的日期对象]
								 * @param  {[obeject]}  ngModelCtrl [需要验证的ngModel对象]
								 * @return {Boolean}             [返回是否通过，再作下一步验证]
								 */
								var isMinOrMax = function(arg, ngModelCtrl) {
									if (arg < minDate || arg > maxDate) {
										msg = "請輸入" + optional[1] + "至" + optional[2] + "範圍內的日期";
										ngModelCtrl.$setValidity('verifyTimeSlot', false);
										return 1;
									} else {
										msg = "";
										ngModelCtrl.$setValidity('verifyTimeSlot', true);
										return 0;
									}
								}
								if (element.siblings('input').val() != "") {
									// 获得siblings（fromDate || toDate）Dom 元素并设置日期值
									var siblingsVal = element.siblings('input').val();
									var siblingsName = element.siblings('input').attr('name');
									var siblingsDateArr = siblingsVal.split("/");
									var siblingsDate = new Date(siblingsDateArr[2], parseInt(siblingsDateArr[1]) - 1, siblingsDateArr[0], 0, 0, 0);
									var siblingsCtrl = scope.$parent[formName][siblingsName];
									isMinOrMax(valDate, ctrl);
									if (!isMinOrMax(valDate, ctrl)) {
										if (valDate > siblingsDate && position == 'p1') {
											msg = "起始時間：請輸入小於" + siblingsVal + "的日期";
											ctrl.$setValidity('verifyTimeSlot', false);
										} else if (valDate < siblingsDate && position == 'p2') {
											msg = "终止時間：請輸入大於" + siblingsVal + "的日期";
											ctrl.$setValidity('verifyTimeSlot', false);
										} else {
											// 若当前ctrl通过，则验证旁边关联的ctrl是否通过
											isMinOrMax(siblingsDate, siblingsCtrl);
										}
									}
								} else {
									isMinOrMax(valDate, ctrl);
								}
								minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null, siblingsVal = null, siblingsDateArr = null, siblingsDate = null; //垃圾回收，清空内存
							} else {
								msg = "格式不正確，格式為：日日/月月/年年年年";
								ctrl.$setValidity('verifyTimeSlot', false);
							}
						}

						scope.showMsg(msg, position);
						scope.getRequiredSign(requiredSign);
					},
					/**
					 * [isMsgShowfunc 错误时添加或移除类isValid]
					 * @param  {[obj]}  ctrl [当前ngModel值]
					 * @param  {[obj]} element [当前的dom元素]
					 */
					isMsgShowfunc: function(ctrl, element) {
						// 获取当前fieldName
						fieldName = ctrl.$name;
						// element = angular.element('input[name="'+ fieldName +'"]');
						scope.$watch('model', function() {
							scope.$parent[formName][fieldName].stamp = false;
							if (ctrl.$dirty && ctrl.$invalid) {
								$timeout(function() {
									scope.$parent[formName][fieldName].stamp = ctrl.$dirty && ctrl.$invalid;
									if (ctrl.$dirty && ctrl.$invalid) {
										// console.log($this);
										element.addClass('isValid');
									}
								}, 6000);
							} else {
								scope.$parent[formName][fieldName].stamp = ctrl.$dirty && ctrl.$invalid;
								if (!(ctrl.$dirty && ctrl.$invalid)) {
									element.removeClass('isValid');
								}
							}
						});

					},
					/**
					 * [blurEventFunc 错误时添加或移除类isValid]
					 * @param  {[type]} ctrl    [description]
					 * @param  {[obj]}  ctrl [当前ngModel值]
					 * @param  {[obj]} element [当前的dom元素]
					 */
					blurEventFunc: function(ctrl, element) {
						// console.log(scope);
						fieldName = ctrl.$name;
						var siblingsEle = element.siblings('input');
						var siblingsName = siblingsEle.attr('name');
						var siblingsCtrl = scope.$parent[formName][siblingsName];

						scope.$apply(function() {
							scope.$parent[formName][fieldName].stamp = ctrl.$dirty && ctrl.$invalid;
							scope.$parent[formName][siblingsName].stamp = siblingsCtrl.$dirty && siblingsCtrl.$invalid;
							if (ctrl.$dirty && ctrl.$invalid) {
								element.addClass('isValid');
							} else {
								element.removeClass('isValid');
								// 若当前ctrl正確，验证旁边关联的ctrl是否正確，若正確则移除样式
								if (siblingsCtrl.$dirty && siblingsCtrl.$invalid) {
									siblingsEle.addClass('isValid');
								} else {
									siblingsEle.removeClass('isValid');
								}
							}
						});
					}

				};
			}
		}
	});

	// verifyGeneral 自定义方法
	/**
	 * [verifyGeneral 自定义方法]
	 * 使用方法verify-General="decimal|N|5|4" 
	 * 必填項可为大小写"Y"or"y"
	 * 
	 */
	Module.directive('verifyGeneral', function($timeout, $compile, $filter, $rootScope) {
		return {
			restrict: 'A',
			priority: 3,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry) {
				var msg, msgShow_stamp, pattern, requiredSign;
				var optional = attrs.verifyGeneral.split("|");
				// var requireFlagShow = function(){
				// 	if(optional[1].toLowerCase() == "Y".toLowerCase()){						
				// 		var template = '<span ng-if=requireFlag>*</span>';
				// 		var content = $compile(template)(scope);
				// 		ele.parent().append(content);
				// 	}
				// }
				/**
				 * 定义公共方法
				 * [publicMethod 包含验证纯整數型數字：isIntfunc，纯浮点型數字：isDecimalfunc，文本（包含數字+字母+普通符号，不包含特殊字符）]
				 */
				var publicMethod = {
					/**
					 * [isIntfunc 验证纯整數型數字]
					 * @val  {[String]}  val [传入键入的值]
					 */
					isIntfunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						// 判断是否为空且必填項参數是否为“Y”，则显示错误信息：这是必填項
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							// 判断是否为空
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (!isNaN(val) && !~val.indexOf('.')) { // 判断是否为數字且是否为整型數字
								if (val < parseInt(optional[2])) { // 判断val是否小於最小值
									msg = "請輸入不小於" + optional[2] + "的數字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val > parseInt(optional[3])) { // 判断val是否大於最大值
									msg = "請輸入不大於" + optional[3] + "的數字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else { // val符合条件
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
									addAttrVerifySuccess(attrs);
								}
							} else { //val为非數字且非小數
								msg = "請輸入整型數字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					},

					/**
					 * [isDecimalfunc 验证纯浮点型數字]
					 * @val  {[String]}  val [传入键入的值]
					 * optional[0] 类型，optional[1] 必填項，optional[2] 精度，optional[3] 小數点后几位
					 */
					isDecimalfunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							// console.log("必填項");
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (!isNaN(val)) {
								if (val < parseFloat(optional[4])) {
									msg = "請輸入不小於" + optional[4] + "的數字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else {
									if (~val.indexOf('.')) {
										if (!(val.replace('.', '').length <= optional[2] && val.replace('.', '').length <= 38)) {
											msg = "精度不超過" + optional[2] + "位";
											ctrlArry[1].$setValidity('verifyGeneral', false);
										} else if (!(val.length - (val.indexOf('.') + 1) <= optional[3])) { // 获取小數点后位的長度 与 参數optional[3] 是否相等
											msg = "請輸入小數点后" + optional[3] + "位以內的數字";
											ctrlArry[1].$setValidity('verifyGeneral', false);
										} else {
											msg = "";
											ctrlArry[1].$setValidity('verifyGeneral', true);
											addAttrVerifySuccess(attrs);
										}
									} else {
										// ele.val($filter('number')(val,optional[3]));
										// ctrlArry[1].$setViewValue(1.00000);
										msg = "";
										ctrlArry[1].$setValidity('verifyGeneral', true);
										addAttrVerifySuccess(attrs);
									}
								}
							} else {
								msg = "請輸入數字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					},
					/**
					 * [isTextfunc 验证字符，不包含以下这些字符< 、> 、' 、\" ]
					 * @val  {[String]}  val [传入键入的值]
					 * optional[0] 类型，optional[1] 必填項，optional[2] 最小長度，optional[3] 最大長度
					 */
					isTextfunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
								// if(attrs.verifySuccess){
								// 	ele.removeAttr("verify-success");
								// }
							}
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (!/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)) {
								if (val.length < parseInt(optional[2])) { // 判断val.length是否小於最小值
									msg = "請輸入長度不小於" + optional[2] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大於最大值
									msg = "請輸入長度不大於" + optional[3] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else { // val符合条件
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
									addAttrVerifySuccess(attrs);
								}
							} else {
								msg = "输入的文字不能包含以下這些字符< 、> 、' 、\" ，請重新输入";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					},
					/**
					 * [iscTextfunc 验证汉字 ]
					 * @val  {[String]}  val [传入键入的值]
					 * optional[0] 类型，optional[1] 必填項，optional[2] 最小長度，optional[3] 最大長度
					 */
					iscTextfunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (!/^[A-Za-z]+$/g.test(val)) {
								if (/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)) {
									msg = "输入的文字不能包含以下这些字符< 、> 、' 、\" ，請重新输入";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val.length < parseInt(optional[2])) { // 判断val.length是否小於最小值
									msg = "請輸入長度不小於" + optional[2] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大於最大值
									msg = "請輸入長度不大於" + optional[3] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else { // val符合条件
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
									addAttrVerifySuccess(attrs);
								}
							} else {
								msg = "請輸入漢字或數字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					},
					/**
					 * [iseTextfunc 验证英文 ]
					 * @val  {[String]}  val [传入键入的值]
					 * optional[0] 类型，optional[1] 必填項，optional[2] 最小長度，optional[3] 最大長度
					 */
					iseTextfunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (!/^[\u4E00-\u9FA5]+$/g.test(val)) {
								if (/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)) {
									msg = "输入的文字不能包含以下这些字符< 、> 、' 、\" ，請重新输入";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val.length < parseInt(optional[2])) { // 判断val.length是否小於最小值
									msg = "請輸入長度不小於" + optional[2] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大於最大值
									msg = "請輸入長度不大於" + optional[3] + "的文字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else { // val符合条件
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
									addAttrVerifySuccess(attrs);
								}
							} else {
								msg = "請輸入英文或數字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					},
					/**
					 * [isDatefunc 日期验证 验证格式dd/MM/YYYY, 并且验证平年，闺年 ]
					 * @val  {[String]}  val [传入键入的值]
					 * optional[0] 类型，optional[1] 必填項，optional[2] 大於某个日期，optional[3] 小於某个日期
					 * 
					 */
					isDatefunc: function(val, flag) {
						removeAttrVerifySuccess(attrs, ele);
						// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
						var regex = /^(?:(?:(?:0[1-9]|1[0-9]|2[0-8])[/](?:0[1-9]|1[0-2])|(?:29|30)[/](?:0[13-9]|1[0-2])|31[/](?:0[13578]|1[02]))[/](?!0000)[0-9]{4}|29([/])02\1(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00))$/g
						if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
							msg = "必填項";
							ctrlArry[1].$setValidity('verifyGeneral', false);
							// 判断是初始化还是验证
							if (flag) {
								requiredSign = false; //验证 必填項* 消失
							} else {
								requiredSign = true; //初始化 必填項* 显示
							}
						} else {
							// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
							// 若为N，则requiredSign为undefined
							if (optional[1].toLowerCase() == "Y".toLowerCase()) {
								requiredSign = false;
							}
							if (ctrlArry[1].$isEmpty(val)) {
								ctrlArry[1].$setValidity('verifyGeneral', true);
								addAttrVerifySuccess(attrs);
							} else if (regex.test(val)) {
								var minDateArr = optional[2].split("/");
								var maxDateArr = optional[3].split("/");
								var minDate = new Date();
								minDate.setFullYear(minDateArr[2], parseInt(minDateArr[1]) - 1, minDateArr[0]); //设置最小日期
								var maxDate = new Date();
								maxDate.setFullYear(maxDateArr[2], parseInt(maxDateArr[1]) - 1, maxDateArr[0]); //设置最大日期
								var valArr = val.split("/");
								var valDate = new Date();
								valDate.setFullYear(valArr[2], parseInt(valArr[1]) - 1, valArr[0]); //获取输入的日期
								if (valDate < minDate) {
									msg = "請輸入大於" + optional[2] + "的日期";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (valDate > maxDate) {
									msg = "請輸入小於" + optional[3] + "的日期";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else {
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
									addAttrVerifySuccess(attrs);
								}
								minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null; //垃圾回收，清空内存
							} else {
								msg = "输入的日期格式不正確或输入的日期有誤";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
						}
						ctrlArry[0].generalShowMsg(msg);
						ctrlArry[0].getRequiredSign(requiredSign);
					}

				};
				switch (optional[0]) {
					case "int":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.isIntfunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.isIntfunc(viewValue, 0);
							return viewValue;
						});
						break;
					case "decimal":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.isDecimalfunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.isDecimalfunc(viewValue, 0);
							return viewValue;
						});
						break;
					case "text":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.isTextfunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.isTextfunc(viewValue, 0);
							return viewValue;
						});
						break;
					case "ctext":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.iscTextfunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.iscTextfunc(viewValue, 0);
							return viewValue;
						});
						break;
					case "etext":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.iseTextfunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.iseTextfunc(viewValue, 0);
							return viewValue;
						});
						break;
					case "date":
						ctrlArry[1].$parsers.unshift(function(viewValue) {
							publicMethod.isDatefunc(viewValue, 1);
							return viewValue;
						});
						ctrlArry[1].$formatters.unshift(function(viewValue) {
							publicMethod.isDatefunc(viewValue, 0);
							return viewValue;
						});
						break;
				}

			}
		}
	});

	// 千分位 && 验证
	Module.directive("tranToNumber", function($filter, $compile) {
		return {
			restrict: 'A',
			require: '?^ngModel',
			//priority: 1,                                                  //此处设置的优先级较低，我们在后台需要计算的时候会取到输入值而不是转换后的值。
			scope: {
				name: '@'
			},
			controller: function($scope, $element, $attrs) {
				var msgArr = [];
				var showRequired = function(msg) {
					// 判断msg是否为必填項
					// 若是者显示*，否则不显示
					if (msg.join('') == "必填項") {
						$sc
					} else {
						$scope.showRequired = false;
					}
				};
				$scope.showMsg = function(msg, position) {
					$scope.msg = [];
					if (msg != "") {
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				};
				$scope.getRequiredSign = function(arg) {
					$scope.requiredSign = arg;
				};
			},
			link: function(scope, ele, attrs, ctrl) {
				var formName = ele.parents("form").attr('name');
				var msg, requiredSign;
				var optionalArr = attrs.tranToNumber.split(","); //后面表示支持的小數位
				var optional = optionalArr[1].split("|"); //必填|最小值|最大值

				// 初始化
				ctrl.$formatters.push(function(value) {
					verify(value.toString(), 0);
					return $filter('number')(value, 0);
				});

				// 验证过程
				var verify = function(val, flag) {
					if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
						// console.log(ctrl);
						msg = "必填項";
						ctrl.$setValidity('tranToNumber', false);
						// 判断是初始化还是验证
						if (flag) {
							requiredSign = false; //验证 必填項* 消失
						} else {
							requiredSign = true; //初始化 必填項* 显示
						}
					} else {
						// 判断是否为空且必填項参數是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if (optional[0].toLowerCase() == "Y".toLowerCase()) {
							requiredSign = false;
						}
						// 判断是否为空
						if (ctrl.$isEmpty(val)) {
							// val = val.toString();
							ctrl.$setValidity('tranToNumber', true);
						} else if (!isNaN(val) && !~val.toString().indexOf('.')) { // 判断是否为數字且是否为整型數字
							if (val < parseInt(optional[1])) { // 判断val是否小於最小值
								msg = "請輸入不小於" + optional[1] + "的數字";
								ctrl.$setValidity('tranToNumber', false);
							} else if (val > parseInt(optional[2])) { // 判断val是否大於最大值
								msg = "請輸入不大於" + optional[2] + "的數字";
								ctrl.$setValidity('tranToNumber', false);
							} else { // val符合条件
								msg = "";
								ctrl.$setValidity('tranToNumber', true);
							}
						} else { //val为非數字且非小數
							msg = "請輸入整型數字";
							ctrl.$setValidity('tranToNumber', false);
						}
					}
					scope.showMsg(msg);
					scope.getRequiredSign(requiredSign);
				}

				// 添加错误信息
				var template = '<span ng-if="!$parent.' + formName + '.submitted && requiredSign || $parent.' + formName + '[name].$valid && !requiredSign && requiredSign != undefined">*</span><span class="clearfix error tranToNumberSpan" ng-if="$parent.' + formName + '[name].stamp || ($parent.' + formName + '.submitted && $parent.' + formName + '[name].$invalid && !$parent.' + formName + '[name].$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				ele.parent().append(content);


				// focus,blur事件处理 千分位问题
				var tempTrueValue; //定义全局暂存变量
				var y = parseFloat(optionalArr[0]); //以10為底的冪，也表示支持的小數位，大於此數的小數將被忽略
				var unit = Math.pow(10, y);
				ele.bind('click', function() {
					ele.select();
				});
				ele.bind('focus', function() {
					tempTrueValue = attrs.value;
					var value = attrs.value;
					if (value != null && value != '' && !isNaN(value)) {
						//編輯時，轉換成數字，且保留y位小數
						ele.val(parseFloat(value / unit).toFixed(y));
					}
				});
				ele.bind('blur', function() {
					blurTest();
					verify(ctrl.$viewValue, 1);
					// 添加移除错误样式
					scope.$apply(function() {
						scope.$parent[formName][scope.name].stamp = ctrl.$dirty && ctrl.$invalid;
						if (ctrl.$dirty && ctrl.$invalid) {
							ele.addClass('isValid');
						} else {
							ele.removeClass('isValid');
						}
					});
				});
				var accMul = function(arg1, arg2) {
					var m = 0,
						s1 = arg1.toString(),
						s2 = arg2.toString();
					try {
						m += s1.split(".")[1].length;
					} catch (e) {}
					try {
						m += s2.split(".")[1].length;
					} catch (e) {}
					return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
				};
				// 失去焦点 处理千分位问题
				var blurTest = function() {
					// console.log('失去焦點:' + ele.val());
					var value = ele.val();
					if (value != null && value != '') {
						if (isNaN(value)) {
							//非數字（忽略千分位）
							var tempVal = value.replace(new RegExp(",", "g"), "");
							if (isNaN(tempVal)) {
								ele.focus();
								// alert('請輸入數字');
								return;
							}
						} else {
							var dotIdx = value.indexOf('.');
							if (dotIdx >= 0) {
								var b = value.length - dotIdx - 1 > y ? true : false;
								if (b) { //多于y位小數
									// alert('最多輸入' + y + '位小數，已忽略后部分小數');
									value = value.substring(0, dotIdx + y + 1); //截取前y位小數
								}
							}
							//轉換成數字，且保留0位小數，即以元為單位
							ctrl.$setViewValue(accMul(value, unit));
							ele.val($filter('number')(value * unit, 0));
							if (ctrl.$viewValue > 1400000000) {
								//撤消trueValue更改
								ctrl.$setViewValue(tempTrueValue);
								// alert('輸入金額不能大於 1,400,000,000');
								ele.focus();
							}
						}
					} else {
						//轉換成數字，且保留0位小數，即以元為單位
						ctrl.$setViewValue(0);
						ele.val(0);
					}
				}
			}
		}
	});

	var autocomplete = {
		/**
		 * [date 日历控件自动添加“/”]
		 * @param  {[obj]} ctrl  [ngModel]
		 * @param  {[type]} ele   [element]
		 * @param  {[type]} value [ngModelviewValue]
		 *
		 */
		date: function(ctrl, ele, value) {
			//判断value是否为空
			if (value) {
				//或者value中的数字
				var str = value.match(/\d/g).join("");
				// 判断是否为数字的第3，第5位
				if (str.length === 3 || str.length === 5) {
					// 在第3，第5位前添加"/"
					value = str.replace(/(.{2})/g, '$1/');
					ctrl.$viewValue = value;
					ctrl.$setViewValue(value);
					ele.val(value);
				}
			}
		},
		month: function(ctrl, ele, value) {
			if (value) {
				var str = value.match(/\d/g).join("");
				if (str.length === 3) {
					value = str.replace(/(.{2})/g, '$1/');
					ctrl.$viewValue = value;
					ctrl.$setViewValue(value);
					ele.val(value);
				}
			}
		}
	}

});