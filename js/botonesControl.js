(function() {
		//  Vector layer
		var vector = new ol.layer.Vector( { source: new ol.source.Vector() })

		// The map
		/*var map = new ol.Map
			({	target: 'map',
				view: new ol.View
				({	zoom: 14,
					center: [270701, 6247637]
				}),
				layers: 
					[	new ol.layer.Tile({ source: new ol.source.OSM() }),
						vector
					]
			});*/

		// Main control bar
		var mainbar = new ol.control.Bar();
		map.addControl(mainbar);

		// Edit control bar 
		var editbar = new ol.control.Bar(
			{	toggleOne: true,	// one control active at the same time
				group:false			// group controls together
			});
		mainbar.addControl(editbar);

		// Add selection tool:
		//  1- a toggle control with a select interaction
		//  2- an option bar to delete / get information on the selected feature
		var sbar = new ol.control.Bar();
		sbar.addControl (new ol.control.TextButton(
				{	html: '<i class="fa fa-times"></i>',
					title: "Delete",
					handleClick: function() 
					{	var features = selectCtrl.getInteraction().getFeatures();
						if (!features.getLength()) info("Select an object first...");
						else info(features.getLength()+" object(s) deleted.");
						for (var i=0, f; f=features.item(i); i++) 
						{	vector.getSource().removeFeature(f);
						}
						selectCtrl.getInteraction().getFeatures().clear();
					}
				}));
		sbar.addControl (new ol.control.TextButton(
				{	html: '<i class="fa fa-info"></i>',
					title: "Show informations",
					handleClick: function() 
					{	switch (selectCtrl.getInteraction().getFeatures().getLength())
						{	case 0: info("Select an object first...");
								break;
							case 1:
								var f = selectCtrl.getInteraction().getFeatures().item(0);
								info("Selection is a "+f.getGeometry().getType());
								break;
							default:
								info(selectCtrl.getInteraction().getFeatures().getLength()+ " objects seleted.");
								break;
						}
					}
				}));

		var selectCtrl = new ol.control.Toggle(
				{	html: '<i class="fa fa-hand-pointer-o"></i>',
					title: "Select",
					interaction: new ol.interaction.Select (),
					bar: sbar,
					active:true
				});

		editbar.addControl ( selectCtrl);

		// Add editing tools
		var pedit = new ol.control.Toggle(
				{	html: '<i class="fa fa-map-marker" ></i>',
					title: 'Point',
					interaction: new ol.interaction.Draw
					({	type: 'Point',
						source: vector.getSource()
					})
				});
		editbar.addControl ( pedit );

		var ledit = new ol.control.Toggle(
				{	html: '<i class="fa fa-share-alt" ></i>',
					title: 'LineString',
					interaction: new ol.interaction.Draw
					({	type: 'LineString',
						source: vector.getSource()
					}),
					// Options bar associated with the control
					bar: new ol.control.Bar(
					{	controls:[ new ol.control.TextButton(
							{	html: 'undo',
								title: "Delete last point",
								handleClick: function() 
								{	try { ledit.getInteraction().removeLastPoint(); } catch(e){};
								}
							}),
							new ol.control.TextButton(
							{	html: 'Finish',
								title: "finish",
								handleClick: function() 
								{	// Prevent null objects on finishDrawing
									var drawi = ledit.getInteraction();
									var lkey = drawi.on('drawend', function(e)
									{	ol.Observable.unByKey(lkey);
										//drawi.unByKey(lkey);
										var c = e.feature.getGeometry().getCoordinates();
										if (c.length < 2)
										{	throw "Bad LineString";
										}
									});
									try { drawi.finishDrawing(); } 
									catch(e) 
									{	ol.Observable.unByKey(lkey);
										//drawi.unByKey(lkey); 
									}
								}
							})
						]
					}) 
				});

		editbar.addControl ( ledit );

		var fedit = new ol.control.Toggle(
				{	html: '<i class="fa fa-bookmark-o fa-rotate-270" ></i>',
					title: 'Polygon',
					interaction: new ol.interaction.Draw
					({	type: 'Polygon',
						source: vector.getSource()
					}),
					// Options bar ssociated with the control
					bar: new ol.control.Bar(
						{	controls:[ new ol.control.TextButton(
								{	html: 'undo',//'<i class="fa fa-mail-reply"></i>',
									title: "undo last point",
									handleClick: function() 
									{	try { fedit.getInteraction().removeLastPoint(); } catch(e){}
									}
								}),
								new ol.control.TextButton(
								{	html: 'finish',
									title: "finish",
									handleClick: function() 
									{	// Prevent null objects on finishDrawing
										var drawi = fedit.getInteraction();
										var lkey = drawi.on('drawend', function(e)
										{	ol.Observable.unByKey(lkey);
											//drawi.unByKey(lkey);
											var c = e.feature.getGeometry().getCoordinates();
											if (c[0].length < 4)
											{	throw "Bad Polygon";
											}
										});
										try { drawi.finishDrawing(); } 
										catch(e) 
										{	ol.Observable.unByKey(lkey);
											//drawi.unByKey(lkey); 
										}
									}
								})
							]
						}) 
				});
		editbar.addControl ( fedit );

		// Add a simple push button to save features
		var save = new ol.control.Button(
				{	html: '<i class="fa fa-download"></i>',
					title: "Save",
					handleClick: function(e)
					{	var json= new ol.format.GeoJSON().writeFeatures(vector.getSource().getFeatures());
						info(json);
					}
				});
		mainbar.addControl ( save );

		// Show info
		function info(i)
		{	$("#info").html(i||"");
		}
		
})();		