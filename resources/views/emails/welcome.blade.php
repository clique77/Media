<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ласкаво просимо в MediaVerse</title>
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
        <p>Привіт, {{ $user->name }}!</p>
        <p>Вітаємо у <strong>MediaVerse</strong> – твоєму новому мультимедійному просторі!</p>
        <p>Ми раді бачити тебе серед нас. Тепер тобі доступні фільми, книги, подкасти та багато іншого. Досліджуй, зберігай улюблене та ділися з друзями!</p>
        <a href="{{ $profileUrl }}" class="btn">Перейти в MediaVerse</a>
        <p>Якщо у тебе є питання, просто дай відповідь на цей лист – ми завжди на зв’язку!</p>
    </div>
    <div class="footer">
        <p>Дякуємо, що приєднався до <strong>MediaVerse</strong>.</p>
        <p><a href="https://mediaverse.example.com">Відвідати наш вебсайт</a></p>
    </div>
</div>
</body>
</html>
