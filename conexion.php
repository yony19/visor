<?php
class Conexion
{
    private $conn;

    private $hostname;
    private $username;
    private $password;
    private $databaseName;

    public function __construct()
    {
        $this->hostname = "localhost";
        $this->username = "phpmyadmin";
        $this->password = "quispe";
        $this->databaseName = "clase2020";

        $this->conn = new mysqli($this->hostname, $this->username, $this->password, $this->databaseName);
        if ($this->conn->connect_errno) {
            printf("Conexión fallida: %s\n", $this->conn->connect_error);
            exit();
        }
    }

    public function obtenerTodo()
    {
        $consulta = "SELECT id, nombre, latitud, longitud, fechareg FROM punto ORDER BY id";

        $result = array();

        $index = 0;
        if ($resultado = $this->conn->query($consulta)) {//ejecuta la consulta

            while ($fila = $resultado->fetch_assoc()) {//recorre filas
                $result[$index] = $fila;
                $result[$index]['temperatura'] = $this->obtenerTemperaturas($fila['id']);
                $index++;
            }

        }
        return $result;
    }

    public function obtenerTemperaturas($id)
    {
        $consulta = "SELECT numero FROM temperatura where punto_id = $id  ORDER BY id";
        $result = array();
        if ($resultado = $this->conn->query($consulta)) {
            while ($fila = $resultado->fetch_assoc()) {
                $result[] = $fila['numero'];
            }
        }
        return $result;
    }

    public function guardarPunto($nombre, $latitud, $longitud)
    {
		$fechareg = date("y-m-d H:i:sa");
        $query = "INSERT INTO punto (nombre,latitud,longitud,fechareg) 
                VALUES('" . $nombre . "','" . $latitud . "','" . $longitud . "','" . $fechareg . "')";
        if (!$this->conn->query($query)) {//si no se guarda
            return 0;
        }
        $this->guardarTemperatura($this->conn->insert_id); // $this->conn->insert_id te trae el ultimo id insertado
        return 1;
    }

    public function guardarTemperatura($punto_id)
    {
        //generamos los numeros aleatorios
        $temp1 = rand(0, 50);
        $temp2 = rand(0, 50);
        $temp3 = rand(0, 50);
        $temp4 = rand(0, 50);
        $temp5 = rand(0, 50);

        $query = "INSERT INTO temperatura(numero,punto_id) 
                VALUES($temp1,$punto_id),($temp2,$punto_id),
                ($temp3,$punto_id),($temp4,$punto_id),($temp5,$punto_id)";

        $this->conn->query($query);
    }

    public function __destruct()
    {
        $this->conn->close();
    }

}
