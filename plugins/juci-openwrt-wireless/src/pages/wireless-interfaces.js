/*	
	This file is part of JUCI (https://github.com/mkschreder/juci.git)

	Copyright (c) 2015 Martin K. Schröder <mkschreder.uk@gmail.com>

	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
*/ 

JUCI.app
.controller("wirelessInterfacesPage", function($scope, $uci, $wireless, gettext, prompt, $modal){
	$wireless.getInterfaces().done(function(interfaces){
		$wireless.getDevices().done(function(devices){
			$scope.devices = devices; 
			$scope.interfaces = interfaces; 
			$scope.interfaces.map(function(x){
				var dev = devices.find(function(dev) { return dev[".name"] == x.device.value; }); 
				x[".frequency"] = (dev||{})[".frequency"]; 
			}); 
			$scope.$apply(); 
		}); 
	}); 
	
	$scope.getItemTitle = function($item){
		return ($item.ssid.value + ' (' + $item[".frequency"] + ')'); 
	}
	
	$scope.onCreateInterface = function(){
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'widgets/wifi-radio-picker-modal.html',
			controller: 'WifiRadioPickerModal',
			size: size,
			resolve: {
				interfaces: function () {
					return $scope.interfaces;
				}
			}
		});

		modalInstance.result.then(function (data) {
			$uci.wireless.$create({
				".type": "wifi-iface",
				"device": data.radio, 
				"ssid": data.ssid, 
				"mode": data.mode
			}).done(function(interface){
				//$scope.interfaces.push(interface);
				var radio = $scope.devices.find(function(x){ return x[".name"] == interface.device.value; })||{};  
				interface[".frequency"] = radio[".frequency"]; 
				if(data.mode == "sta"){
					radio.apsta.value = true; 
				}
				$scope.$apply(); 
			}); 
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	}
	
	$scope.onDeleteInterface = function(conn){
		if(!conn) alert(gettext("Please select a connection in the list!")); 
		if(confirm(gettext("Are you sure you want to delete this wireless interface?"))){
			conn.$delete().done(function(){
				$scope.$apply(); 
			}); 
		}
	}
	
}); 
