from setuptools import setup, find_packages

requires = [
    'pyramid',
    'pyramid-tm',
    'SQLAlchemy',
    'psycopg2-binary',
    'alembic',
    'bcrypt',
    'PyJWT',
    'python-dotenv',
    'waitress',
]

setup(
    name='library_backend',
    version='1.0',
    description='Library Management System Backend',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=requires,
    entry_points={
        'paste.app_factory': [
            'main = app:main',
        ],
    },
)