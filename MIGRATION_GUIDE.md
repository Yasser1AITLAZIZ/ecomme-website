# Migration Guide

This guide explains the new project structure after reorganization.

## What Changed

The project has been reorganized into a monorepo structure with separate `frontend/` and `backend/` directories.

### Before

```
ecomme-website/
├── src/              # Frontend code
├── public/           # Frontend assets
├── package.json      # Frontend dependencies
├── next.config.js    # Frontend config
└── ...
```

### After

```
ecomme-website/
├── frontend/         # All frontend code
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/          # All backend code
│   ├── app/
│   ├── requirements.txt
│   └── ...
└── README.md         # Main project README
```

## Migration Steps

### For Frontend Development

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Reinstall dependencies:**
   ```bash
   npm install
   ```
   
   The `node_modules` folder will be created in `frontend/` instead of the root.

3. **Update your IDE/Editor:**
   - If using VS Code, the workspace should automatically detect the new structure
   - Update any path references in your IDE settings

4. **Update scripts:**
   - All npm scripts remain the same
   - Run them from the `frontend/` directory

### For Backend Development

No changes needed - the backend was already in the `backend/` directory.

### For CI/CD

If you have CI/CD pipelines, update them:

**Before:**
```yaml
- run: npm install
- run: npm run build
```

**After:**
```yaml
- run: cd frontend && npm install
- run: cd frontend && npm run build
```

### For Vercel Deployment

1. Update the **Root Directory** in Vercel project settings to `frontend`
2. Or update `vercel.json` if using a custom configuration

### Environment Variables

No changes needed - environment variables work the same way:
- Frontend: `frontend/.env.local`
- Backend: `backend/.env`

## Benefits of New Structure

1. **Clear Separation**: Frontend and backend are clearly separated
2. **Independent Deployment**: Each can be deployed independently
3. **Better Organization**: Easier to navigate and maintain
4. **Scalability**: Easy to add more services (e.g., `admin-dashboard/`)
5. **Team Collaboration**: Frontend and backend teams can work independently

## Troubleshooting

### "Module not found" errors

If you see module not found errors:
1. Make sure you're in the correct directory (`frontend/` for frontend, `backend/` for backend)
2. Reinstall dependencies: `npm install` or `pip install -r requirements.txt`

### Path issues in imports

If you have absolute imports configured, they should still work. If not, check:
- `frontend/tsconfig.json` for TypeScript path mappings
- `frontend/next.config.js` for Next.js configuration

### Build errors

If build fails:
1. Clear caches: `rm -rf frontend/.next frontend/node_modules`
2. Reinstall: `cd frontend && npm install`
3. Rebuild: `npm run build`

## Next Steps

1. Update any documentation that references old paths
2. Update CI/CD pipelines
3. Update deployment configurations
4. Test both frontend and backend locally
5. Commit the new structure to version control

