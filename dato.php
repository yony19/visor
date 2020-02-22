<?php
include("conexion.php");

if(isset($_REQUEST["nombre"]) and isset($_REQUEST["lati"]) and isset($_REQUEST["logi"])){
	$nombre = $_REQUEST["nombre"];
	$latitud = $_REQUEST["lati"];
	$longitud = $_REQUEST["logi"];
	$fechareg = date("y-m-d H:i:sa");
	
	if($nombre != ""){
		$query = "INSERT INTO punto(nombre,latitud,longitud,fechareg) 
				VALUES('".$nombre."','".$latitud."','".$longitud."','".$fechareg."')";
		//$result = $mysqli -> prepare($query);
		//$result -> execute();
		
		$result = mysqli_query($con,$query);
		
		$sql = "SELECT id, nombre, latitud, longitud, fechareg FROM punto ORDER BY id DESC LIMIT 1";
		$resultado = mysqli_query($con,$sql);
		$row = $resultado->fetch_object();
		$row = (array)$row;
		$json = html_entity_decode(json_encode($row));
		echo $json;
		mysqli_close($con);
		}
	} 


?>