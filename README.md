# 🛒 bbaacckkeenndd1

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![Tests](https://img.shields.io/badge/tests-Jest%20%26%20Supertest-green?logo=jest)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Backend para e-commerce: gestión de productos, usuarios, carritos y tickets. Listo para deploy con Docker, testing y documentación automática.**

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Instalación Local](#instalación-local)
- [Uso con Docker](#uso-con-docker)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts útiles](#scripts-útiles)
- [Testing](#testing)
- [Seeds y Mock Data](#seeds-y-mock-data)
- [Documentación API (Swagger)](#documentación-api-swagger)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Autores y Contacto](#autores-y-contacto)

---

## Descripción

Proyecto final Backend 3 - E-commerce API RESTful desarrollada con **Node.js**, **Express** y **MongoDB**.  
Gestión de usuarios, productos, carritos de compra, autenticación JWT, endpoints documentados y preparados para despliegue en contenedores.

---

## Características

- API RESTful modular y escalable
- Autenticación con JWT + Passport
- Gestión de usuarios, productos, carritos y tickets
- Seeds automáticos con Faker
- Testing automático con Jest y Supertest
- Documentación Swagger UI (autogenerada)
- Dockerfile + docker-compose listo para producción y desarrollo
- Manejo de errores centralizado y validación avanzada
- Código limpio, modular y siguiendo mejores prácticas

---

## Instalación Local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/behappydev/bbaacckkeenndd1.git
   cd bbaacckkeenndd1

npm start - Producción

npm run dev - Desarrollo (nodemon)

npm test - Tests automáticos (Jest + Supertest)

npm run seed:users - Seeds de usuarios

DockerHub
https://hub.docker.com/r/behappydev/bbaacckkeenndd1