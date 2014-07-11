function axaliLicenziaCtrl($scope, $modal, $http){
	var attachmentNames = [
		'licenziantisMonacemebi/mibmuliFailebi',
		'informaciaLicenziisShesaxeb/mibmuliFailebi',
		'damatebitiInformacia/ruqa',
		'damatebitiInformacia/atvisebisGegma',
		'damatebitiInformacia/geoSainformacioPaketi',
		'carmoqmnisSafudzveli/mibmuliFailebi',
		'gauqmebisSafudzveli/mibmuliFailebi',
		'informaciaLicenziisShesaxeb/statusi/safudzveli'
	];
	attachmentNames.forEach(function(attName){
		$scope[attName] = [];
	});
	$scope.licenzia = emptyLicenzia;
	$scope.carmoqmnisSafudzvlebi = carmoqmnisSafudzvlebi;
	$scope.gauqmebisSafudzvlebi = gauqmebisSafudzvlebi;
	$scope.addResursi = function(){
		$scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.push({dasaxeleba:null,raodenoba:null,uom:null,gamokenebisSfero:null});
	};
	$scope.removeResursi = function(res){
		var i = $scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.indexOf(res);
		$scope.licenzia
			.informaciaObiektisShesaxeb
			.resursebi
			.splice(i,1);
	};
	$scope.$on("fileSelected", function (event, args) {
		$scope.$apply(function () {
			$scope[args.inputName].push(args.file);
		});
	});
	$scope.open = function () {
		var modalInstance = $modal.open({
			templateUrl: '/templates/licenziebi/carmomadgeneli.jade',
			controller: 'carmomadgeneliCtrl',
			resolve:{
				carmomadgeneli: function(){
					return $scope.licenzia.carmomadgeneli;
				}
			}
		});
		modalInstance
			.result
			.then(function (carmomadgeneli) {
				$scope.licenzia.carmomadgeneli = carmomadgeneli;
			});
	};
	$scope.submit = function(){
		var licenzia = angular.copy($scope.licenzia);
		licenzia.carmoqmnisSafudzveli = carmoqmnisSafudzvlebi
											.reduce(function(m,v){
												if(v.active){
													m.title = v.title;
													m.name = v.name;
													v.data.forEach(function(field){
														if(field.type!='file')
															m[field.name] = field.value;
													});
												}
												return m;
											}
											,{});
		licenzia.gauqmebisSafudzveli = gauqmebisSafudzvlebi
											.reduce(function(m,v){
												if(v.active){
													m.title = v.title;
													m.name = v.name;
													v.data
														.forEach(function(field){
															if(field.type!='file')
																m[field.name] = field.value;
														});
												}
												return m;
											}
											,{});
		$http({
			method: 'POST',
			url: "/licenziebi/axali",
			headers: { 'Content-Type': undefined },
			transformRequest: function (data) {
				var formData = new FormData();
				formData.append("model", angular.toJson(data.model));
				data.attachments.forEach(function(att){
					for(var i = 0; i < att.files.length; i++) {
						formData.append(att.name+'_'+i, att.files[i]);
					}
				});
				return formData;
			},
			data:{
				model: licenzia,
				attachments: attachmentNames
								.map(function(attName){
									return {
										name:attName,
										files:$scope[attName]
									};
								})
			}
		})
		.success(function (data, status, headers, config) {
			if(data.success){
				alert('ახალი ლიცენზია შენახულია წარმატებით.');
				window.location = '/licenziebi';
			}else{
				alert("მოხდა შეცდომა!");
				console.log(JSON.stringify(data.error));
			}
		})
		.error(function (data, status, headers, config) {
			alert("მოხდა შეცდომა!");
			console.log(data);
			console.log(status);
		});
	};
}

