var myApp = angular.module("va", []);

myApp.controller("testCtrl", function($scope, $rootScope) {
	$scope.text1 = "1";
	// $scope.text2 = "d";
	// $scope.myField7 = 'd';
	$scope.options = ['one','two','three'];
	$scope.diam = [{"Code":"AN","Desc":"腳鏈"},{"Code":"BC","Desc":"胸針"},{"Code":"BN","Desc":"手鐲"}];
	$scope.generalInt = "d";
	$scope.generalDecimal ="d";
	$scope.generalText = "aa";
	$scope.generalFromDate = "31/07/2015";
	$scope.generalToDate = "31/07/2015";
	$scope.CurrentProfit= {"ProfitList":[{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"107","Amount":10000},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"108","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"109","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"110","Amount":10000},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"111","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"112","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"133","Amount":10000},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"134","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"135","Amount":0},{"ProfitID":"50e23d15-e7bc-4247-a7a0-bb98e1125689","TableNumber":"136","Amount":10000}]};
	var arr = [];
	$scope.check = function(arg){
		if(arg.checked == null || arg.checked == false){
			arg.checked = true;
			arr.push(arg);
		}else{
			arg.checked = false;
			arr.splice(arg,1);
		}
		$scope.myFiled5 = arr.toString();
	};

	$scope.hehe = function(arg){
		// console.log($scope.myField7);
		return true;
	}

	$scope.ok = function(arg){
  		console.log(arg);
	}

	$scope.jump = function(arg){
		$scope.showTab = arg;
	}
});

// 获取form对象
myApp.directive('getForm', function($rootScope){
	return{
		restrict: 'A',
		scope: true,
		link: function(scope, element, attrs){
			$rootScope.forms = {};
			var formArr = attrs.getForm.split(",");
			for (var i = 0; i < formArr.length; i++) {
				$rootScope.forms[formArr[i]] = scope[formArr[i]];
			};
		}
	}
})
// submit
myApp.directive('vsubmit',function($rootScope){
	return {
		restrict: 'A',
		scope:{
			func : '&'	
		},
		link: function(scope, element, attrs){
			element.click(function(){
				// console.log($rootScope.forms[attrs.fname]);
				// angular.element('form[name="'+ attrs.fname +'"]').submit();
				$rootScope.forms[attrs.fname].submitted = false;
				/**
				 * [判断表单合法]
				 * @param  {[boolean]} $rootScope.forms[attrs.fname].$valid [表单合法性]
				 * 若合法：调用绑定的方法func();
				 * 若不合法：scope.fname.submitted 设置为true
				 */
				if($rootScope.forms[attrs.fname].$valid){
					scope.func();
					console.log("success");
				}else{
					scope.$apply(function(){
						$rootScope.forms[attrs.fname].submitted = true;
					});
					angular.element('form[name="'+ attrs.fname +'"]').find('.ng-invalid').addClass('isValid');
					angular.element('form[name="'+ attrs.fname +'"].ng-invalid').removeClass('isValid');
					console.log("error");
				}
			});
		}
	}
});

myApp.directive('verify', function($compile, $timeout, $parse){
		return {
			/**
			 * [model 双向绑定ngModel]
			 * @type {Object}
			 *
			 * [name 单向绑定name属性]
			 * @type {String}
			 */
			restrict: 'A',
			require: '?^ngModel',
			scope: {
				model: '=ngModel',
				name : '@'
				// test : '&test'
			},
			controller: function($scope,$element,$attrs){
				$scope.msg = [];

				/**
				 * [控制错误时显示必填项的*]
				 * @param  {[string]} msg [传入提示信息]
				 */
				var showRequired = function(msg){
					// 判断msg是否为必填项
					// 若是者显示*，否则不显示
					if(msg.join("") == "必填项"){
						$scope.showRequired = true;
					}else{
						$scope.showRequired = false;
					}
				}
				/**
				 * [控制msg]
				 * @param  {[string]} msg   [提醒信息]
				 * @param  {[bool]} valid [控制是否进入数组]
				 * @param  {[bool]} required [控制必填项符号“*”的显示]
				 */
				this.showMsg = function(msg, valid){
					if(valid){
						angular.forEach($scope.msg, function(value, key){
							if(value == msg){
								$scope.msg.splice(key,1);
							}
						});
					}else{
						if($.inArray(msg, $scope.msg) < 0){
							$scope.msg.push(msg);
						}	
					}
					showRequired($scope.msg);
				};

				this.generalShowMsg = function(msg){
					$scope.msg = [];
					if(msg != ""){
						$scope.msg.push(msg);
					}
					showRequired($scope.msg);
				}

				this.getRequiredSign = function(arg){
					$scope.requiredSign = arg;
				}
			},
			link: function(scope,element,attrs,ctrl){
				var formName = element.parents("form").attr('name');
                scope.$watch('model', function(){
                	scope.$parent[formName][scope.name].stamp = false;
                	if(ctrl.$dirty && ctrl.$invalid){
                		$timeout(function(){
	                		scope.$parent[formName][scope.name].stamp = ctrl.$dirty && ctrl.$invalid;
            				if(ctrl.$dirty && ctrl.$invalid){
                				element.addClass('isValid');
	                		}
            			},6000);
            			
                	}else{
                		scope.$parent[formName][scope.name].stamp = ctrl.$dirty && ctrl.$invalid;
                		if(!(ctrl.$dirty && ctrl.$invalid)){
                			element.removeClass('isValid');
	                	}
                	}
                });
                element.bind('blur', function(evt) {
                	scope.$apply(function(){
                		scope.$parent[formName][scope.name].stamp = ctrl.$dirty && ctrl.$invalid;
                		if(ctrl.$dirty && ctrl.$invalid){
                			element.addClass('isValid');
	                	}else{
	                		element.removeClass('isValid');
	                	}
                	});
				});
				var template = '<span ng-if="!$parent.'+formName+'.submitted && requiredSign || $parent.'+formName+'[name].$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.'+formName+'[name].stamp || ($parent.'+formName+'.submitted && $parent.'+formName+'[name].$invalid && !$parent.'+formName+'[name].$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
				var content = $compile(template)(scope);
				element.parent().append(content);
			}
		}
	});

