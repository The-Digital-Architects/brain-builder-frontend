release: python manage.py migrate
web: daphne middleware_code.asgi:application --port $PORT --bind 0.0.0.0 -u none