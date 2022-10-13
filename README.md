# mpv-wallet-service

## Introduction

A simple REST API with authentication for a wallet service. Tech stack used include:

- [Express.js](https://expressjs.com)
- [Knex.js](https:knexjs.org) (ORM)
- [MySQL](https://mysql.com) DB

### Database Structure



## Overview

The API allows the following tasks:

- Users must authenticate to access all endpoints. Open an account with the `/users` endpoint and login to get bearer access token. Passwords must be strong passwords (at least 8 characters long with a combination of at least an uppercase character, a lowercase character, a digit and a symbol).

- User must open an account to perform all transactions: get summary of transactions, get account details, deposit, withdraw and transfer.

## Authentication

Authentication is done with JWT. See the full documentation at the end of this document for guidiance

## Error Codes

### General

HTTP Exceptions across all endpoints except authentication

- `HTTP_401_UNAUTHORIZED`: Access Denied/Unauthorized request 

- `HTTP_401_UNAUTHORIZED`: User's credentials could not be verified 

### Authentication

HTTP Exceptions with `/login` endpoint

- `HTTP_400_BAD_REQUEST`: Password must be a string

- `HTTP_400_BAD_REQUEST`: Email must be valid

- `HTTP_401_UNAUTHORIZED`: User's credentials could not be verified 

### Users

HTTP Exceptions with `/users` endpoint

- `HTTP_400_BAD_REQUEST`: Password must be at least 8 characters long with a combination of at least an uppercase character, a lowercase character, a digit and a symbol

- `HTTP_400_BAD_REQUEST`: Email must be valid

- `HTTP_409_CONFLICT`: Duplicate entry: user@email.com already exists

### Accounts

HTTP Exceptions with `/accounts` endpoint

- `HTTP_409_CONFLICT`: Duplicate entry: account already exists

- `HTTP_404_NOT_FOUND`: User does not have an account

### Transfers

HTTP Exceptions with `/transfers` endpoint

- `HTTP_404_NOT_FOUND`: User does not have an account 

- `HTTP_409_CONFLICT`: Insufficient balance

- `HTTP_409_CONFLICT`: Restricted request: cannot transfer to self

### Deposits



### Withdrawals



## Endpoints

[See full documentation](https://documenter.getpostman.com/view/12015411/2s83zmMhzh)