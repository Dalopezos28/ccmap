web: python manage.py migrate && python manage.py collectstatic --noinput && python post_deploy.py && gunicorn comedores_cali.wsgi:application --bind 0.0.0.0:$PORT --workers 3