// required
myApp.directive('verifyRequired', function($compile){
		return {
			restrict: 'A',
			priority: 3,
			require: ['?^verify', '?^ngModel'],
			link: function(scope, ele, attrs, ctrlArry){
				/**
				 * [msg 提示信息]
				 * @type {String}
				 * 并设置默认值为"必填项"
				 * 
				 * [msgShow_stamp 控制提示信息显示与否]
				 * @type {boolean}
				 *
				 *[requiredSign 控制必填项“*”的显示]
				 * @type {boolean}
				 * 
				 */
				var msg = "必填项";
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
				 * @param {boolean} [msgShow_stamp] [控制msg是否进入数组]
				 * @param {boolean} [requiredSign] [控制必填项“*”的显示] ngModel修改过的requiredSign值都为false
				 * 
				 * 
				 */
				ctrlArry[1].$parsers.unshift(function(viewValue){

					if(ctrlArry[1].$isEmpty(viewValue)){
						msgShow_stamp = false;
						requiredSign = false;
						ctrlArry[1].$setValidity('verifyRequired', false);
					}else{
						msgShow_stamp = true;
						requiredSign  = false;
						ctrlArry[1].$setValidity('verifyRequired', true);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[0].getRequiredSign(requiredSign);
					return viewValue;
					
				});
				/**
				 * 
				 * @function [ctrlArry[1].$formatters.unshift] [当ngMolde值发生了改变，反应至Dom(页面加载读取ngModel数据，初始化)]
				 * @viewValue [ngModel.$viewValue]
				 * 判断是否为空，设置ngModel合法性，并设置msgShow_stamp;
				 * @return viewValue {[String]} [返回viewValue至Dom] 
				 *
				 * @function showMsg() [调用verify中的方法，控制msg]  
				 * @param {boolean} [requiredSign] [控制必填项“*”的显示] requiredSign默认值为true；ngModel修改过的requiredSign值都为false
				 */
				ctrlArry[1].$formatters.unshift(function(viewValue){
					if(ctrlArry[1].$isEmpty(viewValue)){
						msgShow_stamp = false;
						requiredSign = true;
						ctrlArry[1].$setValidity('verifyRequired', false);
					}else{
						msgShow_stamp = true;
						requiredSign = false;
						ctrlArry[1].$setValidity('verifyRequired', true);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[0].getRequiredSign(requiredSign);
					return viewValue;
				});
			}
		}
	});

// 验证数字
myApp.directive('verifyNumber', function($timeout){
	return {
		restrict: 'A',
		priority: 2,
		require: ['?^verify','?^ngModel'],
		link: function(scope, ele, attrs, ctrlArry){
				/**
				 * [pattern 正则表达式]
				 * @type {String}
				 */
				var msg = "需要输入数字";
				var pattern = new RegExp("^[0-9]+$");
				var msgShow_stamp;
				ctrlArry[1].$parsers.unshift(function(viewValue){
					if(ctrlArry[1].$isEmpty(viewValue)){
						msgShow_stamp = true;
						ctrlArry[0].showMsg(msg, msgShow_stamp);
						ctrlArry[1].$setValidity('verifyNumber', true);
					}else{
						msgShow_stamp = pattern.test(viewValue);
						if(msgShow_stamp){
							ctrlArry[1].$setValidity('verifyNumber', true);
						}else{
							ctrlArry[1].$setValidity('verifyNumber', false);
						}
						ctrlArry[0].showMsg(msg, msgShow_stamp);
					}
					return viewValue;
				});
				ctrlArry[1].$formatters.unshift(function(viewValue){
					if(ctrlArry[1].$isEmpty(viewValue)){
						ctrlArry[1].$setValidity('verifyNumber', true);
					}else{
						msgShow_stamp = pattern.test(viewValue);
						if(msgShow_stamp){
							ctrlArry[1].$setValidity('verifyNumber', true);
						}else{
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
myApp.directive('verifyRequiredCheckbox', function(){
	return {
		restrict: 'A',
		priority: 2,
		require: ['?^verify', '?^ngModel'],
		link: function(scope, ele, attrs, ctrlArry){
			/**
			 * [msg 提示信息]
			 * @type {String}
			 * 并设置默认值为”必填项“
			 *
			 * [msgShow_stamp 控制提示信息显示与否]
			 * @type {boolean}
			 *
			 * [minLenght 最小长度]
			 * @type {number}
			 */
			var msg = "必填项";
			var msgShow_stamp, minLength, requiredSign;
			/**
			 * [如果设置了提示信息，则替换掉默认值]
			 * attrs.verifyMsg  {[String]} attrs.verifyMsg [或者设置的提示信息]
			 */
			if(attrs.verifyMsg){
				msg = attrs.verifyMsg;
			}
			/**
			 * [如果设置了最小长度，则赋值]
			 * @attrs.verifyRequiredCheckboxMinLength  {[number]} attrs.verifyRequiredCheckboxMinLength [设置最小值]
			 */
			if(attrs.verifyRequiredCheckboxMinLength){
				minLength = attrs.verifyRequiredCheckboxMinLength;
			}else{
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
                   if(viewValue){
                		msgShow_stamp = viewValue.split(",").length >= minLength;
                		if(msgShow_stamp){
                			requiredSign = true;
                			ctrlArry[1].$setValidity('verifyRequiredCheckbox', true);
                		}else{
                			requiredSign = false;
                			ctrlArry[1].$setValidity('verifyRequiredCheckbox', false);
                		}
                   }else{
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
myApp.directive('verifyCustomReg', function($timeout){
	return {
		restrict: 'A',
		priority: 2,
		require: ['?^verify','?^ngModel'],
		link: function(scope, ele, attrs, ctrlArry){
			var msg, msgShow_stamp, pattern;
			if(attrs.verifyMsg){
				msg = attrs.verifyMsg;
			}else{
				msg="请输入提示信息！"
			}
			if(attrs.verifyCustomReg){
				pattern = new RegExp(attrs.verifyCustomReg);
			}else{
				return;
			}
			ctrlArry[1].$parsers.unshift(function(viewValue){
				if(ctrlArry[1].$isEmpty(viewValue)){
					msgShow_stamp = true;
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[1].$setValidity('verifyCustomReg', true);
				}else{
					msgShow_stamp = pattern.test(viewValue);
					if(msgShow_stamp){
						ctrlArry[1].$setValidity('verifyCustomReg', true);
					}else{
						ctrlArry[1].$setValidity('verifyCustomReg', false);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
				}
				return viewValue;
			});
			ctrlArry[1].$formatters.unshift(function(viewValue){
				if(ctrlArry[1].$isEmpty(viewValue)){
					ctrlArry[1].$setValidity('verifyCustomReg', true);
				}else{
					msgShow_stamp = pattern.test(viewValue);
					if(msgShow_stamp){
						ctrlArry[1].$setValidity('verifyCustomReg', true);
					}else{
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
myApp.directive('verifyCustomFunc', function($timeout, $parse){
	return {
		restrict: 'A',
		priority: 2,
		require: ['?^verify','?^ngModel'],
		link: function(scope, ele, attrs, ctrlArry){
			var msg, msgShow_stamp, pattern;
			if(attrs.verifyMsg){
				msg = attrs.verifyMsg;
			}else{
				msg="请输入提示信息！"
			}
			if(attrs.verifyCustomFunc){
				var func = $parse(attrs.verifyCustomFunc);
			}else{
				return;
			}
			ctrlArry[1].$parsers.unshift(function(viewValue){
				if(ctrlArry[1].$isEmpty(viewValue)){
					msgShow_stamp = true;
					ctrlArry[0].showMsg(msg, msgShow_stamp);
					ctrlArry[1].$setValidity('verifyCustomFunc', true);
				}else{
					scope[attrs.ngModel] = viewValue;
					console.log(scope);
					
					msgShow_stamp = func(scope);
					if(msgShow_stamp){
						ctrlArry[1].$setValidity('verifyCustomFunc', true);
					}else{
						ctrlArry[1].$setValidity('verifyCustomFunc', false);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
				}
				return viewValue;
			});
			ctrlArry[1].$formatters.unshift(function(viewValue){
				if(ctrlArry[1].$isEmpty(viewValue)){
					ctrlArry[1].$setValidity('verifyCustomFunc', true);
				}else{
					msgShow_stamp = func(scope);
					if(msgShow_stamp){
						ctrlArry[1].$setValidity('verifyCustomFunc', true);
					}else{
						ctrlArry[1].$setValidity('verifyCustomFunc', false);
					}
					ctrlArry[0].showMsg(msg, msgShow_stamp);
				}
				return viewValue;
			});
		}
	}
});

// verifyTimeSlot
myApp.directive('verifyTimeSlot', function($compile, $timeout, $parse) {
	return {
		restrict: 'A',
		priority: 3,
		// require: '?^ngModel',
		scope: {
			model: '=ngModel'
		},
		controller: function($scope,$element,$attrs){
			var msgArr = [];
			$scope.showMsg = function(msg, position) {
				// if(position == 'p1'){
				// 	msgArr[0] = msg;
				// }else if(position == 'p2'){
				// 	msgArr[1] = msg;
				// }
				// if(msgArr[0] != "" && msgArr[1] != ""){
				// 	$scope.msg = [msgArr[0],msgArr[1]];
				// }else if(msgArr[0] != "" && msgArr[1] == ""){
				// 	$scope.msg[0] = msgArr[0];
				// }else if(msgArr[0] == "" && msgArr[1] != ""){
				// 	$scope.msg[0] = msgArr[1];
				// }

				$scope.msg = [];
				if (msg != "") {
					$scope.msg.push(msg);
				}
				showRequired($scope.msg);
			};
			var showRequired = function(msg) {
				// 判断msg是否为必填项
				// 若是者显示*，否则不显示
				if (msg.join('') == "必填项") {
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
			var toDateEle = ele.children('input').eq(1); //结束如期
			// fieldArr[0] 开始日期
			fieldArr[0].$parsers.unshift(function(viewValue) {
				publicMethod.isTimeSlotfunc(viewValue, 1, fieldArr[0], fromDateEle, 'p1');
				publicMethod.isMsgShowfunc(fieldArr[0],fromDateEle);
				return viewValue;
			});
			fieldArr[0].$formatters.unshift(function(viewValue) {
				publicMethod.isTimeSlotfunc(viewValue, 0, fieldArr[0], fromDateEle, 'p1');
				return viewValue;
			});
			// fieldArr[1] 结束日期
			fieldArr[1].$parsers.unshift(function(viewValue) {
				publicMethod.isTimeSlotfunc(viewValue, 1, fieldArr[1], toDateEle, 'p2');
				publicMethod.isMsgShowfunc(fieldArr[1], toDateEle);
				return viewValue;
			});
			fieldArr[1].$formatters.unshift(function(viewValue) {
				publicMethod.isTimeSlotfunc(viewValue, 0, fieldArr[1], toDateEle, 'p2');
				return viewValue;
			});
			
			fromDateEle.bind('blur',function(evt){
				publicMethod.blurEventFunc(fieldArr[0], fromDateEle);
				// publicMethod.blurEventFunc(fieldArr[1],toDateEle);
			});
			toDateEle.bind('blur',function(evt){
				publicMethod.blurEventFunc(fieldArr[1],toDateEle);
			});

			// 添加错误信息
			var template = '<span ng-if="!$parent.' + formName + '.submitted && requiredSign || $parent.' + formName  + '.' + fieldArr[0].$name + '.$valid && $parent.' + formName  + '.' + fieldArr[1].$name + '.$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.' + formName + '.' + fieldArr[0].$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName  + '.' + fieldArr[0].$name +  '.$invalid && !$parent.' + formName + '.' + fieldArr[0].$name + '.$dirty)||$parent.' + formName + '.' + fieldArr[1].$name + '.stamp || ($parent.' + formName + '.submitted && $parent.' + formName  + '.' + fieldArr[1].$name +  '.$invalid && !$parent.' + formName + '.' + fieldArr[1].$name + '.$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
			var content = $compile(template)(scope);
			ele.append(content);

			var publicMethod = {
				/**
				 * [isTimeSlotfunc 验证和提示]
				 * @param  {[obj]}   ctrl     [当前ngModel对象]
				 * @param  {[obj]}   element  [当前获取焦点的元素]
				 * @param  {[string]}  position [属于开始日期还是结束日期，0：开始日期，1:结束日期]
				 * @return {Boolean}          [description]
				 */
				isTimeSlotfunc: function(val, flag, ctrl, element, position) {
					// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
					var regex = /^(?:(?:(?:0[1-9]|1[0-9]|2[0-8])[/](?:0[1-9]|1[0-2])|(?:29|30)[/](?:0[13-9]|1[0-2])|31[/](?:0[13578]|1[02]))[/](?!0000)[0-9]{4}|29([/])02\1(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00))$/g
					if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrl.$setValidity('verifyTimeSlot', false);
						// 判断是初始化还是验证
						if (flag) {
							requiredSign = false; //验证 必填项* 消失
						} else {
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
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
							var valDate = new Date();
							valDate.setFullYear(valArr[2], parseInt(valArr[1]) - 1, valArr[0]); 
							// 判断当前输入的值是否大于最大值，小于最小值
							var isMinOrMax = function(){
								if (valDate < minDate) {
									msg = "请输入大于" + optional[1] + "的日期";
									ctrl.$setValidity('verifyTimeSlot', false);
								} else if (valDate > maxDate) {
									msg = "请输入小于" + optional[2] + "的日期";
									ctrl.$setValidity('verifyTimeSlot', false);
								} else {
									msg = "";
									ctrl.$setValidity('verifyTimeSlot', true);
								}
							}
							if(element.siblings('input').val() != ""){
								// 获得siblings（fromDate || toDate）Dom 元素并设置日期值
								var siblingsVal = element.siblings('input').val();
								var siblingsDateArr = siblingsVal.split("/");
								var siblingsDate = new Date();
								siblingsDate.setFullYear(siblingsDateArr[2], parseInt(siblingsDateArr[1]) - 1, siblingsDateArr[0]);
								if(valDate > siblingsDate && position == 'p1'){
									msg = "请输入小于" + siblingsVal + "的日期";
									ctrl.$setValidity('verifyTimeSlot', false);
								}else if(valDate < siblingsDate && position == 'p2'){
									msg = "请输入大于" + siblingsVal + "的日期";
									ctrl.$setValidity('verifyTimeSlot', false);
								}else{
									isMinOrMax();
								}
							}else{
								isMinOrMax();
							}
							minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null, siblingsVal = null, siblingsDateArr = null, siblingsDate = null; //垃圾回收，清空内存
						} else {
							msg = "格式不正確，格式如：01/02/2015";
							ctrl.$setValidity('verifyTimeSlot', false);
						}
					}

					scope.showMsg(msg,position);
					scope.getRequiredSign(requiredSign);
				},
				/**
				 * [isMsgShowfunc 错误时添加或移除类isValid]
				 * @param  {[obj]}  ctrl [当前ngModel值]
				 * @param  {[obj]} element [当前的dom元素]
				 */
				isMsgShowfunc: function(ctrl,element){
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
				blurEventFunc:function(ctrl,element){
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

// verifyGeneral 自定义方法
/**
 * [verifyGeneral 自定义方法]
 * 使用方法verify-General="decimal|N|5|4" 
 * 必填项可为大小写"Y"or"y"
 * 
 */
myApp.directive('verifyGeneral', function($timeout, $compile, $filter){
	return {
		restrict: 'A',
		priority: 3,
		require: ['?^verify','?^ngModel'],
		link: function(scope, ele, attrs, ctrlArry){
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
			 * [publicMethod 包含验证纯整数型数字：isIntfunc，纯浮点型数字：isDecimalfunc，文本（包含数字+字母+普通符号，不包含特殊字符）]
			 */
			var publicMethod = {
				/**
				 * [isIntfunc 验证纯整数型数字]
				 * @val  {[String]}  val [传入键入的值]
				 */
				isIntfunc: function(val,flag) {
					// 判断是否为空且必填项参数是否为“Y”，则显示错误信息：这是必填项
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						// 判断是否为空
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						} else if (!isNaN(val) && !~val.indexOf('.')) { // 判断是否为数字且是否为整型数字
							if (val < parseInt(optional[2])) { // 判断val是否小于最小值
								msg = "请输入不小于" + optional[2] + "的数字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else if (val > parseInt(optional[3])) { // 判断val是否大于最大值
								msg = "请输入不大于" + optional[3] + "的数字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else { // val符合条件
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
						} else { //val为非数字且非小数
							msg = "请输入整型数字";
							ctrlArry[1].$setValidity('verifyGeneral', false);
						}
					}
					ctrlArry[0].generalShowMsg(msg);
					ctrlArry[0].getRequiredSign(requiredSign);
				},

				/**
				 * [isDecimalfunc 验证纯浮点型数字]
				 * @val  {[String]}  val [传入键入的值]
				 * optional[0] 类型，optional[1] 必填项，optional[2] 精度，optional[3] 小数点后几位
				 */
				isDecimalfunc: function(val,flag){
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						// console.log("必填项");
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						} 
						else if (!isNaN(val)) {
							if(~val.indexOf('.')){
								if (!(val.replace('.', '').length <= optional[2] && val.replace('.', '').length <= 38)) {
									msg = "精度不超过" + optional[2] + "位";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else if (!(val.length - (val.indexOf('.') + 1) == optional[3])) { // 获取小数点后位的长度 与 参数optional[3] 是否相等
									msg = "请输入小数点后" + optional[3] + "位的数字";
									ctrlArry[1].$setValidity('verifyGeneral', false);
								} else {
									msg = "";
									ctrlArry[1].$setValidity('verifyGeneral', true);
								}
							}else{
								// ele.val($filter('number')(val,optional[3]));
								// ctrlArry[1].$setViewValue(1.00000);
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
							
						} 
						else {
							msg = "请输入数字";
							ctrlArry[1].$setValidity('verifyGeneral', false);
						}
					}
					ctrlArry[0].generalShowMsg(msg);
					ctrlArry[0].getRequiredSign(requiredSign);
				},
				/**
				 * [isTextfunc 验证字符，不包含以下这些字符< 、> 、' 、\" ]
				 * @val  {[String]}  val [传入键入的值]
				 * optional[0] 类型，optional[1] 必填项，optional[2] 最小长度，optional[3] 最大长度
				 */
				isTextfunc: function(val, flag) {
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						} else if (!/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)) {
							if (val.length < parseInt(optional[2])) { // 判断val.length是否小于最小值
								msg = "请输入长度不小于" + optional[2] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大于最大值
								msg = "请输入长度不大于" + optional[3] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else { // val符合条件
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
						} else {
							msg = "输入的文字不能包含以下这些字符< 、> 、' 、\" ，请重新输入";
							ctrlArry[1].$setValidity('verifyGeneral', false);
						}
					}
					ctrlArry[0].generalShowMsg(msg);
					ctrlArry[0].getRequiredSign(requiredSign);
				},
				/**
				 * [iscTextfunc 验证汉字 ]
				 * @val  {[String]}  val [传入键入的值]
				 * optional[0] 类型，optional[1] 必填项，optional[2] 最小长度，optional[3] 最大长度
				 */
				iscTextfunc: function(val, flag) {
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						}  else if (!/^[A-Za-z]+$/g.test(val)) {
							if(/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)){
								msg = "输入的文字不能包含以下这些字符< 、> 、' 、\" ，请重新输入";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
							else if (val.length < parseInt(optional[2])) { // 判断val.length是否小于最小值
								msg = "请输入长度不小于" + optional[2] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大于最大值
								msg = "请输入长度不大于" + optional[3] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else { // val符合条件
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
						} else {
							msg = "请输入汉字或数字";
							ctrlArry[1].$setValidity('verifyGeneral', false);
						}
					}
					ctrlArry[0].generalShowMsg(msg);
					ctrlArry[0].getRequiredSign(requiredSign);
				},
				/**
				 * [iseTextfunc 验证英文 ]
				 * @val  {[String]}  val [传入键入的值]
				 * optional[0] 类型，optional[1] 必填项，optional[2] 最小长度，optional[3] 最大长度
				 */
				iseTextfunc: function(val, flag) {
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						} else if (!/^[\u4E00-\u9FA50-9]+$/g.test(val)) {
							if(/([<]\S+)|(\S+[>])|['"]|(<$)|(^>)/g.test(val)){
								msg = "输入的文字不能包含以下这些字符< 、> 、' 、\" ，请重新输入";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}
							else if (val.length < parseInt(optional[2])) { // 判断val.length是否小于最小值
								msg = "请输入长度不小于" + optional[2] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else if (val.length > parseInt(optional[3])) { // 判断val.length是否大于最大值
								msg = "请输入长度不大于" + optional[3] + "的文字";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							} else { // val符合条件
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
						} else {
							msg = "请输入英文或数字";
							ctrlArry[1].$setValidity('verifyGeneral', false);
						}
					}
					ctrlArry[0].generalShowMsg(msg);
					ctrlArry[0].getRequiredSign(requiredSign);
				},
				/**
				 * [isDatefunc 日期验证 验证格式dd/MM/YYYY, 并且验证平年，闺年 ]
				 * @val  {[String]}  val [传入键入的值]
				 * optional[0] 类型，optional[1] 必填项，optional[2] 大于某个日期，optional[3] 小于某个日期
				 * 
				 */
				isDatefunc: function(val, flag){
					// 定义日期验证规则，验证格式dd/MM/YYYY, 并且验证平年，闺年；
					var regex = /^(?:(?:(?:0[1-9]|1[0-9]|2[0-8])[/](?:0[1-9]|1[0-2])|(?:29|30)[/](?:0[13-9]|1[0-2])|31[/](?:0[13578]|1[02]))[/](?!0000)[0-9]{4}|29([/])02\1(?:(?:1[6-9]|[2-9][0-9])(?:0[48]|[2468][048]|[13579][26])|(?:16|[2468][048]|[3579][26])00))$/g
					if (ctrlArry[1].$isEmpty(val) && optional[1].toLowerCase() == "Y".toLowerCase()) {
						msg = "必填项";
						ctrlArry[1].$setValidity('verifyGeneral', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[1].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						if (ctrlArry[1].$isEmpty(val)) {
							ctrlArry[1].$setValidity('verifyGeneral', true);
						} else if (regex.test(val)){
							var minDateArr = optional[2].split("/");
							var maxDateArr = optional[3].split("/");
							var minDate = new Date();
							minDate.setFullYear(minDateArr[2], parseInt(minDateArr[1])-1, minDateArr[0]);//设置最小日期
							var maxDate = new Date();
							maxDate.setFullYear(maxDateArr[2], parseInt(maxDateArr[1])-1, maxDateArr[0]);//设置最大日期
							var valArr = val.split("/");
							var valDate = new Date();
							valDate.setFullYear(valArr[2], parseInt(valArr[1])-1, valArr[0]);//获取输入的日期
							if (valDate < minDate){
								msg = "请输入大于" + optional[2] + "的日期";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}else if (valDate > maxDate){
								msg = "请输入小于" + optional[3] + "的日期";
								ctrlArry[1].$setValidity('verifyGeneral', false);
							}else{
								msg = "";
								ctrlArry[1].$setValidity('verifyGeneral', true);
							}
							minDateArr = null, maxDateArr = null, minDate = null, maxDate = null, valArr = null, valDate = null; //垃圾回收，清空内存
						} else {
							msg = "输入的日期格式不正确或输入的日期有误";
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
myApp.directive("tranToNumber", function($filter, $compile){
	return {
		restrict:'A',
		require: '?^ngModel',
		priority: 1,
		scope:{
			name : '@'
		},
		controller: function($scope,$element,$attrs){
			var msgArr = [];
			var showRequired = function(msg) {
				// 判断msg是否为必填项
				// 若是者显示*，否则不显示
				if (msg.join('') == "必填项") {
					$scope.showRequired = true;
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
		link: function(scope,ele,attrs,ctrl){
			var formName = ele.parents("form").attr('name');
			var msg, requiredSign;
			var optionalArr = attrs.tranToNumber.split(","); //后面表示支持的小數位
			var optional = optionalArr[1].split("|"); //必填|最小值|最大值
			
			// 初始化
			ctrl.$formatters.push(function(value){
				verify(value.toString(), 0);
				return $filter('number')(value, 0);
			});
			
			// 验证过程
			var verify = function(val, flag){
				if (ctrl.$isEmpty(val) && optional[0].toLowerCase() == "Y".toLowerCase()) {
						// console.log(ctrl);
						msg = "必填项";
						ctrl.$setValidity('tranToNumber', false);
						// 判断是初始化还是验证
						if(flag){
							requiredSign = false; //验证 必填项* 消失
						}else{
							requiredSign = true; //初始化 必填项* 显示
						}
					} else {
						// 判断是否为空且必填项参数是否为“Y”,若为Y，修改时requiredSign设为false,
						// 若为N，则requiredSign为undefined
						if(optional[0].toLowerCase() == "Y".toLowerCase()){
							requiredSign = false;
						}
						// 判断是否为空
						if (ctrl.$isEmpty(val)) {
							val = val.toString();
							ctrl.$setValidity('tranToNumber', true);
						} else if (!isNaN(val) && !~val.toString().indexOf('.')) { // 判断是否为数字且是否为整型数字
							if (val < parseInt(optional[1])) { // 判断val是否小于最小值
								msg = "请输入不小于" + optional[1] + "的数字";
								ctrl.$setValidity('tranToNumber', false);
							} else if (val > parseInt(optional[2])) { // 判断val是否大于最大值
								msg = "请输入不大于" + optional[2] + "的数字";
								ctrl.$setValidity('tranToNumber', false);
							} else { // val符合条件
								msg = "";
								ctrl.$setValidity('tranToNumber', true);
							}
						} else { //val为非数字且非小数
							msg = "请输入整型数字";
							ctrl.$setValidity('tranToNumber', false);
						}
					}
					scope.showMsg(msg);
					scope.getRequiredSign(requiredSign);
			}

			// 添加错误信息
			var template = '<span ng-if="!$parent.'+formName+'.submitted && requiredSign || $parent.'+formName+'[name].$valid && !requiredSign && requiredSign != undefined">*</span><span class="error" ng-if="$parent.'+formName+'[name].stamp || ($parent.'+formName+'.submitted && $parent.'+formName+'[name].$invalid && !$parent.'+formName+'[name].$dirty)"><span ng-if="showRequired">*</span>{{msg[0]}}</span>';
			var content = $compile(template)(scope);
			ele.parent().append(content);


			// focus,blur事件处理 千分位问题
			var tempTrueValue; //定义全局暂存变量
			var y = parseFloat(optionalArr[0]);  //以10為底的冪，也表示支持的小數位，大于此數的小數將被忽略
            var unit = Math.pow(10, y);
			ele.bind('click', function(){
				ele.select();
			});
			ele.bind('focus',function(){
				tempTrueValue = attrs.value;
				var value = attrs.value;
				if (value != null && value != '') {
					//編輯時，轉換成數字，且保留y位小數
					ele.val(parseFloat(value / unit).toFixed(y));
				}
			});
			ele.bind('blur', function(){
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
							alert('請輸入數字');
							return;
						}
					} else {
						var dotIdx = value.indexOf('.');
						if (dotIdx >= 0) {
							var b = value.length - dotIdx - 1 > y ? true : false;
							if (b) { //多于y位小數
								alert('最多輸入' + y + '位小數，已忽略后部分小數');
								value = value.substring(0, dotIdx + y + 1); //截取前y位小數
							}
						}
						//轉換成數字，且保留0位小數，即以元為單位
						ctrl.$setViewValue((value * unit).toString());
						ele.val($filter('number')(value * unit, 0));
						if (ctrl.$viewValue > 1400000000) {
							//撤消trueValue更改
							ctrl.$setViewValue(tempTrueValue);
							alert('輸入金額不能大于 1,400,000,000');
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

// myApp.directive("tranToNumber", ['$filter', function ($filter) {
//         return {
//             restrict: 'AE',
//             replace: false,
//             scope: {
//                 model: '@value',                   //單向綁定顯示值
//                 tranToNumber: '@tranToNumber',    //單向綁定單位數
//                 trueValue: '='                    //雙向綁定存儲的值
//             },
//             link: function (scope, element, attrs, ctrl) {

//                 var y = parseFloat(scope.tranToNumber);  //以10為底的冪，也表示支持的小數位，大于此數的小數將被忽略
//                 //if (isNaN(y)) { //如果使用非數字，則默認為0
//                 //    y = 0;
//                 //}
//                 var unit = Math.pow(10, y);

//                 //點擊事件，實現點擊全選
//                 element.bind('click', function (e) {
//                     $(this).select();
//                 });

//                 /* 獲得焦點時，獲取顯示的值，轉成以“萬”為單位的數，保留y位小數
//                    1.如果顯示的值為null或空字符串，則忽略；
//                    2.如果顯示的值包含千分位（即,號），則將千分位去掉后再進行操作
//                 */
//                 element.bind('focus', function (e) {
//                     //console.log('獲得焦點:' + $(this).val());
//                     var value = $(this).val();
//                     if (value != null && value != '') {
//                         if (isNaN(value)) {
//                             var temp = value.replace(new RegExp(",", "g"), "");  //替換掉 ',' 號
//                             if (!isNaN(temp)) {
//                                 //編輯時，轉換成數字，且保留y位小數
//                                 $(this).val(parseFloat(temp / unit).toFixed(y));
//                             }
//                         }
//                         else {
//                             //編輯時，轉換成數字，且保留y位小數
//                             //$(this).val(parseFloat(value / unit).toFixed(y));
//                             $(this).val(parseFloat(value).toFixed(y));
//                         }
//                     }
//                 });

//                 /* 失去焦點時，獲取用戶輸入的值，轉成以“元”為單位的數，保留0位小數
//                    1.如果用戶輸入的值為null或空字符串，則忽略；
//                    2.如果用戶輸入的值為非數字（千分位除外），則提示錯誤
//                    3.如果用戶輸入的值包含小數，則將保留y位小數
//                    4.如果用戶輸入的值正確：為頁面顯示的值添加千分位；model保存的值不添加
//                 */
//                 element.bind('blur', function (e) {
//                     console.log('失去焦點:' + $(this).val());
//                     var value = $(this).val();
//                     if (value != null && value != '') {
//                         if (isNaN(value)) {
//                             //非數字（忽略千分位）
//                             var tempVal = value.replace(new RegExp(",", "g"), "");
//                             if (isNaN(tempVal)) {
//                                 element.focus();
//                                 alert('請輸入數字');
//                                 return;
//                             }
//                         }
//                         else {
//                             var dotIdx = value.indexOf('.');
//                             if (dotIdx >= 0) {
//                                 var b = value.length - dotIdx - 1 > y ? true : false;
//                                 if (b) {//多于y位小數
//                                     alert('最多輸入' + y + '位小數，已忽略后部分小數');
//                                     value = value.substring(0, dotIdx + y + 1);  //截取前y位小數
//                                 }
//                             }
//                             //轉換成數字，且保留0位小數，即以元為單位
//                             console.log(scope.trueValue);
//                             var tempTrueValue = scope.trueValue;
//                             scope.trueValue = parseFloat((value * unit).toFixed(0));
//                             if (scope.$root.$$phase == null) {
//                                 scope.$apply();
//                             }

//                             $(this).val($filter('number')(value * unit, 0));

//                             if (scope.trueValue > 1400000000) {
//                                 //撤消trueValue更改
//                                 scope.trueValue = tempTrueValue;
//                                 if (scope.$root.$$phase == null) {
//                                     scope.$apply();
//                                 }
//                                 alert('輸入金額不能大于 1,400,000,000');
//                                 element.focus();
//                             }
//                         }
//                     }
//                     else {
//                         //轉換成數字，且保留0位小數，即以元為單位
//                         scope.trueValue = 0;
//                         if (scope.$root.$$phase == null) {
//                             scope.$apply();
//                         }
//                         $(this).val(0);
//                     }
//                 });

//                 //加載時將模型值改成千分位顯示
//                 $(element).val($filter('number')(scope.model, 0));

//                 scope.$watch('trueValue', function (newValue, oldValue, scope) {
//                     if (isNaN(newValue)) {
//                         $(element).val(0);
//                     }
//                     else {
//                         $(element).val($filter('number')(newValue, 0));
//                     }
//                     //console.log("值變啦：" + newValue);
//                 });
//             }
//         }
//     }]);


