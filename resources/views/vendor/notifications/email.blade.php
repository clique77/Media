<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #0d1117;
            color: #c9d1d9;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #161b22;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
        }
        .header {
            text-align: center;
            padding: 20px 0;
        }
        .header h1 {
            margin: 0;
            font-size: 36px;
            color: #58a6ff;
        }
        .content {
            margin: 20px 0;
            line-height: 1.6;
            text-align: center;
        }
        .btn {
            display: block;
            width: max-content;
            padding: 12px 24px;
            margin: 20px auto;
            background-color: #58a6ff;
            color: #0d1117;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            text-align: center;
        }
        .btn:hover {
            background-color: #1f6feb;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #8b949e;
        }
        .footer a {
            color: #58a6ff;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
<div class="email-container">
    <div class="header">
        <h1>MediaVerse</h1>
    </div>
    <div class="content">
        <p>Вітаємо в MediaVerse!</p>
        <p>Будь ласка, натисніть на кнопку нижче, щоб підтвердити свою електронну адресу. Це допоможе вам отримати доступ до всіх наших мультимедійних функцій.</p>
        <a href="{{ $actionUrl }}" class="btn">Підтвердити електронну адресу</a>
        <p>Якщо ви не реєструвалися в MediaVerse, просто ігноруйте цей лист.</p>
    </div>
    <div class="footer">
        <p>Дякуємо, що обрали <strong>MediaVerse</strong>.</p>
        <p><a href="https://mediaverse.example.com">Відвідати наш вебсайт</a></p>
    </div>
</div>
</body>
</html>
