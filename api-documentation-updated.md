# ChristmasGift API Documentation

## Base URL
Development: `https://localhost:7xxx/api`

## Authentication
The API uses JWT Bearer token authentication. After logging in, include the token in the Authorization header:
```
Authorization: Bearer {your-access-token}
```


### Authentication Endpoints

#### Login
```
POST /users/login
```
Request body:
```json
{
    "username": "string",
    "password": "string"
}
```
Response:
```json
{
    "token": "string",
    "user": {
        "userId": number,
        "username": "string",
        "name": "string",
        "email": "string",
        "isAdmin": boolean,
        "spendingLimit": number | null,
        "sillyDescription": "string" | null
    }
}
```

## User Management

### Get All Users (Admin Only)
```
GET /users
```
Response: Array of UserDto

### Get User by ID
```
GET /users/{id}
```
Response: UserDto

### Create User (Admin Only)
```
POST /users
```
Request body:
```json
{
    "username": "string",
    "password": "string",
    "name": "string",
    "email": "string",
    "isAdmin": boolean,
    "spendingLimit": number | null,
    "sillyDescription": "string" | null
}
```
Response: UserDto

### Update User (Admin Only)
```
PUT /users/{id}
```
Request body:
```json
{
    "username": "string" | null,
    "name": "string" | null,
    "email": "string" | null,
    "isAdmin": boolean | null,
    "spendingLimit": number | null,
    "sillyDescription": "string" | null
}
```
Response: UserDto

### Delete User (Admin Only)
```
DELETE /users/{id}
```

## Wish List Management

### Get All Wish List Items
```
GET /wishlist
```
Response: Array of WishListItemDto

### Get Wish List Item by ID
```
GET /wishlist/{id}
```
Response: WishListItemDto

### Get User's Wish List Items
```
GET /wishlist/user/{userId}
```
Response: Array of WishListItemDto

### Create Wish List Item
```
POST /wishlist
```
Request body:
```json
{
    "itemName": "string",
    "description": "string" | null,
    "quantity": number,
    "productUrl": "string" | null
}
```
Response: WishListItemDto

### Update Wish List Item
```
PUT /wishlist/{id}
```
Request body:
```json
{
    "itemName": "string" | null,
    "description": "string" | null,
    "quantity": number | null,
    "productUrl": "string" | null
}
```
Response: WishListItemDto

### Delete Wish List Item
```
DELETE /wishlist/{id}
```

## Wish List Submissions

### Get All Submissions (Admin/Parent Only)
```
GET /wishlistsubmission
```
Response: Array of WishListSubmissionDto

### Get Submission by ID
```
GET /wishlistsubmission/{id}
```
Response: WishListSubmissionDto

### Get User's Submissions
```
GET /wishlistsubmission/user/{userId}
```
Response: Array of WishListSubmissionDto

### Get Pending Parent Approvals
```
GET /wishlistsubmission/pending/parent
```
Response: Array of WishListSubmissionDto

### Get Pending Admin Approvals
```
GET /wishlistsubmission/pending/admin
```
Response: Array of WishListSubmissionDto

### Create Submission
```
POST /wishlistsubmission
```
Request body:
```json
{
    "userId": number
}
```
Response: WishListSubmissionDto

### Update Submission Status
```
PUT /wishlistsubmission/{id}
```
Request body:
```json
{
    "parentApprovalStatus": "string" | null,
    "adminApprovalStatus": "string" | null
}
```
Response: WishListSubmissionDto

# Next Steps for Angular Project Implementation

## 1. Core Setup
- [ ] Set up environment files with API URLs
- [ ] Create interfaces matching API DTOs
- [ ] Implement auth interceptor for JWT tokens
- [ ] Set up auth guard and admin guard

## 2. Authentication
- [ ] Create auth service with login/logout functionality
- [ ] Implement login component with form
- [ ] Add token storage and management
- [ ] Create protected route handling

## 3. User Management (Admin)
- [ ] Create user management component
- [ ] Implement user creation form
- [ ] Add user editing functionality
- [ ] Create user list view with filtering

## 4. Wish List Management
- [ ] Create wish list component
- [ ] Implement item creation form
- [ ] Add item editing functionality
- [ ] Create wish list view
- [ ] Implement submission workflow

## 5. Approval Workflow
- [ ] Create parent approval component
- [ ] Implement admin approval component
- [ ] Add approval status management
- [ ] Create notification system

## 6. UI Components
- [ ] Design and implement navigation
- [ ] Create reusable form components
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add success/error notifications

## 7. Testing
- [ ] Add unit tests for services
- [ ] Create component tests
- [ ] Implement E2E testing
- [ ] Add error boundary testing

## 8. Deployment
- [ ] Set up production environment
- [ ] Configure build process
- [ ] Implement CI/CD pipeline
- [ ] Set up monitoring and logging

## Required Angular Dependencies
```json
{
  "dependencies": {
    "@angular/core": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/router": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "tailwindcss": "^3.3.5",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

# Error Handling
All endpoints return standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses include a message:
```json
{
    "message": "string"
}
```
