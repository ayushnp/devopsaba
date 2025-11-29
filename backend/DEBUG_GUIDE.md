# Backend Debugging Guide

## Common 500 Error Causes

### 1. Database Connection Issues
- Check if PostgreSQL is running
- Verify database credentials in `.env` file
- Test connection: `psql -U postgres -d college-management`

### 2. Missing Environment Variables
Required in `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=college-management
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-api-key
```

### 3. Database Schema Issues
- Run `schema.sql` to ensure all tables exist
- Check for missing columns or constraints
- Verify foreign key relationships

### 4. Common Route Errors
- Missing authentication token
- Invalid request body format
- Missing required fields
- SQL query syntax errors

## Error Logging

All errors are now logged to console with:
- Error message
- Stack trace
- Request URL and method
- Request body

## Testing Endpoints

### Health Check
```bash
curl http://localhost:4000/health
```

### Test Authentication
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test","role":"student"}'
```

## Debugging Steps

1. Check server console for error messages
2. Verify database connection
3. Check request/response in browser DevTools Network tab
4. Verify all required fields are sent
5. Check database logs for SQL errors

