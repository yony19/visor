<?php
  $hostname="localhost";
  $username="clase2020";
  $password="123456";
  $databaseName="clase2020";

$con = mysqli_connect($hostname, $username, $password, $databaseName);
 if ($mysqli -> connect_errno)
 {
 printf("se encontrò un error: %s\n",$mysqli->connect_error);
 exit();
 }
?>