var carmoqmnisSafudzvlebi = [
	{
		title:'აუქციონი',
		name:'auqcioni',
		active:true,
		data:[
			{
				type:'text',
				name:'aukcionisNomeri',
				label:'აუქციონის #',
				value:null
			},
			{
				type:'text',
				name:'lotisNomeri',
				label:'ლოტის #',
				value:null
			},
			{
				type:'text',
				name:'ganacxadisNomeri',
				label:'განაცხადის #',
				value:null
			},
			{
				type:'number',
				name:'sackisiFasi',
				label:'საწყისი ფასი',
				value:null
			},
			{
				type:'number',
				name:'sabolooFasi',
				label:'საბოლოო ფასი',
				value:null
			}
		]
	},
	{
		title:'საბჭოს წესით გადაცემული',
		name:'sabchosCesitGadacemuli',
		active:false,
		data:[
			{
				type:'date',
				name:'tarigi',
				label:'თარიღი',
				value:null
			},
			{
				type:'text',
				name:'oqmisNomeri',
				label:'ოქმის #',
				value:null
			}
		]
	},
	{
		title:'გაყოფა',
		name:'gakofa',
		active:false,
		data:[
			{
				type:'text',
				name:'dzveliLicenziisNomeri',
				label:'ძველი ლიცენზიის #',
				value:null
			}
		]
	},
	{
		title:'გადაცემა',
		name:'gadacema',
		active:false,
		data:[
			{
				type:'text',
				name:'dzveliLicenziisNomeri',
				label:'ძველი ლიცენზიის #',
				value:null
			}
		]
	},
	{
		title:'დუბლიკატი',
		name:'dublikati',
		active:false,
		data:[
			{
				type:'text',
				name:'dzveliLicenziisNomeri',
				label:'ძველი ლიცენზიის #',
				value:null
			}
		]
	},
	{
		title:'იჯარით გადაცემა',
		name:'ijaritGadacema',
		active:false,
		data:[
			{
				type:'text',
				name:'dzveliLicenziisNomeri',
				label:'საიდენთიფიკაციო კოდი',
				placeholder:'ან მოიჯარის პირადი ნომერი',
				value:null
			},
			{
				type:'text',
				name:'dasaxeleba',
				label:'დასახელება',
				placeholder:'ან მოიჯარე პირის სახელი, გვარი',
				value:null
			},
			{
				type:'file',
				name:'carmoqmnisSafudzveli/mibmuliFailebi',
				label:'მიბმული ფაილები'
			}
		]
	}
];
var gauqmebisSafudzvlebi = [
	{
		title:'None',
		name:'none',
		active:true,
		data:[]
	},
	{
		title:'პირადი განცხადება',
		name:'piradiGancxadeba',
		active:false,
		data:[
			{
				type:'file',
				name:'gauqmebisSafudzveli/mibmuliFailebi',
				label:'მიბმული ფაილები'
			}
		]
	},
	{
		title:'სააგენტოს გადაწყვეტილება',
		name:'saagentosGadackvetileba',
		active:false,
		data:[
			{
				type:'file',
				name:'gauqmebisSafudzveli/mibmuliFailebi',
				label:'მიბმული ფაილები'
			}
		]
	},
	{
		title:'გაყოფა',
		name:'gakofa',
		active:false,
		data:[
			{
				type:'text',
				name:'axaliLicenziisNomeri',
				label:'ახალი ლიცენზიის #',
				value:null
			}
		]
	},
	{
		title:'გადაცემა',
		name:'gadacema',
		active:false,
		data:[
			{
				type:'text',
				name:'axaliLicenziisNomeri',
				label:'ახალი ლიცენზიის #',
				value:null
			}
		]
	},
	{
		title:'დუბლიკატი',
		name:'dublikati',
		active:false,
		data:[
			{
				type:'text',
				name:'axaliLicenziisNomeri',
				label:'ახალი ლიცენზიის #',
				value:null
			}
		]
	},
];

var emptyLicenzia = {
	licenziantisMonacemebi: {
		dasaxeleba: null,
		pid: null,
		faktMisamarti: null,
		iurMisamarti: null,
		tel: null,
		mail: null
	},
	carmomadgeneli: {
		pid:null,
		saxeli:null,
		gvari:null,
		tel:null,
		mail:null
	},
	informaciaObiektisShesaxeb: {
		resursebi: [
			{
				dasaxeleba: null,
				raodenoba: null,
				uom: null,
				gamokenebisSfero: null
			}
		],
		regioni: null,
		municipaliteti: null,
		dasaxlebuliPunkti: null,
		fartobiUom: null,
		fartobi: null
	},
	informaciaLicenziisShesaxeb: {
		nomeri: null,
		gacemisTarigi: null,
		brdzanebisNomeri: null,
		brdzanebisTarigi: null,
		moqmedebisVada: null,
		salicenzioPirobebi: null,
		statusi: {
			mnishvneloba:null,
			safudzveli:null
		}
	},
	damatebitiInformacia: {
		regulirebisGadamxdeli: 'კი',
		a: {mnishvneloba:null,uom:''},
		b: {mnishvneloba:null,uom:''},
		c1: {mnishvneloba:null,uom:''},
		c2: {mnishvneloba:null,uom:''},
		p: {mnishvneloba:null,uom:''}
	},
	carmoqmnisSafudzveli: null,
	gauqmebisSafudzveli: null
};