<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>جسر الحضور - لوحة تحكم الإدارة (Laravel Server)</title>

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">

    <!-- Google Maps API -->
    <script src="https://maps.googleapis.com/maps/api/js?v=beta&libraries=geometry,drawing,places"></script>

    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fc;
        }
        #root {
            height: 100vh;
        }
        /* Ensure Google Maps buttons look good in RTL */
        .gm-style {
            direction: ltr;
        }
    </style>

    <!-- Laravel Vite Bundler Directives -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/index.tsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
