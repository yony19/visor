<?php
include("conexion.php");

if ($_GET['action'] == 'listar') {
	$con = new Conexion();
	$resultado = $con->obtenerTodo();
	echo json_encode($resultado);
}

if ($_GET['action'] == 'guardar') {
	$con = new Conexion();
	$resultado = $con->guardarPunto($_POST['titulo'], $_POST['latitud'], $_POST['longitud']);
	echo json_encode(array('status'=>$resultado));
} 
