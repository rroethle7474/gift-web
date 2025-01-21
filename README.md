# GiftTime Web Application

## Overview
GiftTime is a specialized gift management web application built with Angular 17 that streamlines the gift selection and approval process. The application enables users (selected by administrators) to choose gifts, which then go through a dual approval workflow involving both parents and administrators. This ensures that recipients get exactly what they want for special occasions like birthdays and holidays.

## Features
- User gift selection interface
- Admin user management
- Parent approval workflow
- Admin final approval system
- Gift tracking and management
- Secure authentication and authorization

## Prerequisites
Before running this application, please ensure you have the following installed:

- Node.js (version 20.x)
- .NET 8 SDK
- Angular CLI (latest version)
- SQL Server (for local database)
- Git

## Required Backend Components
This web application requires the following backend components to function:

1. **.NET 8 API**: The backend API must be set up and running. You can find the API repository at:
   https://github.com/rroethle7474/gift-api

2. **SQL Database**: A local SQL Server database is required for data storage.

## Local Development Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   # For local development
   npm run start:local
   
   # For development environment
   npm run start:dev
   
   # For test environment
   npm run start:test
   ```

3. **Access the Application**  
   Navigate to `http://localhost:4200` in your web browser

## Available Build Configurations
- Local: `npm run build:local`
- Development: `npm run build:dev`
- Test: `npm run build:test`
- Production: `npm run build:prod`

## Technical Stack
- Angular 17
- TypeScript
- RxJS
- TailwindCSS
- Azure Application Insights
- NGX libraries (Mask, Slick Carousel, Toastr, Validator)

## Environment Configuration
The application supports multiple environments:

1. **Local Environment**
   - Used for local development
   - Configure settings in `src/environments/environment.ts`

2. **Development Environment**
   - Used for development server testing
   - Configure settings in `src/environments/environment.development.ts`

3. **Test Environment**
   - Used for testing server deployment
   - Configure settings in `src/environments/environment.test.ts`

4. **Production Environment**
   - Used for production deployment
   - Configure settings in `src/environments/environment.production.ts`

## Azure DevOps Pipeline Configuration
The application includes a pre-configured Azure DevOps pipeline that handles:
- Automated builds for test and production environments
- Environment-specific configuration management
- Deployment to Azure Web Apps
- Version management

### Pipeline Variables Required
The following variables need to be set in your Azure DevOps pipeline:
- `TEST_API_URL`: API endpoint for test environment
- `PROD_API_URL`: API endpoint for production environment
- `TEST_APPINSIGHTS_CONNECTION_STRING`: Application Insights connection string for test
- `PROD_APPINSIGHTS_CONNECTION_STRING`: Application Insights connection string for production
- `TEST_DEMO_MODE`: Enable/disable demo mode in test
- `PROD_DEMO_MODE`: Enable/disable demo mode in production
- `TEST_INITIAL_SETUP`: Enable/disable initial setup mode in test
- `PROD_INITIAL_SETUP`: Enable/disable initial setup mode in production

## Deployment
The application uses PM2 for process management in Azure Web Apps:

1. **Test Environment**
   - Deployed to: `test-gift-web`
   - Automatically deployed after successful build

2. **Production Environment**
   - Deployed to: `prod-gift-web`
   - Deployed after successful test deployment

## Development Guidelines
1. **Code Style**
   - Follow Angular style guide
   - Use TailwindCSS for styling
   - Implement responsive design

2. **Testing**
   ```bash
   # Run unit tests
   npm test
   ```

3. **Version Control**
   - Main branch is protected
   - Create feature branches for new development
   - Use meaningful commit messages

## Database Setup

### Option 1: Code First Approach (Recommended)
1. **Configure Connection String**
   - Open `appsettings.json` in the API project
   - Update the `DefaultConnection` string to point to your local SQL Server:
     ```json
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=GiftTimeDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
     }
     ```

2. **Generate and Apply Database Migrations**
   - Open a terminal in the API project directory
   - Install the EF Core tools if you haven't already:
     ```bash
     dotnet tool install --global dotnet-ef
     ```
   - Create the initial migration:
     ```bash
     dotnet ef migrations add InitialCreate
     ```
   - Apply the migration to create your database:
     ```bash
     dotnet ef database update
     ```

3. **Verify Database Creation**
   - Check SQL Server Management Studio (SSMS) or Azure Data Studio
   - You should see the following tables created: (Run actuall script for full list)
     - Users
     - WishListItems
     - WishListSubmissions
     - HeroContent
     - WishListSubmissionStatus
     - RecommendWishListItems
     - Settings

### Option 2: Manual Script Generation
If you prefer to work with SQL scripts:
1. Generate a SQL script from your migrations:
   ```bash
   dotnet ef migrations script -o create-database.sql
   ```
2. Execute the generated script in SQL Server Management Studio or Azure Data Studio

### Important Notes
- The database will be automatically populated with default timestamps using `GETDATE()` for creation and modification dates
- Ensure your SQL Server instance is running and accessible
- The application uses Entity Framework Core for all database operations
- Make sure the user executing the application has appropriate SQL Server permissions

## Authentication Configuration

### JWT (JSON Web Token) Setup
The application uses JWT for secure authentication. You'll need to configure the following settings in your API's `appsettings.json`:

1. **Configure JWT Settings**
   ```json
   {
     "Jwt": {
       "Key": "your_secure_secret_key_here",
       "Issuer": "your_issuer",
       "Audience": "your_audience"
     }
   }
   ```

   - `Key`: A secure secret key used to sign the JWT tokens (minimum 16 characters recommended)
   - `Issuer`: The issuer of the JWT token (typically your API's domain)
   - `Audience`: The intended recipient of the token (typically your Angular application's domain)

2. **Security Best Practices**
   - Never commit the actual JWT secret key to source control
   - Use different JWT settings for each environment (development, test, production)
   - Store production keys securely in Azure Key Vault or similar service
   - Rotate keys periodically following security best practices

3. **Environment-Specific Configuration**
   - Development: Configure in `appsettings.Development.json`
   - Test: Configure in Azure DevOps pipeline variables
   - Production: Configure in Azure Key Vault or Azure App Service configuration

4. **Token Validation**
   The API is configured to validate:
   - Token issuer
   - Token audience
   - Token lifetime
   - Token signature using the secret key
   ```

Remember to keep your JWT secret keys secure and never expose them in client-side code or public repositories.
