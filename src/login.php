<?php 
session_start();

include("db.php");

if ($_SERVER['REQUEST_METHOD'] == "POST") {
    $nom_usuario = $_POST['nom_usuario'];
    $senha = $_POST['senha'];

  
    $stmt = $con->prepare("SELECT * FROM form WHERE nom_usuario = ? LIMIT 1");
    $stmt->bind_param("s", $nom_usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $user_data = $result->fetch_assoc();


        if (strlen($senha) > 8) {
            echo "<script type='text/javascript'> alert('A senha não pode ter mais de 8 caracteres.')</script>";
        } else {
            if ($user_data['senha'] == $senha) {
                $_SESSION['user_id'] = $user_data['id_usuario'];
                $_SESSION['nom_usuario'] = $user_data['nom_usuario'];

                header("Location: index.php");
                exit;
            } else {
                echo "<script type='text/javascript'> alert('Usuário ou senha inválidos.')</script>";
            }
        }
    } else {
        echo "<script type='text/javascript'> alert('Usuário ou senha inválidos.')</script>";
    }
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moby - Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="../public/css/registro.css">
</head>
<body>
    <div class="background">
        <div class="register-container">
            <form id="registerForm" action="" method="post" class="register-form">
                <img src="../public/img/moby.png" alt="moby-icon" class="logo">
                <h2 class="title">Entre</h2>
                <div class="input-group">
                    <label for="nom_usuario" class="label">Usuário</label>
                    <input type="text" id="nom_usuario" name="nom_usuario" placeholder="Seu usuário" autofocus required class="input-field">
                </div>
                <div class="input-group">
                    <label for="senha" class="label">Senha</label>
                    <input type="password" id="senha" name="senha" placeholder="Sua senha" required class="input-field">
                </div>
                <button type="submit" class="btn-register">Entrar</button>
                <p style="margin-top: 1rem; color: white" class="no-underline"><span>Não tem uma conta? <a href="./signup.php"><span class="btn-register">Registre</span></a></span></p>

            </form>
        </div>
    </div>
</body>
</html>
