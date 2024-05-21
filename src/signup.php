<?php 
session_start();

include("db.php");

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $nom_usuario = $_POST['nom_usuario'];
    $senha = $_POST['senha'];

   
    $query_check_user = "SELECT * FROM form WHERE nom_usuario = '$nom_usuario'";
    $result_check_user = mysqli_query($con, $query_check_user);

    if (mysqli_num_rows($result_check_user) > 0) {
        echo "<script type='text/javascript'> alert('Nome de usuário já está em uso. Por favor, escolha outro.')</script>";
    } elseif (strlen($senha) > 8) { 
        echo "<script type='text/javascript'> alert('A senha não pode ter mais de 8 caracteres.')</script>";
    } else {
        $nom_usuario = mysqli_real_escape_string($con, $nom_usuario);
        $senha = mysqli_real_escape_string($con, $senha);

        $query = "INSERT INTO form (nom_usuario, senha) VALUES ('$nom_usuario', '$senha')";

        if (mysqli_query($con, $query)) {
            echo "<script type='text/javascript'> alert('Registrado com sucesso')</script>";
        } else {
            $error_message = mysqli_error($con);
            echo "<script type='text/javascript'> alert('Erro: não foi possível executar a consulta. $error_message')</script>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moby - Register</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../public/css/registro.css">
</head>
<body>
    <div class="background">
        <div class="register-container">
            <form id="registerForm" action="" method="post" class="register-form">
                <img src="../public/img/moby.png" alt="moby-icon" class="logo">
                <h2 class="title">Registre-se</h2>
                <div class="input-group">
                    <label for="nom_usuario" class="label">Usuário</label>
                    <input type="text" id="nom_usuario" name="nom_usuario" placeholder="Novo usuário" autofocus required class="input-field">
                </div>
                <div class="input-group">
                    <label for="senha" class="label">Senha</label>
                    <input type="password" id="senha" name="senha" placeholder="Nova senha" required class="input-field">
                </div>
                <button type="submit" class="btn-register">Registrar</button>
                <p style="margin-top: 1rem; color: white" class="no-underline"><span>Já tem uma conta? <a href="./login.php"><span class="btn-register">Entre</span></a></span></p>

            </form>
        </div>
    </div>
</body>
</html>
