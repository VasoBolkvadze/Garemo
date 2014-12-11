function axaliMyariCtrl($scope) {
	$scope.geoPaketi = {
		obiektisKoordinatebi: {
			cxrili: [
				{x: 0, y: 0}
			]
		}
	};
	$scope.addKoordinati = function(){
		$scope.geoPaketi.obiektisKoordinatebi.cxrili.push({x:0,y:0});
	};
	$scope.removeKoordinati = function(i){
		$scope.geoPaketi.obiektisKoordinatebi.cxrili.splice(i,1);
	};
}