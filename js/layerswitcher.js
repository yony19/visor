(function () {
	/** Define a namespace for the application.
	window.app = {};
	var app = window.app; */
	var lineChart = document.querySelector('#lineChart');
	var map = new ol.Map({
		controls: ol.control.defaults({
			attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
				collapsible: false
			})
		})/*.extend([
					new app.RotateNorthControl()
        			])*/,
		target: 'map',
		layers: [
			new ol.layer.Group({
				'title': 'Mapas Base',
				layers: [
					new ol.layer.Group({
						title: 'Acuarela con Etiquetas',
						type: 'base',
						combine: true,
						visible: false,
						layers: [
							new ol.layer.Tile({
								source: new ol.source.Stamen({
									layer: 'watercolor'
								})
							}),
							new ol.layer.Tile({
								source: new ol.source.Stamen({
									layer: 'terrain-labels'
								})
							})
						]
					}),
					new ol.layer.Tile({
						title: 'Acuarela',
						type: 'base',
						visible: false,
						source: new ol.source.Stamen({
							layer: 'watercolor'
						})
					}),
					new ol.layer.Tile({
						title: 'OSM',
						type: 'base',
						visible: true,
						source: new ol.source.OSM()
					}),
					new ol.layer.Tile({
						title: 'Satelite',
						type: 'base',
						visible: false,
						source: new ol.source.BingMaps({
							key: 'AqnrRFmyLeXveu5jFyo9IQegWGIskAjgwK6j5YADrf2dlRH0fZyveUEdepRN7g61',
							//Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3
							imagerySet: 'Aerial'
						})
					})
				]
			}),

			new ol.layer.Group({
				title: 'Capas',
				layers: [

					new ol.layer.Tile({
						title: 'Mascara de nubes Lima',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Lima:buzones_desague', 'TILED': true },
							url: "http://teledeteccion.inictel-uni.edu.pe:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),

					new ol.layer.Tile({
						title: 'PeruSAT1: INICTEL-UNI_pRGB',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Lima:IMG_PER1_20161210152519_000041_150106_p_rgb', 'TILED': true },
							url: "http://teledeteccion.inictel-uni.edu.pe:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),

					new ol.layer.Tile({
						title: 'Mosaico: Lima Metropolitana',
						visible: true,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'GeoPortal:LimaMetropolitana', 'TILED': true },
							url: "http://200.60.23.226:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					})

				]
			}),

			new ol.layer.Group({
				title: 'Limites',
				layers: [
					new ol.layer.Tile({
						title: 'Ríos',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Lima:Rio_navegables', 'TILED': true },
							url: "http://teledeteccion.inictel-uni.edu.pe:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),


					new ol.layer.Tile({
						title: 'Red Vía Nacional',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Lima:RedVial', 'TILED': true },
							url: "http://teledeteccion.inictel-uni.edu.pe:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),

					new ol.layer.Tile({
						title: 'Distritos',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Limites:Distritos', 'TILED': true },
							url: "http://200.60.23.226:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),

					new ol.layer.Tile({
						title: 'Provincias',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Limites:Provincias', 'TILED': true },
							url: "http://200.60.23.226:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					}),

					new ol.layer.Tile({
						title: 'Departamentos',
						visible: false,
						source: new ol.source.TileWMS({
							ratio: 1,
							params: { 'LAYERS': 'Limites:Departamentos', 'TILED': true },
							url: "http://200.60.23.226:8080/geoserver/wms/?",
							serverType: 'geoserver'
						})
					})
				]
			}),

		],
		view: new ol.View({
			center: ol.proj.transform([-76.940249, -12.070160], 'EPSG:4326', 'EPSG:3857'), //-77.028826, -12.102556
			zoom: 9.5  //////////////////////////////////////////////////////////////////////////-79.788056, -6.732951
		})
	});

	var layerSwitcher = new ol.control.LayerSwitcher({
		tipLabel: 'Légende' // Optional label for button
	});
	map.addControl(layerSwitcher);
	// punto con popup
	var puntos = [];

	var iconStyle = new ol.style.Style({
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
			anchor: [0.5, 46],
			anchorXUnits: 'fraction',
			anchorYUnits: 'pixels',
			src: 'image/punto.png'
		}))
	});
	var vectorSource;
	var puntoLayer;

	//obtener todos los puntos de la base de datos
	function listarTodosLosPuntos() {

		$.ajax({
			type: "GET",
			url: "dato.php?action=listar",
			data: {},
			dataType: "json",
			success: function (response) {

				if (response.length > 0) {

					$.each(response, function (index, linea) {//recorre uno por uno para crear
						let objectPoint = new ol.Feature({
							geometry: new ol.geom.Point([linea.latitud, linea.longitud]),
							name: JSON.stringify(linea),
							population: 4000,
							rainfall: 500
						});
						objectPoint.setStyle(iconStyle);
						puntos.push(objectPoint);
					});

				}

				vectorSource = new ol.source.Vector({
					features: puntos
				});

				puntoLayer = new ol.layer.Vector({
					source: vectorSource
				});

				map.addLayer(puntoLayer);
			}
		});
	}

	listarTodosLosPuntos();


	var element = document.getElementById('popup');

	var popup = new ol.Overlay({
		element: element,
		positioning: 'bottom-center',
		stopEvent: false,
		offset: [0, -50]
	});
	map.addOverlay(popup);

	// display popup on click
	map.on('click', function (evt) {

		var feature = map.forEachFeatureAtPixel(evt.pixel,
			function (feature) {
				return feature;
			});

		if (feature) {
			var coordinates = feature.getGeometry().getCoordinates();
			//alert(coordinates[0:1]);
			if (coordinates.length > 1) { var cord2 = coordinates }
			else { var cord2 = coordinates[0][3]; }

			if (feature.values_.name == undefined) {//cuando es nuevo

				var titulo = prompt("Ingrese nombre del punto");
				if (titulo != '') {
					guardarPunto(titulo, coordinates);
				} else {
					alert("El nombre es obligatorio");
				}

			} else {//cuando ya existe

				renderModalValues(feature.get('name'));//feature.get('name') trae el contenido de ese punto
				$("#modalGrafico").modal("show");//mostrar

			}
		} else {
			//$(element).popover('destroy');
		}
	});

	function guardarPunto(titulo, cordenada) {
		$.ajax({
			type: "POST",
			url: "dato.php?action=guardar",
			data: {
				titulo: titulo,
				latitud: cordenada[0],
				longitud: cordenada[1],
			},
			dataType: "",
			success: function (response) {
				listarTodosLosPuntos();
			}
		});
	}

	function renderModalValues(values) {

		let object = JSON.parse(values);

		document.getElementById("exampleModalLongTitle").innerText = object.nombre;

		//dibuja el grafico
		renderChartLine(object.temperatura);


	}

	function renderChartLine(values) {
		var chart = new Chart(lineChart, {
			type: 'line',
			data: {
				labels: [
					'Lunes',
					'Martes',
					'Miercoles',
					'Jueves',
					'Viernes'
				],
				datasets: [{
					label: 'Linea temperatura',
					data: values,
					borderColor: '#739600',
					fill: false,
					lineTension: 0
				}]
			},
			options: {
				legend: {
					position: 'bottom'
				},
				title: {
					display: true,
					text: 'Temperatura por dia',
					position: 'top'
				},
				scales: {
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Temperatura'
						}
					}],
					xAxes: [{
						scaleLabel: {
							display: true,
							labelString: 'Dias'
						}
					}]
				}
			}
		})

		
		//crea imagen para descargar
		setTimeout(function(){ 
			var url_base64jp = document.getElementById("lineChart").toDataURL("image/jpg");
			document.getElementById("link2").href = url_base64jp;
		 }, 2000);
		
	}

	//***************** botones control
	//  Vector layer
	var vector = new ol.layer.Vector({ source: new ol.source.Vector() })

	var mainbar = new ol.control.Bar();
	map.addControl(mainbar);

	// Edit control bar
	var editbar = new ol.control.Bar(
		{
			toggleOne: true,	// one control active at the same time
			group: false			// group controls together
		});
	mainbar.addControl(editbar);

	// Add selection tool:
	//  1- a toggle control with a select interaction
	//  2- an option bar to delete / get information on the selected feature
	var sbar = new ol.control.Bar();
	sbar.addControl(new ol.control.TextButton(
		{
			html: '<i class="fa fa-times"></i>',
			title: "Borrar",
			handleClick: function () {
				var features = selectCtrl.getInteraction().getFeatures();
				if (!features.getLength()) info("Seleccionar un objeto primero...");
				else info(features.getLength() + " object(s) deleted.");
				for (var i = 0, f; f = features.item(i); i++) {
					vector.getSource().removeFeature(f);
				}
				selectCtrl.getInteraction().getFeatures().clear();
			}
		}));
	sbar.addControl(new ol.control.TextButton(
		{
			html: '<i class="fa fa-info"></i>',
			title: "Ver información",
			handleClick: function () {
				switch (selectCtrl.getInteraction().getFeatures().getLength()) {
					case 0: info("Select an object first...");
						break;
					case 1:
						var f = selectCtrl.getInteraction().getFeatures().item(0);
						info("Selection is a " + f.getGeometry().getType());
						break;
					default:
						info(selectCtrl.getInteraction().getFeatures().getLength() + " objects seleted.");
						break;
				}
			}
		}));

	var selectCtrl = new ol.control.Toggle(
		{
			html: '<i class="fa fa-hand-pointer-o"></i>',
			title: "Select",
			interaction: new ol.interaction.Select(),
			bar: sbar,
			active: true
		});

	editbar.addControl(selectCtrl);

	// Add editing tools
	var pedit = new ol.control.Toggle(
		{
			html: '<i class="fa fa-map-marker" ></i>',
			title: 'Point',
			interaction: new ol.interaction.Draw
				({
					type: 'Point',
					source: vector.getSource()
				})
		});
	editbar.addControl(pedit); //adiero el boton punto a la barra

	var ledit = new ol.control.Toggle(
		{
			html: '<i class="fa fa-share-alt" ></i>',
			title: 'LineString',
			interaction: new ol.interaction.Draw
				({
					type: 'LineString',
					source: vector.getSource()
				}),
			// Options bar associated with the control
			bar: new ol.control.Bar(
				{
					controls: [new ol.control.TextButton(
						{
							html: 'undo',
							title: "Eliminar último punto",
							handleClick: function () {
								try { ledit.getInteraction().removeLastPoint(); } catch (e) { };
							}
						}),
					new ol.control.TextButton(
						{
							html: 'Finish',
							title: "finalizar",
							handleClick: function () {	// Prevent null objects on finishDrawing
								var drawi = ledit.getInteraction();
								var lkey = drawi.on('drawend', function (e) {
									ol.Observable.unByKey(lkey);
									//drawi.unByKey(lkey);
									var c = e.feature.getGeometry().getCoordinates();
									if (c.length < 2) {
										throw "Bad LineString";
									}
								});
								try { drawi.finishDrawing(); }
								catch (e) {
									ol.Observable.unByKey(lkey);
									//drawi.unByKey(lkey);
								}
							}
						})
					]
				})
		});

	editbar.addControl(ledit);
	/* comentado
	var fedit = new ol.control.Toggle(
		{
			html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
			title: 'Polygon',
			interaction: new ol.interaction.Draw
				({
					type: 'Polygon',
					source: vector.getSource()
				}),
			// Options bar ssociated with the control
			bar: new ol.control.Bar(
				{
					controls: [new ol.control.TextButton(
						{
							html: 'undo',//'<i class="fa fa-mail-reply"></i>',
							title: "undo last point",
							handleClick: function () {
								try { fedit.getInteraction().removeLastPoint(); } catch (e) { }
							}
						}),
					new ol.control.TextButton(
						{
							html: 'finish',
							title: "finish",
							handleClick: function () {	// Prevent null objects on finishDrawing
								var drawi = fedit.getInteraction();
								var lkey = drawi.on('drawend', function (e) {
									ol.Observable.unByKey(lkey);
									//drawi.unByKey(lkey);
									var c = e.feature.getGeometry().getCoordinates();
									if (c[0].length < 4) {
										throw "Bad Polygon";
									}
								});
								try { drawi.finishDrawing(); }
								catch (e) {
									ol.Observable.unByKey(lkey);
									//drawi.unByKey(lkey);
								}
							}
						})
					]
				})
		});
*/
	// Nuevo codigo del boton agregado
	var features;
	var control = false;//verifica si ya se activo el boton
	var fedit = new ol.control.Toggle(
		{
			html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
			title: 'Polygon',
			onToggle: function () {
				if (!control) {
					var variable = prompt("Ingresa Codigo de Zona de Interes", 124);
					//alert("variable aceptada");
					features = sourceParcela.getFeatures();

					for (var i = 0; i < features.length; i++) {
						var prop = features[i].getProperties();
						if (prop.codigo === variable) {
							features[i].set("hidden", !prop.hidden)
							map.getView().fit(features[i].getGeometry(), map.getSize())
						}
					}
					//layerParcela.redraw();
				}
				control = !control
			},
		});
	editbar.addControl(fedit);

	/*
	// Add a simple push button to save features
	var save = new ol.control.Button(
		{
			html: '<i class="fa fa-download"></i>',
			title: "Save",
			handleClick: function (e) {
				var json = new ol.format.GeoJSON().writeFeatures(vector.getSource().getFeatures());
				info(json);
			}
		});
	mainbar.addControl(save);

	// Show info
	function info(i) {
		$("#info").html(i || "");
	}
*/

	//***************** para el poligono parcela
	var styles = [
		new ol.style.Style({
			stroke: new ol.style.Stroke({
				color: 'blue',
				width: 3
			})/*,
			fill: new ol.style.Fill({
				color: 'rgba(0, 0, 255, 0.1)'
			}),
			geometry: function (feature) {
				// return the coordinates of the first ring of the polygon
				var coordinates = feature.getGeometry().getCoordinates()[0];
				return new ol.geom.MultiPoint(coordinates);
			}*/
		})

	];

	var textoParcela = "<strong>INTERPRETACIÓN: </strong></BR>Zona de interes, xyz.";
	var geojsonObject = {
		'type': 'FeatureCollection',
		'crs': {
			'type': 'name',
			'properties': {
				'name': 'EPSG:3857' //ol.proj.transform([-79.788056, -6.732951], 'EPSG:4326', 'EPSG:3857')
			}
		},
		'features': [{
			'type': 'Feature',
			"properties": { "name": textoParcela, "hidden": true, "codigo": "124" },// Agrega nombre al geojson
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[
					ol.proj.transform([-76.977264, -11.765032], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-76.975615, -11.765106], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-76.975757, -11.768456], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-76.977543, -11.768325], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-76.977264, -11.765032], 'EPSG:4326', 'EPSG:3857')
				]]
			}

		},
		{
			'type': 'Feature',
			"properties": { "name": textoParcela, "hidden": true, "codigo": "123" },// Agrega nombre al geojson
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[
					ol.proj.transform([-79.7819, -6.7257], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7764, -6.7262], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7796, -6.7286], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7819, -6.7257], 'EPSG:4326', 'EPSG:3857')
				]]
			}

		},
		{
			'type': 'Feature',
			"properties": { "name": textoParcela, "hidden": true, "codigo": "125" },// Agrega nombre al geojson
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[
					ol.proj.transform([-80.1395, -6.0455], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.9438, -6.0495], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.9573, -6.1556], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-80.1395, -6.1512], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-80.1395, -6.0455], 'EPSG:4326', 'EPSG:3857')

				]]
			}

		},
		{
			'type': 'Feature',
			"properties": { "name": "NDVI", "hidden": true, "codigo": "126" },// Agrega nombre al geojson
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[
					ol.proj.transform([-79.7792, -6.5581], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7771, -6.5553], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7764, -6.5562], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7769, -6.5596], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.7792, -6.5581], 'EPSG:4326', 'EPSG:3857')

				]]
			}

		},
		{
			'type': 'Feature',
			"properties": { "name": "NDVI", "hidden": true, "codigo": "127" },// Agrega nombre al geojson
			'geometry': {
				'type': 'Polygon',
				'coordinates': [[
					ol.proj.transform([-79.0963, -6.8214], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.0933, -6.8223], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.0937, -6.8244], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.0959, -6.8241], 'EPSG:4326', 'EPSG:3857'),
					ol.proj.transform([-79.0963, -6.8214], 'EPSG:4326', 'EPSG:3857')

				]]
			}

		}
		]
	};

	var sourceParcela = new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(geojsonObject)
		//,getZoomForResolution: 15
	});

	//Funcion agregada p
	function Stylefunction(feature, resolution) {
		var prop = feature.getProperties();
		if (prop.hidden)
			return;

		return styles;
	}
	var layerParcela = new ol.layer.Vector({
		source: sourceParcela,
		minzoom: 14000,
		style: Stylefunction  //Modificado y valor anterior: styles
	});


	map.addLayer(layerParcela);

	//*****************

	// Show info
	function info(i) {
		$("#info").html(i || "");
	}
})();
